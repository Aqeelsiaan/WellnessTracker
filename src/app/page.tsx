import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Heart, Activity, Brain, Shield, TrendingUp, Star } from 'lucide-react'

export default function HomePage() {
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" variant="primary" className="w-full sm:w-auto">
                  🚀 Try Live Demo
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Better Health
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From daily tracking to AI-powered insights, LifeTrack provides all the tools
              you need to achieve your wellness goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Health Tracking */}
            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Health Tracking
              </h3>
              <p className="text-gray-600">
                Monitor blood pressure, glucose, weight, sleep, and more with intuitive
                tracking and automatic trend analysis.
              </p>
            </div>

            {/* Feature 2: AI Diet Planner */}
            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Diet Planner
              </h3>
              <p className="text-gray-600">
                Get personalized 7-day meal plans based on your goals, preferences,
                and current health metrics.
              </p>
            </div>

            {/* Feature 3: Health Assistant */}
            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Health Assistant
              </h3>
              <p className="text-gray-600">
                Chat with your personal health assistant for wellness advice,
                motivation, and answers to your health questions.
              </p>
            </div>

            {/* Feature 4: Emergency Features */}
            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Emergency Card & SOS
              </h3>
              <p className="text-gray-600">
                Keep critical medical information accessible and get help quickly
                with our SOS button and emergency contacts.
              </p>
            </div>

            {/* Feature 5: Wellness Score */}
            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Daily Wellness Score
              </h3>
              <p className="text-gray-600">
                Get a comprehensive score of your daily wellness based on sleep,
                water intake, exercise, and more.
              </p>
            </div>

            {/* Feature 6: Insights */}
            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Health Insights
              </h3>
              <p className="text-gray-600">
                Discover patterns in your health data and receive personalized
                recommendations for improvement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Your Health Journey Today
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users who are already tracking their health and achieving their wellness goals.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Get Started Free
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
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms" className="hover:text-white">Terms of Service</a>
              <a href="/contact" className="hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}