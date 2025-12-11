// routes/persons.ts
import express from 'express'
import { prisma } from '../lib/prisma.ts'
import { 
  authenticate, 
  authorize, 
  checkPersonPermission, 
  logAudit 
} from '../middleware/auth.ts'
import type { AuthRequest } from '../middleware/auth.ts'

const router = express.Router()

// Get all persons (family tree) - All authenticated users can view
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const persons = await prisma.person.findMany({
      include: {
        biologicalFather: {
          select: { id: true, firstName: true, lastName: true }
        },
        biologicalMother: {
          select: { id: true, firstName: true, lastName: true }
        },
        marriagesAsSpouse1: {
          include: {
            spouse2: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        },
        marriagesAsSpouse2: {
          include: {
            spouse1: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: { lastName: 'asc' }
    })

    await logAudit(
      req.user!.id,
      'VIEW',
      'Person',
      'all',
      undefined,
      undefined,
      req.ip
    )

    res.json(persons)
  } catch (error) {
    console.error('Get persons error:', error)
    res.status(500).json({ error: 'Failed to fetch persons' })
  }
})

// Get single person by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const person = await prisma.person.findUnique({
      where: { id: req.params.id },
      include: {
        biologicalFather: true,
        biologicalMother: true,
        biologicalChildren: true,
        biologicalChildrenMother: true,
        marriagesAsSpouse1: {
          include: { spouse2: true }
        },
        marriagesAsSpouse2: {
          include: { spouse1: true }
        },
        photos: true,
        documents: true,
        stories: true,
        user: {
          select: { id: true, email: true, role: true }
        }
      }
    })

    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    res.json(person)
  } catch (error) {
    console.error('Get person error:', error)
    res.status(500).json({ error: 'Failed to fetch person' })
  }
})

// Create new person - Members and Admins only
router.post('/', authenticate, authorize('MEMBER', 'ADMIN'), async (req: AuthRequest, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      maidenName,
      gender,
      dateOfBirth,
      dateOfDeath,
      isDeceased,
      email,
      phone,
      address,
      city,
      state,
      country,
      bio,
      occupation,
      biologicalFatherId,
      biologicalMotherId
    } = req.body

    // Basic validation
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name required' })
    }

    const person = await prisma.person.create({
      data: {
        firstName,
        middleName,
        lastName,
        maidenName,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        dateOfDeath: dateOfDeath ? new Date(dateOfDeath) : undefined,
        isDeceased: isDeceased || false,
        email,
        phone,
        address,
        city,
        state,
        country,
        bio,
        occupation,
        biologicalFatherId,
        biologicalMotherId,
        createdBy: req.user!.id
      }
    })

    await logAudit(
      req.user!.id,
      'CREATE',
      'Person',
      person.id,
      person.id,
      { person },
      req.ip
    )

    res.status(201).json(person)
  } catch (error) {
    console.error('Create person error:', error)
    res.status(500).json({ error: 'Failed to create person' })
  }
})

// Update person - Check permissions
router.put('/:id', authenticate, checkPersonPermission, async (req: AuthRequest, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      maidenName,
      gender,
      dateOfBirth,
      dateOfDeath,
      isDeceased,
      email,
      phone,
      address,
      city,
      state,
      country,
      bio,
      occupation,
      biologicalFatherId,
      biologicalMotherId
    } = req.body

    const oldPerson = await prisma.person.findUnique({
      where: { id: req.params.id }
    })

    const person = await prisma.person.update({
      where: { id: req.params.id },
      data: {
        firstName,
        middleName,
        lastName,
        maidenName,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        dateOfDeath: dateOfDeath ? new Date(dateOfDeath) : undefined,
        isDeceased,
        email,
        phone,
        address,
        city,
        state,
        country,
        bio,
        occupation,
        biologicalFatherId,
        biologicalMotherId,
        updatedBy: req.user!.id
      }
    })

    await logAudit(
      req.user!.id,
      'UPDATE',
      'Person',
      person.id,
      person.id,
      { old: oldPerson, new: person },
      req.ip
    )

    res.json(person)
  } catch (error) {
    console.error('Update person error:', error)
    res.status(500).json({ error: 'Failed to update person' })
  }
})

// Delete person - Admin only
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const person = await prisma.person.findUnique({
      where: { id: req.params.id }
    })

    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    await prisma.person.delete({
      where: { id: req.params.id }
    })

    await logAudit(
      req.user!.id,
      'DELETE',
      'Person',
      req.params.id,
      req.params.id,
      { deleted: person },
      req.ip
    )

    res.json({ message: 'Person deleted successfully' })
  } catch (error) {
    console.error('Delete person error:', error)
    res.status(500).json({ error: 'Failed to delete person' })
  }
})

// Create marriage
router.post('/marriages', authenticate, authorize('MEMBER', 'ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { spouse1Id, spouse2Id, marriageDate, marriagePlace, status } = req.body

    if (!spouse1Id || !spouse2Id) {
      return res.status(400).json({ error: 'Both spouse IDs required' })
    }

    const marriage = await prisma.marriage.create({
      data: {
        spouse1Id,
        spouse2Id,
        marriageDate: marriageDate ? new Date(marriageDate) : undefined,
        marriagePlace,
        status: status || 'MARRIED'
      }
    })

    await logAudit(
      req.user!.id,
      'CREATE',
      'Marriage',
      marriage.id,
      undefined,
      { marriage },
      req.ip
    )

    res.status(201).json(marriage)
  } catch (error) {
    console.error('Create marriage error:', error)
    res.status(500).json({ error: 'Failed to create marriage' })
  }
})

export default router