import express from 'express'
import { prisma } from '../lib/prisma.ts'
import { authenticate, logAudit } from '../middleware/auth.ts'
import type { AuthRequest } from '../middleware/auth.ts'

const router = express.Router()

// GET /api/families — list all families with member count
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const families = await prisma.family.findMany({
      include: {
        _count: { select: { members: true } },
        members: { where: { userId: req.user!.id }, select: { role: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const result = families.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      createdBy: f.createdBy,
      memberCount: f._count.members,
      myRole: f.members[0]?.role ?? null,
      isMember: f.members.length > 0
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch families' })
  }
})

// GET /api/families/:id — single family with members list
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const family = await prisma.family.findUnique({
      where: { id: req.params.id },
      include: {
        members: { select: { userId: true, role: true, createdAt: true } },
        joinRequests: {
          where: { status: 'PENDING' },
          select: { id: true, userId: true, createdAt: true }
        }
      }
    })

    if (!family) return res.status(404).json({ error: 'Family not found' })

    // Enrich members with person info
    const userIds = family.members.map(m => m.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        person: { select: { id: true, firstName: true, lastName: true, profilePhoto: true, gender: true, dateOfBirth: true } }
      }
    })

    const userMap = Object.fromEntries(users.map(u => [u.id, u]))
    const enrichedMembers = family.members.map(m => ({
      ...m,
      user: userMap[m.userId] ?? null
    }))

    res.json({ ...family, members: enrichedMembers })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch family' })
  }
})

// POST /api/families — create a new family (user becomes ADMIN)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Family name is required' })

    const family = await prisma.family.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        createdBy: req.user!.id,
        members: {
          create: { userId: req.user!.id, role: 'ADMIN' }
        }
      }
    })

    await logAudit(req.user!.id, 'CREATE', 'Family', family.id, undefined, { name }, req.ip)
    res.status(201).json(family)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create family' })
  }
})

// POST /api/families/:id/join — request to join a family
router.post('/:id/join', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: familyId } = req.params
    const userId = req.user!.id

    const family = await prisma.family.findUnique({ where: { id: familyId } })
    if (!family) return res.status(404).json({ error: 'Family not found' })

    // Already a member?
    const existing = await prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } }
    })
    if (existing) return res.status(400).json({ error: 'Already a member of this family' })

    // Already requested?
    const existingReq = await prisma.joinRequest.findUnique({
      where: { familyId_userId: { familyId, userId } }
    })
    if (existingReq) return res.status(400).json({ error: 'Join request already sent' })

    const request = await prisma.joinRequest.create({ data: { familyId, userId } })
    res.status(201).json(request)
  } catch (error) {
    res.status(500).json({ error: 'Failed to send join request' })
  }
})

// GET /api/families/:id/requests — list pending join requests (family ADMIN only)
router.get('/:id/requests', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: familyId } = req.params
    const userId = req.user!.id

    const membership = await prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } }
    })

    if (!membership || (membership.role !== 'ADMIN' && req.user!.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only family admins can view join requests' })
    }

    const requests = await prisma.joinRequest.findMany({
      where: { familyId, status: 'PENDING' },
      orderBy: { createdAt: 'asc' }
    })

    // Enrich with user info
    const userIds = requests.map(r => r.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        person: { select: { firstName: true, lastName: true, profilePhoto: true } }
      }
    })
    const userMap = Object.fromEntries(users.map(u => [u.id, u]))

    res.json(requests.map(r => ({ ...r, user: userMap[r.userId] ?? null })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch join requests' })
  }
})

// PUT /api/families/:id/requests/:requestId — accept or reject (family ADMIN only)
router.put('/:id/requests/:requestId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: familyId, requestId } = req.params
    const { action } = req.body // 'accept' | 'reject'
    const userId = req.user!.id

    const membership = await prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } }
    })

    if (!membership || (membership.role !== 'ADMIN' && req.user!.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only family admins can manage join requests' })
    }

    const request = await prisma.joinRequest.findUnique({ where: { id: requestId } })
    if (!request || request.familyId !== familyId) {
      return res.status(404).json({ error: 'Request not found' })
    }

    if (action === 'accept') {
      await prisma.$transaction([
        prisma.joinRequest.update({ where: { id: requestId }, data: { status: 'ACCEPTED' } }),
        prisma.familyMember.create({ data: { familyId, userId: request.userId, role: 'MEMBER' } })
      ])
    } else if (action === 'reject') {
      await prisma.joinRequest.update({ where: { id: requestId }, data: { status: 'REJECTED' } })
    } else {
      return res.status(400).json({ error: 'Action must be accept or reject' })
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to process join request' })
  }
})

// GET /api/families/:id/tree — get family tree data (members only)
router.get('/:id/tree', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: familyId } = req.params
    const userId = req.user!.id

    const membership = await prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } }
    })

    if (!membership && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You must be a member to view this family tree' })
    }

    // Get all members' person records
    const members = await prisma.familyMember.findMany({
      where: { familyId },
      select: { userId: true, role: true }
    })

    const userIds = members.map(m => m.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, personId: { not: null } },
      select: { id: true, personId: true }
    })

    const personIds = users.map(u => u.personId!).filter(Boolean)
    const persons = await prisma.person.findMany({
      where: { id: { in: personIds }, profileStatus: 'APPROVED' },
      select: {
        id: true, firstName: true, lastName: true, gender: true,
        dateOfBirth: true, dateOfDeath: true, isDeceased: true,
        profilePhoto: true, bio: true, occupation: true,
        biologicalFatherId: true, biologicalMotherId: true,
        biologicalChildren: { select: { id: true } },
        biologicalChildrenMother: { select: { id: true } },
        marriagesAsSpouse1: { include: { spouse2: { select: { id: true, firstName: true, lastName: true } } } },
        marriagesAsSpouse2: { include: { spouse1: { select: { id: true, firstName: true, lastName: true } } } }
      }
    })

    res.json(persons)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch family tree' })
  }
})

// DELETE /api/families/:id/members/:memberId — remove member (family ADMIN or self-leave)
router.delete('/:id/members/:memberId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: familyId, memberId } = req.params
    const userId = req.user!.id

    const targetMember = await prisma.familyMember.findUnique({ where: { id: memberId } })
    if (!targetMember || targetMember.familyId !== familyId) {
      return res.status(404).json({ error: 'Member not found' })
    }

    const myMembership = await prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } }
    })

    const isSelf = targetMember.userId === userId
    const isAdmin = myMembership?.role === 'ADMIN' || req.user!.role === 'ADMIN'

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await prisma.familyMember.delete({ where: { id: memberId } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member' })
  }
})

export default router
