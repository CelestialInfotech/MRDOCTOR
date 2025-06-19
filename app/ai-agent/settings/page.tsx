"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bot, MessageSquare, Clock, Shield, Save, ArrowLeft, Zap, Key } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface AIAgentSettings {
  // Basic Configuration
  agentName: string
  agentDescription: string
  welcomeMessage: string

  // Features
  naturalLanguageProcessing: boolean
  appointmentScheduling: boolean
  patientInfoCollection: boolean
  doctorAvailabilityCheck: boolean
  confirmationMessages: boolean
  multiLanguageSupport: boolean

  // Scheduling Settings
  workingHours: {
    start: string
    end: string
  }
  workingDays: string[]
  timeSlotDuration: number
  advanceBookingDays: number

  // Communication Settings
  responseDelay: number
  maxRetries: number
  fallbackToHuman: boolean

  // Notifications
  emailNotifications: boolean
  smsNotifications: boolean
  webhookNotifications: boolean

  // Security
  apiKey: string
  webhookSecret: string
  rateLimitPerMinute: number

  // Advanced
  customPrompts: {
    greeting: string
    appointmentConfirmation: string
    rescheduleMessage: string
    cancellationMessage: string
  }
}

const defaultSettings: AIAgentSettings = {
  agentName: "MedBot Assistant",
  agentDescription: "AI-powered medical appointment booking assistant",
  welcomeMessage: "Hello! I'm here to help you book your medical appointment. How can I assist you today?",

  naturalLanguageProcessing: true,
  appointmentScheduling: true,
  patientInfoCollection: true,
  doctorAvailabilityCheck: true,
  confirmationMessages: true,
  multiLanguageSupport: false,

  workingHours: {
    start: "09:00",
    end: "17:00",
  },
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  timeSlotDuration: 30,
  advanceBookingDays: 30,

  responseDelay: 1000,
  maxRetries: 3,
  fallbackToHuman: true,

  emailNotifications: true,
  smsNotifications: false,
  webhookNotifications: true,

  apiKey: "sk-" + Math.random().toString(36).substring(2, 15),
  webhookSecret: "whsec_" + Math.random().toString(36).substring(2, 15),
  rateLimitPerMinute: 60,

  customPrompts: {
    greeting:
      "Hello! I'm your medical appointment assistant. I can help you schedule, reschedule, or cancel appointments with our doctors.",
    appointmentConfirmation:
      "Your appointment has been successfully booked for {date} at {time} with Dr. {doctor}. You'll receive a confirmation email shortly.",
    rescheduleMessage: "I can help you reschedule your appointment. What date and time would work better for you?",
    cancellationMessage:
      "I understand you need to cancel your appointment. Your appointment for {date} at {time} has been cancelled. Is there anything else I can help you with?",
  },
}

export default function AIAgentSettingsPage() {
  const [settings, setSettings] = useState<AIAgentSettings>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // In a real app, this would load from your backend/database
      const savedSettings = localStorage.getItem("aiAgentSettings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load AI agent settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // In a real app, this would save to your backend/database
      localStorage.setItem("aiAgentSettings", JSON.stringify(settings))

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings Saved",
        description: "AI agent settings have been updated successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save AI agent settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const updateNestedSetting = (parent: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof AIAgentSettings],
        [key]: value,
      },
    }))
  }

  const generateNewApiKey = () => {
    const newKey = "sk-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    updateSetting("apiKey", newKey)
    toast({
      title: "API Key Generated",
      description: "New API key has been generated. Make sure to save your settings.",
    })
  }

  const generateNewWebhookSecret = () => {
    const newSecret =
      "whsec_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    updateSetting("webhookSecret", newSecret)
    toast({
      title: "Webhook Secret Generated",
      description: "New webhook secret has been generated. Make sure to save your settings.",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading AI agent settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/ai-agent">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to AI Agent
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Agent Settings</h1>
            <p className="text-gray-600 mt-2">Configure your AI booking agent behavior and capabilities</p>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Configuration */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Basic Configuration
                </CardTitle>
                <CardDescription>Configure basic AI agent information and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="agentName">Agent Name</Label>
                    <Input
                      id="agentName"
                      value={settings.agentName}
                      onChange={(e) => updateSetting("agentName", e.target.value)}
                      placeholder="Enter agent name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agentDescription">Agent Description</Label>
                    <Input
                      id="agentDescription"
                      value={settings.agentDescription}
                      onChange={(e) => updateSetting("agentDescription", e.target.value)}
                      placeholder="Brief description of the agent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={settings.welcomeMessage}
                    onChange={(e) => updateSetting("welcomeMessage", e.target.value)}
                    placeholder="Message shown when users first interact with the agent"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Agent Features
                </CardTitle>
                <CardDescription>Enable or disable specific AI agent capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Natural Language Processing</Label>
                      <p className="text-sm text-gray-600">Advanced language understanding</p>
                    </div>
                    <Switch
                      checked={settings.naturalLanguageProcessing}
                      onCheckedChange={(checked) => updateSetting("naturalLanguageProcessing", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Appointment Scheduling</Label>
                      <p className="text-sm text-gray-600">Book new appointments</p>
                    </div>
                    <Switch
                      checked={settings.appointmentScheduling}
                      onCheckedChange={(checked) => updateSetting("appointmentScheduling", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Patient Info Collection</Label>
                      <p className="text-sm text-gray-600">Collect patient details</p>
                    </div>
                    <Switch
                      checked={settings.patientInfoCollection}
                      onCheckedChange={(checked) => updateSetting("patientInfoCollection", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Doctor Availability Check</Label>
                      <p className="text-sm text-gray-600">Real-time availability checking</p>
                    </div>
                    <Switch
                      checked={settings.doctorAvailabilityCheck}
                      onCheckedChange={(checked) => updateSetting("doctorAvailabilityCheck", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Confirmation Messages</Label>
                      <p className="text-sm text-gray-600">Send booking confirmations</p>
                    </div>
                    <Switch
                      checked={settings.confirmationMessages}
                      onCheckedChange={(checked) => updateSetting("confirmationMessages", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Multi-Language Support</Label>
                      <p className="text-sm text-gray-600">Support multiple languages</p>
                    </div>
                    <Switch
                      checked={settings.multiLanguageSupport}
                      onCheckedChange={(checked) => updateSetting("multiLanguageSupport", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduling Settings */}
          <TabsContent value="scheduling">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Scheduling Settings
                </CardTitle>
                <CardDescription>Configure appointment scheduling parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Working Hours Start</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={settings.workingHours.start}
                      onChange={(e) => updateNestedSetting("workingHours", "start", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Working Hours End</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={settings.workingHours.end}
                      onChange={(e) => updateNestedSetting("workingHours", "end", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">Time Slot Duration (minutes)</Label>
                    <Select
                      value={settings.timeSlotDuration.toString()}
                      onValueChange={(value) => updateSetting("timeSlotDuration", Number.parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advanceBooking">Advance Booking Days</Label>
                    <Input
                      id="advanceBooking"
                      type="number"
                      min="1"
                      max="365"
                      value={settings.advanceBookingDays}
                      onChange={(e) => updateSetting("advanceBookingDays", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Working Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <Badge
                        key={day}
                        variant={settings.workingDays.includes(day) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newDays = settings.workingDays.includes(day)
                            ? settings.workingDays.filter((d) => d !== day)
                            : [...settings.workingDays, day]
                          updateSetting("workingDays", newDays)
                        }}
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Settings */}
          <TabsContent value="communication">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication Settings
                </CardTitle>
                <CardDescription>Configure how the AI agent communicates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="responseDelay">Response Delay (ms)</Label>
                    <Input
                      id="responseDelay"
                      type="number"
                      min="0"
                      max="5000"
                      value={settings.responseDelay}
                      onChange={(e) => updateSetting("responseDelay", Number.parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-600">Delay before agent responds (makes it feel more natural)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxRetries">Max Retries</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.maxRetries}
                      onChange={(e) => updateSetting("maxRetries", Number.parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-600">Number of times to retry failed operations</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Fallback to Human</Label>
                    <p className="text-sm text-gray-600">Transfer to human agent when AI can't help</p>
                  </div>
                  <Switch
                    checked={settings.fallbackToHuman}
                    onCheckedChange={(checked) => updateSetting("fallbackToHuman", checked)}
                  />
                </div>
                <div className="space-y-4">
                  <Label>Notification Settings</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">Send email confirmations</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Send SMS confirmations</p>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Webhook Notifications</Label>
                        <p className="text-sm text-gray-600">Send webhook events</p>
                      </div>
                      <Switch
                        checked={settings.webhookNotifications}
                        onCheckedChange={(checked) => updateSetting("webhookNotifications", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security and authentication settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="apiKey"
                        type="password"
                        value={settings.apiKey}
                        onChange={(e) => updateSetting("apiKey", e.target.value)}
                        placeholder="Your API key"
                      />
                      <Button variant="outline" onClick={generateNewApiKey}>
                        <Key className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">Used for authenticating API requests</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                    <div className="flex gap-2">
                      <Input
                        id="webhookSecret"
                        type="password"
                        value={settings.webhookSecret}
                        onChange={(e) => updateSetting("webhookSecret", e.target.value)}
                        placeholder="Your webhook secret"
                      />
                      <Button variant="outline" onClick={generateNewWebhookSecret}>
                        <Key className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">Used for verifying webhook authenticity</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rateLimit">Rate Limit (requests per minute)</Label>
                    <Input
                      id="rateLimit"
                      type="number"
                      min="1"
                      max="1000"
                      value={settings.rateLimitPerMinute}
                      onChange={(e) => updateSetting("rateLimitPerMinute", Number.parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-600">Maximum number of requests per minute</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>Configure custom prompts and advanced behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="greetingPrompt">Greeting Prompt</Label>
                    <Textarea
                      id="greetingPrompt"
                      value={settings.customPrompts.greeting}
                      onChange={(e) => updateNestedSetting("customPrompts", "greeting", e.target.value)}
                      placeholder="Custom greeting message"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmationPrompt">Appointment Confirmation Prompt</Label>
                    <Textarea
                      id="confirmationPrompt"
                      value={settings.customPrompts.appointmentConfirmation}
                      onChange={(e) => updateNestedSetting("customPrompts", "appointmentConfirmation", e.target.value)}
                      placeholder="Message sent when appointment is confirmed"
                      rows={3}
                    />
                    <p className="text-xs text-gray-600">
                      Use {"{date}"}, {"{time}"}, {"{doctor}"} as placeholders
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reschedulePrompt">Reschedule Prompt</Label>
                    <Textarea
                      id="reschedulePrompt"
                      value={settings.customPrompts.rescheduleMessage}
                      onChange={(e) => updateNestedSetting("customPrompts", "rescheduleMessage", e.target.value)}
                      placeholder="Message for rescheduling appointments"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cancellationPrompt">Cancellation Prompt</Label>
                    <Textarea
                      id="cancellationPrompt"
                      value={settings.customPrompts.cancellationMessage}
                      onChange={(e) => updateNestedSetting("customPrompts", "cancellationMessage", e.target.value)}
                      placeholder="Message for appointment cancellations"
                      rows={3}
                    />
                    <p className="text-xs text-gray-600">
                      Use {"{date}"}, {"{time}"} as placeholders
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={saving} size="lg">
            {saving ? (
              <>
                <Bot className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
