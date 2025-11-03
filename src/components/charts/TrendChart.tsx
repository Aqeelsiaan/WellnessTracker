'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { MetricType } from '@/types'

interface TrendChartProps {
  data: Array<{
    date: string
    value: number | { systolic?: number; diastolic?: number }
    label?: string
  }>
  metricType: MetricType
  title: string
  unit?: string
  color?: string
  height?: number
  showArea?: boolean
}

const chartColors = {
  [MetricType.BLOOD_PRESSURE]: { systolic: '#ef4444', diastolic: '#f59e0b' },
  [MetricType.BLOOD_GLUCOSE]: '#3b82f6',
  [MetricType.WEIGHT]: '#10b981',
  [MetricType.WATER_INTAKE]: '#06b6d4',
  [MetricType.SLEEP]: '#8b5cf6',
  [MetricType.EXERCISE]: '#f97316',
  [MetricType.STRESS]: '#ec4899',
}

const chartLabels = {
  [MetricType.BLOOD_PRESSURE]: 'Blood Pressure',
  [MetricType.BLOOD_GLUCOSE]: 'Blood Glucose',
  [MetricType.WEIGHT]: 'Weight',
  [MetricType.WATER_INTAKE]: 'Water Intake',
  [MetricType.SLEEP]: 'Sleep Duration',
  [MetricType.EXERCISE]: 'Exercise Duration',
  [MetricType.STRESS]: 'Stress Level',
}

export function TrendChart({
  data,
  metricType,
  title,
  unit = '',
  color,
  height = 300,
  showArea = false
}: TrendChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      fullDate: item.date,
      ...item.value
    }))
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {new Date(payload[0].payload.fullDate).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {unit && ` ${unit}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const chartColor = color || chartColors[metricType]

    if (metricType === MetricType.BLOOD_PRESSURE) {
      const ChartComponent = showArea ? AreaChart : LineChart
      const DataComponent = showArea ? Area : Line

      return (
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showArea ? (
              <>
                <Area
                  type="monotone"
                  dataKey="systolic"
                  stackId="1"
                  stroke={chartColors[metricType].systolic}
                  fill={chartColors[metricType].systolic}
                  fillOpacity={0.6}
                  name="Systolic"
                />
                <Area
                  type="monotone"
                  dataKey="diastolic"
                  stackId="2"
                  stroke={chartColors[metricType].diastolic}
                  fill={chartColors[metricType].diastolic}
                  fillOpacity={0.6}
                  name="Diastolic"
                />
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke={chartColors[metricType].systolic}
                  strokeWidth={2}
                  dot={{ fill: chartColors[metricType].systolic, r: 4 }}
                  name="Systolic"
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke={chartColors[metricType].diastolic}
                  strokeWidth={2}
                  dot={{ fill: chartColors[metricType].diastolic, r: 4 }}
                  name="Diastolic"
                />
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      )
    }

    const ChartComponent = showArea ? AreaChart : LineChart
    const DataComponent = showArea ? Area : Line

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          {showArea ? (
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              fill={chartColor}
              fillOpacity={0.3}
              name={chartLabels[metricType]}
            />
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              dot={{ fill: chartColor, r: 4 }}
              name={chartLabels[metricType]}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color || chartColors[metricType] }}></div>
          <span className="text-sm text-gray-600">{chartLabels[metricType]}</span>
        </div>
      </div>
      {chartData.length > 0 ? (
        renderChart()
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm">No data available</p>
            <p className="text-xs text-gray-400">Start tracking to see trends</p>
          </div>
        </div>
      )}
    </div>
  )
}