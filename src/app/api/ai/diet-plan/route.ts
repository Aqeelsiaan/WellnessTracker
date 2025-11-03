import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const dietPlanSchema = z.object({
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
  age: z.number().min(13).max(120),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goalType: z.enum(['lose', 'gain', 'maintain']),
  dietaryRestrictions: z.array(z.string()),
  allergies: z.array(z.string()),
  preferences: z.array(z.string()),
  targetWeight: z.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      height,
      weight,
      age,
      activityLevel,
      goalType,
      dietaryRestrictions,
      allergies,
      preferences,
      targetWeight
    } = dietPlanSchema.parse(body)

    // Get user's recent health data for personalization
    const recentHealthData = await prisma.healthData.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Extract relevant health metrics
    const currentGlucose = recentHealthData
      .filter(d => d.metricType === 'BLOOD_GLUCOSE')
      .map(d => d.value.value)
      .filter(Boolean)[0]

    const currentBMI = weight / Math.pow(height / 100, 2)

    // Calculate daily calorie needs using Mifflin-St Jeor Equation
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5 // for males
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    const tdee = bmr * activityMultipliers[activityLevel]

    // Adjust calories based on goal
    let dailyCalories = tdee
    if (goalType === 'lose') {
      dailyCalories = tdee * 0.85 // 15% deficit
    } else if (goalType === 'gain') {
      dailyCalories = tdee * 1.15 // 15% surplus
    }

    // Create prompt for OpenAI
    const systemPrompt = `You are a certified nutritionist and dietitian creating personalized meal plans.
    Create a comprehensive 7-day diet plan based on the user's profile and health data.

    User Profile:
    - Height: ${height}cm, Weight: ${weight}kg, Age: ${age} years
    - Activity Level: ${activityLevel}
    - Goal: ${goalType} weight
    - Current BMI: ${currentBMI.toFixed(1)}
    - Daily Calorie Target: ${Math.round(dailyCalories)} calories
    - Dietary Restrictions: ${dietaryRestrictions.join(', ') || 'None'}
    - Allergies: ${allergies.join(', ') || 'None'}
    - Preferences: ${preferences.join(', ') || 'None'}
    - Current Glucose: ${currentGlucose ? `${currentGlucose} mg/dL` : 'Not available'}

    CRITICAL REQUIREMENTS:
    1. Create meals that are nutritionally balanced and appropriate for the user's goals
    2. Consider any dietary restrictions and allergies strictly
    3. If glucose is elevated (>100 mg/dL), prioritize low glycemic index foods
    4. Include 3 main meals and 2 snacks per day
    5. Total daily calories should be within 50 calories of the target
    6. Provide specific ingredients with realistic portion sizes
    7. Include brief cooking instructions
    8. Consider the user's activity level for portion sizes
    9. Focus on whole foods and minimize processed ingredients
    10. Ensure adequate protein (0.8-1.2g per kg body weight)

    Response Format (JSON):
    {
      "plan": {
        "dailyCalories": number,
        "macronutrients": {
          "protein": number (grams),
          "carbs": number (grams),
          "fats": number (grams)
        },
        "meals": [
          {
            "name": string,
            "type": "breakfast" | "lunch" | "dinner" | "snack",
            "calories": number,
            "protein": number,
            "carbs": number,
            "fats": number,
            "ingredients": string[],
            "instructions": string[],
            "day": number (1-7)
          }
        ]
      },
      "recommendations": string[]
    }`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: "Generate a personalized 7-day diet plan based on my profile and requirements."
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })

      const responseContent = completion.choices[0]?.message?.content
      if (!responseContent) {
        throw new Error('No response from OpenAI')
      }

      // Parse the JSON response
      let dietPlan
      try {
        dietPlan = JSON.parse(responseContent)
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError)
        // Return a fallback plan
        dietPlan = generateFallbackPlan(height, weight, activityLevel, goalType, dailyCalories, dietaryRestrictions, allergies)
      }

      // Update user's wellness goals with the new information
      await prisma.wellnessGoal.upsert({
        where: { userId: session.user.id },
        update: {
          height,
          weight,
          age,
          activityLevel,
          goalType,
          targetWeight,
          dietaryRestrictions,
          allergies,
          preferences,
          dailyCalorieGoal: Math.round(dailyCalories),
        },
        create: {
          userId: session.user.id,
          height,
          weight,
          age,
          activityLevel,
          goalType,
          targetWeight,
          dietaryRestrictions,
          allergies,
          preferences,
          dailyCalorieGoal: Math.round(dailyCalories),
        },
      })

      return NextResponse.json({
        success: true,
        data: dietPlan,
        dailyCalories: Math.round(dailyCalories),
        bmi: currentBMI,
      })

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      // Return fallback plan if OpenAI fails
      const fallbackPlan = generateFallbackPlan(height, weight, activityLevel, goalType, dailyCalories, dietaryRestrictions, allergies)

      return NextResponse.json({
        success: true,
        data: fallbackPlan,
        dailyCalories: Math.round(dailyCalories),
        bmi: currentBMI,
        fallback: true,
      })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Diet plan generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate diet plan' },
      { status: 500 }
    )
  }
}

function generateFallbackPlan(
  height: number,
  weight: number,
  activityLevel: string,
  goalType: string,
  dailyCalories: number,
  dietaryRestrictions: string[],
  allergies: string[]
) {
  const proteinGrams = Math.round(weight * 1.0) // 1g per kg
  const fatGrams = Math.round((dailyCalories * 0.25) / 9) // 25% of calories from fat
  const carbGrams = Math.round((dailyCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4)

  return {
    plan: {
      dailyCalories: Math.round(dailyCalories),
      macronutrients: {
        protein: proteinGrams,
        carbs: carbGrams,
        fats: fatGrams
      },
      meals: [
        {
          name: "Oatmeal with Berries",
          type: "breakfast",
          calories: 400,
          protein: 12,
          carbs: 65,
          fats: 8,
          ingredients: ["1/2 cup rolled oats", "1 cup mixed berries", "1 tbsp honey", "1 oz almonds"],
          instructions: ["Cook oats with water or milk", "Top with berries and honey", "Sprinkle with almonds"],
          day: 1
        },
        {
          name: "Grilled Chicken Salad",
          type: "lunch",
          calories: 450,
          protein: 35,
          carbs: 30,
          fats: 15,
          ingredients: ["4 oz grilled chicken breast", "2 cups mixed greens", "1 cup vegetables", "2 tbsp olive oil dressing"],
          instructions: ["Grill chicken and slice", "Mix greens and vegetables", "Top with chicken and dressing"],
          day: 1
        },
        {
          name: "Greek Yogurt",
          type: "snack",
          calories: 150,
          protein: 15,
          carbs: 12,
          fats: 3,
          ingredients: ["1 cup Greek yogurt", "1/4 cup granola", "1/2 cup berries"],
          instructions: ["Layer yogurt with berries and granola"],
          day: 1
        },
        {
          name: "Salmon with Quinoa",
          type: "dinner",
          calories: 500,
          protein: 35,
          carbs: 45,
          fats: 18,
          ingredients: ["5 oz salmon fillet", "1 cup cooked quinoa", "1 cup roasted vegetables", "1 tbsp olive oil"],
          instructions: ["Season and bake salmon", "Cook quinoa and roast vegetables", "Serve together"],
          day: 1
        }
      ]
    },
    recommendations: [
      "Drink at least 8 glasses of water daily",
      "Include a variety of colorful vegetables in your meals",
      "Choose whole grains over refined grains",
      "Limit added sugars and processed foods",
      "Eat slowly and mindfully"
    ]
  }
}