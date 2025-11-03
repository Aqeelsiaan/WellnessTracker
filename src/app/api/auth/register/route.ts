import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      }
    })

    // Create default wellness goals for new user
    await prisma.wellnessGoal.create({
      data: {
        userId: user.id,
        height: 170, // default height in cm
        weight: 70, // default weight in kg
        age: 30, // default age
        activityLevel: 'moderate',
        goalType: 'maintain',
        dietaryRestrictions: [],
        allergies: [],
        preferences: [],
        dailyCalorieGoal: 2000,
      }
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}