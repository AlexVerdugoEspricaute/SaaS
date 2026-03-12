import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert, 
  Paper, 
  Avatar,
  Stack,
  Divider,
  Fade,
  CircularProgress
} from '@mui/material'
import { LockOutlined, ArrowBack } from '@mui/icons-material'

export default function Login({ onLogin }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try{
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Login failed')
      const data = await res.json()
      localStorage.setItem('token', data.token)
      onLogin(data.token)
      navigate('/dashboard')
    }catch(err){
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center',
      p: 2
    }}>
      {/* Back to landing button */}
      <Button 
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ 
          position: 'absolute',
          top: 24,
          left: 24,
          color: 'white',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
        }}
      >
        Volver
      </Button>

      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper elevation={24} sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 4
            }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 64, 
                height: 64, 
                mb: 2,
                boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)'
              }}>
                <LockOutlined sx={{ fontSize: 32 }} />
              </Avatar>
              
              <Typography variant="h3" sx={{ 
                fontWeight: 800,
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                ConvertAI Pro
              </Typography>
              
              <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 500 }}>
                Iniciar sesión
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                Accede a tu cuenta para empezar a convertir archivos
              </Typography>
            </Box>

            <Box component="form" onSubmit={submit} noValidate sx={{ width: '100%' }}>
              <TextField
                label="Correo electrónico"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
                margin="normal"
                variant="outlined"
                type="email"
                autoFocus
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2
                    }
                  }
                }}
              />
              
              <TextField
                label="Contraseña"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                required
                fullWidth
                type="password"
                autoComplete="current-password"
                margin="normal"
                variant="outlined"
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2
                    }
                  }
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    opacity: 0.7
                  }
                }}
              >
                {loading ? (
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CircularProgress size={24} color="inherit" />
                    <span>Iniciando sesión...</span>
                  </Stack>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Cuenta de prueba
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                📧 admin@acme.test
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                🔑 admin123
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  )
}
