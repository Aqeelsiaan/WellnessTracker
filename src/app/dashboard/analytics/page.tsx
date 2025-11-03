'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { TrendChart } from '@/components/charts/TrendChart'
import { Button } from '@/components/ui/Button'
import { MetricType } from '@/types'
import { Calendar, Download, TrendingUp, Activity } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const timeRanges = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 3 months' },
  { value: 365, label: 'Last year' },
]

const metrics = [
  { type: MetricType.BLOOD_PRESSURE, label: 'Blood Pressure', unit: 'mmHg' },
  { type: MetricType.BLOOD_GLUCOSE, label: 'Blood Glucose', unit: 'mg/dL' },
  { type: MetricType.WEIGHT, label: 'Weight', unit: 'kg' },
  { type: MetricType.SLEEP, label: 'Sleep Duration', unit: 'hours' },
  { type: MetricType.EXERCISE, label: 'Exercise Duration', unit: 'minutes' },
  { type: MetricType.STRESS, label: 'Stress Level', unit: '' },
]

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState(30)
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>([
    MetricType.BLOOD_PRESSURE,
    MetricType.WEIGHT,
    MetricType.SLEEP
  ])

  const { data: healthData, error } = useSWR(
    `/api/health?startDate=${new Date(Date.now() - selectedTimeRange * 24 * 60 * 60 * 1000).toISOString()}`,
    fetcher
  )

  const processedData = useMemo(() => {
    if (!healthData?.data) return {}

    const data: Record<MetricType, Array<{ date: string; value: any }>> = {
      [MetricType.BLOOD_PRESSURE]: [],
      [MetricType.BLOOD_GLUCOSE]: [],
      [MetricType.WEIGHT]: [],
      [MetricType.WATER_INTAKE]: [],
      [MetricType.SLEEP]: [],
      [MetricType.EXERCISE]: [],
      [MetricType.STRESS]: [],
    }

    healthData.data.forEach((reading: any) => {
      if (!data[reading.metricType]) return

      let value = reading.value
      if (reading.metricType === MetricType.BLOOD_PRESSURE) {
        value = {
          systolic: reading.value.systolic,
          diastolic: reading.value.diastolic
        }
      } else if (typeof reading.value === 'object' && reading.value !== null) {
        value = reading.value.value || reading.value.duration || reading.value.level || 0
      }

      data[reading.metricType].push({
        date: reading.date,
        value
      })
    })

    // Sort by date
    Object.keys(data).forEach(key => {
      data[key as MetricType].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })

    return data
  }, [healthData])

  const getMetricStats = (metricType: MetricType) => {
    const data = processedData[metricType] || []
    if (data.length === 0) return null

    const values = data.map(d => {
      if (typeof d.value === 'object' && d.value !== null) {
        // For blood pressure, use systolic for stats
        return d.value.systolic || d.value.value || 0
      }
      return d.value
    })

    const latest = values[values.length - 1]
    const earliest = values[0]
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)

    return {
      latest,
      earliest,
      average,
      max,
      min,
      change: latest - earliest,
      changePercent: earliest !== 0 ? ((latest - earliest) / earliest) * 100 : 0,
      count: values.length
    }
  }

  const toggleMetric = (metricType: MetricType) => {
    setSelectedMetrics(prev =>
      prev.includes(metricType)
        ? prev.filter(m => m !== metricType)
        : [...prev, metricType]
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading analytics</h3>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Analytics</h1>
          <p className="text-gray-600">Track your health trends and progress over time</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="primary">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
          </div>
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedTimeRange(range.value)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedTimeRange === range.value
                    ? 'bg-primary-100 text-primary-700 border-primary-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Select Metrics to Display:</span>
          <span className="text-xs text-gray-500">
            {selectedMetrics.length} of {metrics.length} selected
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.type}
              onClick={() => toggleMetric(metric.type)}
              className={`p-2 text-sm rounded-md border transition-colors ${
                selectedMetrics.includes(metric.type)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      {selectedMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedMetrics.map((metricType) => {
            const stats = getMetricStats(metricType)
            const metric = metrics.find(m => m.type === metricType)
            if (!stats || !metric) return null

            const trendColor = stats.changePercent > 0 ? 'text-success-600' :
                              stats.changePercent < 0 ? 'text-danger-600' : 'text-gray-600'
            const trendIcon = stats.changePercent > 0 ? '↗️' :
                             stats.changePercent < 0 ? '↘️' : '→'

            return (
              <div key={metricType} className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3">{metric.label}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Latest:</span>
                    <span className="font-medium">
                      {stats.latest.toFixed(1)} {metric.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average:</span>
                    <span>{stats.average.toFixed(1)} {metric.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Range:</span>
                    <span>{stats.min.toFixed(1)} - {stats.max.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Change:</span>
                    <span className={`font-medium ${trendColor}`}>
                      {trendIcon} {Math.abs(stats.changePercent).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Readings:</span>
                    <span>{stats.count}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Charts */}
      <div className="space-y-6">
        {selectedMetrics.map((metricType) => {
          const metric = metrics.find(m => m.type === metricType)
          if (!metric || !processedData[metricType] || processedData[metricType].length === 0) {
            return null
          }

          return (
            <TrendChart
              key={metricType}
              data={processedData[metricType]}
              metricType={metricType}
              title={`${metric.label} Trends`}
              unit={metric.unit}
              height={350}
              showArea={false}
            />
          )
        })}
      </div>

      {/* No Data State */}
      {selectedMetrics.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Metrics Selected</h3>
          <p className="text-gray-600 mb-4">Select metrics above to view your health trends</p>
          <Button
            variant="outline"
            onClick={() => setSelectedMetrics([MetricType.BLOOD_PRESSURE, MetricType.WEIGHT, MetricType.SLEEP])}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Show Popular Metrics
          </Button>
        </div>
      )}
    </div>
  )
}