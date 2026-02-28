import { useState, useEffect, useRef } from 'react';
import './App.css'

function App() {
  // State for UI elements
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // State for data
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const [items, setItems] = useState([]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

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
        }));
        setItems(mappedItems);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    // Effect to handle clicking outside the filter dropdown to close it
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

  // Event Handlers
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
    if (description && price) {
      const newItem = {
        // The backend expects a full TicketSale object.
        // We'll use defaults for fields not in the form.
        studentEmail: 'user@example.com', // Placeholder
        eventName: description,
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

        // Add new item to state, mapping to local structure
        setItems([...items, {
          id: createdTicket.id,
          description: createdTicket.eventName,
          price: createdTicket.price
        }]);

        // Clear inputs
        setDescription('');
        setPrice('');
        setShowForm(false); // Optionally close form on success
      } catch (error) {
        console.error('Error adding item:', error);
        alert('Failed to add item. Please try again.');
      }
    } else {
      alert('Please enter both description and price.');
    }
  };

  // Filter and sort items before rendering
  const displayedItems = items
    .filter(item => {
      // Filter by selected event types
      const filterMatch = selectedFilters.size === 0 || selectedFilters.has(item.description);
      // Filter by search term (case-insensitive search on description)
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
              placeholder="Event Name"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="number"
              placeholder="Price ($)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <button onClick={handleAddItem}>Save Item</button>
          </div>
        )}

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
  )
}

export default App
