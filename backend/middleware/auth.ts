
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.ts'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    personId?: string
  }
}

// Verify JWT token
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, personId: true, isActive: true }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      personId: user.personId ?? undefined
    }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Role-based authorization
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}

// Check if user can modify a specific person
export const canModifyPerson = async (
  userId: string,
  userRole: string,
  userPersonId: string | null,
  targetPersonId: string
): Promise<boolean> => {
  // Admin can modify anyone
  if (userRole === 'ADMIN') {
    return true
  }

  // Guest cannot modify anyone
  if (userRole === 'GUEST') {
    return false
  }

  // Member can modify themselves
  if (userPersonId === targetPersonId) {
    return true
  }

  // Member can modify direct relatives
  if (userPersonId) {
    const person = await prisma.person.findUnique({
      where: { id: targetPersonId },
      select: {
        biologicalFatherId: true,
        biologicalMotherId: true,
        adoptiveParentId: true,
        biologicalChildren: { select: { id: true } },
        biologicalChildrenMother: { select: { id: true } },
        marriagesAsSpouse1: { select: { spouse2Id: true } },
        marriagesAsSpouse2: { select: { spouse1Id: true } }
      }
    })

    if (!person) return false

    // Check if target is user's parent
    if (
      person.biologicalFatherId === userPersonId ||
      person.biologicalMotherId === userPersonId ||
      person.adoptiveParentId === userPersonId
    ) {
      return true
    }

    // Check if target is user's child
    const childIds = [
      ...person.biologicalChildren.map(c => c.id),
      ...person.biologicalChildrenMother.map(c => c.id)
    ]
    if (childIds.includes(userPersonId)) {
      return true
    }

    // Check if target is user's spouse
    const spouseIds = [
      ...person.marriagesAsSpouse1.map(m => m.spouse2Id),
      ...person.marriagesAsSpouse2.map(m => m.spouse1Id)
    ]
    if (spouseIds.includes(userPersonId)) {
      return true
    }

    // Check if user is target's parent
    const userPerson = await prisma.person.findUnique({
      where: { id: userPersonId },
      select: {
        biologicalFatherId: true,
        biologicalMotherId: true,
        adoptiveParentId: true
      }
    })

    if (
      userPerson?.biologicalFatherId === targetPersonId ||
      userPerson?.biologicalMotherId === targetPersonId ||
      userPerson?.adoptiveParentId === targetPersonId
    ) {
      return true
    }
  }

  return false
}

// Middleware to check person modification permission
export const checkPersonPermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const personId = req.params.id || req.body.personId
    
    if (!personId) {
      return res.status(400).json({ error: 'Person ID required' })
    }

    const canModify = await canModifyPerson(
      req.user!.id,
      req.user!.role,
      req.user!.personId || null,
      personId
    )

    if (!canModify) {
      return res.status(403).json({ 
        error: 'You do not have permission to modify this person' 
      })
    }

    next()
  } catch (error) {
    return res.status(500).json({ error: 'Permission check failed' })
  }
}

// Audit logging helper
export const logAudit = async (
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
  entityType: string,
  entityId: string,
  personId?: string,
  changes?: any,
  ipAddress?: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        personId,
        changes,
        ipAddress
      }
    })
  } catch (error) {
    console.error('Failed to log audit:', error)
  }
}

// Example route usage:
// router.get('/family-tree', authenticate, async (req, res) => { ... }) // All authenticated users
// router.post('/person', authenticate, authorize('MEMBER', 'ADMIN'), async (req, res) => { ... })
// router.put('/person/:id', authenticate, checkPersonPermission, async (req, res) => { ... })
// router.delete('/person/:id', authenticate, authorize('ADMIN'), async (req, res) => { ... })