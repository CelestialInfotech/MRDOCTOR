"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, User, Calendar, Clock, X, Printer } from "lucide-react"

interface ViewNotesModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: any
}

export function ViewNotesModal({ isOpen, onClose, appointment }: ViewNotesModalProps) {
  const handlePrint = () => {
    window.print()
  }

  if (!appointment) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Consultation Notes - {appointment?.patient?.firstName} {appointment?.patient?.lastName}
          </DialogTitle>
          <DialogDescription>
            Appointment on {appointment?.appointmentDate?.toLocaleDateString()} at {appointment?.appointmentTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient & Appointment Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm font-medium">
                    {appointment?.patient?.firstName} {appointment?.patient?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Age & Gender</label>
                  <p className="text-sm">
                    {appointment?.patient?.age} years, {appointment?.patient?.gender}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact</label>
                  <p className="text-sm">{appointment?.patient?.phone}</p>
                  <p className="text-sm text-gray-600">{appointment?.patient?.email}</p>
                </div>
                {appointment?.patient?.medicalHistory && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Medical History</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{appointment?.patient?.medicalHistory}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date & Time</label>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {appointment?.appointmentDate?.toLocaleDateString()}
                    <Clock className="h-3 w-3 ml-2" />
                    {appointment?.appointmentTime}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-sm">{appointment?.durationMinutes || 30} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason for Visit</label>
                  <p className="text-sm">{appointment?.reason || "General consultation"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm font-medium text-green-600">{appointment?.status}</p>
                </div>
                {appointment?.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Completed At</label>
                    <p className="text-sm">{appointment.completedAt.toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Consultation Notes */}
          {appointment?.consultationNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consultation Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{appointment.consultationNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnosis */}
          {appointment?.diagnosis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{appointment.diagnosis}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prescription */}
          {appointment?.prescription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prescription & Treatment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{appointment.prescription}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-up Instructions */}
          {appointment?.followUpInstructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Follow-up Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{appointment.followUpInstructions}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          {appointment?.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Notes
          </Button>
          <Button onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
