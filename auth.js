const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phoneNumber, ...roleSpecificData } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role-specific data
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phoneNumber,
        ...(role === 'DOCTOR' && {
          doctor: {
            create: {
              specialization: roleSpecificData.specialization,
              licenseNumber: roleSpecificData.licenseNumber
            }
          }
        }),
        ...(role === 'PATIENT' && {
          patient: {
            create: {
              dateOfBirth: roleSpecificData.dateOfBirth,
              gender: roleSpecificData.gender,
              address: roleSpecificData.address
            }
          }
        }),
        ...(role === 'ADMIN' && {
          admin: {
            create: {}
          }
        })
      }
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctor: true,
        patient: true,
        admin: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  res.json(req.user);
});

module.exports = router; 