import React, { useState, useEffect, useRef } from 'react';
import './App.css'

function App() {
  // State for UI elements
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // State for data
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const [items, setItems] = useState([]);
  const [studentEmail, setStudentEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Football');

  const filterOptions = ['Football', 'Volleyball', 'Basketball', 'Music'];
  const filterContainerRef = useRef(null);

  // IMPORTANT: Update this port to match your ASP.NET Core launch settings (e.g., 5000, 5106, 7000)
  const API_URL = 'http://localhost:5106/api/tickets';

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Data could not be fetched!');
        const data = await response.json();
        const mappedItems = data.map(ticket => ({
          id: ticket.id,
          description: ticket.eventName,
          price: ticket.price,
          eventType: ticket.type,
        }));
        setItems(mappedItems);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterContainerRef]);

  const handleFilterSelect = (filter) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setSelectedFilters(newFilters);
  };

  const handleAddItem = async () => {
    const allowedDomains = ['@nebraska.edu', '@huskers.unl.edu', '@unl.edu'];
    const isEmailValid = allowedDomains.some(domain => studentEmail.toLowerCase().endsWith(domain));

    if (!studentEmail || !isEmailValid) {
      alert('It is not the correct email. Please use an email ending in a UNL email');
      return;
    }

    if (eventName && price) {
      const newItem = {
        studentEmail: studentEmail,
        eventName: eventName,
        type: eventType,
        price: parseFloat(price),
        isPaid: false,
        purchaseDate: new Date().toISOString(),
      };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
        if (!response.ok) throw new Error('Error creating ticket');
        const createdTicket = await response.json();

        setItems([...items, {
          id: createdTicket.id,
          description: createdTicket.eventName,
          price: createdTicket.price,
          eventType: createdTicket.type,
        }]);

        setStudentEmail('');
        setEventName('');
        setEventType('');
        setPrice('');
        setShowForm(false);
      } catch (error) {
        console.error('Error adding item:', error);
        alert('Failed to add item. Please try again.');
      }
    } else {
      alert('Please enter both event name and price.');
    }
  };

  // Fixed filter logic: now filters on eventType instead of description
  const displayedItems = items
    .filter(item => {
      const filterMatch = selectedFilters.size === 0 || selectedFilters.has(item.eventType);
      const searchMatch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return filterMatch && searchMatch;
    })
    .sort((a, b) => a.price - b.price);

  return (
    <>
      <nav className="navbar">
        <div className="home-icon" onClick={() => window.location.reload()}>🏠</div>
        <div className="search-group">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>Search</button>
        </div>
        <div className="filter-container" ref={filterContainerRef}>
          <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
            {selectedFilters.size > 0 ? `Filters (${selectedFilters.size})` : 'Filters'} ▾
          </button>
          {showFilters && (
            <div className="dropdown-menu">
              {filterOptions.map(filter => (
                <div
                  key={filter}
                  className={`dropdown-item ${selectedFilters.has(filter) ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect(filter)}
                >
                  {filter}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="main-container">
        <div className="sidebar">
          <button
            className={`add-item-btn ${showForm ? 'close' : ''}`}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Close Form' : 'Add New Item'}
          </button>

          {showForm && (
            <div className="form-container">
              <input
                type="text"
                placeholder="Student Email... (e.g., user@unl.edu)"
                value={studentEmail}
                
                onChange={(e) => setStudentEmail(e.target.value)}
                
              />
              <input
                type="text"
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="dropdown-select"
              >
                <option value="">Select Event Type</option>
                {filterOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price ($)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <button onClick={handleAddItem}>Save Item</button>
            </div>
          )}
        </div>

        <div className="item-list">
          {displayedItems.map(item => (
            <div key={item.id} className="item-card">
              <span className="item-text">{item.description}</span>
              <span className="item-price">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
export default App;