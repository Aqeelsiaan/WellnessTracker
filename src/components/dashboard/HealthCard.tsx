'use client'

import { useState } from 'react'
import { CardProps } from '@/types'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Activity,
  Droplets,
  Moon,
  Weight
} from 'lucide-react'

interface HealthCardProps {
  title: string
  value: string | number
  unit?: string
  status: 'normal' | 'warning' | 'critical'
  trend?: 'up' | 'down' | 'stable'
  lastUpdated: Date
  onClick?: () => void
  icon?: 'heart' | 'activity' | 'droplets' | 'moon' | 'weight'
  description?: string
}

const statusColors = {
  normal: 'status-normal',
  warning: 'status-warning',
  critical: 'status-critical'
}

const trendColors = {
  up: 'trend-up',
  down: 'trend-down',
  stable: 'trend-stable'
}

const icons = {
  heart: Heart,
  activity: Activity,
  droplets: Droplets,
  moon: Moon,
  weight: Weight
}

export function HealthCard({
  title,
  value,
  unit,
  status,
  trend,
  lastUpdated,
  onClick,
  icon,
  description
}: HealthCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = icon ? icons[icon] : Heart
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div
      className={cn(
        'health-card cursor-pointer transition-all duration-200',
        isHovered && 'shadow-lg transform -translate-y-1',
        onClick && 'hover:shadow-md'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'p-2 rounded-lg',
            status === 'normal' ? 'bg-success-100' :
            status === 'warning' ? 'bg-warning-100' :
            'bg-danger-100'
          )}>
            <Icon className={cn(
              'h-5 w-5',
              status === 'normal' ? 'text-success-600' :
              status === 'warning' ? 'text-warning-600' :
              'text-danger-600'
            )} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>

        {trend && (
          <div className={cn(
            'flex items-center space-x-1 text-sm',
            trendColors[trend]
          )}>
            <TrendIcon className="h-4 w-4" />
            <span className="font-medium">
              {trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Stable'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {unit && (
              <span className="text-sm text-gray-500 mb-1">{unit}</span>
            )}
          </div>
          <div className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2',
            statusColors[status]
          )}>
            {status === 'normal' ? 'Normal' :
             status === 'warning' ? 'Warning' : 'Critical'}
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">Last updated</p>
          <p className="text-xs text-gray-400">
            {lastUpdated.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}