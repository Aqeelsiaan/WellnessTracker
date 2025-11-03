'use client'

import { useState, useEffect } from 'react'
import { SOSButton } from '@/components/emergency/SOSButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Shield, Users, Phone, MapPin, AlertTriangle, Edit2, Save, X } from 'lucide-react'

interface EmergencyInfo {
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  bloodType?: string
  allergies: string[]
  conditions: string[]
  medications: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  insurance?: {
    provider?: string
    policyNumber?: string
  }
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function EmergencyPage() {
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<EmergencyInfo>({
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    bloodType: '',
    allergies: [],
    conditions: [],
    medications: [],
    insurance: {
      provider: '',
      policyNumber: '',
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [sosActivated, setSosActivated] = useState(false)

  useEffect(() => {
    loadEmergencyInfo()
  }, [])

  const loadEmergencyInfo = async () => {
    try {
      const response = await fetch('/api/emergency')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setEmergencyInfo(data)
          setFormData(data)
        }
      }
    } catch (error) {
      console.error('Failed to load emergency info:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setEmergencyInfo(data.data)
        setIsEditing(false)
        setSaveMessage('Emergency information saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        const errorData = await response.json()
        setSaveMessage(errorData.error || 'Failed to save emergency information')
      }
    } catch (error) {
      setSaveMessage('An error occurred while saving')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (emergencyInfo) {
      setFormData(emergencyInfo)
    }
    setIsEditing(false)
    setSaveMessage('')
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof EmergencyInfo],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleArrayInput = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean)
    setFormData(prev => ({
      ...prev,
      [field]: items
    }))
  }

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const medications = [...formData.medications]
    medications[index] = {
      ...medications[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      medications
    }))
  }

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dosage: '', frequency: '' }
      ]
    }))
  }

  const removeMedication = (index: number) => {
    const medications = formData.medications.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      medications
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency & SOS</h1>
          <p className="text-gray-600">Manage your emergency information and SOS contacts</p>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Info
          </Button>
        )}
      </div>

      {/* SOS Section */}
      <div className="health-card">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency SOS</h3>
          <p className="text-gray-600 mb-6">
            Press and hold the SOS button to alert your emergency contacts
          </p>

          {sosActivated ? (
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-green-900 mb-2">Emergency Alert Sent</h4>
              <p className="text-green-700 text-sm">
                Your emergency contacts have been notified with your location.
              </p>
            </div>
          ) : (
            <SOSButton onActivate={() => setSosActivated(true)} />
          )}
        </div>
      </div>

      {/* Emergency Information */}
      <div className="health-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Emergency Information</h3>
          {saveMessage && (
            <span className={`text-sm ${
              saveMessage.includes('success') ? 'text-success-600' : 'text-danger-600'
            }`}>
              {saveMessage}
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6">
            {/* Emergency Contact */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <Input
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Medical Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                  <select
                    className="input"
                    value={formData.bloodType || ''}
                    onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  >
                    <option value="">Select blood type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <Input
                    value={formData.allergies.join(', ')}
                    onChange={(e) => handleArrayInput('allergies', e.target.value)}
                    placeholder="e.g., Peanuts, Shellfish, Penicillin"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                  <Input
                    value={formData.conditions.join(', ')}
                    onChange={(e) => handleArrayInput('conditions', e.target.value)}
                    placeholder="e.g., Diabetes, Asthma, Heart Disease"
                  />
                </div>
              </div>
            </div>

            {/* Medications */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Medications</h4>
              <div className="space-y-3">
                {formData.medications.map((med, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        value={med.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        placeholder="Medication name"
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        value={med.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        placeholder="Dosage"
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        value={med.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        placeholder="Frequency"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMedication(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addMedication}
                  className="w-full"
                >
                  + Add Medication
                </Button>
              </div>
            </div>

            {/* Insurance */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Insurance Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <Input
                    value={formData.insurance?.provider || ''}
                    onChange={(e) => handleInputChange('insurance.provider', e.target.value)}
                    placeholder="Insurance provider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                  <Input
                    value={formData.insurance?.policyNumber || ''}
                    onChange={(e) => handleInputChange('insurance.policyNumber', e.target.value)}
                    placeholder="Policy number"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleSave}
                loading={isLoading}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Information
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {emergencyInfo ? (
              <>
                {/* Emergency Contact Display */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{emergencyInfo.emergencyContact.name}</p>
                        <p className="text-sm text-gray-600">{emergencyInfo.emergencyContact.relationship}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${emergencyInfo.emergencyContact.phone}`)}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{emergencyInfo.emergencyContact.phone}</p>
                  </div>
                </div>

                {/* Medical Info Display */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Medical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {emergencyInfo.bloodType && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-red-900">Blood Type</p>
                        <p className="text-lg font-bold text-red-700">{emergencyInfo.bloodType}</p>
                      </div>
                    )}
                    {emergencyInfo.allergies.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-orange-900">Allergies</p>
                        <p className="text-sm text-orange-700">{emergencyInfo.allergies.join(', ')}</p>
                      </div>
                    )}
                    {emergencyInfo.conditions.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-yellow-900">Conditions</p>
                        <p className="text-sm text-yellow-700">{emergencyInfo.conditions.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medications Display */}
                {emergencyInfo.medications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Current Medications</h4>
                    <div className="space-y-2">
                      {emergencyInfo.medications.map((med, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <p className="font-medium text-gray-900">{med.name}</p>
                          <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insurance Display */}
                {emergencyInfo.insurance?.provider && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Insurance</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-gray-900">{emergencyInfo.insurance.provider}</p>
                      {emergencyInfo.insurance.policyNumber && (
                        <p className="text-sm text-gray-600">Policy: {emergencyInfo.insurance.policyNumber}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Emergency Information</h4>
                <p className="text-gray-600 mb-4">
                  Add your emergency contact information and medical details for quick access during emergencies.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                >
                  Add Emergency Information
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Important Notice</h4>
            <p className="text-yellow-700 text-sm mt-1">
              This emergency information is for reference purposes. In case of a medical emergency,
              call emergency services immediately (911 in the US/Canada, 112 in Europe, 999 in the UK).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}