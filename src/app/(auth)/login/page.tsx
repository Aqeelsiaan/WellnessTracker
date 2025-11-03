'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Heart, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        // Refresh session and redirect
        await getSession()
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="health-card">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Heart className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your LifeTrack account
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 text-danger-600 mr-2" />
          <span className="text-sm text-danger-800">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="pl-10"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="pl-10"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          Sign in
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </div>
  )
}