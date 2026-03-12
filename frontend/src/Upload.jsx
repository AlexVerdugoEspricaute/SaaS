import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from '@mui/material'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import DownloadIcon from '@mui/icons-material/Download'

const targetFormats = ['xlsx', 'csv', 'json', 'xml', 'txt', 'pdf']

const STATUS_COLOR = { pending: 'warning', done: 'success', error: 'error' }
const STATUS_LABEL = { pending: 'Procesando...', done: 'Listo', error: 'Error' }

export default function Upload(){
  const [file, setFile] = useState(null)
  const [targetFormat, setTargetFormat] = useState('csv')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [job, setJob] = useState(null)   // { jobId, status, errorMessage }
  const navigate = useNavigate()
  const pollRef = useRef(null)

  // Poll job status every 2s until done or error
  useEffect(() => {
    if (!job || job.status === 'done' || job.status === 'error') {
      clearInterval(pollRef.current)
      return
    }
    pollRef.current = setInterval(async () => {
      const token = localStorage.getItem('token')
      try {
        const res = await fetch(`http://localhost:4000/jobs/${job.jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return
        const data = await res.json()
        setJob(prev => ({ ...prev, status: data.status, errorMessage: data.errorMessage }))
      } catch {}
    }, 2000)
    return () => clearInterval(pollRef.current)
  }, [job?.jobId, job?.status])

  const readableFileSize = useMemo(() => {
    if (!file) return ''
    if (file.size < 1024 * 1024) return `${Math.round(file.size / 1024)} KB`
    return `${(file.size / (1024 * 1024)).toFixed(2)} MB`
  }, [file])

  function logout(){
    localStorage.removeItem('token')
    navigate('/login')
  }

  function handleDownload() {
    const token = localStorage.getItem('token')
    // Abrimos en nueva pestaña con el token en header no es posible via <a>,
    // hacemos fetch + blob
    fetch(`http://localhost:4000/download/${job.jobId}`, {
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
      a.download = `conversion.${targetFormat}`
      a.click()
      URL.revokeObjectURL(url)
    })
    .catch(err => setError(err.message))
  }

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    setJob(null)

    if (!file) {
      setError('Selecciona un archivo para convertir.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('targetFormat', targetFormat)

      const res = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'No se pudo crear la conversion')
      }

      const data = await res.json()
      setJob({ jobId: data.jobId, status: data.status })
      setFile(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at 10% 10%, #dff0ff, #f6fff6 55%, #ffffff 100%)', py: 5 }}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ borderRadius: 4, p: { xs: 2, md: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>Nueva conversion</Typography>
              <Typography variant="body1" color="text.secondary">Sube tu archivo y elige el formato de salida.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => navigate('/dashboard')}>Volver</Button>
              <Button variant="text" color="inherit" onClick={logout}>Salir</Button>
            </Stack>
          </Stack>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderStyle: 'dashed', borderColor: 'primary.main', backgroundColor: '#f9fcff' }}>
              <Stack spacing={2}>
                <Typography variant="h6">Archivo de entrada</Typography>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<UploadFileRoundedIcon />}
                  sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                >
                  Elegir archivo
                  <input
                    hidden
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </Button>

                {file && (
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <DescriptionOutlinedIcon color="action" />
                    <Typography>{file.name}</Typography>
                    <Chip label={readableFileSize} size="small" />
                  </Stack>
                )}
              </Stack>
            </Paper>

            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="format-label">Formato destino</InputLabel>
              <Select
                labelId="format-label"
                value={targetFormat}
                label="Formato destino"
                onChange={(e) => setTargetFormat(e.target.value)}
              >
                {targetFormats.map((format) => (
                  <MenuItem key={format} value={format}>{format.toUpperCase()}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {job && (
              <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                  <Typography variant="body2" color="text.secondary">Estado:</Typography>
                  <Chip
                    label={STATUS_LABEL[job.status] || job.status}
                    color={STATUS_COLOR[job.status] || 'default'}
                    size="small"
                    icon={job.status === 'pending' ? <CircularProgress size={12} color="inherit" /> : undefined}
                  />
                  {job.status === 'done' && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                    >
                      Descargar {targetFormat.toUpperCase()}
                    </Button>
                  )}
                  {job.status === 'error' && (
                    <Typography variant="body2" color="error">{job.errorMessage}</Typography>
                  )}
                </Stack>
              </Paper>
            )}

            <Button type="submit" variant="contained" size="large" sx={{ mt: 3 }} disabled={loading}>
              {loading ? 'Subiendo...' : 'Convertir archivo'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
