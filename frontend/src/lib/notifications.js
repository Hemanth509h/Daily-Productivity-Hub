/**
 * Notification Service - Handles browser notifications for task reminders
 */

import { getTimeLeft } from './utils.js';

let navigationCallback = null;

// Register callback for notification clicks
export const setNotificationClickCallback = (callback) => {
  navigationCallback = callback;
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  }

  return false;
};

export const sendNotification = (title, options = {}) => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options,
      });

      // Add click listener to notification
      notification.addEventListener('click', () => {
        window.focus();
        notification.close();
        
        // If this is a task notification and callback is set, navigate to task
        if (options.taskId && navigationCallback) {
          navigationCallback(options.taskId);
        }
      });
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  }
};

export const sendTaskReminderNotification = (task) => {
  sendNotification('Task Reminder', {
    body: `📌 ${task.title || 'Untitled task'}\n⏰ Time to focus!`,
    tag: `task-${task.id}`,
    requireInteraction: true,
    taskId: task.id,
  });

  // Play notification sound
  playNotificationSound();
};

export const sendTaskCompletedNotification = (taskTitle) => {
  sendNotification('Task Completed! 🎉', {
    body: `Great job completing: ${taskTitle}`,
    tag: 'task-completed',
  });

  playNotificationSound();
};

export const sendDeadlineNotification = (task, timeLeft) => {
  sendNotification('Task Deadline Alert', {
    body: `⚠️ ${task.title}\nDeadline: ${timeLeft}`,
    tag: `deadline-${task.id}`,
    requireInteraction: true,
  });

  playNotificationSound();
};

const playNotificationSound = () => {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Fallback: use Web Audio API beep if loading fails
      createBeep();
    });
  } catch (err) {
    console.error('Error playing notification sound:', err);
  }
};

const createBeep = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (err) {
    console.error('Error creating beep:', err);
  }
};

export const checkTaskReminders = (tasks = []) => {
  if (!Array.isArray(tasks)) return;

  const now = new Date();

  tasks.forEach(task => {
    if (task.completed) return;

    if (task.reminderTime) {
      const reminderTime = new Date(task.reminderTime);
      const timeDiff = reminderTime - now;

      // Check if reminder time is within the next 5 minutes and hasn't been notified yet
      if (timeDiff > 0 && timeDiff <= 300000 && !localStorage.getItem(`reminder-${task.id}`)) {
        sendTaskReminderNotification(task);
        localStorage.setItem(`reminder-${task.id}`, 'notified');
      }
      return;
    }

    if (task.deadlineDate) {
      const deadlineTime = new Date(task.deadlineDate);
      const timeDiff = deadlineTime - now;

      // Send a deadline notification for tasks due within 5 minutes if no reminder is configured
      if (timeDiff > 0 && timeDiff <= 300000 && !localStorage.getItem(`deadline-${task.id}`)) {
        sendDeadlineNotification(task, getTimeLeft(task.deadlineDate));
        localStorage.setItem(`deadline-${task.id}`, 'notified');
      }
    }
  });
};

export const clearReminderCache = (taskId) => {
  localStorage.removeItem(`reminder-${taskId}`);
};
