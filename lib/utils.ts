import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeDiacritics(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\-]+/g, "")
}

