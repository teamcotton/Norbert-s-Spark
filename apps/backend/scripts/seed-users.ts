#!/usr/bin/env tsx
/**
 * Seed script to populate the users table with 58 different accounts
 *
 * Usage:
 *   pnpm seed:users
 *
 * This will create:
 * - 1 admin account
 * - 2 moderator accounts
 * - 55 regular user accounts
 *
 * All accounts use the password: Password123!
 */
/*
 * All accounts use the password specified by the SEED_PASSWORD environment variable,
 * or 'Password123!' if SEED_PASSWORD is not set.
 */
import { db } from '../src/infrastructure/database/index.js'
import { user } from '../src/infrastructure/database/schema.js'
import { Password } from '../src/domain/value-objects/password.js'
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'Password123!'
if (!process.env.SEED_PASSWORD) {
  console.warn(
    '[seed-users] Warning: SEED_PASSWORD environment variable not set. Using default password "Password123!".'
  )
}

// Diverse first names
const firstNames = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'William',
  'Barbara',
  'David',
  'Elizabeth',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
  'Christopher',
  'Nancy',
  'Daniel',
  'Lisa',
  'Matthew',
  'Betty',
  'Anthony',
  'Margaret',
  'Mark',
  'Sandra',
  'Donald',
  'Ashley',
  'Steven',
  'Kimberly',
  'Paul',
  'Emily',
  'Andrew',
  'Donna',
  'Joshua',
  'Michelle',
  'Kenneth',
  'Carol',
  'Kevin',
  'Amanda',
  'Brian',
  'Dorothy',
  'George',
  'Melissa',
  'Edward',
  'Deborah',
  'Ronald',
  'Stephanie',
  'Timothy',
  'Rebecca',
  'Jason',
  'Sharon',
  'Jeffrey',
  'Laura',
  'Ryan',
  'Cynthia',
  'Jacob',
  'Kathleen',
  'Gary',
  'Amy',
  'Nicholas',
  'Shirley',
  'Eric',
  'Angela',
  'Jonathan',
  'Helen',
  'Stephen',
  'Anna',
]

// Diverse last names
const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
  'Allen',
  'King',
  'Wright',
  'Scott',
  'Torres',
  'Nguyen',
  'Hill',
  'Flores',
  'Green',
  'Adams',
  'Nelson',
  'Baker',
  'Hall',
  'Rivera',
  'Campbell',
  'Mitchell',
  'Carter',
  'Roberts',
  'Gomez',
  'Phillips',
  'Evans',
  'Turner',
  'Diaz',
  'Parker',
  'Cruz',
  'Edwards',
  'Collins',
  'Reyes',
  'Stewart',
  'Morris',
  'Morales',
  'Murphy',
  'Cook',
  'Rogers',
  'Morgan',
  'Peterson',
  'Cooper',
  'Reed',
  'Bailey',
  'Bell',
]

// Email domains for variety
const emailDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'mail.com',
  'aol.com',
  'zoho.com',
  'fastmail.com',
]

/**
 * Generate a unique email address
 */
function generateEmail(firstName: string, lastName: string, index: number): string {
  const domain = emailDomains[index % emailDomains.length]
  const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
  const suffix = index > 9 ? index : ''
  return `${baseEmail}${suffix}@${domain}`
}

/**
 * Generate a full name
 */
function generateName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

/**
 * Determine role based on index
 */
function getRole(index: number): 'admin' | 'moderator' | 'user' {
  if (index === 0) return 'admin'
  if (index === 1 || index === 2) return 'moderator'
  return 'user'
}

async function seedUsers() {
  console.log('🌱 Starting user seed script...')
  console.log(`📊 Creating ${TOTAL_USERS} user accounts`)
  console.log(`🔐 All accounts use password: ${DEFAULT_PASSWORD}`)

  try {
    // Hash the password once (all users will use the same hashed password)
    console.log('\n⏳ Hashing password...')
    const hashedPassword = (await Password.create(DEFAULT_PASSWORD)).getHash()
    console.log('✅ Password hashed')

    const usersToInsert = []

    console.log('\n👥 Generating user data...')
    for (let i = 0; i < TOTAL_USERS; i++) {
      const firstName = firstNames[i % firstNames.length]
      const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length]
      const name = generateName(firstName, lastName)
      const email = generateEmail(firstName, lastName, i)
      const role = getRole(i)

      usersToInsert.push({
        name,
        email,
        password: hashedPassword,
        role,
      })

      // Log special accounts
      if (role === 'admin') {
        console.log(`   👑 Admin: ${email}`)
      } else if (role === 'moderator') {
        console.log(`   🛡️  Moderator: ${email}`)
      }
    }

    console.log(`   👤 Regular users: ${TOTAL_USERS - 3}`)

    console.log('\n💾 Inserting users into database...')
    const insertedUsers = await db.insert(user).values(usersToInsert).returning()

    console.log(`\n✅ Successfully created ${insertedUsers.length} users!`)
    console.log('\n📋 Summary:')
    console.log(`   Total users: ${insertedUsers.length}`)
    console.log(`   Admins: ${insertedUsers.filter((u) => u.role === 'admin').length}`)
    console.log(`   Moderators: ${insertedUsers.filter((u) => u.role === 'moderator').length}`)
    console.log(`   Users: ${insertedUsers.filter((u) => u.role === 'user').length}`)
    console.log('\n🔑 Login credentials:')
    console.log(`   Email: Any of the generated emails`)
    console.log(`   Password: ${DEFAULT_PASSWORD}`)
  } catch (error) {
    console.error('\n❌ Error seeding users:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  } finally {
    // Close the database connection pool
    const { pool } = await import('../src/infrastructure/database/index.js')
    await pool.end()
    console.log('\n🔌 Database connection closed')
  }
}

// Run the seed script
seedUsers()
