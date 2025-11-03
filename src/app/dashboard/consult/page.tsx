'use client'

import { useState } from 'react'
import { HealthChat } from '@/components/ai/HealthChat'
import { Button } from '@/components/ui/Button'
import { MessageCircle, Heart, Brain, Activity, Shield } from 'lucide-react'

export default function ConsultPage() {
  const [showChat, setShowChat] = useState(false)

  const consultationTopics = [
    {
      icon: Heart,
      title: 'General Health',
      description: 'Ask about overall wellness, preventive care, and healthy lifestyle habits',
      questions: [
        'What are the signs of good health?',
        'How often should I get checkups?',
        'What vitamins should I consider?',
      ]
    },
    {
      icon: Brain,
      title: 'Nutrition & Diet',
      description: 'Get guidance on healthy eating, meal planning, and dietary concerns',
      questions: [
        'What makes a balanced diet?',
        'How can I eat healthier on a budget?',
        'What are anti-inflammatory foods?',
      ]
    },
    {
      icon: Activity,
      title: 'Fitness & Exercise',
      description: 'Learn about workout routines, injury prevention, and staying active',
      questions: [
        'How much exercise do I need?',
        'What are good beginner workouts?',
        'How can I stay motivated to exercise?',
      ]
    },
    {
      icon: Shield,
      title: 'Mental Health & Stress',
      description: 'Discuss stress management, sleep hygiene, and emotional wellness',
      questions: [
        'What are effective stress relief techniques?',
        'How can I improve my sleep quality?',
        'What are mindfulness exercises I can try?',
      ]
    }
  ]

  if (showChat) {
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Consultation</h1>
            <p className="text-gray-600">Chat with your AI health assistant</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowChat(false)}
          >
            ← Back to Topics
          </Button>
        </div>
        <div className="h-[calc(100vh-250px)]">
          <HealthChat />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Consultation</h1>
        <p className="text-gray-600">
          Get personalized wellness guidance from your AI health assistant
        </p>
      </div>

      {/* Emergency Notice */}
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-danger-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-danger-900">Medical Emergency?</h3>
            <p className="text-danger-700 text-sm mt-1">
              If you're experiencing a medical emergency, call emergency services immediately or go to the nearest emergency room.
            </p>
          </div>
        </div>
      </div>

      {/* Start Chat Button */}
      <div className="text-center">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowChat(true)}
          className="text-lg px-8 py-3"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Start Health Consultation
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Available 24/7 for general wellness questions
        </p>
      </div>

      {/* Consultation Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consultationTopics.map((topic, index) => {
          const Icon = topic.icon
          return (
            <div key={index} className="health-card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{topic.description}</p>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Example questions:</p>
                <ul className="space-y-1">
                  {topic.questions.map((question, qIndex) => (
                    <li key={qIndex} className="text-sm text-gray-600 flex items-start">
                      <span className="text-primary-500 mr-2">•</span>
                      {question}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowChat(true)}
              >
                Ask about {topic.title}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Important Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Important Information</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="text-primary-500 mt-1">•</span>
            <span>
              <strong>This is not medical advice.</strong> The AI health assistant provides general wellness information for educational purposes only.
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-primary-500 mt-1">•</span>
            <span>
              Always consult with qualified healthcare professionals for personalized medical advice, diagnosis, or treatment.
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-primary-500 mt-1">•</span>
            <span>
              In case of medical emergency, call emergency services immediately or visit the nearest emergency department.
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-primary-500 mt-1">•</span>
            <span>
              The AI may not detect all emergency situations. Use your judgment and seek professional help when needed.
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-primary-500 mt-1">•</span>
            <span>
              Your conversations are stored to improve the service and provide context for future discussions.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}