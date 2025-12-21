// backend/scripts/createAdmin.js
// Simple script to create admin user - Run with: node scripts/createAdmin.js

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

// Load environment variables
require('dotenv').config()

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function createAdmin() {
  console.log('=== Create Admin User ===\n')

  try {
    // Check database connection
    await prisma.$connect()
    console.log('✅ Database connected\n')

    // Get email
    const email = await question('Enter admin email: ')
    
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address')
      rl.close()
      await prisma.$disconnect()
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
        const upgrade = await question('\nUpgrade this user to ADMIN? (yes/no): ')
        
        if (upgrade.toLowerCase() === 'yes' || upgrade.toLowerCase() === 'y') {
          await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
          })
          console.log('\n✅ User upgraded to ADMIN successfully!')
        }
      }
      
      rl.close()
      await prisma.$disconnect()
      return
    }

    // Get password
    const password = await question('Enter admin password (min 8 characters): ')
    
    if (!password || password.length < 8) {
      console.error('❌ Password must be at least 8 characters long')
      rl.close()
      await prisma.$disconnect()
      process.exit(1)
    }

    // Confirm password
    const confirmPassword = await question('Confirm password: ')
    
    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match')
      rl.close()
      await prisma.$disconnect()
      process.exit(1)
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
    console.log('╠═══════════════════════════════════════════╣')
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
    rl.close()
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