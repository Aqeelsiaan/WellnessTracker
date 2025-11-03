import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { MetricType } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get all health data for the user
    const healthData = await prisma.healthData.findMany({
      where: {
        userId,
        date: {
          gte: monthAgo
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Process blood pressure data
    const bloodPressureData = healthData.filter(d => d.metricType === MetricType.BLOOD_PRESSURE)
    const latestBP = bloodPressureData[0]
    const weeklyBP = bloodPressureData.filter(d => d.date >= weekAgo)
    const monthlyBP = bloodPressureData

    // Process glucose data
    const glucoseData = healthData.filter(d => d.metricType === MetricType.BLOOD_GLUCOSE)
    const latestGlucose = glucoseData[0]
    const weeklyGlucose = glucoseData.filter(d => d.date >= weekAgo)
    const monthlyGlucose = glucoseData

    // Process weight data
    const weightData = healthData.filter(d => d.metricType === MetricType.WEIGHT)
    const latestWeight = weightData[0]
    const weeklyWeight = weightData.filter(d => d.date >= weekAgo)
    const monthlyWeight = weightData

    // Process water intake data (today only)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const waterData = healthData.filter(d =>
      d.metricType === MetricType.WATER_INTAKE && d.date >= today
    )
    const todayWaterIntake = waterData.reduce((sum, d) => {
      const amount = d.value as any
      return sum + (amount.amount || 0)
    }, 0)

    // Process sleep data
    const sleepData = healthData.filter(d => d.metricType === MetricType.SLEEP)
    const lastSleep = sleepData[0]
    const weeklySleep = sleepData.filter(d => d.date >= weekAgo)

    // Get user's wellness goals for calculating daily water goal
    const wellnessGoals = await prisma.wellnessGoal.findUnique({
      where: { userId }
    })

    const dailyWaterGoal = 2.1 // liters default

    // Calculate wellness score
    const wellnessScore = calculateWellnessScore({
      latestSleep,
      todayWaterIntake,
      dailyWaterGoal,
      exerciseData: healthData.filter(d => d.metricType === MetricType.EXERCISE).slice(0, 7),
      stressData: healthData.filter(d => d.metricType === MetricType.STRESS).slice(0, 7),
      nutritionData: healthData.filter(d => d.date >= today)
    })

    // Calculate BMI if weight data exists
    let bmi = null
    if (latestWeight && wellnessGoals) {
      const weight = (latestWeight.value as any).value // in kg
      const height = wellnessGoals.height / 100 // convert cm to m
      bmi = weight / (height * height)
    }

    const dashboardData = {
      bloodPressure: {
        current: latestBP ? latestBP.value : null,
        weekly: weeklyBP.map(d => d.value),
        monthly: monthlyBP.map(d => d.value),
        lastUpdated: latestBP ? latestBP.date : null
      },
      glucose: {
        current: latestGlucose ? latestGlucose.value : null,
        weekly: weeklyGlucose.map(d => d.value),
        monthly: monthlyGlucose.map(d => d.value),
        lastUpdated: latestGlucose ? latestGlucose.date : null
      },
      weight: {
        current: latestWeight ? latestWeight.value : null,
        bmi: bmi,
        weekly: weeklyWeight.map(d => d.value),
        monthly: monthlyWeight.map(d => d.value),
        lastUpdated: latestWeight ? latestWeight.date : null
      },
      waterIntake: {
        today: todayWaterIntake,
        goal: dailyWaterGoal,
        percentage: (todayWaterIntake / dailyWaterGoal) * 100
      },
      sleep: {
        lastNight: lastSleep ? lastSleep.value : null,
        weekly: weeklySleep.map(d => d.value),
        lastUpdated: lastSleep ? lastSleep.date : null
      },
      wellnessScore,
      goals: wellnessGoals
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateWellnessScore(data: {
  latestSleep: any
  todayWaterIntake: number
  dailyWaterGoal: number
  exerciseData: any[]
  stressData: any[]
  nutritionData: any[]
}) {
  const { latestSleep, todayWaterIntake, dailyWaterGoal, exerciseData, stressData, nutritionData } = data

  let score = 0
  let factors = {
    sleep: { hours: 0, quality: 3 },
    water: { intake: todayWaterIntake, goal: dailyWaterGoal },
    exercise: { minutes: 0, intensity: 3 },
    stress: { level: 5 },
    nutrition: { caloriesGoal: 2000, caloriesActual: 0, balancedMeals: false }
  }

  // Sleep scoring (30% of total)
  if (latestSleep) {
    const sleep = latestSleep.value as any
    factors.sleep.hours = sleep.duration || 0
    factors.sleep.quality = sleep.quality || 3

    let sleepScore = 0
    if (factors.sleep.hours >= 7 && factors.sleep.hours <= 9) sleepScore = 100
    else if (factors.sleep.hours >= 6 && factors.sleep.hours <= 10) sleepScore = 80
    else if (factors.sleep.hours >= 5 && factors.sleep.hours <= 11) sleepScore = 60
    else sleepScore = 30

    score += sleepScore * 0.3
  } else {
    score += 50 * 0.3 // neutral score
  }

  // Water intake scoring (20% of total)
  const waterPercentage = Math.min((todayWaterIntake / dailyWaterGoal) * 100, 100)
  score += waterPercentage * 0.2

  // Exercise scoring (25% of total)
  if (exerciseData.length > 0) {
    const totalExercise = exerciseData.reduce((sum, d) => {
      const exercise = d.value as any
      return sum + (exercise.duration || 0)
    }, 0)
    factors.exercise.minutes = totalExercise

    let exerciseScore = Math.min((totalExercise / 30) * 100, 100) // 30 min = 100%
    score += exerciseScore * 0.25
  } else {
    score += 30 * 0.25 // low score for no exercise
  }

  // Stress scoring (15% of total)
  if (stressData.length > 0) {
    const avgStress = stressData.reduce((sum, d) => {
      const stress = d.value as any
      return sum + (stress.level || 5)
    }, 0) / stressData.length
    factors.stress.level = Math.round(avgStress)

    const stressScore = Math.max(100 - (avgStress * 10), 0) // lower stress = higher score
    score += stressScore * 0.15
  } else {
    score += 70 * 0.15 // moderate default
  }

  // Nutrition scoring (10% of total)
  if (nutritionData.length > 0) {
    factors.nutrition.balancedMeals = nutritionData.length >= 3 // 3+ meals = balanced
    const nutritionScore = factors.nutrition.balancedMeals ? 100 : 50
    score += nutritionScore * 0.1
  } else {
    score += 50 * 0.1 // neutral score
  }

  // Determine trend (simplified)
  const trend = score >= 80 ? 'improving' : score >= 60 ? 'stable' : 'declining'

  return {
    score: Math.round(score),
    factors,
    trend
  }
}