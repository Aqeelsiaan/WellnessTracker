import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Heart, Activity, Brain, Shield, Star, Users } from 'lucide-react'

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-8">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              LifeTrack
              <span className="block text-2xl md:text-3xl text-primary-600 mt-2">
                Smart Health Companion
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Take control of your health with AI-powered insights, comprehensive tracking,
              and personalized wellness plans designed for your unique journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/demo">
                <Button size="lg" variant="primary" className="w-full sm:w-auto">
                  🚀 Try Live Demo
                </Button>
              </Link>
              <a href="https://github.com/Aqeelsiaan/WellnessTracker" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  📁 View Source Code
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Health Monitoring Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From daily tracking to AI-powered insights, LifeTrack provides everything you need for your wellness journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Health Tracking</h3>
              <p className="text-gray-600">Monitor blood pressure, glucose, weight, sleep, and more with intuitive tracking.</p>
            </div>

            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Diet Planner</h3>
              <p className="text-gray-600">Get personalized meal plans based on your goals, preferences, and health data.</p>
            </div>

            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Health Assistant</h3>
              <p className="text-gray-600">Chat with your personal health assistant for wellness advice and support.</p>
            </div>

            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Emergency SOS</h3>
              <p className="text-gray-600">Quick SOS button and emergency card for peace of mind and critical situations.</p>
            </div>

            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Wellness Score</h3>
              <p className="text-gray-600">Daily wellness score combining sleep, water, exercise, and nutrition factors.</p>
            </div>

            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600">Interactive charts and trend analysis to track your progress over time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built with Modern Technologies</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-2">Next.js 14</div>
              <p className="text-sm text-gray-600">React Framework</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-2">TypeScript</div>
              <p className="text-sm text-gray-600">Type Safety</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-2">Tailwind</div>
              <p className="text-sm text-gray-600">Modern CSS</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-2">OpenAI</div>
              <p className="text-sm text-gray-600">AI Integration</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Try the interactive demo to see all features in action.
          </p>
          <Link href="/demo">
            <Button size="lg" variant="secondary">
              🚀 Try Live Demo Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg mb-2">Made With 🖤 By Aqeel Siaan</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="https://github.com/Aqeelsiaan/WellnessTracker" className="hover:text-white">GitHub</a>
              <a href="/demo" className="hover:text-white">Live Demo</a>
              <a href="#" className="hover:text-white">Documentation</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}