"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"

type AlertMessageProps = {
  type: "success" | "error"
  message: string
  onClose?: () => void
}

export default function AlertMessage({ type, message, onClose }: AlertMessageProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  const baseStyle =
    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-md w-fit"

  return (
    <div
      className={`${baseStyle} ${
        type === "success"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
      {message}
    </div>
  )
}
