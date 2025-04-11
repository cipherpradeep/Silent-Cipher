const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all records for a patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const records = await prisma.record.findMany({
      where: {
        patientId: req.params.patientId
      },
      include: {
        doctor: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching patient records' });
  }
});

// Get records created by a doctor
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const records = await prisma.record.findMany({
      where: {
        doctorId: req.params.doctorId
      },
      include: {
        patient: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching doctor records' });
  }
});

// Create a new record
router.post('/', auth, authorize('DOCTOR'), async (req, res) => {
  try {
    const { patientId, diagnosis, prescription, notes } = req.body;
    const doctorId = req.user.doctor.id;

    const record = await prisma.record.create({
      data: {
        doctorId,
        patientId,
        diagnosis,
        prescription,
        notes
      },
      include: {
        doctor: {
          include: {
            user: true
          }
        },
        patient: {
          include: {
            user: true
          }
        }
      }
    });

    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating record' });
  }
});

// Update a record
router.patch('/:id', auth, authorize('DOCTOR'), async (req, res) => {
  try {
    const { diagnosis, prescription, notes } = req.body;
    const doctorId = req.user.doctor.id;

    const record = await prisma.record.update({
      where: {
        id: req.params.id,
        doctorId // Ensure only the creating doctor can update
      },
      data: {
        diagnosis,
        prescription,
        notes
      },
      include: {
        doctor: {
          include: {
            user: true
          }
        },
        patient: {
          include: {
            user: true
          }
        }
      }
    });

    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating record' });
  }
});

// Delete a record
router.delete('/:id', auth, authorize('DOCTOR'), async (req, res) => {
  try {
    const doctorId = req.user.doctor.id;

    await prisma.record.delete({
      where: {
        id: req.params.id,
        doctorId // Ensure only the creating doctor can delete
      }
    });

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting record' });
  }
});

module.exports = router; 