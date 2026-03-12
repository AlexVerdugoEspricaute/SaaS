import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, TextField, Button, Typography, Box, Alert, Paper, Avatar } from '@mui/material'

export default function Login({ onLogin }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)
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
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 2 }}>A</Avatar>
            <Typography component="h1" variant="h5">Iniciar sesión</Typography>

            <Box component="form" onSubmit={submit} noValidate sx={{ mt: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <TextField
                label="Email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
                margin="normal"
                variant="outlined"
                size="small"
                sx={{ maxWidth: 360, width: '100%', '& .MuiInputBase-root': { borderRadius: 2, backgroundColor: 'grey.50' }, '& .MuiInputBase-input': { padding: '12px 14px' } }}
                inputProps={{ style: { padding: '12px 20px' } }}
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="current-password"
                margin="normal"
                variant="outlined"
                size="small"
                sx={{ maxWidth: 360, width: '100%', '& .MuiInputBase-root': { borderRadius: 2, backgroundColor: 'grey.50' }, '& .MuiInputBase-input': { padding: '12px 14px' } }}
                inputProps={{ style: { padding: '12px 14px' } }}
              />

              <Button type="submit" variant="contained" sx={{ mt: 4, mb: 2, py: 1.2, borderRadius: 2, width: '100%', maxWidth: 360 }}>Entrar</Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>
            )}

            <Typography variant="body2" sx={{ mt: 2 }}>Seeded admin: <strong>admin@acme.test / admin</strong></Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
