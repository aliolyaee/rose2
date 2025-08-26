import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as dateFnsFormat } from 'date-fns';
import { faIR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock data generation utility (no longer primarily used, but keep for any minor utility)
let mockIdCounter = 0;
export function generateMockId(): string {
  mockIdCounter++;
  return mockIdCounter.toString();
}

// Date formatting utility
export function formatDate(dateString: string, formatString: string = 'PPpp'): string {
  try {
    return dateFnsFormat(new Date(dateString), formatString, { locale: faIR });
  } catch (error) {
    return "تاریخ نامعتبر"; // Invalid Date
  }
}

// Price formatting
export function formatCurrency(amount: number, currency: string = 'IRR'): string {
  // For IRR, it's common to not show decimal places.
  // And use 'ریال' or 'تومان' (though تومان is 1/10 of IRR).
  // Let's assume the amount is in Rials.
  if (currency === 'IRR') {
    return new Intl.NumberFormat('fa-IR', { style: 'currency', currency: 'IRR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  }
  return new Intl.NumberFormat('fa-IR', { style: 'currency', currency }).format(amount);
}

// Debounce function
export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}
