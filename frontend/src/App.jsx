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

  const filterOptions = ['Football', 'Volleyball', 'Basketball', 'Music', 'Expensive', 'Cheap'];
  const filterContainerRef = useRef(null);

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

  const handleAddItem = () => {
    if (description && price) {
      const newItem = {
        id: Date.now(), // simple unique id
        description,
        price: parseFloat(price).toFixed(2)
      };
      setItems([...items, newItem]);
      // Clear inputs
      setDescription('');
      setPrice('');
    } else {
      alert('Please enter both description and price.');
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="home-icon" onClick={() => window.location.reload()}>🏠</div>
        <div className="search-group">
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => alert('Searching for: ' + searchTerm)}>Search</button>
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
        {/* Left Column Wrapper */}
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
                placeholder="Item Description"
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
        </div>

        {/* Right Column Content */}

        <div className="item-list">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <span className="item-text">{item.description}</span>
              <span className="item-price">${item.price}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

export default App
