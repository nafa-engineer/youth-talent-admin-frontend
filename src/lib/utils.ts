import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-'
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return '-'
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-'
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return '-'
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('id-ID').format(num)
}

export function formatPercentage(value: number, total: number): string {
  if (!total || total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(1).replace('.', ',')}%`
}

