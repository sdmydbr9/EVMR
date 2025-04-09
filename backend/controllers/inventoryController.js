const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Get all inventory items
 */
const getAllInventoryItems = async (req, res) => {
  try {
    const { category, lowStock, search } = req.query;
    
    let query = 'SELECT * FROM inventory_items';
    const params = [];
    let whereClauses = [];
    
    // Apply filters if provided
    if (category) {
      whereClauses.push(`category = $${params.length + 1}`);
      params.push(category);
    }
    
    if (lowStock === 'true') {
      whereClauses.push(`current_quantity <= reorder_level`);
    }
    
    if (search) {
      whereClauses.push(`(name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json({ items: result.rows });
  } catch (err) {
    console.error('Error getting inventory items:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while retrieving inventory items' 
    });
  }
};

/**
 * Get a single inventory item by ID
 */
const getInventoryItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM inventory_items WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Inventory item not found' 
      });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting inventory item:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while retrieving the inventory item' 
    });
  }
};

/**
 * Create a new inventory item
 */
const createInventoryItem = async (req, res) => {
  try {
    const { 
      name, 
      category, 
      description, 
      unit, 
      current_quantity, 
      reorder_level, 
      cost_price, 
      selling_price 
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO inventory_items (
        name, category, description, unit, current_quantity, 
        reorder_level, cost_price, selling_price
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [name, category, description, unit, current_quantity, reorder_level, cost_price, selling_price]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while creating the inventory item' 
    });
  }
};

/**
 * Update an inventory item
 */
const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      category, 
      description, 
      unit, 
      current_quantity, 
      reorder_level, 
      cost_price, 
      selling_price 
    } = req.body;
    
    const result = await pool.query(
      `UPDATE inventory_items 
       SET name = $1, category = $2, description = $3, unit = $4, 
           current_quantity = $5, reorder_level = $6, cost_price = $7, 
           selling_price = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, category, description, unit, current_quantity, reorder_level, cost_price, selling_price, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Inventory item not found' 
      });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while updating the inventory item' 
    });
  }
};

/**
 * Delete an inventory item
 */
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM inventory_items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Inventory item not found' 
      });
    }
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while deleting the inventory item' 
    });
  }
};

/**
 * Update stock levels
 */
const updateStockLevels = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({ 
        error: true, 
        message: 'Quantity is required' 
      });
    }
    
    const result = await pool.query(
      `UPDATE inventory_items 
       SET current_quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [quantity, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Inventory item not found' 
      });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating stock levels:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while updating stock levels' 
    });
  }
};

/**
 * Get low stock alerts
 */
const getLowStockAlerts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM inventory_items WHERE current_quantity <= reorder_level ORDER BY name'
    );
    
    res.json({ items: result.rows });
  } catch (err) {
    console.error('Error getting low stock alerts:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while retrieving low stock alerts' 
    });
  }
};

module.exports = {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStockLevels,
  getLowStockAlerts
}; 