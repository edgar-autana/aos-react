import { RFQ } from '@/types/rfq/rfq'

export function getRfqDisplayName(rfq: RFQ): string {
  return rfq.name || rfq.slug_name || 'Unnamed RFQ'
}

export function getRfqStatusColor(status: string | null): string {
  if (!status) return 'bg-gray-100 text-gray-800'
  // Since status is now a UUID, we'll use a generic approach
  // You might want to create a lookup table for status UUIDs to status names
  return 'bg-blue-100 text-blue-800'
}

export function getRfqStatusText(status: string | null): string {
  if (!status) return 'Unknown'
  // Since status is now a UUID, you'll need to map this to actual status names
  // For now, return the UUID or create a lookup function
  return status// Show first 8 chars of UUID
}

export function getRfqPriorityColor(priority: boolean | null): string {
  if (priority === true) {
    return 'bg-red-100 text-red-800' // High priority
  } else if (priority === false) {
    return 'bg-green-100 text-green-800' // Normal priority
  } else {
    return 'bg-gray-100 text-gray-800' // Unknown
  }
}

export function getRfqPriorityText(priority: boolean | null): string {
  if (priority === true) {
    return 'YES'
  } else if (priority === false) {
    return 'NO'
  } else {
    return 'Unknown'
  }
}

export function formatRfqDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    return 'Invalid Date'
  }
}

export function formatRfqCurrency(amount: number | null, currency: string | null = 'USD'): string {
  if (amount === null || amount === undefined) return 'N/A'
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount)
  } catch (error) {
    return `${amount} ${currency}`
  }
}

export function getRfqDaysUntilDue(dueDate: string | null): number | null {
  if (!dueDate) return null
  
  try {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  } catch (error) {
    return null
  }
}

export function getRfqDueDateStatus(dueDate: string | null): 'overdue' | 'due-soon' | 'on-time' | 'no-date' {
  const daysUntilDue = getRfqDaysUntilDue(dueDate)
  
  if (daysUntilDue === null) return 'no-date'
  if (daysUntilDue < 0) return 'overdue'
  if (daysUntilDue <= 3) return 'due-soon'
  return 'on-time'
}

export function getRfqDueDateColor(dueDate: string | null): string {
  const status = getRfqDueDateStatus(dueDate)
  
  switch (status) {
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'due-soon':
      return 'bg-yellow-100 text-yellow-800'
    case 'on-time':
      return 'bg-green-100 text-green-800'
    case 'no-date':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function isRfqOverdue(dueDate: string | null): boolean {
  const daysUntilDue = getRfqDaysUntilDue(dueDate)
  return daysUntilDue !== null && daysUntilDue < 0
}

export function isRfqDueSoon(dueDate: string | null): boolean {
  const daysUntilDue = getRfqDaysUntilDue(dueDate)
  return daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3
}

export function getRfqProgress(rfq: RFQ): number {
  // Since status is now a UUID, you'll need to map status UUIDs to progress values
  // This is a placeholder - implement based on your status mapping
  if (!rfq.status) return 0
  return 50 // Default progress
}

export function canEditRfq(rfq: RFQ): boolean {
  // Since status is now a UUID, you'll need to implement this based on your status mapping
  // For now, allow editing if enabled
  return rfq.enabled === true
}

export function canDeleteRfq(rfq: RFQ): boolean {
  // Since status is now a UUID, you'll need to implement this based on your status mapping
  // For now, allow deletion if enabled
  return rfq.enabled === true
}

export function getRfqStatusOptions(): { value: string; label: string }[] {
  // Since status is now a UUID, you'll need to populate this with actual status UUIDs and names
  // This is a placeholder - replace with actual status mapping from your database
  return [
    { value: '', label: 'Unknown Status' }
  ]
}

export function getRfqPriorityOptions(): { value: boolean; label: string }[] {
  return [
    { value: false, label: 'Normal' },
    { value: true, label: 'High' }
  ]
} 