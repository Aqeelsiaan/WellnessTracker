'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Shield, AlertTriangle, MapPin, Users, Phone } from 'lucide-react'

interface SOSButtonProps {
  onActivate?: (location: GeolocationPosition) => void
  className?: string
}

export function SOSButton({ onActivate, className }: SOSButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isActivating, setIsActivating] = useState(false)
  const [location, setLocation] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Get current location when component mounts
    getCurrentLocation()
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      intervalRef.current = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0 && isPressed) {
      // Countdown finished, activate SOS
      activateSOS()
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [countdown, isPressed])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position)
        setError('')
      },
      (error) => {
        console.error('Error getting location:', error)
        setError('Unable to get your location. SOS will still work but location sharing may be limited.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    )
  }

  const handleMouseDown = () => {
    setIsPressed(true)
    setCountdown(3) // 3-second countdown
  }

  const handleMouseUp = () => {
    if (countdown > 0) {
      // User released before countdown finished
      setIsPressed(false)
      setCountdown(0)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    handleMouseDown()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleMouseUp()
  }

  const activateSOS = async () => {
    if (!location) {
      // Try to get location one more time
      getCurrentLocation()
    }

    setIsActivating(true)

    try {
      const payload = {
        location: location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        } : {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
        },
        emergencyType: 'medical',
        message: 'Emergency SOS activated via LifeTrack app',
      }

      const response = await fetch('/api/emergency/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        onActivate?.(location!)
        console.log('SOS activated successfully:', data)

        // Show success feedback (in real app, this might trigger navigation to confirmation screen)
        setTimeout(() => {
          setIsPressed(false)
          setCountdown(0)
          setIsActivating(false)
        }, 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to activate SOS')
        setIsActivating(false)
        setIsPressed(false)
        setCountdown(0)
      }
    } catch (error) {
      console.error('SOS activation error:', error)
      setError('Failed to activate SOS. Please try again or call emergency services directly.')
      setIsActivating(false)
      setIsPressed(false)
      setCountdown(0)
    }
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        {/* Main SOS Button */}
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          disabled={isActivating}
          className={`
            relative w-32 h-32 rounded-full text-white font-bold text-xl
            transition-all duration-200 transform
            ${isPressed && countdown > 0
              ? 'bg-red-600 scale-95 shadow-lg'
              : 'bg-red-500 hover:bg-red-600 hover:scale-105 shadow-md'
            }
            ${isActivating
              ? 'bg-green-500 animate-pulse'
              : ''
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          style={{
            background: isActivating
              ? 'linear-gradient(45deg, #10b981, #059669)'
              : isPressed && countdown > 0
              ? 'linear-gradient(45deg, #dc2626, #b91c1c)'
              : 'linear-gradient(45deg, #ef4444, #dc2626)',
          }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            {isActivating ? (
              <>
                <Shield className="h-8 w-8 mb-1" />
                <span className="text-xs">SENT</span>
              </>
            ) : countdown > 0 ? (
              <>
                <span className="text-3xl font-bold">{countdown}</span>
                <span className="text-xs">HOLD</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-8 w-8 mb-1" />
                <span className="text-xs">SOS</span>
              </>
            )}
          </div>

          {/* Visual feedback for countdown */}
          {isPressed && countdown > 0 && (
            <div
              className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"
              style={{
                animationDuration: `${countdown}s`,
              }}
            />
          )}
        </button>

        {/* Instructions */}
        <div className="text-center mt-4">
          <p className="text-sm font-medium text-gray-900">
            {isActivating
              ? 'Emergency alert sent!'
              : countdown > 0
              ? `Keep holding... ${countdown}`
              : 'Press and hold for 3 seconds'
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isActivating
              ? 'Emergency contacts have been notified'
              : 'to alert your emergency contacts'
            }
          </p>
        </div>
      </div>

      {/* Status Information */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        {location && (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>Location available</span>
          </div>
        )}
        <div className="flex items-center space-x-1">
          <Users className="h-3 w-3" />
          <span>Contacts will be alerted</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-md max-w-xs">
          <p className="text-sm text-yellow-800">{error}</p>
          <p className="text-xs text-yellow-600 mt-1">
            If this is a real emergency, call emergency services immediately.
          </p>
        </div>
      )}

      {/* Emergency Call Reminder */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          For immediate help, call emergency services:
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => window.open('tel:911')}
        >
          <Phone className="h-3 w-3 mr-1" />
          Call 911
        </Button>
      </div>
    </div>
  )
}