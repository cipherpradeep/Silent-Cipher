const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create emergency alert
router.post('/', auth, async (req, res) => {
  try {
    const { description, location } = req.body;
    const patientId = req.user.patient?.id;

    if (!patientId) {
      return res.status(403).json({ message: 'Only patients can create emergency alerts' });
    }

    const emergency = await prisma.emergency.create({
      data: {
        patientId,
        description,
        location,
        status: 'PENDING'
      },
      include: {
        patient: {
          include: {
            user: true
          }
        }
      }
    });

    // Emit emergency alert to all connected doctors
    req.app.get('io').to('doctors').emit('new-emergency', emergency);

    res.status(201).json(emergency);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating emergency alert' });
  }
});

// Get all emergencies (for doctors and admins)
router.get('/', auth, authorize('DOCTOR', 'ADMIN'), async (req, res) => {
  try {
    const emergencies = await prisma.emergency.findMany({
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
    res.json(emergencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching emergencies' });
  }
});

// Get emergencies for a specific patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const emergencies = await prisma.emergency.findMany({
      where: {
        patientId: req.params.patientId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(emergencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching patient emergencies' });
  }
});

// Update emergency status
router.patch('/:id/status', auth, authorize('DOCTOR', 'ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;

    const emergency = await prisma.emergency.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        patient: {
          include: {
            user: true
          }
        }
      }
    });

    // Notify patient about status update
    req.app.get('io').to(`patient-${emergency.patientId}`).emit('emergency-update', emergency);

    res.json(emergency);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating emergency status' });
  }
});

module.exports = router; 