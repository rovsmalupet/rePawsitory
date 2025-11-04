// server/server.js
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require('mongoose');
const Pet = require('./Pet');
app.use(cors()); // allow React frontend to access this API
app.use(express.json());
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pethealthdb';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log(`✅ Connected to MongoDB at ${MONGO_URI}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  
// Endpoint to send data to frontend
app.get("/pets", async (req, res) => {
  try {
    const pets = await Pet.find().lean();
    return res.json(pets);
  } catch (err) {
    console.error('Error fetching pets:', err);
    return res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// Endpoint to add a new pet
app.post("/pets", async (req, res) => {
  try {
    const { name, species, breed, age, photo } = req.body || {};

    if (!name || !species) {
      return res.status(400).json({ error: "'name' and 'species' are required" });
    }

    const pet = new Pet({
      name,
      species,
      breed: breed || "",
      age: typeof age === "number" ? age : Number(age) || 0,
      photo: photo || "",
    });

    const saved = await pet.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating pet:', err);
    return res.status(500).json({ error: 'Failed to create pet' });
  }
});

// Start server
app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
