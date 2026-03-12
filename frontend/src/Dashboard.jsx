import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Tooltip,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'

export default function Dashboard({ onLogout }){
  const [projects, setProjects] = useState([])
  const [jobs, setJobs] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const fetchData = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) return navigate('/login')
    fetch('http://localhost:4000/projects', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(async res => {
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      return res.json()
    })
    .then(data => setProjects(data))
    .catch(err => setError(err.message))

    fetch('http://localhost:4000/jobs', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(async res => {
      if (!res.ok) return []
      return res.json()
    })
    .then(data => setJobs(Array.isArray(data) ? data : []))
    .catch(() => setJobs([]))
  }, [navigate])

  useEffect(() => { fetchData() }, [fetchData])

  function downloadJob(job) {
    const token = localStorage.getItem('token')
    fetch(`http://localhost:4000/download/${job.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('No se pudo descargar')
      return res.blob()
    })
    .then(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = job.outputPath || `conversion.${job.targetFormat}`
      a.click()
      URL.revokeObjectURL(url)
    })
    .catch(err => setError(err.message))
  }

  function logout(){
    if (onLogout) onLogout()
    else {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f9ff 0%, #eef6f3 100%)', py: 5 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Dashboard</Typography>
              <Typography variant="body2" color="text.secondary">Gestiona conversiones y revisa el estado de tus archivos.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => navigate('/upload')}>Nueva conversion</Button>
              <Button variant="outlined" color="inherit" onClick={logout}>Salir</Button>
            </Stack>
          </Stack>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          {/* Tabla de trabajos */}
          <Paper variant="outlined" sx={{ mt: 3, borderRadius: 2, overflow: 'hidden' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pt: 2 }}>
              <Typography variant="h6">Conversiones</Typography>
              <Tooltip title="Actualizar">
                <IconButton onClick={fetchData} size="small"><RefreshIcon /></IconButton>
              </Tooltip>
            </Stack>
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>Archivo</TableCell>
                  <TableCell>De</TableCell>
                  <TableCell>A</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Accion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No hay conversiones aun. Usa &quot;Nueva conversion&quot; para empezar.
                    </TableCell>
                  </TableRow>
                )}
                {jobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {job.fileName}
                    </TableCell>
                    <TableCell><Chip label={job.inputFormat?.toUpperCase()} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={job.targetFormat?.toUpperCase()} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell>
                      <Chip
                        label={job.status === 'done' ? 'Listo' : job.status === 'error' ? 'Error' : 'Procesando'}
                        color={job.status === 'done' ? 'success' : job.status === 'error' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: 12 }}>
                      {new Date(job.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {job.status === 'done' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<DownloadIcon />}
                          onClick={() => downloadJob(job)}
                        >
                          Descargar
                        </Button>
                      )}
                      {job.status === 'error' && (
                        <Tooltip title={job.errorMessage || 'Error desconocido'}>
                          <Chip label="Ver error" color="error" size="small" variant="outlined" />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Paper>
      </Container>
    </Box>
  )
}
