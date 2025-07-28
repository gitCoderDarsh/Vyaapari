import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'

// Generate a cuid-like ID
function generateId() {
  return 'cm' + randomBytes(10).toString('base64url')
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { firstName, lastName, businessName, email, phone, password } = body

    // Basic validation
    if (!firstName || !lastName || !email || !password || !phone || !businessName) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Password strength validation
    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return Response.json({ error: 'User already exists' }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)
    // Note: Removed password logging for security reasons
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        id: generateId(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        businessName: businessName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
      },
    })

    return Response.json({ message: 'User created successfully', user: { id: user.id, email: user.email } }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
