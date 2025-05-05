import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return `$${amount.toFixed(0)}`;
  }
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function calculateValuation(askAmount: number, equityPercentage: number): number {
  return (askAmount / equityPercentage) * 100;
}

export function getStatusColor(status: string): {
  bg: string;
  text: string;
  icon?: string;
} {
  switch (status.toLowerCase()) {
    case "active":
      return { bg: "bg-green-100", text: "text-green-800", icon: "fa-circle" };
    case "interested":
      return { bg: "bg-blue-100", text: "text-blue-800", icon: "fa-handshake" };
    case "reviewing":
      return { bg: "bg-yellow-100", text: "text-yellow-800", icon: "fa-clock" };
    case "completed":
      return { bg: "bg-green-100", text: "text-green-800", icon: "fa-check" };
    case "pending":
      return { bg: "bg-gray-100", text: "text-gray-800", icon: "fa-hourglass" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-500" };
  }
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit'
  });
}

export function generateAvatarFallback(name: string): string {
  if (!name) return "US";
  
  const parts = name.split(" ");
  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function calculateTimeLeft(dateString: string): string {
  const targetDate = new Date(dateString);
  const now = new Date();
  
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 30) return `${diffDays} days`;
  
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
}
