import  express from 'express'
import { prisma } from '../lib/prisma.ts'
import { authenticate, logAudit } from '../middleware/auth.ts'
import type { AuthRequest } from '../middleware/auth.ts'

const router = express.Router()

// ==================== PROFILE MANAGEMENT ROUTES ====================

// Create or update comprehensive person profile for current user
router.post('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    
    // Check if user already has a person linked
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        personId: true,
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
    

    const {
      // Section 1: Identity
      firstName,
      middleName,
      lastName,
      maidenName,
      nicknames,
      gender,
      dateOfBirth,
      isDeceased,
      dateOfDeath,
      
      // Section 2: Contact & Location
      email,
      phone,
      address,
      city,
      state,
      country,
      
      // Section 3: Family Relationships
      biologicalFatherId,
      biologicalMotherId,
      spouses, // Array of spouse objects
      
      // Section 4: Children
      childrenIds, // Array of child IDs
      
      // Section 5: Life & Story
      bio,
      occupation,
      stories, // Array of story objects
      profilePhoto,
      
      // Profile status
      status // DRAFT, PENDING, APPROVED, REJECTED
    } = req.body

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ 
        error: 'First name and last name are required' 
      })
    }

    // If updating existing profile
    if (existingUser?.personId) {
      // Update person
      const updatedPerson = await prisma.person.update({
        where: { id: existingUser.personId },
        data: {
          // Identity
          firstName,
          middleName: middleName || null,
          lastName,
          maidenName: maidenName || null,
          nicknames: Array.isArray(nicknames) ? nicknames : [],
          gender: gender || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          isDeceased: isDeceased || false,
          dateOfDeath: (isDeceased && dateOfDeath) ? new Date(dateOfDeath) : null,
          
          // Contact
          email: email || null,
          phone: phone || null,
          address: address || null,
          city: city || null,
          state: state || null,
          country: country || null,
          
          // Family relationships
          biologicalFatherId: biologicalFatherId || null,
          biologicalMotherId: biologicalMotherId || null,
          
          // Life & Story
          bio: bio || null,
          occupation: occupation || null,
          profilePhoto: profilePhoto || null,
          
          updatedBy: userId
        }
      })
      

      // Handle spouses (marriages)
      if (Array.isArray(spouses) && spouses.length > 0) {
        // Delete existing marriages for this person
        await prisma.marriage.deleteMany({
          where: {
            OR: [
              { spouse1Id: existingUser.personId },
              { spouse2Id: existingUser.personId }
            ]
          }
        })

        // Create new marriages
        for (const spouse of spouses) {
          if (spouse.spouseId) {
            await prisma.marriage.create({
              data: {
                spouse1Id: existingUser.personId,
                spouse2Id: spouse.spouseId,
                marriageDate: spouse.marriageDate ? new Date(spouse.marriageDate) : null,
                status: spouse.status || 'MARRIED'
              }
            })
          }
        }
      }

      // Handle stories
      if (Array.isArray(stories) && stories.length > 0) {
        // Delete existing stories
        await prisma.story.deleteMany({
          where: { personId: existingUser.personId }
        })

        // Create new stories
        for (const story of stories) {
          if (story.title && story.content) {
            await prisma.story.create({
              data: {
                personId: existingUser.personId,
                title: story.title,
                content: story.content,
                storyDate: story.date ? new Date(story.date) : null,
                author: `${firstName} ${lastName}`
              }
            })
          }
        }
      }

      // Log the update
      await logAudit(
        userId,
        'UPDATE',
        'Person',
        existingUser.personId,
        existingUser.personId,
        { action: 'updated_comprehensive_profile', status },
        req.ip
      )

      // Fetch complete updated profile
      const completeProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          personId: true,
          person: {
            include: {
              biologicalFather: {
                select: { id: true, firstName: true, lastName: true, profilePhoto: true }
              },
              biologicalMother: {
                select: { id: true, firstName: true, lastName: true, profilePhoto: true }
              },
              marriagesAsSpouse1: {
                include: {
                  spouse2: {
                    select: { id: true, firstName: true, lastName: true, profilePhoto: true }
                  }
                }
              },
              marriagesAsSpouse2: {
                include: {
                  spouse1: {
                    select: { id: true, firstName: true, lastName: true, profilePhoto: true }
                  }
                }
              },
              biologicalChildren: {
                select: { id: true, firstName: true, lastName: true, dateOfBirth: true, profilePhoto: true }
              },
              stories: true
            }
          }
        }
      })

      return res.json(completeProfile)
    }

    // Create new person profile
    const person = await prisma.person.create({
      data: {
        // Identity
        firstName,
        middleName: middleName || null,
        lastName,
        maidenName: maidenName || null,
        nicknames: Array.isArray(nicknames) ? nicknames : [],
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        isDeceased: isDeceased || false,
        dateOfDeath: (isDeceased && dateOfDeath) ? new Date(dateOfDeath) : null,

        // Contact
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,

        // Family relationships
        biologicalFatherId: biologicalFatherId || null,
        biologicalMotherId: biologicalMotherId || null,

        // Life & Story
        bio: bio || null,
        occupation: occupation || null,
        profilePhoto: profilePhoto || null,

        createdBy: userId,
        updatedBy: userId
      }
    })

    // Link person to user
    await prisma.user.update({
      where: { id: userId },
      data: { personId: person.id }
    })

    // Handle spouses (marriages)
    if (Array.isArray(spouses) && spouses.length > 0) {
      for (const spouse of spouses) {
        if (spouse.spouseId) {
          await prisma.marriage.create({
            data: {
              spouse1Id: person.id,
              spouse2Id: spouse.spouseId,
              marriageDate: spouse.marriageDate ? new Date(spouse.marriageDate) : null,
              status: spouse.status || 'MARRIED'
            }
          })
        }
      }
    }

    // Handle stories
    if (Array.isArray(stories) && stories.length > 0) {
      for (const story of stories) {
        if (story.title && story.content) {
          await prisma.story.create({
            data: {
              personId: person.id,
              title: story.title,
              content: story.content,
              storyDate: story.date ? new Date(story.date) : null,
              author: `${firstName} ${lastName}`
            }
          })
        }
      }
    }

    // Log the creation
    await logAudit(
      userId,
      'CREATE',
      'Person',
      person.id,
      person.id,
      { action: 'created_comprehensive_profile', status },
      req.ip
    )

    // Fetch complete profile
    const completeProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        personId: true,
        person: {
          include: {
            biologicalFather: {
              select: { id: true, firstName: true, lastName: true, profilePhoto: true }
            },
            biologicalMother: {
              select: { id: true, firstName: true, lastName: true, profilePhoto: true }
            },
            marriagesAsSpouse1: {
              include: {
                spouse2: {
                  select: { id: true, firstName: true, lastName: true, profilePhoto: true }
                }
              }
            },
            marriagesAsSpouse2: {
              include: {
                spouse1: {
                  select: { id: true, firstName: true, lastName: true, profilePhoto: true }
                }
              }
            },
            biologicalChildren: {
              select: { id: true, firstName: true, lastName: true, dateOfBirth: true, profilePhoto: true }
            },
            stories: true
          }
        }
      }
    })

    res.status(201).json(completeProfile)
  } catch (error) {
    console.error('Create/update person profile error:', error)
    res.status(500).json({ error: 'Failed to process person profile' })
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
                profilePhoto: true,
                dateOfBirth: true
              }
            },
            biologicalMother: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
                dateOfBirth: true
              }
            },
            marriagesAsSpouse1: {
              include: {
                spouse2: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePhoto: true,
                    dateOfBirth: true
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
                    profilePhoto: true,
                    dateOfBirth: true
                  }
                }
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
            stories: {
              orderBy: {
                storyDate: 'desc'
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

// ==================== PERSON SEARCH ROUTE ====================

// Search persons (for autocomplete in relationships)
router.get('/search', authenticate, async (req: AuthRequest, res) => {
  try {
    const { q = '', limit = '10' } = req.query

    if (!q || (q as string).length < 2) {
      return res.json([])
    }

    const searchQuery = q as string

    const persons = await prisma.person.findMany({
      where: {
        OR: [
          { firstName: { contains: searchQuery, mode: 'insensitive' } },
          { lastName: { contains: searchQuery, mode: 'insensitive' } },
          { nicknames: { has: searchQuery } }
        ]
      },
      take: parseInt(limit as string),
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
        profilePhoto: true,
        city: true,
        isDeceased: true
      }
    })

    // Format response for autocomplete
    const formattedResults = persons.map(person => ({
      id: person.id,
      name: `${person.firstName} ${person.middleName ? person.middleName + ' ' : ''}${person.lastName}`,
      firstName: person.firstName,
      lastName: person.lastName,
      birthYear: person.dateOfBirth ? new Date(person.dateOfBirth).getFullYear() : undefined,
      profilePhoto: person.profilePhoto,
      city: person.city,
      isDeceased: person.isDeceased
    }))

    res.json(formattedResults)
  } catch (error) {
    console.error('Person search error:', error)
    res.status(500).json({ error: 'Failed to search persons' })
  }
})

// ==================== EXISTING ROUTES (Keep these) ====================

// Get person by ID (with access control)
router.get('/:personId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { personId } = req.params
    const userId = req.user!.id

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

    // Access control
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