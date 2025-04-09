const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const { authorize } = require('../middleware/auth');

// Define roles that can access different endpoints
const ALL_STAFF = ['admin', 'vet', 'technician', 'receptionist'];
const MEDICAL_STAFF = ['admin', 'vet', 'technician'];
const ADMIN_VET = ['admin', 'vet'];

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory items with optional filters
 * @access  All staff
 */
router.get('/', 
  authorize(ALL_STAFF),
  inventoryController.getAllInventoryItems
);

/**
 * @route   GET /api/inventory/:id
 * @desc    Get a specific inventory item
 * @access  All staff
 */
router.get('/:id',
  authorize(ALL_STAFF),
  param('id').isInt().withMessage('Inventory item ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  inventoryController.getInventoryItemById
);

/**
 * @route   POST /api/inventory
 * @desc    Add new inventory item
 * @access  Admin and vets only
 */
router.post('/',
  authorize(ADMIN_VET),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('current_quantity').isInt({ min: 0 }).withMessage('Current quantity must be a non-negative integer'),
    body('reorder_level').isInt({ min: 0 }).withMessage('Reorder level must be a non-negative integer'),
    body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be a non-negative number'),
    body('selling_price').optional().isFloat({ min: 0 }).withMessage('Selling price must be a non-negative number')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  inventoryController.createInventoryItem
);

/**
 * @route   PUT /api/inventory/:id
 * @desc    Update inventory item
 * @access  Admin and vets only
 */
router.put('/:id',
  authorize(ADMIN_VET),
  param('id').isInt().withMessage('Inventory item ID must be an integer'),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('unit').optional().notEmpty().withMessage('Unit cannot be empty'),
    body('current_quantity').optional().isInt({ min: 0 }).withMessage('Current quantity must be a non-negative integer'),
    body('reorder_level').optional().isInt({ min: 0 }).withMessage('Reorder level must be a non-negative integer'),
    body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be a non-negative number'),
    body('selling_price').optional().isFloat({ min: 0 }).withMessage('Selling price must be a non-negative number')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  inventoryController.updateInventoryItem
);

/**
 * @route   DELETE /api/inventory/:id
 * @desc    Delete inventory item
 * @access  Admin only
 */
router.delete('/:id',
  authorize(['admin']),
  param('id').isInt().withMessage('Inventory item ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  inventoryController.deleteInventoryItem
);

/**
 * @route   PATCH /api/inventory/:id/stock
 * @desc    Update stock levels (partial update)
 * @access  Admin and vets only
 */
router.patch('/:id/stock',
  authorize(ADMIN_VET),
  param('id').isInt().withMessage('Inventory item ID must be an integer'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  inventoryController.updateStockLevels
);

/**
 * @route   GET /api/inventory/alerts/low-stock
 * @desc    Get low stock alerts
 * @access  All staff
 */
router.get('/alerts/low-stock',
  authorize(ALL_STAFF),
  inventoryController.getLowStockAlerts
);

module.exports = router; 