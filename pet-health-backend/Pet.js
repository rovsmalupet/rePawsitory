const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    default: '',
    trim: true
  },
  age: {
    type: Number,
    default: 0,
    min: 0
  },
  photo: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Pet', petSchema);

