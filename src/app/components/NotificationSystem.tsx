import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

export function NotificationSystem() {
  useEffect(() => {
    // Listen for queue updates in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sqms_notification') {
        const notification = JSON.parse(e.newValue || '{}');
        if (notification.message) {
          switch (notification.type) {
            case 'success':
              toast.success(notification.message);
              break;
            case 'error':
              toast.error(notification.message);
              break;
            case 'info':
              toast.info(notification.message);
              break;
            default:
              toast(notification.message);
          }
          // Clear the notification
          localStorage.removeItem('sqms_notification');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return <Toaster position="top-right" richColors expand={true} />;
}

// Helper function to show notifications
export const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'default' = 'default') => {
  // For same-window notifications
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'info':
      toast.info(message);
      break;
    default:
      toast(message);
  }

  // Also store in localStorage for cross-tab notifications
  localStorage.setItem('sqms_notification', JSON.stringify({ message, type }));
};
