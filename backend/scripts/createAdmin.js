// backend/scripts/createAdmin.js
// Simple script to create admin user - Run with: node scripts/createAdmin.js [email] [password]

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// Load environment variables
require('dotenv').config()

const prisma = new PrismaClient()

async function createAdmin() {
  console.log('=== Create Admin User ===\n')

  try {
    // Check database connection
    await prisma.$connect()
    console.log('✅ Database connected\n')

    // Get email from args or prompt
    let email = process.argv[2]
    let password = process.argv[3]

    if (!email) {
      console.error('❌ Email is required. Usage: node scripts/createAdmin.js <email> <password>')
      process.exit(1)
    }

    if (!email.includes('@')) {
      console.error('❌ Invalid email address')
      process.exit(1)
    }

    if (!password) {
      console.error('❌ Password is required. Usage: node scripts/createAdmin.js <email> <password>')
      process.exit(1)
    }

    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters long')
      process.exit(1)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('\n⚠️  User with this email already exists!')

      if (existingUser.role === 'ADMIN') {
        console.log('   This user is already an admin.')
      } else {
        console.log('   Upgrading user to ADMIN...')
        await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        })
        console.log('\n✅ User upgraded to ADMIN successfully!')
      }

      await prisma.$disconnect()
      return
    }

    // Hash password
    console.log('\n⏳ Creating admin user...')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    console.log('\n✅ Admin user created successfully!')
    console.log('\n╔═══════════════════════════════════════════╗')
    console.log('║           ADMIN DETAILS                   ║')
    console.log('╠══════════════════════════════════════════╣')
    console.log(`║ Email:    ${admin.email.padEnd(30)} ║`)
    console.log(`║ Role:     ${admin.role.padEnd(30)} ║`)
    console.log(`║ ID:       ${admin.id.substring(0, 20).padEnd(30)} ║`)
    console.log('╚═══════════════════════════════════════════╝\n')
    console.log('You can now login with these credentials!\n')

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message)
    if (error.code === 'P2002') {
      console.error('   This email is already registered.')
    } else if (error.code === 'P1001') {
      console.error('   Cannot connect to database. Check your DATABASE_URL in .env')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in your .env file!')
  console.error('   Please set it before running this script.\n')
  process.exit(1)
}

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET is not set in your .env file!')
  console.warn('   Please set it for authentication to work.\n')
}

createAdmin()
