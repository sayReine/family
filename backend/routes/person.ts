import * as express from 'express'
import { prisma } from '../lib/prisma.ts'
import { authenticate, logAudit } from '../middleware/auth.ts'
import type { AuthRequest } from '../middleware/auth.ts'

const router = express.Router()

// Create person profile for current user
router.post('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    
    // Check if user already has a person linked
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { person: true }
    })

    if (existingUser?.personId) {
      return res.status(400).json({ 
        error: 'User already has a person profile linked' 
      })
    }

    const {
      firstName,
      middleName,
      lastName,
      maidenName,
      nicknames,
      gender,
      dateOfBirth,
      email,
      phone,
      address,
      city,
      state,
      country,
      bio,
      occupation
    } = req.body

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ 
        error: 'First name and last name are required' 
      })
    }

    // Create person
    const person = await prisma.person.create({
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        maidenName: maidenName || null,
        nicknames: Array.isArray(nicknames) ? nicknames : [],
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        bio: bio || null,
        occupation: occupation || null,
        createdBy: userId,
        updatedBy: userId
      }
    })

    // Link person to user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { personId: person.id },
      select: {
        id: true,
        email: true,
        role: true,
        personId: true,
        person: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            maidenName: true,
            nicknames: true,
            gender: true,
            dateOfBirth: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            country: true,
            bio: true,
            occupation: true,
            profilePhoto: true
          }
        }
      }
    })

    // Log the creation
    await logAudit(
      userId,
      'CREATE',
      'Person',
      person.id,
      person.id,
      { action: 'created_person_profile' },
      req.ip
    )

    res.status(201).json(updatedUser)
  } catch (error) {
    console.error('Create person profile error:', error)
    res.status(500).json({ error: 'Failed to create person profile' })
  }
})

// Update person profile for current user
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    
    // Get user with person
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { person: true }
    })

    if (!user?.personId) {
      return res.status(404).json({ 
        error: 'No person profile found. Please create one first.' 
      })
    }

    const {
      firstName,
      middleName,
      lastName,
      maidenName,
      nicknames,
      gender,
      dateOfBirth,
      email,
      phone,
      address,
      city,
      state,
      country,
      bio,
      occupation,
      profilePhoto
    } = req.body

    // Update person
    const updatedPerson = await prisma.person.update({
      where: { id: user.personId },
      data: {
        ...(firstName && { firstName }),
        middleName: middleName !== undefined ? middleName : undefined,
        ...(lastName && { lastName }),
        maidenName: maidenName !== undefined ? maidenName : undefined,
        nicknames: nicknames !== undefined ? (Array.isArray(nicknames) ? nicknames : []) : undefined,
        gender: gender !== undefined ? gender : undefined,
        dateOfBirth: dateOfBirth !== undefined ? (dateOfBirth ? new Date(dateOfBirth) : null) : undefined,
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        city: city !== undefined ? city : undefined,
        state: state !== undefined ? state : undefined,
        country: country !== undefined ? country : undefined,
        bio: bio !== undefined ? bio : undefined,
        occupation: occupation !== undefined ? occupation : undefined,
        profilePhoto: profilePhoto !== undefined ? profilePhoto : undefined,
        updatedBy: userId
      }
    })

    // Log the update
    await logAudit(
      userId,
      'UPDATE',
      'Person',
      user.personId,
      user.personId,
      { action: 'updated_person_profile' },
      req.ip
    )

    res.json(updatedPerson)
  } catch (error) {
    console.error('Update person profile error:', error)
    res.status(500).json({ error: 'Failed to update person profile' })
  }
})

// Get current user's person profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        person: {
          include: {
            biologicalFather: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true
              }
            },
            biologicalMother: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true
              }
            },
            marriagesAsSpouse1: {
              include: {
                spouse2: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePhoto: true
                  }
                }
              }
            },
            marriagesAsSpouse2: {
              include: {
                spouse1: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePhoto: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user?.person) {
      return res.status(404).json({ 
        error: 'No person profile found' 
      })
    }

    res.json(user.person)
  } catch (error) {
    console.error('Get person profile error:', error)
    res.status(500).json({ error: 'Failed to fetch person profile' })
  }
})

// Get person by ID (with access control)
router.get('/:personId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { personId } = req.params
    const userId = req.user!.id
    const userRole = req.user!.role

    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        biologicalFather: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true
          }
        },
        biologicalMother: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true
          }
        },
        biologicalChildren: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            profilePhoto: true
          }
        },
        marriagesAsSpouse1: {
          include: {
            spouse2: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true
              }
            }
          }
        },
        marriagesAsSpouse2: {
          include: {
            spouse1: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true
              }
            }
          }
        },
        photos: true,
        documents: true,
        stories: true
      }
    })

    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    // Log the view
    await logAudit(
      userId,
      'VIEW',
      'Person',
      personId,
      personId,
      { action: 'viewed_person' },
      req.ip
    )

    res.json(person)
  } catch (error) {
    console.error('Get person error:', error)
    res.status(500).json({ error: 'Failed to fetch person' })
  }
})

// Create a new person (MEMBER and ADMIN only)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const userRole = req.user!.role

    // Only MEMBER and ADMIN can create new people
    if (userRole === 'GUEST') {
      return res.status(403).json({ 
        error: 'Guest users cannot create new people. Please upgrade your account.' 
      })
    }

    const {
      firstName,
      middleName,
      lastName,
      maidenName,
      nicknames,
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

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ 
        error: 'First name and last name are required' 
      })
    }

    // Create person
    const person = await prisma.person.create({
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        maidenName: maidenName || null,
        nicknames: Array.isArray(nicknames) ? nicknames : [],
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        dateOfDeath: dateOfDeath ? new Date(dateOfDeath) : null,
        isDeceased: isDeceased || false,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        bio: bio || null,
        occupation: occupation || null,
        biologicalFatherId: biologicalFatherId || null,
        biologicalMotherId: biologicalMotherId || null,
        createdBy: userId,
        updatedBy: userId
      }
    })

    // Log the creation
    await logAudit(
      userId,
      'CREATE',
      'Person',
      person.id,
      person.id,
      { action: 'created_person' },
      req.ip
    )

    res.status(201).json(person)
  } catch (error) {
    console.error('Create person error:', error)
    res.status(500).json({ error: 'Failed to create person' })
  }
})

// Update person (with access control)
router.put('/:personId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { personId } = req.params
    const userId = req.user!.id
    const userRole = req.user!.role

    // Get the person to update
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: { user: true }
    })

    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    // Access control: 
    // - ADMIN can update anyone
    // - MEMBER can update themselves and direct relatives
    // - GUEST can only update themselves
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { personId: true }
    })

    const isOwnProfile = currentUser?.personId === personId

    if (userRole === 'GUEST' && !isOwnProfile) {
      return res.status(403).json({ 
        error: 'You can only update your own profile' 
      })
    }

    if (userRole === 'MEMBER' && !isOwnProfile) {
      // Check if user has a person profile
      if (!currentUser?.personId) {
        return res.status(403).json({ 
          error: 'You can only update your own profile and direct relatives' 
        })
      }

      // Check if it's a direct relative
      const isDirectRelative = await prisma.person.findFirst({
        where: {
          OR: [
            { id: personId, biologicalFatherId: currentUser.personId },
            { id: personId, biologicalMotherId: currentUser.personId },
            { id: currentUser.personId, biologicalFatherId: personId },
            { id: currentUser.personId, biologicalMotherId: personId }
          ]
        }
      })

      if (!isDirectRelative) {
        return res.status(403).json({ 
          error: 'You can only update your own profile and direct relatives' 
        })
      }
    }

    const {
      firstName,
      middleName,
      lastName,
      maidenName,
      nicknames,
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
      profilePhoto,
      biologicalFatherId,
      biologicalMotherId
    } = req.body

    // Update person
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: {
        ...(firstName && { firstName }),
        middleName: middleName !== undefined ? middleName : undefined,
        ...(lastName && { lastName }),
        maidenName: maidenName !== undefined ? maidenName : undefined,
        nicknames: nicknames !== undefined ? (Array.isArray(nicknames) ? nicknames : []) : undefined,
        gender: gender !== undefined ? gender : undefined,
        dateOfBirth: dateOfBirth !== undefined ? (dateOfBirth ? new Date(dateOfBirth) : null) : undefined,
        dateOfDeath: dateOfDeath !== undefined ? (dateOfDeath ? new Date(dateOfDeath) : null) : undefined,
        isDeceased: isDeceased !== undefined ? isDeceased : undefined,
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        city: city !== undefined ? city : undefined,
        state: state !== undefined ? state : undefined,
        country: country !== undefined ? country : undefined,
        bio: bio !== undefined ? bio : undefined,
        occupation: occupation !== undefined ? occupation : undefined,
        profilePhoto: profilePhoto !== undefined ? profilePhoto : undefined,
        biologicalFatherId: biologicalFatherId !== undefined ? biologicalFatherId : undefined,
        biologicalMotherId: biologicalMotherId !== undefined ? biologicalMotherId : undefined,
        updatedBy: userId
      }
    })

    // Log the update
    await logAudit(
      userId,
      'UPDATE',
      'Person',
      personId,
      personId,
      { action: 'updated_person', changes: req.body },
      req.ip
    )

    res.json(updatedPerson)
  } catch (error) {
    console.error('Update person error:', error)
    res.status(500).json({ error: 'Failed to update person' })
  }
})

// Delete person (ADMIN only)
router.delete('/:personId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { personId } = req.params
    const userId = req.user!.id
    const userRole = req.user!.role

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Only administrators can delete people' 
      })
    }

    // Check if person is linked to a user
    const linkedUser = await prisma.user.findFirst({
      where: { personId }
    })

    if (linkedUser) {
      return res.status(400).json({ 
        error: 'Cannot delete a person linked to a user account. Unlink the user first.' 
      })
    }

    await prisma.person.delete({
      where: { id: personId }
    })

    // Log the deletion
    await logAudit(
      userId,
      'DELETE',
      'Person',
      personId,
      personId,
      { action: 'deleted_person' },
      req.ip
    )

    res.json({ message: 'Person deleted successfully' })
  } catch (error) {
    console.error('Delete person error:', error)
    res.status(500).json({ error: 'Failed to delete person' })
  }
})

// Get all people (with pagination)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '20', search = '' } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)

    const where = search
      ? {
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' as const } },
            { lastName: { contains: search as string, mode: 'insensitive' as const } },
            { email: { contains: search as string, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const [people, total] = await Promise.all([
      prisma.person.findMany({
        where,
        skip,
        take,
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          dateOfBirth: true,
          dateOfDeath: true,
          isDeceased: true,
          profilePhoto: true,
          email: true,
          city: true,
          state: true
        }
      }),
      prisma.person.count({ where })
    ])

    res.json({
      people,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error) {
    console.error('Get people error:', error)
    res.status(500).json({ error: 'Failed to fetch people' })
  }
})

export default router