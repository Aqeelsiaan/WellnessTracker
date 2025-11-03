'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MetricType } from '@/types'
import {
  Heart,
  Activity,
  Droplets,
  Moon,
  Weight,
  Brain,
  Plus,
  Save,
  AlertCircle
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const trackingForms = {
  [MetricType.BLOOD_PRESSURE]: {
    title: 'Blood Pressure',
    icon: Heart,
    description: 'Track your blood pressure and pulse rate',
    fields: [
      { name: 'systolic', label: 'Systolic (mmHg)', type: 'number', min: 70, max: 250, required: true },
      { name: 'diastolic', label: 'Diastolic (mmHg)', type: 'number', min: 40, max: 150, required: true },
      { name: 'pulse', label: 'Pulse (bpm)', type: 'number', min: 40, max: 200, required: true },
      { name: 'position', label: 'Position', type: 'select', options: ['sitting', 'standing', 'lying'] },
    ]
  },
  [MetricType.BLOOD_GLUCOSE]: {
    title: 'Blood Glucose',
    icon: Activity,
    description: 'Monitor your blood sugar levels',
    fields: [
      { name: 'value', label: 'Glucose Level', type: 'number', min: 20, max: 600, required: true },
      { name: 'type', label: 'Reading Type', type: 'select', options: ['fasting', 'post_meal'], required: true },
      { name: 'timeSinceMeal', label: 'Time Since Meal (minutes)', type: 'number', min: 0, max: 300 },
      { name: 'unit', label: 'Unit', type: 'select', options: ['mg/dL', 'mmol/L'], defaultValue: 'mg/dL' },
    ]
  },
  [MetricType.WEIGHT]: {
    title: 'Weight',
    icon: Weight,
    description: 'Track your weight and body composition',
    fields: [
      { name: 'value', label: 'Weight', type: 'number', min: 20, max: 300, step: 0.1, required: true },
      { name: 'unit', label: 'Unit', type: 'select', options: ['kg', 'lbs'], defaultValue: 'kg' },
      { name: 'bodyFat', label: 'Body Fat %', type: 'number', min: 0, max: 100, step: 0.1 },
    ]
  },
  [MetricType.WATER_INTAKE]: {
    title: 'Water Intake',
    icon: Droplets,
    description: 'Log your daily water consumption',
    fields: [
      { name: 'amount', label: 'Amount', type: 'number', min: 0, max: 5000, step: 100, required: true },
      { name: 'unit', label: 'Unit', type: 'select', options: ['ml', 'oz', 'cups'], defaultValue: 'ml' },
    ]
  },
  [MetricType.SLEEP]: {
    title: 'Sleep',
    icon: Moon,
    description: 'Record your sleep duration and quality',
    fields: [
      { name: 'duration', label: 'Duration (hours)', type: 'number', min: 0, max: 24, step: 0.5, required: true },
      { name: 'quality', label: 'Quality (1-5)', type: 'number', min: 1, max: 5, required: true },
      { name: 'bedTime', label: 'Bedtime', type: 'time', required: true },
      { name: 'wakeTime', label: 'Wake Time', type: 'time', required: true },
    ]
  },
  [MetricType.EXERCISE]: {
    title: 'Exercise',
    icon: Brain,
    description: 'Log your physical activity',
    fields: [
      { name: 'type', label: 'Exercise Type', type: 'text', required: true },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', min: 0, max: 480, required: true },
      { name: 'intensity', label: 'Intensity (1-5)', type: 'number', min: 1, max: 5, required: true },
      { name: 'calories', label: 'Calories Burned', type: 'number', min: 0, max: 2000 },
    ]
  },
  [MetricType.STRESS]: {
    title: 'Stress Level',
    icon: Brain,
    description: 'Track your stress levels and triggers',
    fields: [
      { name: 'level', label: 'Stress Level (1-10)', type: 'number', min: 1, max: 10, required: true },
      { name: 'triggers', label: 'Triggers (comma separated)', type: 'text' },
      { name: 'copingMechanisms', label: 'Coping Mechanisms (comma separated)', type: 'text' },
    ]
  },
}

export default function TrackPage() {
  const { data: session, status } = useSession()
  const [selectedMetric, setSelectedMetric] = useState<MetricType>(MetricType.BLOOD_PRESSURE)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const { data: recentData } = useSWR(
    `/api/health?metricType=${selectedMetric}&limit=5`,
    fetcher
  )

  const currentForm = trackingForms[selectedMetric]
  const Icon = currentForm.icon

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const payload = {
        metricType: selectedMetric,
        value: { ...formData },
        date: new Date().toISOString(),
        notes: notes.trim() || undefined,
      }

      // Handle array fields for stress tracking
      if (selectedMetric === MetricType.STRESS) {
        if (formData.triggers) {
          payload.value.triggers = formData.triggers.split(',').map((s: string) => s.trim()).filter(Boolean)
        }
        if (formData.copingMechanisms) {
          payload.value.copingMechanisms = formData.copingMechanisms.split(',').map((s: string) => s.trim()).filter(Boolean)
        }
      }

      const response = await fetch('/api/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Health data saved successfully!' })
        setFormData({})
        setNotes('')
        // Mutate to refresh data
        mutate('/api/health')
        mutate('/api/dashboard')
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to save data' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Track Health Data</h1>
        <p className="text-gray-600">Log your health metrics to monitor your progress</p>
      </div>

      {/* Metric Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(trackingForms).map(([type, form]) => {
          const FormIcon = form.icon
          return (
            <button
              key={type}
              onClick={() => {
                setSelectedMetric(type as MetricType)
                setFormData({})
                setMessage(null)
              }}
              className={`p-3 rounded-lg border text-center transition-all ${
                selectedMetric === type
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <FormIcon className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs font-medium">{form.title}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tracking Form */}
        <div className="lg:col-span-2">
          <div className="health-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentForm.title}</h3>
                <p className="text-sm text-gray-600">{currentForm.description}</p>
              </div>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-md flex items-center ${
                message.type === 'success' ? 'bg-success-50 text-success-800' : 'bg-danger-50 text-danger-800'
              }`}>
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {currentForm.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-danger-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      className="input"
                      value={formData[field.name] || field.defaultValue || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option.replace('_', ' ').charAt(0).toUpperCase() + option.replace('_', ' ').slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={field.type}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name,
                        field.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value
                      )}
                      required={field.required}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Reading
              </Button>
            </form>
          </div>
        </div>

        {/* Recent Data */}
        <div className="lg:col-span-1">
          <div className="health-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent {currentForm.title} Readings</h3>

            {recentData?.data && recentData.data.length > 0 ? (
              <div className="space-y-3">
                {recentData.data.map((reading: any) => (
                  <div key={reading.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(reading.date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(reading.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Display reading data based on type */}
                    <div className="text-sm text-gray-600">
                      {selectedMetric === MetricType.BLOOD_PRESSURE && (
                        <span>{reading.value.systolic}/{reading.value.diastolic} mmHg, Pulse: {reading.value.pulse} bpm</span>
                      )}
                      {selectedMetric === MetricType.BLOOD_GLUCOSE && (
                        <span>{reading.value.value} {reading.value.unit} ({reading.value.type})</span>
                      )}
                      {selectedMetric === MetricType.WEIGHT && (
                        <span>{reading.value.value} {reading.value.unit}</span>
                      )}
                      {selectedMetric === MetricType.WATER_INTAKE && (
                        <span>{reading.value.amount} {reading.value.unit}</span>
                      )}
                      {selectedMetric === MetricType.SLEEP && (
                        <span>{reading.value.duration}h, Quality: {reading.value.quality}/5</span>
                      )}
                      {selectedMetric === MetricType.EXERCISE && (
                        <span>{reading.value.type}, {reading.value.duration}min</span>
                      )}
                      {selectedMetric === MetricType.STRESS && (
                        <span>Level: {reading.value.level}/10</span>
                      )}
                    </div>

                    {reading.notes && (
                      <p className="text-xs text-gray-500 mt-1">{reading.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No recent readings</p>
                <p className="text-xs text-gray-400">Start by adding your first reading</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}