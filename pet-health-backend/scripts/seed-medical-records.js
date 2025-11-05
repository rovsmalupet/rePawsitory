const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { User, Pet, MedicalRecord } = require('../models');
const { connectToDatabase } = require('../db');

// Create dummy PDF files for testing
const createDummyFiles = () => {
  const uploadsDir = path.join(__dirname, '../uploads/medical-records');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create some dummy PDF files (just text files with .pdf extension for testing)
  const dummyFiles = [
    'vaccination-record-001.pdf',
    'checkup-report-001.pdf',
    'lab-results-001.pdf',
    'surgery-notes-001.pdf',
    'medication-prescription-001.pdf',
    'xray-image-001.jpg'
  ];

  dummyFiles.forEach(filename => {
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `Dummy medical record file: ${filename}\nCreated: ${new Date().toISOString()}`);
      console.log(`Created dummy file: ${filename}`);
    }
  });

  return dummyFiles;
};

const seedMedicalRecords = async () => {
  try {
    await connectToDatabase();
    console.log('Connected to database');

    // Create dummy files first
    const dummyFiles = createDummyFiles();

    // Find existing users and pets
    const vets = await User.find({ role: 'veterinarian' }).limit(2);
    const pets = await Pet.find().limit(4);

    if (vets.length === 0) {
      console.log('No veterinarians found. Please run create-test-users.js first.');
      process.exit(1);
    }

    if (pets.length === 0) {
      console.log('No pets found. Please run seed-database.js first.');
      process.exit(1);
    }

    console.log(`Found ${vets.length} vets and ${pets.length} pets`);

    // Clear existing medical records (optional - comment out if you want to keep existing)
    await MedicalRecord.deleteMany({});
    console.log('Cleared existing medical records');

    const records = [];

    // Medical Record 1: Vaccination for first pet
    if (pets[0]) {
      records.push(new MedicalRecord({
        pet: pets[0]._id,
        recordType: 'vaccination',
        vaccination: {
          name: 'Rabies Vaccine',
          manufacturer: 'Nobivac',
          batchNumber: 'RB-2024-1234',
          date: new Date('2024-10-15'),
          nextDueDate: new Date('2025-10-15'),
          administeredBy: vets[0]._id
        },
        date: new Date('2024-10-15'),
        veterinarian: vets[0]._id,
        notes: 'Annual rabies vaccination administered. No adverse reactions observed. Pet tolerated procedure well.',
        attachments: [{
          filename: dummyFiles[0],
          fileUrl: `/uploads/medical-records/${dummyFiles[0]}`,
          fileType: 'application/pdf',
          uploadDate: new Date()
        }],
        cost: {
          amount: 45.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-10-15')
        },
        createdBy: vets[0]._id,
        updatedBy: vets[0]._id
      }));
    }

    // Medical Record 2: Checkup for second pet
    if (pets[1]) {
      records.push(new MedicalRecord({
        pet: pets[1]._id,
        recordType: 'checkup',
        checkup: {
          reason: 'Annual wellness exam',
          findings: 'Overall good health. Slight dental tartar buildup noted. Weight within normal range.',
          recommendations: 'Schedule dental cleaning in next 3 months. Continue current diet and exercise routine.',
          followUpDate: new Date('2025-02-01')
        },
        date: new Date('2024-11-01'),
        veterinarian: vets[0]._id,
        notes: 'Comprehensive physical examination performed. Heart and lungs sound clear. Teeth show mild tartar.',
        attachments: [{
          filename: dummyFiles[1],
          fileUrl: `/uploads/medical-records/${dummyFiles[1]}`,
          fileType: 'application/pdf',
          uploadDate: new Date()
        }],
        cost: {
          amount: 85.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-11-01')
        },
        createdBy: vets[0]._id,
        updatedBy: vets[0]._id
      }));
    }

    // Medical Record 3: Medication for first pet
    if (pets[0] && vets[1]) {
      records.push(new MedicalRecord({
        pet: pets[0]._id,
        recordType: 'medication',
        medication: {
          name: 'Carprofen',
          dosage: '25mg',
          frequency: 'Twice daily',
          startDate: new Date('2024-09-10'),
          endDate: new Date('2024-09-24'),
          prescribedBy: vets[1]._id
        },
        date: new Date('2024-09-10'),
        veterinarian: vets[1]._id,
        notes: 'Prescribed for mild arthritis pain. Monitor for any GI upset. Take with food.',
        attachments: [{
          filename: dummyFiles[4],
          fileUrl: `/uploads/medical-records/${dummyFiles[4]}`,
          fileType: 'application/pdf',
          uploadDate: new Date()
        }],
        cost: {
          amount: 32.50,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-09-10')
        },
        createdBy: vets[1]._id,
        updatedBy: vets[1]._id
      }));
    }

    // Medical Record 4: Surgery for third pet
    if (pets[2]) {
      records.push(new MedicalRecord({
        pet: pets[2]._id,
        recordType: 'surgery',
        surgery: {
          procedure: 'Dental Cleaning and Extraction',
          preOpNotes: 'Pre-anesthetic bloodwork normal. Fasted 12 hours prior.',
          postOpNotes: 'Procedure completed successfully. Two molars extracted due to severe decay.',
          complications: 'None',
          recovery: 'Patient recovered well from anesthesia. Prescribed pain medication and antibiotics.'
        },
        date: new Date('2024-08-20'),
        veterinarian: vets[0]._id,
        notes: 'Dental surgery performed under general anesthesia. Patient monitored throughout procedure.',
        attachments: [
          {
            filename: dummyFiles[3],
            fileUrl: `/uploads/medical-records/${dummyFiles[3]}`,
            fileType: 'application/pdf',
            uploadDate: new Date()
          },
          {
            filename: dummyFiles[5],
            fileUrl: `/uploads/medical-records/${dummyFiles[5]}`,
            fileType: 'image/jpeg',
            uploadDate: new Date()
          }
        ],
        cost: {
          amount: 450.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-08-20')
        },
        createdBy: vets[0]._id,
        updatedBy: vets[0]._id
      }));
    }

    // Medical Record 5: Lab results for second pet
    if (pets[1] && vets[1]) {
      records.push(new MedicalRecord({
        pet: pets[1]._id,
        recordType: 'lab_result',
        date: new Date('2024-10-05'),
        veterinarian: vets[1]._id,
        notes: 'Complete Blood Count (CBC) and Chemistry Panel. All values within normal limits. Kidney and liver function excellent.',
        attachments: [{
          filename: dummyFiles[2],
          fileUrl: `/uploads/medical-records/${dummyFiles[2]}`,
          fileType: 'application/pdf',
          uploadDate: new Date()
        }],
        cost: {
          amount: 120.00,
          currency: 'USD',
          paid: true,
          paymentDate: new Date('2024-10-05')
        },
        createdBy: vets[1]._id,
        updatedBy: vets[1]._id
      }));
    }

    // Medical Record 6: Another vaccination for fourth pet
    if (pets[3] && vets[1]) {
      records.push(new MedicalRecord({
        pet: pets[3]._id,
        recordType: 'vaccination',
        vaccination: {
          name: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
          manufacturer: 'Fel-O-Vax',
          batchNumber: 'FV-2024-5678',
          date: new Date('2024-09-01'),
          nextDueDate: new Date('2025-09-01'),
          administeredBy: vets[1]._id
        },
        date: new Date('2024-09-01'),
        veterinarian: vets[1]._id,
        notes: 'Core vaccine for cats administered. No adverse reactions. Pet remained calm during visit.',
        attachments: [{
          filename: dummyFiles[0],
          fileUrl: `/uploads/medical-records/${dummyFiles[0]}`,
          fileType: 'application/pdf',
          uploadDate: new Date()
        }],
        cost: {
          amount: 38.00,
          currency: 'USD',
          paid: false
        },
        createdBy: vets[1]._id,
        updatedBy: vets[1]._id
      }));
    }

    // Save all records
    const savedRecords = await MedicalRecord.insertMany(records);
    console.log(`\n✅ Created ${savedRecords.length} medical records:`);
    
    savedRecords.forEach((record, index) => {
      console.log(`\n${index + 1}. ${record.recordType.toUpperCase()}`);
      console.log(`   Pet ID: ${record.pet}`);
      console.log(`   Date: ${record.date.toLocaleDateString()}`);
      console.log(`   Vet ID: ${record.veterinarian}`);
      console.log(`   Attachments: ${record.attachments.length} file(s)`);
      console.log(`   Cost: $${record.cost.amount} (${record.cost.paid ? 'Paid' : 'Unpaid'})`);
    });

    console.log('\n✅ Medical records seeding completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Login as a veterinarian');
    console.log('2. Go to "My Patients"');
    console.log('3. Click "View Records" on any patient');
    console.log('4. See the medical records with attachments');

  } catch (error) {
    console.error('Error seeding medical records:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the seed script
seedMedicalRecords();
