import React, { useState, useEffect, useRef } from 'react';
import './App.css'
import unlLogo from './assets/pngegg.png';

// Ticket types available for filtering, corresponding to the backend TicketType enum
const filterOptions = ['Football', 'Volleyball', 'MensBasketball', 'WomensBasketball', 'Baseball', 'Music', 'Softball'];
const API_BASE_URL = 'http://10.65.238.92:5106/api';

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
  const [eventDate, setEventDate] = useState('');
  const [budget, setBudget] = useState(10000);
  const [showMyOffers, setShowMyOffers] = useState(false);
  const [myOffersEmail, setMyOffersEmail] = useState('');
  const [myOffers, setMyOffers] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const filterContainerRef = useRef(null);
  const [showMyListings, setShowMyListings] = useState(false);
  const [myListingsEmail, setMyListingsEmail] = useState('');
  const [myListings, setMyListings] = useState([]);

  const formatTicketType = (type) => {
    if (type === 'MensBasketball') return 'Mens Basketball';
    if (type === 'WomensBasketball') return 'Womens Basketball';
    return type;
  };


  // Effect to fetch all tickets from the API when the component mounts
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tickets`);
        if (!response.ok) throw new Error('Data could not be fetched!');
        const data = await response.json();
        // Map the backend data structure to the frontend item format
        const mappedItems = data.map(ticket => ({
          id: ticket.id,
          description: ticket.eventName,
          price: ticket.price,
          eventType: ticket.type,
          eventDate: ticket.eventDate,
        }));
        setItems(mappedItems);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
    fetchTickets();
  }, []);

  // Effect to handle clicks outside the filter dropdown to close it automatically
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

  // State for modal interactions and offer handling
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');


  // Toggles a filter category on or off in the selected set
  const handleFilterSelect = (filter) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setSelectedFilters(newFilters);
  };

  // Handles the creation of a new ticket listing
  const handleAddItem = async () => {
    // Validate that the email belongs to a recognized university domain
    const allowedDomains = ['@nebraska.edu', '@huskers.unl.edu', '@unl.edu'];
    const isEmailValid = allowedDomains.some(domain => studentEmail.toLowerCase().endsWith(domain));

    if (!studentEmail || !isEmailValid) {
      alert(' Please use an UNL email');
      return;
    }

    if (eventName && price && eventDate) {
      // Robustly parse the date to avoid timezone issues.
      // This ensures "YYYY-MM-DD" is treated as the start of that day in UTC.
      const [year, month, day] = eventDate.split('-').map(Number);

      // Check if date is in the past
      const selectedDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        alert('Event date cannot be in the past.');
        return;
      }

      const utcEventDate = new Date(Date.UTC(year, month - 1, day));

      // Construct the new ticket object
      const newItem = {
        studentEmail: studentEmail,
        eventName: eventName,
        type: eventType,
        eventDate: utcEventDate.toISOString(),
        price: parseFloat(price),
        isPaid: false,
        purchaseDate: new Date().toISOString(),
      };

      try {
        // Send POST request to create the ticket
        const response = await fetch(`${API_BASE_URL}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
        if (!response.ok) throw new Error('Error creating ticket');
        const createdTicket = await response.json();

        // Update local state with the newly created ticket to display it immediately
        setItems([...items, {
          id: createdTicket.id,
          description: createdTicket.eventName,
          price: createdTicket.price,
          eventType: createdTicket.type,
          eventDate: createdTicket.eventDate,
        }]);

        // Reset form fields and close the form
        setStudentEmail('');
        setEventName('');
        setEventType('');
        setPrice('');
        setShowForm(false);
        setEventDate('');
      } catch (error) {
        console.error('Error adding item:', error);
        alert('Failed to add item. Please try again.');
      }
    } else {
      alert('Please enter event name, date, and price.');
    }
  };

  // Calculate max price for the slider
  const maxPrice = items.reduce((max, item) => (item.price > max ? item.price : max), 0);

  // Filter items based on active categories, search text, and budget cap, then sort by price
  const displayedItems = items
    .filter(item => {
      const filterMatch = selectedFilters.size === 0 || selectedFilters.has(item.eventType);
      const searchMatch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const budgetMatch = item.price <= budget;

      const itemDate = new Date(item.eventDate);
      const startDate = filterStartDate ? new Date(filterStartDate) : null;
      const endDate = filterEndDate ? new Date(filterEndDate) : null;
      if (endDate) endDate.setHours(23, 59, 59, 999); // Include the entire end day

      const dateMatch = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);

      return filterMatch && searchMatch && budgetMatch && dateMatch;
    })
    .sort((a, b) => a.price - b.price);
  
  // Submits a purchase offer for a selected ticket
  const handleSendOffer = async () => {
      if (!buyerName || !buyerPhone) {
        alert('Please enter your name and phone number.');
        return;
      }

      try {
        // Post the offer details to the backend
        const response = await fetch(`${API_BASE_URL}/offers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketId: selectedItem.id,
            buyerName: buyerName,
            buyerPhone: buyerPhone,
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          alert(`Error: ${errorText}`);
          return;
        }

        // Close the modal and show the confirmation message
        setSelectedItem(null);
        setShowConfirmation(true);
        setBuyerName('');
        setBuyerPhone('');
      } catch (error) {
        alert(`Network error: ${error.message}`);
      }
    };

    // Fetches offers submitted by the current user based on their email
  const handleFetchMyOffers = async () => {
    try {
      // Retrieve offers associated with the provided email
      const response = await fetch(`${API_BASE_URL}/offers/my-offers?email=${encodeURIComponent(myOffersEmail)}`);
      if (!response.ok) throw new Error('Failed to fetch offers');
      const data = await response.json();
      console.log('Offers data:', data);
      setMyOffers(data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Deletes a specific offer by ID
  const handleDeleteOffer = async (offerId) => {
    try {
      // Delete the offer and update the local list
      const response = await fetch(`${API_BASE_URL}/offers/${offerId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete offer');
      setMyOffers(myOffers.filter(o => o.id !== offerId));
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Fetches tickets listed by the current user based on their email
  const handleFetchMyListings = async () => {
    try {
      // Retrieve tickets listed by the provided email
      const response = await fetch(`${API_BASE_URL}/tickets/by-email?email=${encodeURIComponent(myListingsEmail)}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      console.log('Listings data:', data);
      setMyListings(data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Deletes a ticket listing and updates the local state
  const handleDeleteListing = async (ticketId) => {
    try {
      // Delete the ticket listing and remove it from both the listings view and the main feed
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete listing');
      setMyListings(myListings.filter(l => l.id !== ticketId));
      setItems(items.filter(i => i.id !== ticketId));
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="home-icon" onClick={() => window.location.reload()}>
          <img src={unlLogo} alt="UNL Home" />
        </div>
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
              <div style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                  Max Price: ${Math.min(budget, maxPrice).toFixed(0)}
                </label>
                <input
                  type="range"
                  min="0"
                  max={maxPrice || 100}
                  value={Math.min(budget, maxPrice)}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
              <div style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                  Date Range
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    style={{ width: '100%', padding: '6px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    style={{ width: '100%', padding: '6px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
              </div>
              {filterOptions.map(filter => (
                <div
                  key={filter}
                  className={`dropdown-item ${selectedFilters.has(filter) ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect(filter)}
                >
                  {formatTicketType(filter)}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="page-header">
        <h1 className="page-title">Ticket Finder</h1>
      </div>

      <main className="main-container">
        <div className="sidebar">
          <button
            className={`add-item-btn ${showForm ? 'close' : ''}`}
            onClick={() => setShowForm(!showForm)}
          >
            <span style={{ fontSize: '1.5em', fontWeight: 'bold', marginRight: '8px', verticalAlign: 'middle' }}>
              {showForm ? '✕' : '+'}
            </span>
            <span style={{ verticalAlign: 'middle' }}>{showForm ? 'Close Form' : 'Add New Item'}</span>
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
                  <option key={option} value={option}>{formatTicketType(option)}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Event Date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
              <input
                type="number"
                placeholder="Price ($)"
                min="0"
                value={price}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || parseFloat(val) >= 0) setPrice(val);
                }}
              />
              <button onClick={handleAddItem}>Save Item</button>
            </div>
          )}

          <button className="view-offers-btn" onClick={() => setShowMyOffers(true)}>
            View My Offers
          </button>

          <button className="view-offers-btn" style={{ background: '#7f8c8d' }} onClick={() => setShowMyListings(true)}>
            Manage My Listings
          </button>

        </div>

        <div className="item-list">
          {displayedItems.map(item => (
            <div key={item.id} className="item-card" onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="item-text">{item.description}</span>
                <span className="item-date">{new Date(item.eventDate).toLocaleDateString()}</span>
                <span className="item-type">{formatTicketType(item.eventType)}</span>
              </div>
              <span className="item-price">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        {selectedItem && (
          <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedItem(null)}>✕</button>
              
              <h2 className="modal-title">{selectedItem.description}</h2>
              <p className="modal-date">Event on: {new Date(selectedItem.eventDate).toLocaleDateString()}</p>
              <p className="modal-type">{formatTicketType(selectedItem.eventType)}</p>
              <p className="modal-price">${(selectedItem.price ?? 0).toFixed(2)}</p>

              <div className="modal-inputs">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="modal-input"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="modal-input"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button className="modal-send-btn" onClick={handleSendOffer}>Send Offer</button>
              </div>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="modal-overlay" onClick={() => setShowConfirmation(false)}>
            <div className="modal-card confirm-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowConfirmation(false)}>✕</button>
              <h2 className="confirm-title">Message Sent!</h2>
              <p className="confirm-body">
                Your offer has been sent! Please wait, the ticket holder will reach out to you directly.
              </p>
            </div>
          </div>
        )}

        {showMyOffers && (
          <div className="modal-overlay" onClick={() => setShowMyOffers(false)}>
            <div className="modal-card confirm-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowMyOffers(false)}>✕</button>
              <h2 className="confirm-title">View My Offers</h2>
              <input
                type="text"
                placeholder="Your UNL email"
                className="modal-input"
                value={myOffersEmail}
                onChange={(e) => setMyOffersEmail(e.target.value)}
                style={{ marginTop: '12px' }}
              />
              <div className="modal-footer" style={{ marginTop: '16px', marginBottom: '16px' }}>
                <button className="modal-send-btn" onClick={handleFetchMyOffers}>Check Offers</button>
              </div>
              {myOffers.length === 0 ? (
                <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No offers yet.</p>
              ) :
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '12px 0' }} />
                  <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px' }}>
                    {myOffers.map((offer, index) => (
                      <div key={offer.id ?? index} style={{ padding: '12px', paddingRight: '32px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee', position: 'relative' }}>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#c0392b',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >✕</button>
                        <div style={{ fontWeight: '600', color: '#2c3e50' }}>{offer.ticketName}</div>
                        <div style={{ color: '#4a4a6a', fontSize: '14px' }}>{offer.buyerName}</div>
                        <div style={{ color: '#4a4a6a', fontSize: '14px' }}>{offer.buyerPhone}</div>
                        <div style={{ color: '#aaa', fontSize: '12px' }}>{new Date(offer.submittedAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </>
              }
            </div>
          </div>
        )}

        {showMyListings && (
          <div className="modal-overlay" onClick={() => { setShowMyListings(false); setMyListings([]); setMyListingsEmail(''); }}>
            <div className="modal-card confirm-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => { setShowMyListings(false); setMyListings([]); setMyListingsEmail(''); }}>✕</button>
              <h2 className="confirm-title">Manage My Listings</h2>
              <input
                type="text"
                placeholder="Your UNL email"
                className="modal-input"
                value={myListingsEmail}
                onChange={(e) => setMyListingsEmail(e.target.value)}
                style={{ marginTop: '12px', marginBottom: '16px' }}
              />
              <div className="modal-footer" style={{ marginBottom: '16px' }}>
                <button className="modal-send-btn" onClick={handleFetchMyListings}>Check Listings</button>
                <button className="modal-send-btn" style={{ marginLeft: '10px' }} onClick={() => { setShowMyListings(false); setMyListings([]); setMyListingsEmail(''); }}>Close</button>
              </div>
              {myListings.length === 0 ? (
                <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No listings found.</p>
              ) : (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '12px 0' }} />
                  <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px' }}>
                    {myListings.map((listing, index) => (
                      <div key={listing.id ?? index} style={{ padding: '12px', paddingRight: '32px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee', position: 'relative' }}>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#c0392b',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >✕</button>
                        <div style={{ fontWeight: '600', color: '#2c3e50' }}>{listing.eventName}</div>
                        <div style={{ color: '#4a4a6a', fontSize: '14px', fontStyle: 'italic' }}>{formatTicketType(listing.type)}</div>
                        <div style={{ color: '#27ae60', fontWeight: 'bold' }}>${(listing.price ?? 0).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default App;