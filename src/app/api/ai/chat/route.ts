import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string()
  })).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, conversationHistory = [] } = chatSchema.parse(body)

    // Get user's health data for context
    const recentHealthData = await prisma.healthData.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 20
    })

    // Get user's wellness goals
    const wellnessGoals = await prisma.wellnessGoal.findUnique({
      where: { userId: session.user.id }
    })

    // Get emergency info if available
    const emergencyInfo = await prisma.emergencyInfo.findUnique({
      where: { userId: session.user.id }
    })

    // Process health data for context
    const healthContext = {
      latestReadings: {},
      trends: {},
      goals: wellnessGoals ? {
        height: wellnessGoals.height,
        weight: wellnessGoals.weight,
        age: wellnessGoals.age,
        activityLevel: wellnessGoals.activityLevel,
        goalType: wellnessGoals.goalType,
        dietaryRestrictions: wellnessGoals.dietaryRestrictions,
        allergies: wellnessGoals.allergies,
      } : null,
      emergencyInfo: emergencyInfo ? {
        bloodType: emergencyInfo.bloodType,
        allergies: emergencyInfo.allergies,
        conditions: emergencyInfo.conditions,
      } : null
    }

    // Group recent readings by type
    const readingsByType = recentHealthData.reduce((acc, reading) => {
      if (!acc[reading.metricType]) {
        acc[reading.metricType] = []
      }
      acc[reading.metricType].push(reading)
      return acc
    }, {} as Record<string, any[]>)

    // Extract latest readings and basic trends
    Object.entries(readingsByType).forEach(([metricType, readings]) => {
      if (readings.length > 0) {
        healthContext.latestReadings[metricType] = readings[0].value

        // Simple trend calculation
        if (readings.length >= 2) {
          const latest = readings[0].value
          const previous = readings[1].value

          if (typeof latest === 'object' && typeof previous === 'object') {
            // For blood pressure
            if (latest.systolic && previous.systolic) {
              healthContext.trends[metricType] = latest.systolic > previous.systolic ? 'increasing' : 'decreasing'
            }
          } else if (typeof latest === 'number' && typeof previous === 'number') {
            healthContext.trends[metricType] = latest > previous ? 'increasing' : 'decreasing'
          }
        }
      }
    })

    // Detect potential emergencies in the message
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'stroke', 'suicide', 'kill myself',
      'emergency', 'call 911', 'can\'t breathe', 'severe pain', 'bleeding',
      'unconscious', 'faint', 'dizzy', 'confused'
    ]

    const isEmergency = emergencyKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    )

    if (isEmergency) {
      // Save the emergency message
      await prisma.chatMessage.create({
        data: {
          userId: session.user.id,
          role: 'user',
          content: message,
          category: 'emergency',
        }
      })

      return NextResponse.json({
        response: "⚠️ **IMMEDIATE MEDICAL ATTENTION REQUIRED**\n\nBased on your message, you may be experiencing a medical emergency. Please:\n\n📞 **Call emergency services immediately** (911 in the US/Canada, 112 in Europe, 999 in the UK)\n🚑 **Go to the nearest emergency room**\n👥 **Contact your emergency contact** if you're unable to call for help\n\nThis is not medical advice - this is a recommendation to seek immediate professional medical care.",
        category: 'emergency',
        disclaimer: 'This is not medical advice. If you are experiencing a medical emergency, call emergency services immediately.',
        isEmergency: true
      })
    }

    // Create the system prompt
    const systemPrompt = `You are a helpful AI health assistant for LifeTrack, a comprehensive health monitoring application. Your role is to provide general wellness information, motivation, and guidance based on the user's health data and goals.

IMPORTANT GUIDELINES:
1. ALWAYS include this disclaimer: "This is not medical advice — for educational use only. Please consult with healthcare professionals for personalized medical advice."
2. Do not diagnose conditions or prescribe treatments
3. Provide general wellness information and education
4. Be encouraging and motivational
5. Consider the user's health data and goals in your responses
6. If you detect potential emergencies, advise seeking immediate medical attention

USER CONTEXT:
- Current Date: ${new Date().toLocaleDateString()}
- Latest Health Readings: ${JSON.stringify(healthContext.latestReadings, null, 2)}
- Health Trends: ${JSON.stringify(healthContext.trends, null, 2)}
- Wellness Goals: ${JSON.stringify(healthContext.goals, null, 2)}
- Medical Info: ${JSON.stringify(healthContext.emergencyInfo, null, 2)}

Your tone should be:
- Supportive and encouraging
- Educational but not prescriptive
- Professional yet friendly
- Focused on wellness and prevention
- Respectful of privacy and health concerns

Keep responses concise but informative (1-3 paragraphs maximum). Use emojis where appropriate for tone.`

    // Build conversation history
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ]

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      })

      const aiResponse = completion.choices[0]?.message?.content

      if (!aiResponse) {
        throw new Error('No response from OpenAI')
      }

      // Save user message
      await prisma.chatMessage.create({
        data: {
          userId: session.user.id,
          role: 'user',
          content: message,
          category: 'general',
        }
      })

      // Save AI response
      await prisma.chatMessage.create({
        data: {
          userId: session.user.id,
          role: 'assistant',
          content: aiResponse,
          category: 'general',
        }
      })

      // Categorize the response
      let category = 'general'
      if (message.toLowerCase().includes('diet') || message.toLowerCase().includes('food') || message.toLowerCase().includes('eat')) {
        category = 'diet'
      } else if (message.toLowerCase().includes('exercise') || message.toLowerCase().includes('workout') || message.toLowerCase().includes('fitness')) {
        category = 'exercise'
      } else if (message.toLowerCase().includes('stress') || message.toLowerCase().includes('anxiety') || message.toLowerCase().includes('mental')) {
        category = 'mental'
      }

      return NextResponse.json({
        response: aiResponse,
        category,
        disclaimer: 'This is not medical advice — for educational use only. Please consult with healthcare professionals for personalized medical advice.',
        isEmergency: false
      })

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)

      // Fallback response
      const fallbackResponse = `I'm here to help with general wellness questions and provide motivation for your health journey.

Based on your health data and goals, I can offer guidance on nutrition, exercise, sleep, and stress management.

${healthContext.goals ? `I see you're working on ${healthContext.goals.goalType}ing weight. That's a great goal!` : ''}

Remember: Small, consistent changes lead to big results over time. Stay hydrated, aim for balanced meals, and don't forget to celebrate your progress!

**This is not medical advice — for educational use only. Please consult with healthcare professionals for personalized medical advice.**`

      // Save messages even with fallback
      await prisma.chatMessage.create({
        data: {
          userId: session.user.id,
          role: 'user',
          content: message,
          category: 'general',
        }
      })

      await prisma.chatMessage.create({
        data: {
          userId: session.user.id,
          role: 'assistant',
          content: fallbackResponse,
          category: 'general',
        }
      })

      return NextResponse.json({
        response: fallbackResponse,
        category: 'general',
        disclaimer: 'This is not medical advice — for educational use only. Please consult with healthcare professionals for personalized medical advice.',
        isEmergency: false,
        fallback: true
      })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid message format', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process your message' },
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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    const messages = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      messages: messages.reverse(), // Return in chronological order
      count: messages.length
    })

  } catch (error) {
    console.error('Chat history fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}