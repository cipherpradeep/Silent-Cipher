const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all appointments (for doctors and admins)
router.get('/', auth, authorize('DOCTOR', 'ADMIN'), async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
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
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// Get appointments for a specific patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: req.params.patientId
      },
      include: {
        doctor: {
          include: {
            user: true
          }
        }
      }
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching patient appointments' });
  }
});

// Get appointments for a specific doctor
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: req.params.doctorId
      },
      include: {
        patient: {
          include: {
            user: true
          }
        }
      }
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching doctor appointments' });
  }
});

// Create a new appointment
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, patientId, date, notes } = req.body;

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId,
        date: new Date(date),
        status: 'SCHEDULED',
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

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating appointment' });
  }
});

// Update appointment status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
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

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating appointment status' });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.appointment.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting appointment' });
  }
});

module.exports = router; 