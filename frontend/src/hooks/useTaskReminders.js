import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { checkTaskReminders, setNotificationClickCallback } from '../lib/notifications';

/**
 * Hook to monitor task reminders and send notifications
 */
export const useTaskReminders = (tasks = []) => {
  const [, navigate] = useLocation();

  const checkReminders = useCallback(() => {
    checkTaskReminders(tasks);
  }, [tasks]);

  useEffect(() => {
    // Set up navigation callback for notification clicks
    setNotificationClickCallback((taskId) => {
      navigate(`/tasks/${taskId}`);
    });

    // Check reminders immediately
    checkReminders();

    // Check every minute for upcoming reminders
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [checkReminders, navigate]);
};

export default useTaskReminders;
