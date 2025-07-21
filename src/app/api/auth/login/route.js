import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// This function handles user login
export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();
    const { email, password } = body;
    // Validate required fields
    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });
    // If user not found, return error
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // If password is invalid, return error
    if (!isPasswordValid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }
    // If login is successful, return user data (excluding password)
    return Response.json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
        email: user.email,
        phone: user.phone,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
