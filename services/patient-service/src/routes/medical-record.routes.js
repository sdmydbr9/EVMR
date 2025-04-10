const express = require('express');
const router = express.Router();

// Simple route to test
router.get('/', (req, res) => {
  res.json({ message: 'Medical Records API is working' });
});

module.exports = router; 