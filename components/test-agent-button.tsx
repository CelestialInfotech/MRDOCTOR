"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import { TestAgentModal } from "./test-agent-modal"

export function TestAgentButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-black hover:bg-gray-800 text-white">
        <Bot className="h-4 w-4 mr-2" />
        Test Agent
      </Button>
      <TestAgentModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
