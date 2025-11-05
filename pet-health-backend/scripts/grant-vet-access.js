const mongoose = require('mongoose');
const { User, Pet, PetAccess } = require('./models');
const { connectToDatabase } = require('./db');

async function grantVetAccess() {
  try {
    await connectToDatabase();

    // Get the vet user
    const vet = await User.findOne({ email: 'vet@example.com' });
    if (!vet) {
      console.log('Vet not found. Please create a vet account first.');
      return;
    }
    console.log('Found vet:', vet.name);

    // Get a pet (any pet in the database)
    const pet = await Pet.findOne().populate('owner');
    if (!pet) {
      console.log('No pets found. Please create a pet first.');
      return;
    }
    console.log('Found pet:', pet.name, 'owned by:', pet.owner.name);

    // Check if access already exists
    const existingAccess = await PetAccess.findOne({
      pet: pet._id,
      veterinarian: vet._id,
      isRevoked: false
    });

    if (existingAccess) {
      console.log('Vet already has access to this pet');
      return;
    }

    // Create pet access
    const petAccess = new PetAccess({
      pet: pet._id,
      veterinarian: vet._id,
      accessLevel: 'write',
      permissions: {
        viewMedicalHistory: true,
        addMedicalRecords: true,
        editMedicalRecords: true,
        deleteMedicalRecords: false,
        addPrescriptions: true,
        scheduleAppointments: true
      },
      grantedBy: pet.owner._id,
      notes: 'Access granted for testing'
    });

    await petAccess.save();
    console.log('✅ Pet access granted successfully!');
    console.log('Vet:', vet.name, 'can now access pet:', pet.name);

  } catch (error) {
    console.error('Error granting vet access:', error);
  } finally {
    await mongoose.connection.close();
  }
}

grantVetAccess();