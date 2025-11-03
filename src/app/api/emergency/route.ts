import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const emergencyInfoSchema = z.object({
  emergencyContact: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    relationship: z.string().min(1),
  }),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()),
  conditions: z.array(z.string()),
  medications: z.array(z.object({
    name: z.string().min(1),
    dosage: z.string().min(1),
    frequency: z.string().min(1),
  })),
  insurance: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
  }).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const emergencyInfo = await prisma.emergencyInfo.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json(emergencyInfo)

  } catch (error) {
    console.error('Emergency info fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const emergencyData = emergencyInfoSchema.parse(body)

    const emergencyInfo = await prisma.emergencyInfo.upsert({
      where: { userId: session.user.id },
      update: emergencyData,
      create: {
        userId: session.user.id,
        ...emergencyData,
      },
    })

    return NextResponse.json({
      message: 'Emergency information saved successfully',
      data: emergencyInfo,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Emergency info save error:', error)
    return NextResponse.json(
      { error: 'Failed to save emergency information' },
      { status: 500 }
    )
  }
}