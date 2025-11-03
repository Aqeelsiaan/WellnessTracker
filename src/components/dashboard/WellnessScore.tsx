'use client'

import { CardProps } from '@/types'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/Progress'
import { Heart, Star, Smile, Meh, Frown } from 'lucide-react'

interface WellnessScoreProps {
  score: number
  factors: {
    sleep: { hours: number; quality: number }
    water: { intake: number; goal: number }
    exercise: { minutes: number; intensity: number }
    stress: { level: number }
    nutrition: { caloriesGoal: number; caloriesActual: number; balancedMeals: boolean }
  }
  trend: 'improving' | 'stable' | 'declining'
}

export function WellnessScore({ score, factors, trend }: WellnessScoreProps) {
  const getScoreEmoji = (score: number) => {
    if (score >= 90) return { emoji: '🌟', color: 'text-success-600' }
    if (score >= 80) return { emoji: '😊', color: 'text-success-500' }
    if (score >= 70) return { emoji: '👍', color: 'text-warning-500' }
    if (score >= 60) return { emoji: '⚠️', color: 'text-warning-600' }
    return { emoji: '🚨', color: 'text-danger-600' }
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent! You\'re crushing your wellness goals.'
    if (score >= 80) return 'Great job! Keep up the good work.'
    if (score >= 70) return 'Good progress! Room for improvement.'
    if (score >= 60) return 'Needs attention. Let\'s work on this together.'
    return 'Time to prioritize your health. Small steps make a big difference.'
  }

  const getMotivationalTip = (factors: WellnessScoreProps['factors']) => {
    const tips = []

    if (factors.sleep.hours < 7) {
      tips.push('💤 Try to get 7-9 hours of sleep tonight')
    }
    if (factors.water.intake < factors.water.goal * 0.8) {
      tips.push('💧 Don\'t forget to stay hydrated')
    }
    if (factors.exercise.minutes < 30) {
      tips.push('🏃‍♀️ Even a 10-minute walk can boost your wellness')
    }
    if (factors.stress.level > 7) {
      tips.push('🧘‍♀️ Take a few deep breaths - you\'ve got this!')
    }
    if (!factors.nutrition.balancedMeals) {
      tips.push('🥗 Aim for balanced meals with protein, carbs, and veggies')
    }

    return tips.length > 0 ? tips[Math.floor(Math.random() * tips.length)] : '🎉 You\'re doing great! Keep it up!'
  }

  const { emoji, color } = getScoreEmoji(score)
  const message = getScoreMessage(score)
  const tip = getMotivationalTip(factors)

  const factorProgress = [
    {
      name: 'Sleep',
      value: Math.min((factors.sleep.hours / 8) * 100, 100),
      color: 'bg-blue-500',
      details: `${factors.sleep.hours}h, Quality: ${'⭐'.repeat(factors.sleep.quality)}`
    },
    {
      name: 'Hydration',
      value: Math.min((factors.water.intake / factors.water.goal) * 100, 100),
      color: 'bg-cyan-500',
      details: `${(factors.water.intake * 1000).toFixed(0)}ml / ${(factors.water.goal * 1000).toFixed(0)}ml`
    },
    {
      name: 'Exercise',
      value: Math.min((factors.exercise.minutes / 30) * 100, 100),
      color: 'bg-green-500',
      details: `${factors.exercise.minutes}min, Intensity: ${'⚡'.repeat(factors.exercise.intensity)}`
    },
    {
      name: 'Stress',
      value: Math.max(100 - (factors.stress.level * 10), 0),
      color: 'bg-yellow-500',
      details: `Level: ${factors.stress.level}/10 (lower is better)`
    },
    {
      name: 'Nutrition',
      value: factors.nutrition.balancedMeals ? 100 : 50,
      color: 'bg-purple-500',
      details: factors.nutrition.balancedMeals ? 'Balanced meals' : 'Needs improvement'
    }
  ]

  return (
    <div className="health-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Daily Wellness Score</h3>
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-primary-500" />
          <span className={cn(
            'text-sm font-medium',
            trend === 'improving' ? 'text-success-600' :
            trend === 'declining' ? 'text-danger-600' :
            'text-gray-600'
          )}>
            {trend === 'improving' ? '↗️ Improving' :
             trend === 'declining' ? '↘️ Declining' : '→ Stable'}
          </span>
        </div>
      </div>

      {/* Score Display */}
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center">
          <div className="text-6xl font-bold color">{score}</div>
          <div className="absolute -right-4 -top-2 text-2xl">{emoji}</div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
              className={cn(
                'transition-all duration-500',
                score >= 80 ? 'text-success-500' :
                score >= 60 ? 'text-warning-500' :
                'text-danger-500'
              )}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('text-2xl font-bold', color)}>{score}%</span>
          </div>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-3 mb-6">
        {factorProgress.map((factor) => (
          <div key={factor.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{factor.name}</span>
              <span className="text-gray-500">{factor.details}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn('h-2 rounded-full transition-all duration-500', factor.color)}
                style={{ width: `${factor.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Tip */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-200">
        <div className="flex items-start space-x-2">
          <Star className="h-5 w-5 text-primary-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary-900">Today's Tip</p>
            <p className="text-sm text-primary-700 mt-1">{tip}</p>
          </div>
        </div>
      </div>
    </div>
  )
}