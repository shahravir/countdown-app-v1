const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Event = require('./models/Event');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/countdown-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new event
app.post('/api/events', async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const event = new Event({ title, date, description });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update an event
app.put('/api/events/:id', async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, date, description },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});