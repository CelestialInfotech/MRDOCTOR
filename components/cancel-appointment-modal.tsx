"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, User, Calendar, Clock, X, Trash2 } from "lucide-react"

interface CancelAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: any
  onCancel: (reason: string, notifyPatient: boolean) => Promise<void>
}

export function CancelAppointmentModal({ isOpen, onClose, appointment, onCancel }: CancelAppointmentModalProps) {
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [notifyPatient, setNotifyPatient] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  const predefinedReasons = [
    "Doctor unavailable due to emergency",
    "Medical equipment malfunction",
    "Doctor illness",
    "Hospital emergency",
    "Scheduling conflict",
    "Patient requested cancellation",
    "Other (specify below)",
  ]

  const handleCancel = async () => {
    let finalReason = selectedReason
    if (selectedReason === "Other (specify below)") {
      if (!customReason.trim()) {
        alert("Please specify the reason for cancellation")
        return
      }
      finalReason = customReason
    } else if (!selectedReason) {
      alert("Please select a reason for cancellation")
      return
    }

    setIsCancelling(true)
    try {
      await onCancel(finalReason, notifyPatient)
      setSelectedReason("")
      setCustomReason("")
      setNotifyPatient(true)
    } catch (error) {
      console.error("Error cancelling:", error)
      alert("Failed to cancel appointment. Please try again.")
    } finally {
      setIsCancelling(false)
    }
  }

  const handleClose = () => {
    setSelectedReason("")
    setCustomReason("")
    setNotifyPatient(true)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Cancel Appointment
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The appointment will be permanently cancelled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Summary */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Appointment to Cancel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p className="text-sm">
                    {appointment?.patient?.firstName} {appointment?.patient?.lastName}
                  </p>
                  <p className="text-xs text-gray-600">{appointment?.patient?.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {appointment?.appointmentDate?.toLocaleDateString()}
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {appointment?.appointmentTime} ({appointment?.durationMinutes || 30} min)
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Reason for Visit</Label>
                  <p className="text-sm">{appointment?.reason || "General consultation"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Reason */}
          <div>
            <Label className="text-base font-medium">Reason for Cancellation *</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-3">
              {predefinedReasons.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason} className="text-sm cursor-pointer">
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Custom Reason */}
          {selectedReason === "Other (specify below)" && (
            <div>
              <Label htmlFor="customReason">Please specify the reason</Label>
              <Textarea
                id="customReason"
                placeholder="Enter specific reason for cancellation..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          )}

          {/* Notification Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifyPatient"
              checked={notifyPatient}
              onCheckedChange={(checked) => setNotifyPatient(checked as boolean)}
            />
            <Label htmlFor="notifyPatient" className="text-sm cursor-pointer">
              Notify patient about cancellation (recommended)
            </Label>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Important Notice</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Cancelling this appointment will permanently remove it from the system. If you need to reschedule
                  instead, please use the reschedule option.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Keep Appointment
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
            <Trash2 className="h-4 w-4 mr-2" />
            {isCancelling ? "Cancelling..." : "Cancel Appointment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
