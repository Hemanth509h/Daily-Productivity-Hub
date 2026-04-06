import { format, formatDistanceToNow, isPast, isToday, isTomorrow, differenceInDays, differenceInHours } from 'date-fns';

export function formatDeadline(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isPast(date) && !isToday(date)) {
    const days = Math.abs(differenceInDays(new Date(), date));
    return { label: `${days}d overdue`, color: 'text-red-600', bg: 'bg-red-50' };
  }
  if (isToday(date)) {
    const hours = differenceInHours(date, new Date());
    if (hours <= 0) return { label: 'Due now', color: 'text-red-600', bg: 'bg-red-50' };
    return { label: `${hours}h left`, color: 'text-amber-600', bg: 'bg-amber-50' };
  }
  if (isTomorrow(date)) {
    return { label: 'Tomorrow', color: 'text-amber-600', bg: 'bg-amber-50' };
  }
  const days = differenceInDays(date, new Date());
  if (days <= 3) return { label: `${days} days left`, color: 'text-amber-600', bg: 'bg-amber-50' };
  if (days <= 7) return { label: `${days} days left`, color: 'text-green-600', bg: 'bg-green-50' };
  return { label: format(date, 'MMM d, yyyy'), color: 'text-muted-foreground', bg: '' };
}

export function formatTime(dateStr) {
  if (!dateStr) return null;
  return format(new Date(dateStr), 'h:mm a');
}

export function formatDate(dateStr) {
  if (!dateStr) return null;
  return format(new Date(dateStr), 'MMM d, yyyy');
}

export function formatDateTime(dateStr) {
  if (!dateStr) return null;
  return format(new Date(dateStr), 'MMM d, yyyy • HH:mm');
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function categoryBadgeClass(category) {
  const map = { work: 'badge-work', personal: 'badge-personal', study: 'badge-study' };
  return map[category] || 'badge-work';
}

export function priorityBadgeClass(priority) {
  const map = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
  return map[priority] || 'badge-medium';
}

export function statusBadgeClass(status) {
  const map = { overdue: 'badge-overdue', pending: 'badge-pending', completed: 'badge-completed' };
  return map[status] || 'badge-pending';
}
