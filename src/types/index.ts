export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface HealthMetric {
  id: string
  userId: string
  date: Date
  metricType: MetricType
  value: any
  notes?: string
  createdAt: Date
}

export enum MetricType {
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  BLOOD_GLUCOSE = 'BLOOD_GLUCOSE',
  WEIGHT = 'WEIGHT',
  WATER_INTAKE = 'WATER_INTAKE',
  SLEEP = 'SLEEP',
  EXERCISE = 'EXERCISE',
  STRESS = 'STRESS',
}

export interface BloodPressureReading {
  systolic: number
  diastolic: number
  pulse: number
  position?: 'standing' | 'sitting' | 'lying'
}

export interface GlucoseReading {
  value: number
  type: 'fasting' | 'post_meal'
  timeSinceMeal?: number // minutes
  unit?: 'mg/dL' | 'mmol/L'
}

export interface WeightReading {
  value: number
  unit?: 'kg' | 'lbs'
  bodyFat?: number
}

export interface WaterIntake {
  amount: number
  unit?: 'ml' | 'oz' | 'cups'
}

export interface SleepData {
  duration: number // hours
  quality: number // 1-5 scale
  bedTime: string
  wakeTime: string
  notes?: string
}

export interface ExerciseData {
  type: string
  duration: number // minutes
  intensity: number // 1-5 scale
  calories?: number
}

export interface StressData {
  level: number // 1-10 scale
  triggers?: string[]
  copingMechanisms?: string[]
}

export interface DashboardData {
  bloodPressure: {
    current: BloodPressureReading | null
    weekly: BloodPressureReading[]
    monthly: BloodPressureReading[]
  }
  glucose: {
    current: { fasting?: GlucoseReading; postMeal?: GlucoseReading } | null
    weekly: GlucoseReading[]
    monthly: GlucoseReading[]
  }
  weight: {
    current: WeightReading | null
    bmi: number | null
    weekly: WeightReading[]
    monthly: WeightReading[]
  }
  waterIntake: {
    today: number
    goal: number
    weekly: WaterIntake[]
  }
  sleep: {
    lastNight: SleepData | null
    weekly: SleepData[]
  }
  wellnessScore: {
    score: number
    factors: WellnessFactors
    trend: 'improving' | 'stable' | 'declining'
  }
}

export interface WellnessFactors {
  sleep: {
    hours: number
    quality: number
  }
  water: {
    intake: number
    goal: number
  }
  exercise: {
    minutes: number
    intensity: number
  }
  stress: {
    level: number
  }
  nutrition: {
    caloriesGoal: number
    caloriesActual: number
    balancedMeals: boolean
  }
}

export interface EmergencyInfo {
  id: string
  userId: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  bloodType?: string
  allergies: string[]
  conditions: string[]
  medications: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  insurance?: {
    provider: string
    policyNumber: string
  }
}

export interface WellnessGoal {
  id: string
  userId: string
  height: number // cm
  weight: number // kg
  age: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goalType: 'lose' | 'gain' | 'maintain'
  targetWeight?: number
  dietaryRestrictions: string[]
  allergies: string[]
  preferences: string[]
  dailyCalorieGoal?: number
}

export interface DietPlanRequest {
  userProfile: {
    height: number
    weight: number
    age: number
    activityLevel: string
    goalType: string
    dietaryRestrictions: string[]
  }
  healthData?: {
    currentGlucose?: number
    currentBMI: number
  }
}

export interface DietPlanResponse {
  plan: {
    dailyCalories: number
    macronutrients: {
      protein: number // grams
      carbs: number // grams
      fats: number // grams
    }
    meals: Array<{
      name: string
      calories: number
      protein: number
      carbs: number
      fats: number
      ingredients: string[]
      instructions: string[]
    }>
  }
  recommendations: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  category?: 'general' | 'diet' | 'exercise' | 'mental' | 'emergency'
  timestamp: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'consistency' | 'goals' | 'improvement' | 'milestones'
  unlockedAt: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface NotificationSettings {
  readingReminders: {
    enabled: boolean
    times: string[] // ["08:00", "14:00", "20:00"]
  }
  medicationReminders: {
    enabled: boolean
    medications: Array<{
      name: string
      time: string
      dosage: string
    }>
  }
  hydrationReminders: {
    enabled: boolean
    interval: number // minutes
    dailyGoal: number // liters
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

export interface ComparisonData {
  userPercentile: number
  ageGroupAverage: number
  populationAverage: number
  interpretation: string
}

export interface HealthInsight {
  type: string
  title: string
  description: string
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
}