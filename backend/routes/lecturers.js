const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all lecturers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM lecturers');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching lecturers' });
  }
});

// Get a single lecturer
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM lecturers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lecturer not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching lecturer' });
  }
});

// Create a new lecturer
router.post('/', async (req, res) => {
  const { name, email, department } = req.body;
  
  // Basic validation
  if (!name || !email || !department) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO lecturers (name, email, department) VALUES (?, ?, ?)',
      [name, email, department]
    );
    
    const [newLecturer] = await db.query('SELECT * FROM lecturers WHERE id = ?', [result.insertId]);
    res.status(201).json(newLecturer[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error creating lecturer' });
  }
});

// Update a lecturer
router.put('/:id', async (req, res) => {
  const { name, email, department } = req.body;
  
  // Basic validation
  if (!name || !email || !department) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [result] = await db.query(
      'UPDATE lecturers SET name = ?, email = ?, department = ? WHERE id = ?',
      [name, email, department, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lecturer not found' });
    }

    const [updatedLecturer] = await db.query('SELECT * FROM lecturers WHERE id = ?', [req.params.id]);
    res.json(updatedLecturer[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error updating lecturer' });
  }
});

// Delete a lecturer
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM lecturers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lecturer not found' });
    }
    res.json({ message: 'Lecturer deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting lecturer' });
  }
});

module.exports = router; 