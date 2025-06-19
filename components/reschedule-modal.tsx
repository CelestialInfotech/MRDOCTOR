"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Save, X } from "lucide-react"

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: any
  onReschedule: (newDate: Date, newTime: string, reason: string) => Promise<void>
}

export function RescheduleModal({ isOpen, onClose, appointment, onReschedule }: RescheduleModalProps) {
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [reason, setReason] = useState("")
  const [isRescheduling, setIsRescheduling] = useState(false)

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ]

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      alert("Please select both date and time")
      return
    }

    const selectedDate = new Date(newDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      alert("Please select a future date")
      return
    }

    setIsRescheduling(true)
    try {
      await onReschedule(selectedDate, newTime, reason)
      setNewDate("")
      setNewTime("")
      setReason("")
    } catch (error) {
      console.error("Error rescheduling:", error)
      alert("Failed to reschedule appointment. Please try again.")
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleClose = () => {
    setNewDate("")
    setNewTime("")
    setReason("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reschedule Appointment
          </DialogTitle>
          <DialogDescription>Change the date and time for this appointment</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Appointment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Current Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p className="text-sm">
                    {appointment?.patient?.firstName} {appointment?.patient?.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Date & Time</Label>
                  <p className="text-sm">
                    {appointment?.appointmentDate?.toLocaleDateString()} at {appointment?.appointmentTime}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm">{appointment?.durationMinutes || 30} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reason</Label>
                  <p className="text-sm">{appointment?.reason || "General consultation"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newDate">New Date *</Label>
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newTime">New Time *</Label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason for Reschedule */}
          <div>
            <Label htmlFor="reason">Reason for Reschedule (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for rescheduling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleReschedule} disabled={isRescheduling}>
            <Save className="h-4 w-4 mr-2" />
            {isRescheduling ? "Rescheduling..." : "Reschedule Appointment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
