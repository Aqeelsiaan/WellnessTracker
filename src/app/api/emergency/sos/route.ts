import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const sosRequestSchema = z.object({
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number(),
  }),
  emergencyType: z.enum(['medical', 'accident', 'other']),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { location, emergencyType, message } = sosRequestSchema.parse(body)

    // Get user's emergency information
    const emergencyInfo = await prisma.emergencyInfo.findUnique({
      where: { userId: session.user.id }
    })

    if (!emergencyInfo || !emergencyInfo.emergencyContact) {
      return NextResponse.json({
        error: 'No emergency contact information available',
        code: 'NO_CONTACT_INFO'
      }, { status: 400 })
    }

    // Generate unique case number
    const caseNumber = `SOS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // In a real implementation, this would:
    // 1. Send SMS to emergency contacts via a service like Twilio
    // 2. Call emergency services if needed
    // 3. Send email notifications
    // 4. Log the SOS event
    // 5. Share location with emergency contacts

    // For this demo, we'll simulate the emergency response
    const emergencyResponse = {
      caseNumber,
      timestamp: new Date().toISOString(),
      location,
      emergencyType,
      message,
      emergencyContact: emergencyInfo.emergencyContact,
      actions: [],
      user: {
        name: session.user.name,
        email: session.user.email,
      }
    }

    // Simulate different actions based on emergency type
    if (emergencyType === 'medical') {
      emergencyResponse.actions.push(
        '🚑 Emergency services would be contacted',
        '📱 SMS sent to emergency contacts',
        '📍 Location shared with emergency team',
        '🏥 Nearby hospitals identified'
      )
    } else if (emergencyType === 'accident') {
      emergencyResponse.actions.push(
        '📞 Emergency contacts notified',
        '📍 Location shared with contacts',
        '🚑 Medical assistance recommended',
        '📸 Accident location documented'
      )
    } else {
      emergencyResponse.actions.push(
        '📞 Emergency contacts notified',
        '📍 Location shared',
        '⚠️ Emergency contact advised to check on you'
      )
    }

    // Log the SOS event (in a real app, this would be stored in the database)
    console.log('SOS Alert Triggered:', emergencyResponse)

    // In a real implementation, you might also:
    // - Send push notifications to emergency contacts
    // - Integrate with emergency services APIs
    // - Provide real-time location tracking
    // - Send automatic updates to contacts

    return NextResponse.json({
      success: true,
      caseNumber,
      message: 'Emergency alert sent successfully',
      emergencyResponse,
      disclaimer: 'This is a demo. In a real emergency, please call emergency services immediately.'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    console.error('SOS activation error:', error)
    return NextResponse.json(
      { error: 'Failed to process emergency alert' },
      { status: 500 }
    )
  }
}