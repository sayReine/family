import express from 'express'
import { prisma } from '../lib/prisma.ts'
import { authenticate, logAudit } from '../middleware/auth.ts'
import type { AuthRequest } from '../middleware/auth.ts'

const router = express.Router()

// Middleware to check if user is admin
const requireAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// ==================== PROFILE APPROVAL ROUTES ====================

// Get all pending profiles
router.get('/profiles/pending', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const pendingProfiles = await prisma.person.findMany({
      where: { profileStatus: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        biologicalFather: {
          select: { id: true, firstName: true, lastName: true }
        },
        biologicalMother: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({ profiles: pendingProfiles })
  } catch (error) {
    console.error('Get pending profiles error:', error)
    res.status(500).json({ error: 'Failed to fetch pending profiles' })
  }
})

// Approve a profile
router.post('/profiles/:personId/approve', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { personId } = req.params
    const userId = req.user!.id

    // Check if person exists
    const person = await prisma.person.findUnique({
      where: { id: personId }
    })

    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    // Update person status to APPROVED
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: {
        profileStatus: 'APPROVED',
        updatedBy: userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    })

    // Log the approval
    await logAudit(
      userId,
      'UPDATE',
      'Person',
      personId,
      personId,
      { action: 'approved_profile', previousStatus: person.profileStatus },
      req.ip
    )

    // TODO: Send notification email to user
    // You can implement email notification here

    res.json({
      message: 'Profile approved successfully',
      person: updatedPerson
    })
  } catch (error) {
    console.error('Approve profile error:', error)
    res.status(500).json({ error: 'Failed to approve profile' })
  }
})

// Reject a profile
router.post('/profiles/:personId/reject', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { personId } = req.params
    const { reason } = req.body
    const userId = req.user!.id

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' })
    }

    // Check if person exists
    const person = await prisma.person.findUnique({
      where: { id: personId }
    })

    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    // Update person status to REJECTED
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: {
        profileStatus: 'REJECTED',
        rejectionReason: reason.trim(),
        updatedBy: userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    })

    // Log the rejection
    await logAudit(
      userId,
      'UPDATE',
      'Person',
      personId,
      personId,
      { action: 'rejected_profile', reason: reason.trim(), previousStatus: person.profileStatus },
      req.ip
    )

    // TODO: Send notification email to user with rejection reason
    // You can implement email notification here

    res.json({
      message: 'Profile rejected successfully',
      person: updatedPerson
    })
  } catch (error) {
    console.error('Reject profile error:', error)
    res.status(500).json({ error: 'Failed to reject profile' })
  }
})

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users
router.get('/users', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '50', search = '' } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)

    const where = search
      ? {
          OR: [
            { email: { contains: search as string, mode: 'insensitive' as const } },
            { person: { 
              firstName: { contains: search as string, mode: 'insensitive' as const }
            }},
            { person: { 
              lastName: { contains: search as string, mode: 'insensitive' as const }
            }}
          ]
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          email: true,
          role: true,
          personId: true,
          person: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true
            }
          },
          isActive: true,
          createdAt: true,
          lastLoginAt: true
        }
      }),
      prisma.user.count({ where })
    ])

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Deactivate/Activate user
router.put('/users/:userId/status', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params
    const { isActive } = req.body
    const adminId = req.user!.id

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' })
    }

    // Prevent admin from deactivating themselves
    if (userId === adminId) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        personId: true
      }
    })

    await logAudit(
      adminId,
      'UPDATE',
      'User',
      userId,
      undefined,
      { action: isActive ? 'activated_user' : 'deactivated_user' },
      req.ip
    )

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({ error: 'Failed to update user status' })
  }
})

// Delete user
router.delete('/users/:userId', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params
    const adminId = req.user!.id

    // Prevent admin from deleting themselves
    if (userId === adminId) {
      return res.status(400).json({ error: 'You cannot delete your own account' })
    }

    // Check if user has a linked person
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { personId: true, email: true }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Delete user (person link will be set to null due to cascade)
    await prisma.user.delete({
      where: { id: userId }
    })

    await logAudit(
      adminId,
      'DELETE',
      'User',
      userId,
      undefined,
      { action: 'deleted_user', email: user.email },
      req.ip
    )

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// ==================== STATISTICS ROUTES ====================

// Get admin statistics
router.get('/stats', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const [
      totalUsers,
      totalPeople,
      pendingProfiles,
      approvedProfiles,
      rejectedProfiles,
      draftProfiles,
      recentLogins
    ] = await Promise.all([
      prisma.user.count(),
      prisma.person.count(),
      prisma.person.count({ where: { profileStatus: 'PENDING' } }),
      prisma.person.count({ where: { profileStatus: 'APPROVED' } }),
      prisma.person.count({ where: { profileStatus: 'REJECTED' } }),
      prisma.person.count({ where: { profileStatus: 'DRAFT' } }),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ])

    res.json({
      stats: {
        totalUsers,
        totalPeople,
        pendingProfiles,
        approvedProfiles,
        rejectedProfiles,
        draftProfiles,
        recentLogins
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

// Get audit logs (recent activity)
router.get('/audit-logs', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '50' } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              email: true,
              person: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      }),
      prisma.auditLog.count()
    ])

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error) {
    console.error('Get audit logs error:', error)
    res.status(500).json({ error: 'Failed to fetch audit logs' })
  }
})

// ==================== MANUAL PERSON REGISTRATION ROUTES ====================

// Helper function to calculate generation level
const calculateGeneration = async (biologicalFatherId?: string, biologicalMotherId?: string): Promise<number> => {
  if (!biologicalFatherId && !biologicalMotherId) {
    return 1; // Root generation
  }

  let parentGeneration = 0;

  // Check father's generation
  if (biologicalFatherId) {
    const father = await prisma.person.findUnique({
      where: { id: biologicalFatherId },
      select: { id: true }
    });

    if (father) {
      // Recursively find the highest generation among ancestors
      const fatherGen = await getPersonGeneration(biologicalFatherId);
      parentGeneration = Math.max(parentGeneration, fatherGen);
    }
  }

  // Check mother's generation
  if (biologicalMotherId) {
    const mother = await prisma.person.findUnique({
      where: { id: biologicalMotherId },
      select: { id: true }
    });

    if (mother) {
      const motherGen = await getPersonGeneration(biologicalMotherId);
      parentGeneration = Math.max(parentGeneration, motherGen);
    }
  }

  return parentGeneration + 1;
};

// Helper function to get a person's generation
const getPersonGeneration = async (personId: string): Promise<number> => {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: {
      biologicalFatherId: true,
      biologicalMotherId: true
    }
  });

  if (!person) return 1;

  return await calculateGeneration(person.biologicalFatherId || undefined, person.biologicalMotherId || undefined);
};

// Get generation suggestion for new person
router.get('/register/generation-suggestion', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { biologicalFatherId, biologicalMotherId } = req.query;

    const suggestedGeneration = await calculateGeneration(
      biologicalFatherId as string | undefined,
      biologicalMotherId as string | undefined
    );

    res.json({ suggestedGeneration });
  } catch (error) {
    console.error('Get generation suggestion error:', error);
    res.status(500).json({ error: 'Failed to calculate generation suggestion' });
  }
});

// Admin manual person registration
router.post('/register/person', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

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
      biologicalMotherId,
      profilePhoto
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        error: 'First name and last name are required'
      });
    }

    // Calculate generation
    const generation = await calculateGeneration(biologicalFatherId, biologicalMotherId);

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
        profilePhoto: profilePhoto || null,
        profileStatus: 'APPROVED', // Admin-created profiles are auto-approved
        createdBy: userId,
        updatedBy: userId
      }
    });

    // Log the creation
    await logAudit(
      userId,
      'CREATE',
      'Person',
      person.id,
      person.id,
      { action: 'admin_manual_registration', generation },
      req.ip
    );

    res.status(201).json({
      person,
      generation
    });
  } catch (error) {
    console.error('Admin person registration error:', error);
    res.status(500).json({ error: 'Failed to register person' });
  }
});

export default router
