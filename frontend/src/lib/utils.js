import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function formatTime(date) {
  return format(new Date(date), 'HH:mm');
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function categoryBadgeClass(category) {
  const classes = {
    work: 'bg-blue-100 text-blue-800',
    personal: 'bg-purple-100 text-purple-800',
    study: 'bg-green-100 text-green-800',
  };
  return classes[category] || 'bg-gray-100 text-gray-800';
}

function statusBadgeClass(status) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function formatDeadline(deadline) {
  if (!deadline) return null;
  return format(new Date(deadline), 'MMM dd, yyyy');
}

function getTimeLeft(deadline) {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  if (diff < 0) return 'Overdue';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
}

function priorityBadgeClass(priority) {
  const classes = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-orange-100 text-orange-800',
    low: 'bg-green-100 text-green-800',
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
}

export {
  cn,
  formatTime,
  getGreeting,
  categoryBadgeClass,
  formatDeadline,
  getTimeLeft,
  statusBadgeClass,
  priorityBadgeClass
};
