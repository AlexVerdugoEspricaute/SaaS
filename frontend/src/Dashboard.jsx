import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [projects, setProjects] = useState([])
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
  },[])

  function logout(){
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <button onClick={logout}>Logout</button>
      {error && <p className="error">{error}</p>}
      <ul>
        {projects.map(p => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  )
}
