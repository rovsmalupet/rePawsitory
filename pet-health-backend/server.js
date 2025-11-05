// server/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const mongoose = require('mongoose');
const { User, Pet, MedicalRecord, PetAccess } = require('./models');
const { connectToDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const { auth, checkRole } = require('./middleware/auth');
const upload = require('./config/multer');
const uploadMedicalRecord = require('./config/multerMedicalRecords');

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use authentication routes
app.use('/api', authRoutes);

// Protected route example
app.get('/api/profile', auth, async (req, res) => {
  try {
    // req.user is set by auth middleware
    res.json({
      message: 'Profile accessed successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected route with role check
app.get('/api/vet-only', auth, checkRole(['veterinarian']), (req, res) => {
  res.json({ message: 'Welcome, veterinarian!' });
});

// Medical record file upload endpoint (supports multiple files)
app.post('/api/upload/medical-record', auth, uploadMedicalRecord.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    // Return the URLs for all uploaded files
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      fileUrl: `/uploads/medical-records/${file.filename}`,
      fileType: file.mimetype
    }));

    res.json({ 
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Image upload endpoint for pets
app.post('/api/upload/pet-image', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the URL path to the uploaded image
    const imageUrl = `/uploads/pets/${req.file.filename}`;
    res.json({ 
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get patients for veterinarian
app.get('/api/vet/patients', auth, checkRole(['veterinarian']), async (req, res) => {
  try {
    console.log('Fetching patients for vet:', req.user._id);
    
    // Find all pets this vet has access to
    const petAccesses = await PetAccess.find({
      veterinarian: req.user._id,
      isRevoked: false
    }).populate({
      path: 'pet',
      populate: {
        path: 'owner',
        select: 'name email'
      }
    });

    console.log('Found pet accesses:', petAccesses.length);
    petAccesses.forEach(access => {
      if (access.pet) {
        console.log('- Pet:', access.pet.name, '(ID:', access.pet._id + ')');
      }
    });

    // Extract and format pet data with owner info
    const patients = petAccesses
      .filter(access => access.pet) // Filter out any null pets
      .map(access => ({
        _id: access.pet._id,
        name: access.pet.name,
        species: access.pet.species,
        breed: access.pet.breed,
        dateOfBirth: access.pet.dateOfBirth,
        gender: access.pet.gender,
        weight: access.pet.weight,
        color: access.pet.color,
        microchipId: access.pet.microchipId,
        photoUrl: access.pet.photoUrl,
        allergies: access.pet.allergies,
        chronicConditions: access.pet.chronicConditions,
        owner: {
          _id: access.pet.owner._id,
          name: access.pet.owner.name,
          email: access.pet.owner.email
        },
        accessLevel: access.accessLevel,
        permissions: access.permissions
      }));

    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get all veterinarians (for pet owners to search and request access)
app.get('/api/vets', auth, async (req, res) => {
  try {
    const veterinarians = await User.find({ role: 'veterinarian' })
      .select('name email clinic license specialization address')
      .lean();

    res.json(veterinarians);
  } catch (error) {
    console.error('Error fetching veterinarians:', error);
    res.status(500).json({ error: 'Failed to fetch veterinarians' });
  }
});

// Connect to MongoDB
connectToDatabase();

  
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
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
