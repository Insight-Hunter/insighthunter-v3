export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission; // 'denied'
}

export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  try {
    return new Notification(title, {
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      ...options,
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
    return null;
  }
}

export function showToast(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
  duration: number = 3000
): void {
  const toast = document.createElement('div');
  const colors: Record<string, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600',
  };

  toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }, duration);
}
