"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

export function SentimentAnalysis({ sentiment, message }) {
  if (!sentiment || !message) return null

  const getIcon = () => {
    switch (sentiment) {
      case "positive":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "negative":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "neutral":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const getBgColor = () => {
    switch (sentiment) {
      case "positive":
        return "bg-green-50"
      case "negative":
        return "bg-amber-50"
      case "neutral":
        return "bg-blue-50"
      default:
        return "bg-gray-50"
    }
  }

  return (
    <Card className={`border-0 ${getBgColor()}`}>
      <CardContent className="p-4 flex items-start space-x-3">
        {getIcon()}
        <p className="text-sm">{message}</p>
      </CardContent>
    </Card>
  )
}
