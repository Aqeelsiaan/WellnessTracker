import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'
import { MetricType } from '@/types'

const healthDataSchema = z.object({
  metricType: z.nativeEnum(MetricType),
  value: z.any(),
  date: z.string().datetime(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { metricType, value, date, notes } = healthDataSchema.parse(body)

    // Validate the value based on metric type
    let validatedValue = value
    switch (metricType) {
      case MetricType.BLOOD_PRESSURE:
        const bpSchema = z.object({
          systolic: z.number().min(70).max(250),
          diastolic: z.number().min(40).max(150),
          pulse: z.number().min(40).max(200),
          position: z.enum(['standing', 'sitting', 'lying']).optional(),
        })
        validatedValue = bpSchema.parse(value)
        break

      case MetricType.BLOOD_GLUCOSE:
        const glucoseSchema = z.object({
          value: z.number().min(20).max(600),
          type: z.enum(['fasting', 'post_meal']),
          timeSinceMeal: z.number().min(0).max(300).optional(),
          unit: z.enum(['mg/dL', 'mmol/L']).default('mg/dL'),
        })
        validatedValue = glucoseSchema.parse(value)
        break

      case MetricType.WEIGHT:
        const weightSchema = z.object({
          value: z.number().min(20).max(300),
          unit: z.enum(['kg', 'lbs']).default('kg'),
          bodyFat: z.number().min(0).max(100).optional(),
        })
        validatedValue = weightSchema.parse(value)
        break

      case MetricType.WATER_INTAKE:
        const waterSchema = z.object({
          amount: z.number().min(0).max(5000),
          unit: z.enum(['ml', 'oz', 'cups']).default('ml'),
        })
        validatedValue = waterSchema.parse(value)
        break

      case MetricType.SLEEP:
        const sleepSchema = z.object({
          duration: z.number().min(0).max(24),
          quality: z.number().min(1).max(5),
          bedTime: z.string(),
          wakeTime: z.string(),
          notes: z.string().optional(),
        })
        validatedValue = sleepSchema.parse(value)
        break

      case MetricType.EXERCISE:
        const exerciseSchema = z.object({
          type: z.string().min(1),
          duration: z.number().min(0).max(480),
          intensity: z.number().min(1).max(5),
          calories: z.number().min(0).max(2000).optional(),
        })
        validatedValue = exerciseSchema.parse(value)
        break

      case MetricType.STRESS:
        const stressSchema = z.object({
          level: z.number().min(1).max(10),
          triggers: z.array(z.string()).optional(),
          copingMechanisms: z.array(z.string()).optional(),
        })
        validatedValue = stressSchema.parse(value)
        break

      default:
        throw new Error('Invalid metric type')
    }

    const healthData = await prisma.healthData.create({
      data: {
        userId: session.user.id,
        metricType,
        value: validatedValue,
        date: new Date(date),
        notes,
      },
    })

    return NextResponse.json({
      message: 'Health data saved successfully',
      data: healthData,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Health data save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const metricType = searchParams.get('metricType') as MetricType | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const whereClause: any = {
      userId: session.user.id,
    }

    if (metricType) {
      whereClause.metricType = metricType
    }

    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) {
        whereClause.date.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate)
      }
    }

    const healthData = await prisma.healthData.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
      take: limit,
    })

    return NextResponse.json({
      data: healthData,
      count: healthData.length,
    })

  } catch (error) {
    console.error('Health data fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}