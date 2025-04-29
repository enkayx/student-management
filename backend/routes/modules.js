const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all modules with lecturer information
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, l.name as lecturer_name 
      FROM modules m 
      LEFT JOIN lecturers l ON m.lecturer_id = l.id
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching modules' });
  }
});

// Get a single module
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, l.name as lecturer_name 
      FROM modules m 
      LEFT JOIN lecturers l ON m.lecturer_id = l.id 
      WHERE m.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching module' });
  }
});

// Create a new module
router.post('/', async (req, res) => {
  const { name, code, credits, lecturer_id } = req.body;
  
  // Basic validation
  if (!name || !code || !credits || !lecturer_id) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO modules (name, code, credits, lecturer_id) VALUES (?, ?, ?, ?)',
      [name, code, credits, lecturer_id]
    );
    
    const [newModule] = await db.query(`
      SELECT m.*, l.name as lecturer_name 
      FROM modules m 
      LEFT JOIN lecturers l ON m.lecturer_id = l.id 
      WHERE m.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newModule[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Module code already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error creating module' });
  }
});

// Update a module
router.put('/:id', async (req, res) => {
  const { name, code, credits, lecturer_id } = req.body;
  
  // Basic validation
  if (!name || !code || !credits || !lecturer_id) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [result] = await db.query(
      'UPDATE modules SET name = ?, code = ?, credits = ?, lecturer_id = ? WHERE id = ?',
      [name, code, credits, lecturer_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const [updatedModule] = await db.query(`
      SELECT m.*, l.name as lecturer_name 
      FROM modules m 
      LEFT JOIN lecturers l ON m.lecturer_id = l.id 
      WHERE m.id = ?
    `, [req.params.id]);
    
    res.json(updatedModule[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Module code already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error updating module' });
  }
});

// Delete a module
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM modules WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting module' });
  }
});

module.exports = router; 