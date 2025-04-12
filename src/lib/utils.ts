
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isThisYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date into a relative time string (e.g. '2 days ago')
 * or a standard date format if older than a week
 */
export function formatDateRelative(date: string | Date | null): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    // For recent dates, use relative format
    if (diffDays < 7) {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }
    
    // For older dates in the current year, show month and day
    if (isThisYear(dateObj)) {
      return format(dateObj, 'MMM d');
    }
    
    // For dates in previous years, include the year
    return format(dateObj, 'MMM d, yyyy');
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
}
