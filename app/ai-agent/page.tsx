import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Settings, Activity, MessageSquare, Calendar, TrendingUp, Zap, CheckCircle } from "lucide-react"
import Link from "next/link"
import { appointmentService } from "@/lib/firebase-service"
import { getDocs, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { TestAgentButton } from "@/components/test-agent-button"

async function getAIAgentStats() {
  try {
    // Get all appointments and filter in memory to avoid complex queries
    const querySnapshot = await getDocs(collection(db, "appointments"))

    const allAppointments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      appointmentDate: doc.data().appointmentDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    }))

    const aiAppointments = allAppointments.filter((apt) => apt.aiAgentBooking === true)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentAIAppointments = aiAppointments.filter((apt) => apt.createdAt >= weekAgo)

    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    const monthlyAIAppointments = aiAppointments.filter((apt) => apt.appointmentDate >= monthAgo)

    const successfulAppointments = monthlyAIAppointments.filter((apt) => apt.status !== "cancelled")
    const successRate =
      monthlyAIAppointments.length > 0
        ? Math.round((successfulAppointments.length / monthlyAIAppointments.length) * 100)
        : 0

    return {
      total: aiAppointments.length,
      recent: recentAIAppointments.length,
      successRate,
    }
  } catch (error) {
    console.error("Error fetching AI agent stats:", error)
    return { total: 0, recent: 0, successRate: 0 }
  }
}

export default async function AIAgentPage() {
  const stats = await getAIAgentStats()
  const recentBookings = await appointmentService.getRecentAIBookings(5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Agent Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor and manage your AI booking agent</p>
          </div>
          <div className="flex gap-2">
            <Link href="/ai-agent/settings">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <TestAgentButton />
          </div>
        </div>

        {/* AI Agent Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-600" />
              Agent Status
              <Badge className="bg-green-100 text-green-800 ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </CardTitle>
            <CardDescription>Your AI agent is running and ready to book appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-sm text-blue-700">Total AI Bookings</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">{stats.recent}</div>
                <div className="text-sm text-green-700">This Week</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">{stats.successRate}%</div>
                <div className="text-sm text-purple-700">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent AI Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent AI Bookings
              </CardTitle>
              <CardDescription>Latest appointments booked by your AI agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {booking.patient.firstName} {booking.patient.lastName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {booking.doctor.firstName} {booking.doctor.lastName} - {booking.doctor.specialization}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.appointmentDate.toLocaleDateString()} at {booking.appointmentTime}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      AI
                    </Badge>
                  </div>
                ))}
                {recentBookings.length === 0 && <p className="text-center text-gray-500 py-4">No recent AI bookings</p>}
              </div>
            </CardContent>
          </Card>

          {/* AI Agent Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Agent Configuration
              </CardTitle>
              <CardDescription>Current AI agent settings and capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Natural Language Processing</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Appointment Scheduling</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Patient Information Collection</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Doctor Availability Check</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Confirmation Messages</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="pt-4">
                  <Link href="/ai-agent/settings">
                    <Button variant="outline" className="w-full">
                      Configure Agent
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Agent Integration
            </CardTitle>
            <CardDescription>How to connect your existing AI agent with this system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">API Endpoint</h4>
                <code className="text-sm bg-white p-2 rounded border block">POST /api/ai-agent/book-appointment</code>
                <p className="text-sm text-blue-700 mt-2">Use this endpoint to book appointments from your AI agent</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Webhook URL</h4>
                <code className="text-sm bg-white p-2 rounded border block">
                  https://your-domain.com/api/webhooks/ai-agent
                </code>
                <p className="text-sm text-green-700 mt-2">
                  Configure your AI agent to send booking requests to this webhook
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Authentication</h4>
                <p className="text-sm text-purple-700">
                  Use API keys for secure communication between your AI agent and this system
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
