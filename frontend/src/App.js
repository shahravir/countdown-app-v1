import React, { useEffect, useState, useRef } from 'react';
import './App.css';

const API_URL = 'http://localhost:5001/api/events';
const PLACEHOLDER_COUNT = 12; // Number of total tiles (events + placeholders)

function getCountdown(date) {
  const now = new Date();
  const eventDate = new Date(date);
  const diff = eventDate - now;
  if (diff <= 0) return { done: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return {
    done: false,
    days, hours, minutes, seconds
  };
}

function formatUKDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).replace(',', '');
}

function getProgress(event) {
  const now = new Date();
  const eventDate = new Date(event.date);
  const created = event.createdAt ? new Date(event.createdAt) : new Date(event._id ? parseInt(event._id.substring(0,8), 16) * 1000 : Date.now());
  // fallback: use MongoDB ObjectId timestamp if available
  const total = eventDate - created;
  const elapsed = now - created;
  if (total <= 0) return 100;
  let percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  return percent;
}

function getTimeLeft(date) {
  const now = new Date();
  const eventDate = new Date(date);
  let diff = eventDate - now;
  if (diff <= 0) return 'Event Passed';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', date: '', description: '', id: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hidden, setHidden] = useState([]); // store hidden event ids
  const [showHidden, setShowHidden] = useState(false); // toggle for hidden cards
  const [now, setNow] = useState(Date.now()); // for live countdown
  const [showModal, setShowModal] = useState(false); // modal for add/edit
  const intervalRef = useRef();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      let data = await res.json();
      // Add createdAt fallback for old events
      data = data.map(ev => ({ ...ev, createdAt: ev.createdAt || (ev._id ? new Date(parseInt(ev._id.substring(0,8), 16) * 1000).toISOString() : new Date().toISOString()) }));
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Live countdown update every second
  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `${API_URL}/${form.id}` : API_URL;
      const body = { title: form.title, date: form.date, description: form.description };
      if (!form.id) body.createdAt = new Date().toISOString();
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to save event');
      setForm({ title: '', date: '', description: '', id: null });
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = event => {
    setForm({
      title: event.title,
      date: event.date.slice(0, 16), // for input type="datetime-local"
      description: event.description || '',
      id: event._id
    });
    setShowModal(true);
  };

  // Hide event (for both active and completed)
  const handleHide = id => {
    setHidden([...hidden, id]);
  };

  // Show all hidden events
  const handleShowHidden = () => {
    setShowHidden(!showHidden);
  };

  // Unhide a hidden event
  const handleUnhide = id => {
    setHidden(hidden.filter(hid => hid !== id));
  };

  const openAddModal = () => {
    setForm({ title: '', date: '', description: '', id: null });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ title: '', date: '', description: '', id: null });
    setError('');
  };

  // Calculate how many placeholders to show
  const visibleEvents = events.filter(event => !hidden.includes(event._id));
  const placeholders = Math.max(0, PLACEHOLDER_COUNT - visibleEvents.length);

  return (
    <div className="fullscreen-bg">
      <header className="sticky-header">
        <h1>Countdown Events</h1>
        <button className="add-event-btn" onClick={openAddModal}>+ Add Event</button>
      </header>
      <button className="show-hidden-btn" onClick={handleShowHidden}>
        {showHidden ? 'Hide Hidden Cards' : 'Show Hidden Cards'}
      </button>
      {error && <div className="error">{error}</div>}
      {loading ? <p>Loading...</p> : (
        <>
          <div className="event-grid fullscreen-grid rect-card-grid">
            {visibleEvents.map(event => {
              const countdown = getCountdown(event.date);
              const progress = getProgress(event);
              return (
                <div
                  key={event._id}
                  className={`event-tile rect-card${countdown.done ? ' event-tile-done' : ''}`}
                  style={{
                    background: `linear-gradient(90deg, #b9f6ca ${progress}%, #fff ${progress}%)`,
                    position: 'relative'
                  }}
                >
                  <button className="card-hide-btn" onClick={() => handleHide(event._id)} title="Hide Event">×</button>
                  <div className="card-content">
                    <strong className="card-title" onClick={() => handleEdit(event)} title="Edit Event" style={{cursor:'pointer'}}>{event.title}</strong> <br />
                    <span>{event.description}</span><br />
                    <span className="event-date"> <b>ETA:</b> {formatUKDate(event.date)}</span><br />
                    <span className="live-timer"> <b>Time Left:</b> <span className="timer-text">{getTimeLeft(event.date)}</span></span>
                  </div>
                </div>
              );
            })}
            {Array.from({ length: placeholders }).map((_, idx) => (
              <div key={`ph-${idx}`} className="event-tile rect-card placeholder-tile" onClick={openAddModal}>
                <div className="placeholder-content">+
                  <div className="placeholder-label">Add Event</div>
                </div>
              </div>
            ))}
          </div>
          {showHidden && (
            <div className="event-grid hidden-grid fullscreen-grid rect-card-grid">
              {events.filter(event => hidden.includes(event._id)).map(event => {
                const countdown = getCountdown(event.date);
                const progress = getProgress(event);
                return (
                  <div
                    key={event._id}
                    className={`event-tile rect-card event-tile-hidden${countdown.done ? ' event-tile-done' : ''}`}
                  >
                    <button className="card-hide-btn" onClick={() => handleUnhide(event._id)} title="Unhide Event">👁️</button>
                    <div className="card-content">
                      <strong className="card-title" onClick={() => handleEdit(event)} title="Edit Event" style={{cursor:'pointer'}}>{event.title}</strong> <br />
                      <span>{event.description}</span><br />
                      <span className="event-date"><span role="img" aria-label="calendar">📅</span> <b>Date:</b> {formatUKDate(event.date)}</span><br />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      {showModal && (
        <div className="modal-bg" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{form.id ? 'Edit Event' : 'Add Event'}</h2>
            <form onSubmit={handleSubmit} className="event-form-modal">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Event Title"
                required
                autoFocus
              />
              <input
                name="date"
                type="datetime-local"
                value={form.date}
                onChange={handleChange}
                required
              />
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description (optional)"
              />
              <div className="modal-actions">
                <button type="submit">{form.id ? 'Update' : 'Add'} Event</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
            {error && <div className="error">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
