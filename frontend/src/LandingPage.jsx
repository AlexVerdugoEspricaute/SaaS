import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Rating,
  alpha,
  IconButton
} from '@mui/material'
import { 
  AutoFixHigh,
  Speed,
  Security,
  CloudUpload,
  Download,
  Transform,
  ArrowForward,
  CheckCircle,
  Star
} from '@mui/icons-material'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <AutoFixHigh />,
      title: 'IA Inteligente',
      description: 'Conversiones potenciadas por DeepSeek AI para documentos complejos y extracción inteligente de datos'
    },
    {
      icon: <Speed />,
      title: 'Ultra Rápido',
      description: 'Procesamiento en tiempo real con conversiones que toman segundos, no minutos'
    },
    {
      icon: <Security />,
      title: 'Totalmente Seguro',
      description: 'Tus archivos se procesan de forma segura y se eliminan automáticamente después de la conversión'
    },
    {
      icon: <Transform />,
      title: 'Múltiples Formatos',
      description: 'Soporta PDF, Excel, CSV, JSON, XML, TXT y más. Cualquier formato a cualquier formato'
    }
  ]

  const steps = [
    {
      icon: <CloudUpload />,
      title: 'Sube tu archivo',
      description: 'Arrastra y suelta o selecciona tu archivo desde cualquier dispositivo'
    },
    {
      icon: <Transform />,
      title: 'Elige el formato',
      description: 'Selecciona el formato de salida deseado de nuestra amplia lista'
    },
    {
      icon: <Download />,
      title: 'Descarga el resultado',
      description: 'Obtén tu archivo convertido en segundos, listo para usar'
    }
  ]

  const testimonials = [
    {
      name: 'Ana García',
      role: 'CEO, StartupTech',
      rating: 5,
      comment: 'Increíble servicio. Convertí 500+ archivos PDFs a Excel en minutos. La IA realmente funciona.',
      avatar: 'A'
    },
    {
      name: 'Carlos López',
      role: 'Analista de Datos',
      rating: 5,
      comment: 'La precisión en la extracción de tablas desde PDFs es perfecta. Ahorré horas de trabajo manual.',
      avatar: 'C'
    },
    {
      name: 'María Rodríguez',
      role: 'Project Manager',
      rating: 5,
      comment: 'Interface súper intuitiva. Mi equipo adoptó la herramienta inmediatamente.',
      avatar: 'M'
    }
  ]

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 2
      }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              ConvertAI Pro
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </Button>
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
                onClick={() => navigate('/login')}
              >
                Empezar Gratis
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip 
                label="🚀 Potenciado por IA" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  mb: 3,
                  fontWeight: 600
                }} 
              />
              <Typography variant="h1" sx={{ mb: 3 }}>
                Convierte cualquier archivo en 
                <Box component="span" sx={{ 
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  ml: 1
                }}>
                  segundos
                </Box>
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
                Plataforma SaaS profesional para conversión de archivos con inteligencia artificial. 
                PDF, Excel, CSV, JSON, XML y más.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    px: 4,
                    '&:hover': { bgcolor: '#f8fafc' }
                  }}
                  onClick={() => navigate('/login')}
                >
                  Empezar Ahora
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    px: 4,
                    '&:hover': { 
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Ver Demo
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                position: 'relative',
                transform: { md: 'translateX(20px)' }
              }}>
                <Card sx={{ 
                  maxWidth: 400,
                  mx: 'auto',
                  transform: 'rotate(3deg)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      🎯 Conversión en Progreso
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        documento.pdf → spreadsheet.xlsx
                      </Typography>
                      <Box sx={{ 
                        width: '100%',
                        height: 8,
                        bgcolor: 'grey.200',
                        borderRadius: 4,
                        mt: 1,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          width: '85%',
                          height: '100%',
                          bgcolor: 'primary.main',
                          borderRadius: 4
                        }} />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="success.main">
                      ✅ IA detectó 3 tablas, 45 filas de datos
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              ¿Por qué elegir ConvertAI Pro?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              La plataforma más avanzada para conversión de archivos, diseñada para profesionales que valoran la eficiencia.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  }
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2
                  }}>
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How it Works */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              Cómo funciona
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Proceso simple en 3 pasos para conversiones profesionales
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: `primary.${index === 1 ? 'main' : 'light'}`,
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                    fontSize: '2rem'
                  }}>
                    {step.icon}
                  </Avatar>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              Casos de éxito
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Miles de profesionales confían en ConvertAI Pro
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <CardContent>
                    <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                      "{testimonial.comment}"
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 8, md: 12 }
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              Listo para convertir?
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Únete a miles de profesionales que ya están ahorrando tiempo con ConvertAI Pro
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                size="large"
                endIcon={<ArrowForward />}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  px: 4,
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
                onClick={() => navigate('/login')}
              >
                Empezar Gratis
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                ConvertAI Pro
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                La plataforma más avanzada para conversión de archivos con inteligencia artificial.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Producto
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Conversiones IA</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Formatos soportados</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>API para desarrolladores</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Soporte
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Centro de ayuda</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Contacto</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Términos y privacidad</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 4, pt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2026 ConvertAI Pro. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}