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
  Typography,
  Avatar,
  Card,
  CardContent,
  Fade,
  AppBar,
  Toolbar,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider
} from '@mui/material'
import {
  CloudUpload,
  Description,
  Download,
  AutoFixHigh,
  ArrowBack,
  CheckCircle,
  Error,
  Transform,
  Refresh
} from '@mui/icons-material'

const targetFormats = [
  { value: 'xlsx', label: 'Excel (.xlsx)', icon: '📊' },
  { value: 'csv', label: 'CSV (.csv)', icon: '📈' },
  { value: 'json', label: 'JSON (.json)', icon: '🔗' },
  { value: 'xml', label: 'XML (.xml)', icon: '🏷️' },
  { value: 'txt', label: 'Texto (.txt)', icon: '📄' },
  { value: 'pdf', label: 'PDF (.pdf)', icon: '📕' }
]

export default function Upload(){
  const [file, setFile] = useState(null)
  const [targetFormat, setTargetFormat] = useState('csv')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [job, setJob] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()
  const pollRef = useRef(null)
  const fileInputRef = useRef(null)

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
      } catch (e) {
        // Silently ignore polling errors
      }
    }, 2000)
    return () => clearInterval(pollRef.current)
  }, [job?.jobId, job?.status])

  const readableFileSize = useMemo(() => {
    if (!file) return ''
    if (file.size < 1024 * 1024) return `${Math.round(file.size / 1024)} KB`
    return `${(file.size / (1024 * 1024)).toFixed(2)} MB`
  }, [file])

  // Función para resetear el formulario y permitir otra conversión
  function resetForm() {
    setFile(null)
    setJob(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleDownload() {
    const token = localStorage.getItem('token')
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

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
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
      
      // Resetear el input de archivos HTML para permitir seleccionar otro archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Current step for stepper
  const getCurrentStep = () => {
    if (!file) return 0
    if (!job) return 1
    if (job.status === 'pending') return 2
    if (job.status === 'done') return 3
    if (job.status === 'error') return 2
    return 1
  }

  const currentStep = getCurrentStep()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ 
        bgcolor: 'white',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <Toolbar>
          <Button 
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2, borderRadius: 3 }}
          >
            Dashboard
          </Button>
          
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main',
              width: 40,
              height: 40
            }}>
              <Transform />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ 
                color: 'text.primary',
                fontWeight: 700
              }}>
                Nueva Conversión
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary'
              }}>
                Convierte archivos con IA
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              Convierte tu archivo
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ 
              fontWeight: 400,
              mb: 4,
              maxWidth: 600,
              mx: 'auto'
            }}>
              Sube tu archivo, selecciona el formato de destino y deja que nuestra IA haga el resto.
              Soportamos conversiones inteligentes entre múltiples formatos.
            </Typography>
          </Box>
        </Fade>

        {/* Progress Stepper */}
        <Fade in timeout={800}>
          <Card sx={{ mb: 4, borderRadius: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Stepper activeStep={currentStep} orientation="vertical">
                <Step>
                  <StepLabel
                    StepIconComponent={() => 
                      <Avatar sx={{ 
                        bgcolor: currentStep >= 0 ? 'primary.main' : 'grey.300',
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem'
                      }}>
                        1
                      </Avatar>
                    }
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Seleccionar archivo
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      Arrastra y suelta tu archivo o haz clic para seleccionar
                    </Typography>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel
                    StepIconComponent={() => 
                      <Avatar sx={{ 
                        bgcolor: currentStep >= 1 ? 'primary.main' : 'grey.300',
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem'
                      }}>
                        2
                      </Avatar>
                    }
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Elegir formato
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      Selecciona el formato de salida deseado
                    </Typography>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel
                    StepIconComponent={() => 
                      <Avatar sx={{ 
                        bgcolor: currentStep >= 2 ? (job?.status === 'error' ? 'error.main' : 'warning.main') : 'grey.300',
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem'
                      }}>
                        {job?.status === 'error' ? <Error /> : 
                         job?.status === 'pending' ? <CircularProgress size={16} color="inherit" /> : '3'}
                      </Avatar>
                    }
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {job?.status === 'error' ? 'Error en conversión' : 
                       job?.status === 'pending' ? 'Procesando...' : 'Procesar archivo'}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      {job?.status === 'error' ? 'Ocurrió un error durante la conversión' :
                       job?.status === 'pending' ? 'Tu archivo se está convirtiendo con IA...' :
                       'Haz clic en "Convertir" para iniciar el proceso'}
                    </Typography>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel
                    StepIconComponent={() => 
                      <Avatar sx={{ 
                        bgcolor: currentStep >= 3 ? 'success.main' : 'grey.300',
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem'
                      }}>
                        {currentStep >= 3 ? <CheckCircle /> : '4'}
                      </Avatar>
                    }
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Descargar resultado
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      ¡Listo! Descarga tu archivo convertido
                    </Typography>
                  </StepContent>
                </Step>
              </Stepper>
            </CardContent>
          </Card>
        </Fade>

        {/* Upload Form */}
        <Fade in timeout={1000}>
          <Card sx={{ borderRadius: 4, mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit}>
                {/* File Upload Area */}
                <Paper
                  variant="outlined"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  sx={{
                    p: 6,
                    borderRadius: 4,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor: dragActive ? 'primary.main' : file ? 'success.main' : 'grey.300',
                    bgcolor: dragActive ? 'action.hover' : file ? 'success.50' : 'grey.50',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    mb: 4,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  
                  <Avatar sx={{
                    bgcolor: file ? 'success.main' : 'primary.main',
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3
                  }}>
                    {file ? <CheckCircle sx={{ fontSize: 40 }} /> : <CloudUpload sx={{ fontSize: 40 }} />}
                  </Avatar>
                  
                  {file ? (
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                        ✨ Archivo seleccionado
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                        <Description color="action" />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {file.name}
                        </Typography>
                        <Chip 
                          label={readableFileSize} 
                          size="small" 
                          color="success"
                          sx={{ borderRadius: 2 }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Haz clic aquí para cambiar el archivo
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        {dragActive ? '🎯 Suelta tu archivo aquí' : '☁️ Sube tu archivo'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Arrastra y suelta tu archivo aquí o haz clic para seleccionar
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<CloudUpload />}
                        sx={{ borderRadius: 3 }}
                      >
                        Seleccionar archivo
                      </Button>
                    </Box>
                  )}
                </Paper>

                {/* Format Selection */}
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <InputLabel>Formato de destino</InputLabel>
                  <Select
                    value={targetFormat}
                    label="Formato de destino"
                    onChange={(e) => setTargetFormat(e.target.value)}
                    sx={{ borderRadius: 3 }}
                  >
                    {targetFormats.map((format) => (
                      <MenuItem key={format.value} value={format.value}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography sx={{ fontSize: '1.2rem' }}>
                            {format.icon}
                          </Typography>
                          <Typography>
                            {format.label}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Error Display */}
                {error && (
                  <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Job Status */}
                {job && (
                  <Card variant="outlined" sx={{ mb: 4, borderRadius: 3 }}>
                    <CardContent>
                      <Stack spacing={3}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{
                            bgcolor: job.status === 'done' ? 'success.main' : 
                                    job.status === 'error' ? 'error.main' : 'warning.main',
                            width: 48,
                            height: 48
                          }}>
                            {job.status === 'done' ? <CheckCircle /> :
                             job.status === 'error' ? <Error /> :
                             <AutoFixHigh />}
                          </Avatar>
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {job.status === 'done' ? '🎉 ¡Conversión completada!' :
                               job.status === 'error' ? '❌ Error en la conversión' :
                               '🤖 Procesando con IA...'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {job.status === 'done' ? 'Tu archivo está listo para descargar' :
                               job.status === 'error' ? job.errorMessage || 'Ocurrió un error inesperado' :
                               'Analizando documento y aplicando conversión inteligente'}
                            </Typography>
                          </Box>

                          <Chip
                            label={job.status === 'done' ? 'Completado' :
                                  job.status === 'error' ? 'Error' : 'Procesando'}
                            color={job.status === 'done' ? 'success' :
                                  job.status === 'error' ? 'error' : 'warning'}
                            icon={job.status === 'pending' ? <CircularProgress size={16} color="inherit" /> : undefined}
                            sx={{ borderRadius: 2, fontWeight: 600 }}
                          />
                        </Stack>

                        {job.status === 'pending' && (
                          <LinearProgress sx={{ borderRadius: 2, height: 8 }} />
                        )}

                        {job.status === 'done' && (
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                              variant="contained"
                              size="large"
                              startIcon={<Download />}
                              onClick={handleDownload}
                              sx={{ 
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                flexGrow: 1
                              }}
                            >
                              Descargar {targetFormat.toUpperCase()}
                            </Button>
                            <Button
                              variant="outlined"
                              size="large"
                              startIcon={<Refresh />}
                              onClick={resetForm}
                              sx={{ borderRadius: 3 }}
                            >
                              Nueva Conversión
                            </Button>
                          </Stack>
                        )}

                        {job.status === 'error' && (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Refresh />}
                            onClick={resetForm}
                            sx={{ borderRadius: 3 }}
                          >
                            Reintentar
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                {(!job || job.status === 'error') && (
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || !file}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Transform />}
                    sx={{
                      width: '100%',
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        opacity: 0.7
                      }
                    }}
                  >
                    {loading ? 'Subiendo archivo...' : 'Convertir archivo'}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Info Cards */}
        <Fade in timeout={1200}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Card sx={{ flexGrow: 1, borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 2
                }}>
                  <AutoFixHigh />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Potenciado por IA
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  DeepSeek AI analiza tu documento y realiza conversiones inteligentes
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ flexGrow: 1, borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ 
                  bgcolor: 'success.main',
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 2
                }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  100% Seguro
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tus archivos se procesan de forma segura y se eliminan automáticamente
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Fade>
      </Container>
    </Box>
  )
}
