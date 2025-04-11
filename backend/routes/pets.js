const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');

// Ensure pet uploads directory exists
const ensureUploadsDirectory = () => {
  const uploadDir = path.join(__dirname, '../uploads/pets');
  console.log('Checking uploads directory:', uploadDir);

  if (!fs.existsSync(uploadDir)) {
    console.log('Creating uploads directory:', uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
  } else {
    console.log('Uploads directory exists:', uploadDir);
    // Check if directory is writable
    try {
      fs.accessSync(uploadDir, fs.constants.W_OK);
      console.log('Uploads directory is writable');
    } catch (err) {
      console.error('Uploads directory is not writable:', err);
    }
  }

  return uploadDir;
};

// Call this when module is loaded
const uploadsDir = ensureUploadsDirectory();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'pet-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
  fileFilter: function (req, file, cb) {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  }
});

// Get all pets for the current user
router.get('/', async (req, res) => {
  try {
    // Get user ID from the authenticated user
    const userId = req.user.id;
    const isDemo = req.user.isDemo || false;

    // Different handling for demo users vs real users
    let pets = [];

    if (isDemo) {
      // For demo users, retrieve demo pets (may include pre-populated sample data)
      const result = await pool.query(
        `SELECT * FROM pets WHERE owner_id = $1 ORDER BY name ASC`,
        [userId]
      );
      
      // If no demo pets exist yet, create some sample data for the demo user
      if (result.rowCount === 0) {
        console.log('Creating sample pets for demo user', userId);
        // Create sample pets for demo user
        await createSamplePetsForDemo(userId);
        
        // Fetch the newly created sample pets
        const sampleResult = await pool.query(
          `SELECT * FROM pets WHERE owner_id = $1 ORDER BY name ASC`,
          [userId]
        );
        
        pets = sampleResult.rows;
      } else {
        pets = result.rows;
      }
    } else {
      // For real users, only show their own data (strict isolation)
      const result = await pool.query(
        `SELECT * FROM pets WHERE owner_id = $1 ORDER BY name ASC`,
        [userId]
      );
      
      pets = result.rows;
    }

    res.json({ success: true, pets });
  } catch (err) {
    console.error('Error fetching pets:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch pets' });
  }
});

/**
 * Creates sample pets for demo users
 * @param {number} userId - Demo user ID
 */
async function createSamplePetsForDemo(userId) {
  try {
    const samplePets = [
      {
        name: 'Max',
        species: 'Dog',
        breed: 'Labrador Retriever',
        color: 'Yellow',
        dateOfBirth: '2019-05-12',
        gender: 'Male',
        isNeutered: true,
        microchipId: 'DEMO-CHIP-001'
      },
      {
        name: 'Luna',
        species: 'Cat',
        breed: 'Maine Coon',
        color: 'Tabby',
        dateOfBirth: '2020-03-15',
        gender: 'Female',
        isNeutered: true,
        microchipId: 'DEMO-CHIP-002'
      },
      {
        name: 'Rocky',
        species: 'Dog',
        breed: 'German Shepherd',
        color: 'Black and Tan',
        dateOfBirth: '2018-11-23',
        gender: 'Male',
        isNeutered: false,
        microchipId: 'DEMO-CHIP-003'
      }
    ];

    for (const pet of samplePets) {
      await pool.query(
        `INSERT INTO pets (
          name, species, breed, color, date_of_birth, gender,
          is_neutered, microchip_id, owner_id, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL)`,
        [
          pet.name, 
          pet.species, 
          pet.breed, 
          pet.color, 
          pet.dateOfBirth, 
          pet.gender, 
          pet.isNeutered, 
          pet.microchipId, 
          userId
        ]
      );
    }
    
    console.log(`Created ${samplePets.length} sample pets for demo user ${userId}`);
  } catch (error) {
    console.error('Error creating sample pets for demo user:', error);
  }
}

// Get a specific pet by ID (ensuring it belongs to the current user)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    res.json({ success: true, pet: result.rows[0] });
  } catch (err) {
    console.error('Error fetching pet:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch pet' });
  }
});

// Create a new pet
router.post('/', async (req, res) => {
  try {
    const {
      name,
      species,
      breed,
      color,
      dateOfBirth,
      gender,
      isNeutered,
      microchipId
    } = req.body;

    // Get user ID from the authenticated user
    const userId = req.user.id;

    // Validate required fields
    if (!name || !species || !breed || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Name, species, breed, date of birth, and gender are required'
      });
    }

    // Insert pet into database without image_url
    const result = await pool.query(
      `INSERT INTO pets (
        name, species, breed, color, date_of_birth, gender,
        is_neutered, microchip_id, owner_id, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL) RETURNING *`,
      [name, species, breed, color, dateOfBirth, gender, isNeutered, microchipId, userId]
    );

    res.status(201).json({ success: true, pet: result.rows[0] });
  } catch (err) {
    console.error('Error creating pet:', err);
    res.status(500).json({ success: false, message: 'Failed to create pet' });
  }
});

// Update pet image
router.post('/:id/image', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('Image upload request received:', {
      petId: id,
      userId: userId,
      file: req.file,
      headers: req.headers
    });

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      console.log('Pet not found or does not belong to user:', { petId: id, userId: userId });
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // If no file was uploaded
    if (!req.file) {
      console.log('No file was uploaded in the request');
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    // Generate the URL for the uploaded file
    const imageUrl = `/uploads/pets/${req.file.filename}`;
    console.log('Generated image URL:', imageUrl);

    // Update pet record with new image URL
    const updateResult = await pool.query(
      `UPDATE pets SET image_url = $1 WHERE id = $2 AND owner_id = $3 RETURNING *`,
      [imageUrl, id, userId]
    );

    console.log('Pet record updated with new image URL:', updateResult.rows[0]);
    res.json({ success: true, pet: updateResult.rows[0] });
  } catch (err) {
    console.error('Error uploading pet image:', err);
    res.status(500).json({ success: false, message: 'Failed to upload pet image' });
  }
});

// Update a pet
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      name,
      species,
      breed,
      color,
      dateOfBirth,
      gender,
      isNeutered,
      microchipId
    } = req.body;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Update pet in database
    const result = await pool.query(
      `UPDATE pets SET
        name = $1,
        species = $2,
        breed = $3,
        color = $4,
        date_of_birth = $5,
        gender = $6,
        is_neutered = $7,
        microchip_id = $8
      WHERE id = $9 AND owner_id = $10 RETURNING *`,
      [name, species, breed, color, dateOfBirth, gender, isNeutered, microchipId, id, userId]
    );

    res.json({ success: true, pet: result.rows[0] });
  } catch (err) {
    console.error('Error updating pet:', err);
    res.status(500).json({ success: false, message: 'Failed to update pet' });
  }
});

// Delete a pet
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Delete pet from database
    await pool.query(
      `DELETE FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    res.json({ success: true, message: 'Pet deleted successfully' });
  } catch (err) {
    console.error('Error deleting pet:', err);
    res.status(500).json({ success: false, message: 'Failed to delete pet' });
  }
});

// Get pet's vaccinations
router.get('/:id/vaccinations', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      'SELECT * FROM vaccinations WHERE pet_id = $1 ORDER BY date_administered DESC',
      [id]
    );
    res.json({ success: true, vaccinations: result.rows });
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vaccinations' });
  }
});

// Add vaccination record
router.post('/:id/vaccinations', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { vaccineName, dateAdministered, nextDueDate, notes } = req.body;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      `INSERT INTO vaccinations (pet_id, vaccine_name, date_administered, next_due_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, vaccineName, dateAdministered, nextDueDate, notes]
    );

    res.json({ success: true, vaccination: result.rows[0] });
  } catch (error) {
    console.error('Error adding vaccination:', error);
    res.status(500).json({ success: false, message: 'Failed to add vaccination' });
  }
});

// Get pet's deworming records
router.get('/:id/deworming', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      'SELECT * FROM deworming WHERE pet_id = $1 ORDER BY date_given DESC',
      [id]
    );
    res.json({ success: true, deworming: result.rows });
  } catch (error) {
    console.error('Error fetching deworming records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch deworming records' });
  }
});

// Add deworming record
router.post('/:id/deworming', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { medicineName, dateGiven, notes } = req.body;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      `INSERT INTO deworming (pet_id, medicine_name, date_given, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, medicineName, dateGiven, notes]
    );

    res.json({ success: true, deworming: result.rows[0] });
  } catch (error) {
    console.error('Error adding deworming record:', error);
    res.status(500).json({ success: false, message: 'Failed to add deworming record' });
  }
});

// Get pet's grooming records
router.get('/:id/grooming', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      'SELECT * FROM grooming WHERE pet_id = $1 ORDER BY date DESC',
      [id]
    );
    res.json({ success: true, grooming: result.rows });
  } catch (error) {
    console.error('Error fetching grooming records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch grooming records' });
  }
});

// Add grooming record
router.post('/:id/grooming', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { serviceType, date, notes } = req.body;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      `INSERT INTO grooming (pet_id, service_type, date, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, serviceType, date, notes]
    );

    res.json({ success: true, grooming: result.rows[0] });
  } catch (error) {
    console.error('Error adding grooming record:', error);
    res.status(500).json({ success: false, message: 'Failed to add grooming record' });
  }
});

// Get pet's weight records
router.get('/:id/weight', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      'SELECT * FROM weight_records WHERE pet_id = $1 ORDER BY date DESC',
      [id]
    );
    res.json({ success: true, weight: result.rows });
  } catch (error) {
    console.error('Error fetching weight records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weight records' });
  }
});

// Add weight record
router.post('/:id/weight', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { weight, date, notes } = req.body;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      `INSERT INTO weight_records (pet_id, weight, date, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, weight, date, notes]
    );

    res.json({ success: true, weight: result.rows[0] });
  } catch (error) {
    console.error('Error adding weight record:', error);
    res.status(500).json({ success: false, message: 'Failed to add weight record' });
  }
});

// Update weight record
router.put('/:id/weight/:recordId', async (req, res) => {
  try {
    const { id, recordId } = req.params;
    const userId = req.user.id;
    const { weight, date, notes } = req.body;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      `UPDATE weight_records
       SET weight = $1, date = $2, notes = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND pet_id = $5
       RETURNING *`,
      [weight, date, notes, recordId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Weight record not found' });
    }

    res.json({ success: true, weight: result.rows[0] });
  } catch (error) {
    console.error('Error updating weight record:', error);
    res.status(500).json({ success: false, message: 'Failed to update weight record' });
  }
});

// Delete weight record
router.delete('/:id/weight/:recordId', async (req, res) => {
  try {
    const { id, recordId } = req.params;
    const userId = req.user.id;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      `DELETE FROM weight_records WHERE id = $1 AND pet_id = $2 RETURNING id`,
      [recordId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Weight record not found' });
    }

    res.json({ success: true, message: 'Weight record deleted successfully' });
  } catch (error) {
    console.error('Error deleting weight record:', error);
    res.status(500).json({ success: false, message: 'Failed to delete weight record' });
  }
});

// Get pet's quality of life assessments
router.get('/:id/quality-of-life', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      'SELECT * FROM quality_of_life WHERE pet_id = $1 ORDER BY date DESC',
      [id]
    );
    res.json({ success: true, qualityOfLife: result.rows });
  } catch (error) {
    console.error('Error fetching quality of life assessments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quality of life assessments' });
  }
});

// Add quality of life assessment
router.post('/:id/quality-of-life', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { date, mobility, comfort, happiness, appetite, hygiene, notes } = req.body;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      `INSERT INTO quality_of_life (pet_id, date, mobility, comfort, happiness, appetite, hygiene, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, date, mobility, comfort, happiness, appetite, hygiene, notes]
    );

    res.json({ success: true, qualityOfLife: result.rows[0] });
  } catch (error) {
    console.error('Error adding quality of life assessment:', error);
    res.status(500).json({ success: false, message: 'Failed to add quality of life assessment' });
  }
});

// Update quality of life assessment
router.put('/:id/quality-of-life/:recordId', async (req, res) => {
  try {
    const { id, recordId } = req.params;
    const userId = req.user.id;
    const { date, mobility, comfort, happiness, appetite, hygiene, notes } = req.body;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      `UPDATE quality_of_life
       SET date = $1, mobility = $2, comfort = $3, happiness = $4, appetite = $5, hygiene = $6, notes = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND pet_id = $9
       RETURNING *`,
      [date, mobility, comfort, happiness, appetite, hygiene, notes, recordId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quality of life assessment not found' });
    }

    res.json({ success: true, qualityOfLife: result.rows[0] });
  } catch (error) {
    console.error('Error updating quality of life assessment:', error);
    res.status(500).json({ success: false, message: 'Failed to update quality of life assessment' });
  }
});

// Delete quality of life assessment
router.delete('/:id/quality-of-life/:recordId', async (req, res) => {
  try {
    const { id, recordId } = req.params;
    const userId = req.user.id;

    // Verify pet exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM pets WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const result = await pool.query(
      `DELETE FROM quality_of_life WHERE id = $1 AND pet_id = $2 RETURNING id`,
      [recordId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quality of life assessment not found' });
    }

    res.json({ success: true, message: 'Quality of life assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality of life assessment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quality of life assessment' });
  }
});

module.exports = router;