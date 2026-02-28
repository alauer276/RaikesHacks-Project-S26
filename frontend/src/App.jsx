import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tickets, setTickets] = useState([])
  const [formData, setFormData] = useState({
    studentEmail: '',
    eventName: '',
    price: '',
    isPaid: false,
    purchaseDate: new Date().toISOString().split('T')[0]
  })
  const [editingId, setEditingId] = useState(null)

  // IMPORTANT: Update this port to match your ASP.NET Core launch settings (e.g., 5000, 5106, 7000)
  const API_URL = 'http://localhost:5106/api/tickets'; 

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch(API_URL)
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      price: Number(formData.price),
      purchaseDate: new Date(formData.purchaseDate).toISOString()
    }

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL
      const method = editingId ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await fetchTickets()
        setFormData({
            studentEmail: '',
            eventName: '',
            price: '',
            isPaid: false,
            purchaseDate: new Date().toISOString().split('T')[0]
        })
        setEditingId(null)
      }
    } catch (error) {
      console.error('Error saving ticket:', error)
    }
  }

  const handleEdit = (ticket) => {
    setEditingId(ticket.id)
    setFormData({
      studentEmail: ticket.studentEmail,
      eventName: ticket.eventName,
      price: ticket.price,
      isPaid: ticket.isPaid,
      purchaseDate: ticket.purchaseDate.split('T')[0]
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (response.ok) fetchTickets()
    } catch (error) {
      console.error('Error deleting ticket:', error)
    }
  }

  return (
    <div className="container">
      <h1>Ticket Sales Dashboard</h1>
      <div className="content">
        <div className="card form-card">
          <h2>{editingId ? 'Edit Ticket' : 'New Ticket'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Email</label><input type="email" name="studentEmail" value={formData.studentEmail} onChange={handleInputChange} required /></div>
            <div className="form-group"><label>Event</label><input type="text" name="eventName" value={formData.eventName} onChange={handleInputChange} required /></div>
            <div className="form-group"><label>Price</label><input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required /></div>
            <div className="form-group"><label>Date</label><input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleInputChange} required /></div>
            <div className="form-group checkbox"><label><input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleInputChange} /> Paid</label></div>
            <button type="submit">{editingId ? 'Update Ticket' : 'Add Ticket'}</button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => {
                  setEditingId(null)
                  setFormData({ studentEmail: '', eventName: '', price: '', isPaid: false, purchaseDate: new Date().toISOString().split('T')[0] })
                }}
                style={{ marginLeft: '10px', opacity: 0.8 }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
        <div className="card list-card">
          <h2>Tickets</h2>
          <table>
            <thead>
              <tr><th>Event</th><th>Email</th><th>Price</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td>{t.eventName}</td>
                  <td>{t.studentEmail}</td>
                  <td>${t.price.toFixed(2)}</td>
                  <td>{t.isPaid ? '✅' : '❌'}</td>
                  <td>
                    <button onClick={() => handleEdit(t)} style={{ marginRight: '5px' }}>Edit</button>
                    <button onClick={() => handleDelete(t.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App
