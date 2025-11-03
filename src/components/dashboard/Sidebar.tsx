'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Heart,
  Activity,
  TrendingUp,
  Brain,
  MessageCircle,
  Shield,
  Settings,
  Calendar,
  BarChart3,
  Target,
  Award,
  Bell,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Heart },
  { name: 'Track Health', href: '/dashboard/track', icon: Activity },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Diet Plan', href: '/dashboard/diet', icon: Brain },
  { name: 'Health Assistant', href: '/dashboard/consult', icon: MessageCircle },
  { name: 'Wellness Score', href: '/dashboard/wellness', icon: Target },
  { name: 'Emergency', href: '/dashboard/emergency', icon: Shield },
  { name: 'Achievements', href: '/dashboard/achievements', icon: Award },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Profile', href: '/dashboard/profile', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LifeTrack</span>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 transition-colors'
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 h-5 w-5'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Need help?</p>
                  <p className="text-xs text-gray-500">Visit our support center</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}