
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.ts'
import { authenticate, logAudit } from '../middleware/auth.ts'
import type { AuthRequest } from '../middleware/auth.ts'

const router = express.Router()

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'GUEST' } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Only admins can create non-guest users
    // For first user, you might want to manually set them as ADMIN in database
    const allowedRole = role === 'GUEST' ? 'GUEST' : 'GUEST'

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: allowedRole
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      user,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        personId: user.personId
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
        createdAt: true,
        lastLoginAt: true
      }
    })

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Link user to person (Admin only or user linking themselves)
router.post('/link-person', authenticate, async (req: AuthRequest, res) => {
  try {
    const { personId } = req.body
    const userId = req.user!.id

    // Check if person exists
    const person = await prisma.person.findUnique({
      where: { id: personId }
    })

    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    // Check if person is already linked
    const existingLink = await prisma.user.findFirst({
      where: { personId }
    })

    if (existingLink && existingLink.id !== userId) {
      return res.status(400).json({ 
        error: 'This person is already linked to another user' 
      })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { personId },
      select: {
        id: true,
        email: true,
        role: true,
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

    await logAudit(
      userId,
      'UPDATE',
      'User',
      userId,
      personId,
      { action: 'linked_person', personId },
      req.ip
    )

    res.json(updatedUser)
  } catch (error) {
    console.error('Link person error:', error)
    res.status(500).json({ error: 'Failed to link person' })
  }
})

// Admin: Update user role
router.put('/users/:userId/role', authenticate, async (req: AuthRequest, res) => {
  try {
    // Only admins can change roles
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { userId } = req.params
    const { role } = req.body

    if (!['GUEST', 'MEMBER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        personId: true
      }
    })

    await logAudit(
      req.user!.id,
      'UPDATE',
      'User',
      userId,
      undefined,
      { action: 'role_change', newRole: role },
      req.ip
    )

    res.json(updatedUser)
  } catch (error) {
    console.error('Update role error:', error)
    res.status(500).json({ error: 'Failed to update role' })
  }
})

export default router