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
  Avatar,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Fade,
  AppBar,
  Toolbar
} from '@mui/material'
import { 
  Refresh,
  Download,
  CloudUpload,
  Assessment,
  Speed,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  AutoFixHigh,
  Logout
} from '@mui/icons-material'

export default function Dashboard({ onLogout }){
  const [projects, setProjects] = useState([])
  const [jobs, setJobs] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchData = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) return navigate('/login')
    
    setLoading(true)
    
    Promise.all([
      fetch('http://localhost:4000/projects', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://localhost:4000/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    .then(async ([projectsRes, jobsRes]) => {
      const projectsData = await projectsRes.json().catch(() => [])
      const jobsData = await jobsRes.json().catch(() => [])
      
      setProjects(Array.isArray(projectsData) ? projectsData : [])
      setJobs(Array.isArray(jobsData) ? jobsData : [])
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
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

  // Stats calculations
  const totalJobs = jobs.length
  const doneJobs = jobs.filter(j => j.status === 'done').length
  const pendingJobs = jobs.filter(j => j.status === 'pending').length
  const errorJobs = jobs.filter(j => j.status === 'error').length
  const successRate = totalJobs > 0 ? Math.round((doneJobs / totalJobs) * 100) : 0

  const stats = [
    {
      title: 'Total Conversiones',
      value: totalJobs,
      icon: <Assessment />,
      color: 'primary',
      subtitle: 'Este mes'
    },
    {
      title: 'Completadas',
      value: doneJobs,
      icon: <CheckCircle />,
      color: 'success',
      subtitle: `${successRate}% exitosas`
    },
    {
      title: 'En Proceso',
      value: pendingJobs,
      icon: <Schedule />,
      color: 'warning',
      subtitle: 'Procesando...'
    },
    {
      title: 'Con Errores',
      value: errorJobs,
      icon: <ErrorIcon />,
      color: 'error',
      subtitle: 'Requieren atención'
    }
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ 
        bgcolor: 'white',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <Toolbar>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main',
              width: 40,
              height: 40
            }}>
              <AutoFixHigh />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ 
                color: 'text.primary',
                fontWeight: 700
              }}>
                ConvertAI Pro
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary'
              }}>
                Dashboard
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              startIcon={<CloudUpload />}
              onClick={() => navigate('/upload')}
              sx={{ borderRadius: 3 }}
            >
              Nueva Conversión
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Logout />}
              onClick={logout}
              sx={{ borderRadius: 3 }}
            >
              Salir
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 800,
              mb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              ¡Bienvenido de vuelta! 👋
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Aquí tienes un resumen de tus conversiones y el estado de tu actividad.
            </Typography>
          </Box>
        </Fade>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ mb: 4 }}>
            <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Cargando tu dashboard...
            </Typography>
          </Box>
        )}

        {/* Stats Cards */}
        <Fade in timeout={800}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${stat.color === 'primary' ? '#667eea' : stat.color === 'success' ? '#10b981' : stat.color === 'warning' ? '#f59e0b' : '#ef4444'} 0%, ${stat.color === 'primary' ? '#764ba2' : stat.color === 'success' ? '#059669' : stat.color === 'warning' ? '#d97706' : '#dc2626'} 100%)`,
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {stat.subtitle}
                        </Typography>
                      </Box>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        width: 48,
                        height: 48
                      }}>
                        {stat.icon}
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Fade>

        {/* Jobs Table */}
        <Fade in timeout={1000}>
          <Paper sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            {/* Table Header */}
            <Box sx={{ 
              p: 3,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Historial de Conversiones
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gestiona y descarga tus archivos convertidos
                  </Typography>
                </Box>
                <Tooltip title="Actualizar datos">
                  <IconButton 
                    onClick={fetchData} 
                    disabled={loading}
                    sx={{ 
                      bgcolor: 'white',
                      borderRadius: 3,
                      '&:hover': { bgcolor: '#f1f5f9' }
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            {/* Table Content */}
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fafbfc' }}>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Archivo</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Conversión</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Fecha</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 8, textAlign: 'center' }}>
                      <Box>
                        <CloudUpload sx={{ 
                          fontSize: 64, 
                          color: 'text.secondary',
                          opacity: 0.3,
                          mb: 2
                        }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                          No hay conversiones aún
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          ¡Empieza creando tu primera conversión de archivos!
                        </Typography>
                        <Button 
                          variant="contained" 
                          startIcon={<CloudUpload />}
                          onClick={() => navigate('/upload')}
                          sx={{ borderRadius: 3 }}
                        >
                          Nueva Conversión
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
                
                {jobs.map((job, index) => (
                  <TableRow 
                    key={job.id} 
                    hover 
                    sx={{ 
                      '&:hover': { bgcolor: '#f8fafc' },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        fontWeight: 500
                      }}>
                        {job.fileName}
                      </Box>
                    </TableCell>
                    
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip 
                          label={job.inputFormat?.toUpperCase()} 
                          size="small" 
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary">→</Typography>
                        <Chip 
                          label={job.targetFormat?.toUpperCase()} 
                          size="small" 
                          color="primary"
                          sx={{ borderRadius: 2 }}
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={
                          job.status === 'done' ? 'Completado' : 
                          job.status === 'error' ? 'Error' : 
                          'Procesando'
                        }
                        color={
                          job.status === 'done' ? 'success' : 
                          job.status === 'error' ? 'error' : 
                          'warning'
                        }
                        size="small"
                        icon={
                          job.status === 'done' ? <CheckCircle /> :
                          job.status === 'error' ? <ErrorIcon /> :
                          <Schedule />
                        }
                        sx={{ borderRadius: 2, fontWeight: 500 }}
                      />
                    </TableCell>
                    
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(job.createdAt).toLocaleDateString()} 
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {new Date(job.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right" sx={{ py: 2 }}>
                      {job.status === 'done' ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<Download />}
                          onClick={() => downloadJob(job)}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          Descargar
                        </Button>
                      ) : job.status === 'error' ? (
                        <Tooltip title={job.errorMessage || 'Error en la conversión'}>
                          <Chip 
                            label="Ver Error" 
                            color="error" 
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          />
                        </Tooltip>
                      ) : (
                        <Chip 
                          label="Procesando" 
                          color="warning" 
                          size="small"
                          sx={{ borderRadius: 2 }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Fade>
      </Container>
    </Box>
  )
}
