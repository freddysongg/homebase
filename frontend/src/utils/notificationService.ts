interface NotificationPreferences {
  inApp: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private preferences: NotificationPreferences = {
    inApp: true
  };

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  setPreferences(preferences: NotificationPreferences) {
    this.preferences = preferences;
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }

  async sendNotification(type: 'inApp', title: string, message: string) {
    if (!this.preferences[type]) {
      console.log(`${type} notifications are disabled`);
      return;
    }

    this.showInAppNotification(title, message);
  }

  private showInAppNotification(title: string, message: string) {
    // Create and show a toast notification
    const toast = document.createElement('div');
    toast.className =
      'fixed bottom-4 right-4 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.innerHTML = `
      <h4 class="font-bold">${title}</h4>
      <p>${message}</p>
    `;

    document.body.appendChild(toast);

    // Remove the toast after 5 seconds
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 5000);
  }
}

// Add styles for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(1rem); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(1rem); }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-fade-out {
    animation: fadeOut 0.3s ease-out;
  }
`;
document.head.appendChild(style);

export const notificationService = NotificationService.getInstance();
