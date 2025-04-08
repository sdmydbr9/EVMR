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
    
    // Query for pets belonging to this user only
    const result = await pool.query(
      `SELECT * FROM pets WHERE owner_id = $1 ORDER BY name ASC`,
      [userId]
    );
    
    const pets = result.rows.map(pet => {
      console.log('Pet data from database:', pet);
      return pet;
    });
    
    res.json({ success: true, pets });
  } catch (err) {
    console.error('Error fetching pets:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch pets' });
  }
});

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

module.exports = router; 