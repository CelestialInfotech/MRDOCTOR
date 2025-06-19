"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MessageSquare, User, Send, X } from "lucide-react"

interface ContactPatientModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: any
  doctorProfile: any
}

export function ContactPatientModal({ isOpen, onClose, appointment, doctorProfile }: ContactPatientModalProps) {
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [smsMessage, setSmsMessage] = useState("")
  const [callNotes, setCallNotes] = useState("")

  const patient = appointment?.patient

  const handlePhoneCall = () => {
    if (patient?.phone) {
      window.open(`tel:${patient.phone}`, "_blank")
    } else {
      alert("Patient phone number not available")
    }
  }

  const handleSendEmail = () => {
    if (!patient?.email) {
      alert("Patient email not available")
      return
    }

    if (!emailSubject.trim() || !emailMessage.trim()) {
      alert("Please fill in both subject and message")
      return
    }

    const subject = encodeURIComponent(emailSubject)
    const body = encodeURIComponent(emailMessage)
    window.open(`mailto:${patient.email}?subject=${subject}&body=${body}`, "_blank")
  }

  const handleSendSMS = () => {
    if (!patient?.phone) {
      alert("Patient phone number not available")
      return
    }

    if (!smsMessage.trim()) {
      alert("Please enter a message")
      return
    }

    const message = encodeURIComponent(smsMessage)
    window.open(`sms:${patient.phone}?body=${message}`, "_blank")
  }

  const initializeTemplates = () => {
    if (!emailSubject) {
      setEmailSubject(`Regarding your appointment - ${appointment?.appointmentDate?.toLocaleDateString()}`)
    }
    if (!emailMessage) {
      setEmailMessage(
        `Dear ${patient?.firstName || "Patient"},\n\nI hope this message finds you well.\n\nI am writing regarding your upcoming appointment scheduled for ${appointment?.appointmentDate?.toLocaleDateString()} at ${appointment?.appointmentTime}.\n\nPlease let me know if you have any questions or concerns.\n\nBest regards,\nDr. ${doctorProfile?.firstName} ${doctorProfile?.lastName}\n${doctorProfile?.specialization}\n${doctorProfile?.hospitalAffiliation}`,
      )
    }
    if (!smsMessage) {
      setSmsMessage(
        `Hi ${patient?.firstName}, this is Dr. ${doctorProfile?.firstName} ${doctorProfile?.lastName}. Regarding your appointment on ${appointment?.appointmentDate?.toLocaleDateString()} at ${appointment?.appointmentTime}. Please reply if you have any questions.`,
      )
    }
  }

  const handleTabChange = (value: string) => {
    if (value === "email" || value === "sms") {
      initializeTemplates()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Patient
          </DialogTitle>
          <DialogDescription>
            Communicate with {patient?.firstName} {patient?.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">
                    {patient?.firstName} {patient?.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{patient?.phone || "Not available"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{patient?.email || "Not available"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication Tabs */}
          <Tabs defaultValue="phone" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Call
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Phone Call</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Patient Phone Number</Label>
                    <p className="text-lg font-mono bg-gray-100 p-2 rounded">{patient?.phone || "Not available"}</p>
                  </div>

                  <div>
                    <Label>Discussion Points</Label>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Appointment confirmation for {appointment?.appointmentDate?.toLocaleDateString()}</li>
                      <li>• Pre-appointment instructions</li>
                      <li>• Address any patient concerns</li>
                      <li>• Confirm contact information</li>
                    </ul>
                  </div>

                  <div>
                    <Label htmlFor="callNotes">Call Notes (Optional)</Label>
                    <Textarea
                      id="callNotes"
                      placeholder="Record notes about the call..."
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={handlePhoneCall} disabled={!patient?.phone} className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Patient
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Send Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="emailTo">To</Label>
                    <Input id="emailTo" value={patient?.email || ""} disabled className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="emailSubject">Subject</Label>
                    <Input
                      id="emailSubject"
                      placeholder="Enter email subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emailMessage">Message</Label>
                    <Textarea
                      id="emailMessage"
                      placeholder="Enter your message"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={8}
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={handleSendEmail} disabled={!patient?.email} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Send SMS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="smsTo">To</Label>
                    <Input id="smsTo" value={patient?.phone || ""} disabled className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="smsMessage">Message</Label>
                    <Textarea
                      id="smsMessage"
                      placeholder="Enter your SMS message"
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      rows={4}
                      className="mt-1"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">{smsMessage.length}/160 characters</p>
                  </div>

                  <Button onClick={handleSendSMS} disabled={!patient?.phone} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send SMS
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
