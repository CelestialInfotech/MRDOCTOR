import { AlertCircle } from "lucide-react"

interface FormErrorProps {
  error: string
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null

  return (
    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  )
}
