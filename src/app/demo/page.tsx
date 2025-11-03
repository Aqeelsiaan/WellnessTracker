'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Heart, Activity, Brain, Shield, Users, Star } from 'lucide-react'

export default function DemoPage() {
  const [currentView, setCurrentView] = useState('dashboard')

  const DemoDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LifeTrack Dashboard</h1>
          <p className="text-gray-600">Your health monitoring overview</p>
        </div>

        {/* Health Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">Normal</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">120/80</h3>
            <p className="text-sm text-gray-600">Blood Pressure</p>
            <p className="text-xs text-gray-500 mt-2">Last: 2 hours ago</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-blue-500" />
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">Normal</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">95</h3>
            <p className="text-sm text-gray-600">Blood Glucose</p>
            <p className="text-xs text-gray-500 mt-2">Fasting • Last: Today</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-green-500" />
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">Normal</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">70.5</h3>
            <p className="text-sm text-gray-600">Weight (kg)</p>
            <p className="text-xs text-gray-500 mt-2">BMI: 23.2 • Last: Yesterday</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Brain className="h-8 w-8 text-cyan-500" />
              <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">75%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">1.6L</h3>
            <p className="text-sm text-gray-600">Water Intake</p>
            <p className="text-xs text-gray-500 mt-2">Goal: 2.1L • Today</p>
          </div>
        </div>

        {/* Wellness Score */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Daily Wellness Score</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600">85</div>
                <p className="text-sm text-gray-600 mt-1">Great job!</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '87%'}}></div>
                  </div>
                  <span className="text-sm text-gray-600">Sleep: 7h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  <span className="text-sm text-gray-600">Water: 75%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                  <span className="text-sm text-gray-600">Exercise: 45min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="primary" className="w-full" onClick={() => setCurrentView('track')}>
            <Activity className="h-4 w-4 mr-2" />
            Add Reading
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setCurrentView('diet')}>
            <Brain className="h-4 w-4 mr-2" />
            Diet Plan
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setCurrentView('chat')}>
            <Users className="h-4 w-4 mr-2" />
            Health Assistant
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setCurrentView('emergency')}>
            <Shield className="h-4 w-4 mr-2" />
            Emergency
          </Button>
        </div>
      </div>
    </div>
  )

  const DemoTrack = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Track Health Data</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {['Blood Pressure', 'Glucose', 'Weight', 'Sleep', 'Water', 'Exercise', 'Stress'].map((metric) => (
              <button key={metric} className="p-3 border-2 border-primary-500 bg-primary-50 text-primary-700 rounded-lg">
                {metric}
              </button>
            ))}
          </div>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select a metric to track your health data</p>
            <Button variant="outline" className="mt-4" onClick={() => setCurrentView('dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const DemoDiet = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Diet Planner</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Your Profile</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Height:</span>
                  <span className="font-medium">170 cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">70 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Goal:</span>
                  <span className="font-medium">Maintain weight</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Calories:</span>
                  <span className="font-medium">2,000</span>
                </div>
              </div>
              <Button variant="primary" className="w-full mt-6">
                <Brain className="h-4 w-4 mr-2" />
                Generate AI Meal Plan
              </Button>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Sample Meal Plan</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900">Breakfast</h4>
                  <p className="text-sm text-gray-600">Oatmeal with berries and almonds - 400 cal</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900">Lunch</h4>
                  <p className="text-sm text-gray-600">Grilled chicken salad - 450 cal</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900">Dinner</h4>
                  <p className="text-sm text-gray-600">Salmon with quinoa - 500 cal</p>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" className="mt-6" onClick={() => setCurrentView('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )

  const DemoChat = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Health Assistant</h2>
          <div className="border rounded-lg p-4 h-64 bg-gray-50 mb-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">AI</span>
                </div>
                <div className="bg-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-gray-700">Hello! I'm your AI health assistant. How can I help you today?</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 justify-end">
                <div className="bg-primary-600 text-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm">What are some healthy breakfast options?</p>
                </div>
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 text-xs">U</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">AI</span>
                </div>
                <div className="bg-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-gray-700">Great question! Here are some healthy breakfast options:</p>
                  <ul className="text-sm text-gray-600 mt-2">
                    <li>• Oatmeal with berries and nuts</li>
                    <li>• Greek yogurt with granola</li>
                    <li>• Whole grain toast with avocado</li>
                    <li>• Smoothie with spinach and fruits</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2 italic">This is not medical advice - for educational use only.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask about health, nutrition, exercise..."
              className="flex-1 input"
            />
            <Button variant="primary">Send</Button>
          </div>
          <Button variant="outline" className="mt-4" onClick={() => setCurrentView('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )

  const DemoEmergency = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency & SOS</h2>
          <div className="text-center mb-8">
            <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-red-600 transition-colors">
              <div className="text-white text-center">
                <Shield className="h-8 w-8 mx-auto mb-1" />
                <span className="text-sm font-bold">SOS</span>
              </div>
            </div>
            <p className="text-gray-600">Press and hold for 3 seconds to alert emergency contacts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">Jane Doe</p>
                <p className="text-sm text-gray-600">Spouse</p>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Medical Information</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-900">Blood Type: O+</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                <p className="text-sm font-medium text-orange-900">Allergies: Peanuts, Penicillin</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="mt-6" onClick={() => setCurrentView('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )

  const views = {
    dashboard: <DemoDashboard />,
    track: <DemoTrack />,
    diet: <DemoDiet />,
    chat: <DemoChat />,
    emergency: <DemoEmergency />
  }

  return views[currentView as keyof typeof views] || views.dashboard
}