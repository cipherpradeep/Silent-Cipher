const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all patients (for doctors and admins)
router.get('/', auth, authorize('DOCTOR', 'ADMIN'), async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: true
      }
    });
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// Get a specific patient
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        appointments: {
          include: {
            doctor: {
              include: {
                user: true
              }
            }
          }
        },
        records: {
          include: {
            doctor: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if the requester is authorized to view this patient's data
    if (req.user.role === 'PATIENT' && req.user.patient.id !== patient.id) {
      return res.status(403).json({ message: 'Not authorized to view this patient' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching patient' });
  }
});

// Update patient information
router.patch('/:id', auth, async (req, res) => {
  try {
    const { dateOfBirth, gender, address } = req.body;

    // Check if the requester is authorized to update this patient's data
    if (req.user.role === 'PATIENT' && req.user.patient.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this patient' });
    }

    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        address
      },
      include: {
        user: true
      }
    });

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating patient' });
  }
});

module.exports = router; 