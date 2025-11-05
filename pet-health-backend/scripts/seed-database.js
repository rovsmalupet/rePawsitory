const mongoose = require('mongoose');
const { User, Pet, MedicalRecord, PetAccess } = require('../models');
const { connectToDatabase } = require('../db');

// Sample data
const sampleUsers = [
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    role: 'pet_owner',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'pet_owner',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    }
  },
  {
    name: 'Dr. Emily Parker',
    email: 'dr.parker@vetclinic.com',
    password: 'password123',
    role: 'veterinarian',
    clinic: 'Paws & Claws Veterinary Clinic',
    license: 'VET-CA-12345',
    specialization: 'General Practice',
    address: {
      street: '789 Pet Lane',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'USA'
    }
  },
  {
    name: 'Dr. Michael Chen',
    email: 'dr.chen@vetclinic.com',
    password: 'password123',
    role: 'veterinarian',
    clinic: 'Advanced Animal Hospital',
    license: 'VET-CA-67890',
    specialization: 'Surgery',
    address: {
      street: '321 Animal Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90002',
      country: 'USA'
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectToDatabase();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Pet.deleteMany({});
    await MedicalRecord.deleteMany({});
    await PetAccess.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const users = await User.create(sampleUsers);
    console.log(`✅ Created ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    console.log('');

    const [johnSmith, sarahJohnson, drParker, drChen] = users;

    // Create pets for John Smith
    console.log('🐾 Creating pets...');
    const johnsPets = await Pet.create([
      {
        owner: johnSmith._id,
        name: 'Max',
        species: 'Dog',
        breed: 'Golden Retriever',
        dateOfBirth: new Date('2020-03-15'),
        gender: 'male',
        weight: {
          value: 30,
          unit: 'kg',
          date: new Date()
        },
        color: 'Golden',
        microchipId: 'MC123456789',
        photoUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
        allergies: ['Chicken', 'Wheat'],
        chronicConditions: [
          {
            condition: 'Hip Dysplasia',
            diagnosedDate: new Date('2022-06-10'),
            notes: 'Mild condition, managed with exercise and supplements'
          }
        ],
        emergencyContact: {
          name: 'Jane Smith',
          phone: '(555) 123-4567',
          email: 'jane@example.com',
          relationship: 'Spouse'
        }
      },
      {
        owner: johnSmith._id,
        name: 'Luna',
        species: 'Cat',
        breed: 'Siamese',
        dateOfBirth: new Date('2021-07-22'),
        gender: 'female',
        weight: {
          value: 4.5,
          unit: 'kg',
          date: new Date()
        },
        color: 'Seal Point',
        microchipId: 'MC987654321',
        photoUrl: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400',
        allergies: ['Fish'],
        emergencyContact: {
          name: 'Jane Smith',
          phone: '(555) 123-4567',
          email: 'jane@example.com',
          relationship: 'Spouse'
        }
      }
    ]);

    // Create pets for Sarah Johnson
    const sarahsPets = await Pet.create([
      {
        owner: sarahJohnson._id,
        name: 'Buddy',
        species: 'Dog',
        breed: 'Labrador Retriever',
        dateOfBirth: new Date('2019-11-05'),
        gender: 'male',
        weight: {
          value: 32,
          unit: 'kg',
          date: new Date()
        },
        color: 'Yellow',
        microchipId: 'MC456789123',
        photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
        allergies: [],
        emergencyContact: {
          name: 'Robert Johnson',
          phone: '(555) 987-6543',
          email: 'robert@example.com',
          relationship: 'Spouse'
        }
      },
      {
        owner: sarahJohnson._id,
        name: 'Whiskers',
        species: 'Cat',
        breed: 'Maine Coon',
        dateOfBirth: new Date('2022-01-10'),
        gender: 'male',
        weight: {
          value: 6.2,
          unit: 'kg',
          date: new Date()
        },
        color: 'Brown Tabby',
        microchipId: 'MC789123456',
        photoUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
        allergies: ['Dairy'],
        emergencyContact: {
          name: 'Robert Johnson',
          phone: '(555) 987-6543',
          email: 'robert@example.com',
          relationship: 'Spouse'
        }
      }
    ]);

    const allPets = [...johnsPets, ...sarahsPets];
    console.log(`✅ Created ${allPets.length} pets:`);
    allPets.forEach(pet => {
      const owner = users.find(u => u._id.equals(pet.owner));
      console.log(`   - ${pet.name} (${pet.species} - ${pet.breed}) - Owner: ${owner.name}`);
    });
    console.log('');

    // Create medical records
    console.log('📋 Creating medical records...');
    const medicalRecords = await MedicalRecord.create([
      // Max's records
      {
        pet: johnsPets[0]._id,
        recordType: 'vaccination',
        date: new Date('2024-01-15'),
        veterinarian: drParker._id,
        createdBy: drParker._id,
        vaccination: {
          name: 'Rabies',
          manufacturer: 'Zoetis',
          batchNumber: 'RAB2024-001',
          date: new Date('2024-01-15'),
          nextDueDate: new Date('2027-01-15'),
          administeredBy: drParker._id
        },
        notes: 'Annual rabies vaccination. No adverse reactions.',
        cost: {
          amount: 45.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-01-15')
        }
      },
      {
        pet: johnsPets[0]._id,
        recordType: 'checkup',
        date: new Date('2024-06-10'),
        veterinarian: drParker._id,
        createdBy: drParker._id,
        checkup: {
          reason: 'Annual wellness exam',
          findings: 'Overall healthy. Slight weight gain noticed. Hip joints examined, mild arthritis present.',
          recommendations: 'Reduce food portions slightly. Continue joint supplements. Consider hydrotherapy.',
          followUpDate: new Date('2024-12-10')
        },
        notes: 'Patient cooperative. Vital signs normal. Weight: 30kg (up from 28kg last year)',
        cost: {
          amount: 120.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-06-10')
        }
      },
      {
        pet: johnsPets[0]._id,
        recordType: 'medication',
        date: new Date('2024-06-10'),
        veterinarian: drParker._id,
        createdBy: drParker._id,
        medication: {
          name: 'Carprofen',
          dosage: '75mg',
          frequency: 'Twice daily with food',
          startDate: new Date('2024-06-10'),
          endDate: new Date('2024-12-10'),
          prescribedBy: drParker._id
        },
        notes: 'For hip dysplasia management. Monitor for GI upset.',
        cost: {
          amount: 65.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-06-10')
        }
      },
      // Luna's records
      {
        pet: johnsPets[1]._id,
        recordType: 'vaccination',
        date: new Date('2024-02-20'),
        veterinarian: drParker._id,
        createdBy: drParker._id,
        vaccination: {
          name: 'FVRCP',
          manufacturer: 'Merck',
          batchNumber: 'FVRCP2024-015',
          date: new Date('2024-02-20'),
          nextDueDate: new Date('2027-02-20'),
          administeredBy: drParker._id
        },
        notes: 'Feline viral rhinotracheitis, calicivirus, and panleukopenia vaccination. No reactions.',
        cost: {
          amount: 38.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-02-20')
        }
      },
      {
        pet: johnsPets[1]._id,
        recordType: 'checkup',
        date: new Date('2024-08-15'),
        veterinarian: drParker._id,
        createdBy: drParker._id,
        checkup: {
          reason: 'Annual wellness exam',
          findings: 'Healthy adult cat. Dental health good. No abnormalities detected.',
          recommendations: 'Continue current diet. Annual dental cleaning recommended next year.',
          followUpDate: new Date('2025-08-15')
        },
        notes: 'Weight stable at 4.5kg. Patient slightly anxious but cooperative.',
        cost: {
          amount: 95.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-08-15')
        }
      },
      // Buddy's records
      {
        pet: sarahsPets[0]._id,
        recordType: 'vaccination',
        date: new Date('2024-03-10'),
        veterinarian: drChen._id,
        createdBy: drChen._id,
        vaccination: {
          name: 'DHPP',
          manufacturer: 'Boehringer Ingelheim',
          batchNumber: 'DHPP2024-022',
          date: new Date('2024-03-10'),
          nextDueDate: new Date('2027-03-10'),
          administeredBy: drChen._id
        },
        notes: 'Distemper, hepatitis, parvovirus, and parainfluenza combination vaccine.',
        cost: {
          amount: 42.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-03-10')
        }
      },
      {
        pet: sarahsPets[0]._id,
        recordType: 'surgery',
        date: new Date('2024-05-22'),
        veterinarian: drChen._id,
        createdBy: drChen._id,
        surgery: {
          procedure: 'Dental cleaning and extraction',
          preOpNotes: 'Patient fasted 12 hours. Pre-anesthetic bloodwork normal.',
          postOpNotes: 'Two molars extracted due to severe decay. Procedure successful.',
          complications: 'None',
          recovery: 'Patient recovered well from anesthesia. Eating soft food normally.'
        },
        notes: 'Owner advised on dental care routine. Recheck in 2 weeks.',
        cost: {
          amount: 650.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-05-22')
        }
      },
      // Whiskers' records
      {
        pet: sarahsPets[1]._id,
        recordType: 'vaccination',
        date: new Date('2024-04-05'),
        veterinarian: drChen._id,
        createdBy: drChen._id,
        vaccination: {
          name: 'Rabies',
          manufacturer: 'Zoetis',
          batchNumber: 'RAB2024-012',
          date: new Date('2024-04-05'),
          nextDueDate: new Date('2027-04-05'),
          administeredBy: drChen._id
        },
        notes: 'First rabies vaccination. Patient handled well.',
        cost: {
          amount: 45.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-04-05')
        }
      }
    ]);

    console.log(`✅ Created ${medicalRecords.length} medical records`);
    console.log('');

    // Grant access to veterinarians
    console.log('🔑 Granting veterinarian access...');
    const petAccesses = await PetAccess.create([
      // Dr. Parker has access to John's pets
      {
        pet: johnsPets[0]._id,
        veterinarian: drParker._id,
        accessLevel: 'write',
        permissions: {
          viewMedicalHistory: true,
          addMedicalRecords: true,
          editMedicalRecords: true,
          deleteMedicalRecords: false,
          addPrescriptions: true,
          scheduleAppointments: true
        },
        grantedBy: johnSmith._id,
        notes: 'Primary veterinarian'
      },
      {
        pet: johnsPets[1]._id,
        veterinarian: drParker._id,
        accessLevel: 'write',
        permissions: {
          viewMedicalHistory: true,
          addMedicalRecords: true,
          editMedicalRecords: true,
          deleteMedicalRecords: false,
          addPrescriptions: true,
          scheduleAppointments: true
        },
        grantedBy: johnSmith._id,
        notes: 'Primary veterinarian'
      },
      // Dr. Chen has access to Sarah's pets
      {
        pet: sarahsPets[0]._id,
        veterinarian: drChen._id,
        accessLevel: 'write',
        permissions: {
          viewMedicalHistory: true,
          addMedicalRecords: true,
          editMedicalRecords: true,
          deleteMedicalRecords: false,
          addPrescriptions: true,
          scheduleAppointments: true
        },
        grantedBy: sarahJohnson._id,
        notes: 'Primary veterinarian'
      },
      {
        pet: sarahsPets[1]._id,
        veterinarian: drChen._id,
        accessLevel: 'write',
        permissions: {
          viewMedicalHistory: true,
          addMedicalRecords: true,
          editMedicalRecords: true,
          deleteMedicalRecords: false,
          addPrescriptions: true,
          scheduleAppointments: true
        },
        grantedBy: sarahJohnson._id,
        notes: 'Primary veterinarian'
      }
    ]);

    console.log(`✅ Created ${petAccesses.length} veterinarian access grants`);
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   • ${users.length} users created`);
    console.log(`   • ${allPets.length} pets created`);
    console.log(`   • ${medicalRecords.length} medical records created`);
    console.log(`   • ${petAccesses.length} veterinarian access grants created`);
    console.log('\n👤 Test Accounts:');
    console.log('   Pet Owners:');
    console.log('   • Email: john@example.com | Password: password123');
    console.log('   • Email: sarah@example.com | Password: password123');
    console.log('\n   Veterinarians:');
    console.log('   • Email: dr.parker@vetclinic.com | Password: password123');
    console.log('   • Email: dr.chen@vetclinic.com | Password: password123');
    console.log('\n🐾 Pets:');
    console.log('   John\'s Pets:');
    console.log('   • Max (Golden Retriever)');
    console.log('   • Luna (Siamese Cat)');
    console.log('\n   Sarah\'s Pets:');
    console.log('   • Buddy (Labrador Retriever)');
    console.log('   • Whiskers (Maine Coon)');
    console.log('\n═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
