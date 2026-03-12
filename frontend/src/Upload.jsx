import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
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

const targetFormats = [
  'pdf',
  'docx',
  'xlsx',
  'csv',
  'txt',
  'xml',
  'json'
]

export default function Upload(){
  const [file, setFile] = useState(null)
  const [targetFormat, setTargetFormat] = useState('pdf')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const readableFileSize = useMemo(() => {
    if (!file) return ''
    if (file.size < 1024 * 1024) return `${Math.round(file.size / 1024)} KB`
    return `${(file.size / (1024 * 1024)).toFixed(2)} MB`
  }, [file])

  function logout(){
    localStorage.removeItem('token')
    navigate('/login')
  }

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!file) {
      setError('Selecciona un archivo para convertir.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

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
      setSuccess(`Conversion creada. Job ID: ${data.id || 'pendiente'}`)
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
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

            <Button type="submit" variant="contained" size="large" sx={{ mt: 3 }} disabled={loading}>
              {loading ? 'Creando conversion...' : 'Convertir archivo'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
