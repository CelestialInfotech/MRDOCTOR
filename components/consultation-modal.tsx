"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, User, Save, X } from "lucide-react"

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: any
  onComplete: (notes: string, diagnosis: string, prescription: string, followUp: string) => void
}

export function ConsultationModal({ isOpen, onClose, appointment, onComplete }: ConsultationModalProps) {
  const [consultationNotes, setConsultationNotes] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [prescription, setPrescription] = useState("")
  const [followUpInstructions, setFollowUpInstructions] = useState("")
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
  })
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    if (!consultationNotes.trim()) {
      alert("Please add consultation notes before completing")
      return
    }

    setIsCompleting(true)
    try {
      await onComplete(consultationNotes, diagnosis, prescription, followUpInstructions)
      onClose()
    } catch (error) {
      console.error("Error completing consultation:", error)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Consultation - {appointment?.patient?.firstName} {appointment?.patient?.lastName}
          </DialogTitle>
          <DialogDescription>Record consultation details and complete the appointment</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm">
                  {appointment?.patient?.firstName} {appointment?.patient?.lastName}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Age & Gender</Label>
                <p className="text-sm">
                  {appointment?.patient?.age} years, {appointment?.patient?.gender}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Contact</Label>
                <p className="text-sm">{appointment?.patient?.phone}</p>
                <p className="text-sm text-gray-600">{appointment?.patient?.email}</p>
              </div>
              {appointment?.patient?.medicalHistory && (
                <div>
                  <Label className="text-sm font-medium">Medical History</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{appointment?.patient?.medicalHistory}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Appointment Reason</Label>
                <p className="text-sm">{appointment?.reason || "General consultation"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vital Signs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="bp">Blood Pressure</Label>
                  <Input
                    id="bp"
                    placeholder="120/80"
                    value={vitalSigns.bloodPressure}
                    onChange={(e) => setVitalSigns((prev) => ({ ...prev, bloodPressure: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="hr">Heart Rate</Label>
                  <Input
                    id="hr"
                    placeholder="72 bpm"
                    value={vitalSigns.heartRate}
                    onChange={(e) => setVitalSigns((prev) => ({ ...prev, heartRate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="temp">Temperature</Label>
                  <Input
                    id="temp"
                    placeholder="98.6°F"
                    value={vitalSigns.temperature}
                    onChange={(e) => setVitalSigns((prev) => ({ ...prev, temperature: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    placeholder="70 kg"
                    value={vitalSigns.weight}
                    onChange={(e) => setVitalSigns((prev) => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Consultation Details */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="notes">Consultation Notes *</Label>
            <Textarea
              id="notes"
              placeholder="Record your observations, symptoms discussed, examination findings..."
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              placeholder="Primary and secondary diagnoses..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="prescription">Prescription & Treatment</Label>
            <Textarea
              id="prescription"
              placeholder="Medications, dosages, treatment plan..."
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="followup">Follow-up Instructions</Label>
            <Textarea
              id="followup"
              placeholder="Next appointment recommendations, care instructions..."
              value={followUpInstructions}
              onChange={(e) => setFollowUpInstructions(e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={isCompleting}>
            <Save className="h-4 w-4 mr-2" />
            {isCompleting ? "Completing..." : "Complete Consultation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
