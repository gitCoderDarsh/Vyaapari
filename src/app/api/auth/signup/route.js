import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req) {
  try {
    const body = await req.json()
    const { firstName, lastName, businessName, email, phone, password } = body

    // Basic validation
    if (!firstName || !email || !password || !phone || !businessName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
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
    console.log('Hashed password:', hashedPassword)
        // Create new user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        businessName,
        email,
        phone,
        password: hashedPassword,
      },
    })

    console.log('User created:', user);

    return Response.json({ message: 'User created successfully', user }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
