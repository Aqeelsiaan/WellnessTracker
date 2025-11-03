'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { HealthCard } from '@/components/dashboard/HealthCard'
import { WellnessScore } from '@/components/dashboard/WellnessScore'
import { Button } from '@/components/ui/Button'
import { Activity, Plus, TrendingUp, Calendar } from 'lucide-react'
import { DashboardData } from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { data: dashboardData, error, isLoading } = useSWR<DashboardData>(
    '/api/dashboard',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  )

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading dashboard</h3>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
        <p className="text-gray-600">Start tracking your health metrics to see your dashboard.</p>
      </div>
    )
  }

  // Format blood pressure for display
  const getBloodPressureDisplay = (bp: any) => {
    if (!bp) return { value: '--', unit: '--' }
    return {
      value: `${bp.systolic}/${bp.diastolic}`,
      unit: 'mmHg',
      pulse: bp.pulse
    }
  }

  // Format glucose for display
  const getGlucoseDisplay = (glucose: any) => {
    if (!glucose) return { value: '--', unit: '--' }
    return {
      value: glucose.value,
      unit: glucose.unit || 'mg/dL',
      type: glucose.type
    }
  }

  // Format weight for display
  const getWeightDisplay = (weight: any) => {
    if (!weight) return { value: '--', unit: '--' }
    return {
      value: weight.value?.toFixed(1) || '--',
      unit: weight.unit || 'kg'
    }
  }

  // Get health status based on values
  const getHealthStatus = (metric: string, value: any) => {
    if (!value) return 'normal'

    switch (metric) {
      case 'bloodPressure':
        const bp = value
        if (bp.systolic >= 140 || bp.diastolic >= 90) return 'critical'
        if (bp.systolic >= 120 || bp.diastolic >= 80) return 'warning'
        return 'normal'

      case 'glucose':
        const glucose = value.value || 0
        if (glucose > 125) return 'critical'
        if (glucose > 100) return 'warning'
        return 'normal'

      case 'weight':
        // Use BMI if available, otherwise return normal
        return 'normal'

      default:
        return 'normal'
    }
  }

  const bpDisplay = getBloodPressureDisplay(dashboardData.bloodPressure.current)
  const glucoseDisplay = getGlucoseDisplay(dashboardData.glucose.current)
  const weightDisplay = getWeightDisplay(dashboardData.weight.current)

  const lastBPUpdate = dashboardData.bloodPressure.lastUpdated
  const lastGlucoseUpdate = dashboardData.glucose.lastUpdated
  const lastWeightUpdate = dashboardData.weight.lastUpdated

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
          <p className="text-gray-600">Monitor your health metrics and track your progress</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View History
          </Button>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Reading
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthCard
          title="Blood Pressure"
          value={bpDisplay.value}
          unit={bpDisplay.unit}
          status={getHealthStatus('bloodPressure', dashboardData.bloodPressure.current)}
          lastUpdated={lastBPUpdate || new Date()}
          icon="heart"
          description={bpDisplay.pulse ? `Pulse: ${bpDisplay.pulse} bpm` : undefined}
          onClick={() => window.location.href = '/dashboard/track'}
        />

        <HealthCard
          title="Blood Glucose"
          value={glucoseDisplay.value}
          unit={glucoseDisplay.unit}
          status={getHealthStatus('glucose', dashboardData.glucose.current)}
          lastUpdated={lastGlucoseUpdate || new Date()}
          icon="activity"
          description={glucoseDisplay.type}
          onClick={() => window.location.href = '/dashboard/track'}
        />

        <HealthCard
          title="Weight"
          value={weightDisplay.value}
          unit={weightDisplay.unit}
          status={getHealthStatus('weight', dashboardData.weight.current)}
          lastUpdated={lastWeightUpdate || new Date()}
          icon="weight"
          description={dashboardData.weight.bmi ? `BMI: ${dashboardData.weight.bmi.toFixed(1)}` : undefined}
          onClick={() => window.location.href = '/dashboard/track'}
        />

        <HealthCard
          title="Water Intake"
          value={(dashboardData.waterIntake.today * 1000).toFixed(0)}
          unit="ml"
          status={dashboardData.waterIntake.percentage >= 80 ? 'normal' :
                  dashboardData.waterIntake.percentage >= 50 ? 'warning' : 'critical'}
          lastUpdated={new Date()}
          icon="droplets"
          description={`${(dashboardData.waterIntake.percentage).toFixed(0)}% of daily goal`}
          onClick={() => window.location.href = '/dashboard/track'}
        />
      </div>

      {/* Wellness Score and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wellness Score */}
        <div className="lg:col-span-1">
          <WellnessScore
            score={dashboardData.wellnessScore.score}
            factors={dashboardData.wellnessScore.factors}
            trend={dashboardData.wellnessScore.trend}
          />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="health-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>

            {dashboardData.sleep.lastNight ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Last Night's Sleep</p>
                      <p className="text-sm text-gray-500">
                        {dashboardData.sleep.lastNight?.duration} hours,
                        Quality: {'⭐'.repeat(dashboardData.sleep.lastNight?.quality || 3)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {dashboardData.sleep.lastUpdated &&
                      new Date(dashboardData.sleep.lastUpdated).toLocaleDateString()
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity to display</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.href = '/dashboard/track'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Reading
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => window.location.href = '/dashboard/track'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reading
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => window.location.href = '/dashboard/diet'}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View Diet Plan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => window.location.href = '/dashboard/consult'}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Health Assistant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => window.location.href = '/dashboard/analytics'}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}