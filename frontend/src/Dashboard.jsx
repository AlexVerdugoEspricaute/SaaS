import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'

export default function Dashboard(){
  const [projects, setProjects] = useState([])
  const [jobs, setJobs] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
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
  },[])

  function logout(){
    localStorage.removeItem('token')
    navigate('/login')
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

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 3 }}>
            <Paper variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6">Proyectos</Typography>
                <Chip size="small" label={projects.length} />
              </Stack>
              <List dense>
                {projects.map((p) => (
                  <React.Fragment key={p.id}>
                    <ListItem>
                      <ListItemText primary={p.name} secondary={`Tenant: ${p.tenantId}`} />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
                {projects.length === 0 && <Typography variant="body2" color="text.secondary">No hay proyectos disponibles.</Typography>}
              </List>
            </Paper>

            <Paper variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6">Ultimos trabajos</Typography>
                <Chip size="small" color="primary" label={jobs.length} />
              </Stack>
              <List dense>
                {jobs.map((job) => (
                  <React.Fragment key={job.id}>
                    <ListItem>
                      <ListItemText
                        primary={job.fileName || `Trabajo ${job.id}`}
                        secondary={`Estado: ${job.status || 'pendiente'} - ${job.targetFormat || 'sin formato'}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
                {jobs.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Aun no hay endpoint `/jobs` en backend o no hay conversiones creadas.
                  </Typography>
                )}
              </List>
            </Paper>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
