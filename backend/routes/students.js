const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all students
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Get a single student
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching student' });
  }
});

// Create a new student
router.post('/', async (req, res) => {
  const { name, email, student_number } = req.body;
  
  // Basic validation
  if (!name || !email || !student_number) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO students (name, email, student_number) VALUES (?, ?, ?)',
      [name, email, student_number]
    );
    
    const [newStudent] = await db.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
    res.status(201).json(newStudent[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email or student number already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error creating student' });
  }
});

// Update a student
router.put('/:id', async (req, res) => {
  const { name, email, student_number } = req.body;
  
  // Basic validation
  if (!name || !email || !student_number) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [result] = await db.query(
      'UPDATE students SET name = ?, email = ?, student_number = ? WHERE id = ?',
      [name, email, student_number, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const [updatedStudent] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    res.json(updatedStudent[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email or student number already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error updating student' });
  }
});

// Delete a student
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting student' });
  }
});

module.exports = router; 