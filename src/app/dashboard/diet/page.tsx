'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Brain, RefreshCw, Loader2, CheckCircle, AlertCircle, Utensils } from 'lucide-react'

interface DietPlanResponse {
  plan: {
    dailyCalories: number
    macronutrients: {
      protein: number
      carbs: number
      fats: number
    }
    meals: Array<{
      name: string
      type: string
      calories: number
      protein: number
      carbs: number
      fats: number
      ingredients: string[]
      instructions: string[]
      day: number
    }>
  }
  recommendations: string[]
}

export default function DietPlanPage() {
  const { data: session } = useSession()
  const [userProfile, setUserProfile] = useState({
    height: 170,
    weight: 70,
    age: 30,
    activityLevel: 'moderate' as const,
    goalType: 'maintain' as const,
    dietaryRestrictions: [] as string[],
    allergies: [] as string[],
    preferences: [] as string[],
    targetWeight: 70,
  })
  const [dietPlan, setDietPlan] = useState<DietPlanResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedGoals, setSavedGoals] = useState<any>(null)

  // Load saved goals on component mount
  useEffect(() => {
    loadSavedGoals()
  }, [])

  const loadSavedGoals = async () => {
    try {
      const response = await fetch('/api/user/goals')
      if (response.ok) {
        const goals = await response.json()
        setSavedGoals(goals)
        if (goals) {
          setUserProfile({
            height: goals.height || 170,
            weight: goals.weight || 70,
            age: goals.age || 30,
            activityLevel: goals.activityLevel || 'moderate',
            goalType: goals.goalType || 'maintain',
            dietaryRestrictions: goals.dietaryRestrictions || [],
            allergies: goals.allergies || [],
            preferences: goals.preferences || [],
            targetWeight: goals.targetWeight || 70,
          })
        }
      }
    } catch (error) {
      console.error('Failed to load saved goals:', error)
    }
  }

  const generateDietPlan = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai/diet-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile),
      })

      if (response.ok) {
        const data = await response.json()
        setDietPlan(data.data)
        if (data.fallback) {
          setError('Using fallback meal plan due to AI service limitations. The plan is still personalized for your goals.')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate diet plan')
      }
    } catch (error) {
      setError('An error occurred while generating your diet plan')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayInput = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean)
    setUserProfile(prev => ({
      ...prev,
      [field]: items
    }))
  }

  const currentBMI = userProfile.weight / Math.pow(userProfile.height / 100, 2)

  const groupedMeals = dietPlan?.plan.meals.reduce((acc, meal) => {
    if (!acc[meal.day]) {
      acc[meal.day] = []
    }
    acc[meal.day].push(meal)
    return acc
  }, {} as Record<number, typeof dietPlan.plan.meals>) || {}

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Diet Planner</h1>
        <p className="text-gray-600">Get a personalized 7-day meal plan based on your goals and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Form */}
        <div className="lg:col-span-1">
          <div className="health-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <Input
                  type="number"
                  value={userProfile.height}
                  onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                  min="100"
                  max="250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <Input
                  type="number"
                  value={userProfile.weight}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                  min="30"
                  max="300"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <Input
                  type="number"
                  value={userProfile.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  min="13"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                <select
                  className="input"
                  value={userProfile.activityLevel}
                  onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly Active</option>
                  <option value="moderate">Moderately Active</option>
                  <option value="active">Very Active</option>
                  <option value="very_active">Extremely Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                <select
                  className="input"
                  value={userProfile.goalType}
                  onChange={(e) => handleInputChange('goalType', e.target.value)}
                >
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Weight (kg)</label>
                <Input
                  type="number"
                  value={userProfile.targetWeight}
                  onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value) || 0)}
                  min="30"
                  max="300"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions (comma-separated)</label>
                <Input
                  type="text"
                  placeholder="vegetarian, gluten-free, dairy-free"
                  value={userProfile.dietaryRestrictions.join(', ')}
                  onChange={(e) => handleArrayInput('dietaryRestrictions', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma-separated)</label>
                <Input
                  type="text"
                  placeholder="nuts, shellfish, soy"
                  value={userProfile.allergies.join(', ')}
                  onChange={(e) => handleArrayInput('allergies', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferences (comma-separated)</label>
                <Input
                  type="text"
                  placeholder="mediterranean, asian, low-carb"
                  value={userProfile.preferences.join(', ')}
                  onChange={(e) => handleArrayInput('preferences', e.target.value)}
                />
              </div>
            </div>

            {/* BMI Display */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Current BMI:</span>
                <span className={`text-sm font-bold ${
                  currentBMI < 18.5 ? 'text-warning-600' :
                  currentBMI < 25 ? 'text-success-600' :
                  currentBMI < 30 ? 'text-warning-600' :
                  'text-danger-600'
                }`}>
                  {currentBMI.toFixed(1)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {currentBMI < 18.5 ? 'Underweight' :
                 currentBMI < 25 ? 'Normal weight' :
                 currentBMI < 30 ? 'Overweight' :
                 'Obese'}
              </div>
            </div>

            <Button
              onClick={generateDietPlan}
              className="w-full mt-6"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Diet Plan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Diet Plan Display */}
        <div className="lg:col-span-2">
          {error && (
            <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 text-warning-600 mr-2" />
              <span className="text-sm text-warning-800">{error}</span>
            </div>
          )}

          {dietPlan ? (
            <div className="space-y-6">
              {/* Nutrition Overview */}
              <div className="health-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Nutrition Overview</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{dietPlan.plan.dailyCalories}</div>
                    <div className="text-sm text-gray-600">Calories/day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{dietPlan.plan.macronutrients.protein}g</div>
                    <div className="text-sm text-gray-600">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{dietPlan.plan.macronutrients.carbs}g</div>
                    <div className="text-sm text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{dietPlan.plan.macronutrients.fats}g</div>
                    <div className="text-sm text-gray-600">Fats</div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="health-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                <ul className="space-y-2">
                  {dietPlan.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 7-Day Meal Plan */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">7-Day Meal Plan</h3>
                {Object.entries(groupedMeals).map(([day, meals]) => (
                  <div key={day} className="health-card">
                    <h4 className="font-medium text-gray-900 mb-3">Day {day}</h4>
                    <div className="space-y-4">
                      {meals.map((meal, mealIndex) => (
                        <div key={mealIndex} className="border-l-4 border-primary-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{meal.name}</h5>
                            <span className="text-sm text-gray-500 capitalize">{meal.type}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span>{meal.calories} cal</span>
                            <span>P: {meal.protein}g</span>
                            <span>C: {meal.carbs}g</span>
                            <span>F: {meal.fats}g</span>
                          </div>
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">Ingredients:</span>
                            <ul className="text-sm text-gray-600 mt-1">
                              {meal.ingredients.map((ingredient, index) => (
                                <li key={index}>• {ingredient}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Instructions:</span>
                            <ol className="text-sm text-gray-600 mt-1">
                              {meal.instructions.map((instruction, index) => (
                                <li key={index}>{index + 1}. {instruction}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="health-card text-center py-12">
              <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your Personalized Diet Plan</h3>
              <p className="text-gray-600 mb-6">
                Fill in your profile details and generate a custom 7-day meal plan tailored to your goals
              </p>
              <div className="text-left max-w-md mx-auto">
                <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Personalized calorie targets based on your goals</li>
                  <li>• Balanced macronutrient distribution</li>
                  <li>• 7 days of meal plans (3 meals + 2 snacks daily)</li>
                  <li>• Recipes with ingredients and instructions</li>
                  <li>• Accommodations for dietary restrictions and allergies</li>
                  <li>• Nutrition recommendations for your health goals</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}