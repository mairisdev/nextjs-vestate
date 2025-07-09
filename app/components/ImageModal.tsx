"use client"

import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from "@radix-ui/react-dialog"
import Image from "next/image"

export default function ImageModal({
  open,
  imageUrl,
  onClose
}: {
  open: boolean
  imageUrl: string
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/60 z-50" />
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-4 max-w-3xl w-full rounded-lg bg-white shadow-lg">
          <DialogTitle className="sr-only">Atsauksmes attēls</DialogTitle>
          <Image
            src={imageUrl}
            alt="Atsauksmes attēls"
            width={1200}
            height={800}
            className="w-full h-auto object-contain rounded-md"
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
