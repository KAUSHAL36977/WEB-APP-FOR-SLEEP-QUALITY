export class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.notifications = new Map();
        this.checkPermission();
    }

    async checkPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        this.permission = Notification.permission;
        return this.permission === 'granted';
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    async scheduleNotification(title, options = {}) {
        if (!await this.checkPermission()) {
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: '/images/icon.png',
                badge: '/images/badge.png',
                ...options
            });

            this.notifications.set(notification.id, notification);

            notification.addEventListener('close', () => {
                this.removeNotification(notification.id);
            });

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    }

    removeNotification(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.close();
            this.notifications.delete(id);
        }
    }

    async scheduleBedtimeReminder(bedtime) {
        const bedtimeDate = new Date(`2000-01-01T${bedtime}`);
        const reminderTime = new Date(bedtimeDate.getTime() - (30 * 60000)); // 30 minutes before
        
        const now = new Date();
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        if (timeUntilReminder > 0) {
            setTimeout(() => {
                this.scheduleNotification('Bedtime Reminder', {
                    body: `Time to start your bedtime routine! Your bedtime is in 30 minutes.`,
                    tag: 'bedtime-reminder'
                });
            }, timeUntilReminder);
        }
    }

    async scheduleWakeupReminder(wakeup) {
        const wakeupDate = new Date(`2000-01-01T${wakeup}`);
        const now = new Date();
        const timeUntilWakeup = wakeupDate.getTime() - now.getTime();
        
        if (timeUntilWakeup > 0) {
            setTimeout(() => {
                this.scheduleNotification('Wake-up Time!', {
                    body: 'Good morning! Time to start your day.',
                    tag: 'wakeup-reminder'
                });
            }, timeUntilWakeup);
        }
    }

    async scheduleSleepQualityReminder() {
        const now = new Date();
        const reminderTime = new Date(now);
        reminderTime.setHours(20, 0, 0); // 8:00 PM
        
        if (reminderTime < now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.scheduleNotification('Sleep Quality Check', {
                body: 'How was your sleep last night? Take a moment to rate your sleep quality.',
                tag: 'sleep-quality-reminder'
            });
        }, timeUntilReminder);
    }

    async scheduleSleepHygieneReminder() {
        const now = new Date();
        const reminderTime = new Date(now);
        reminderTime.setHours(21, 0, 0); // 9:00 PM
        
        if (reminderTime < now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.scheduleNotification('Sleep Hygiene Reminder', {
                body: 'Time to prepare for bed! Remember to:\n- Dim the lights\n- Avoid screens\n- Relax your mind',
                tag: 'sleep-hygiene-reminder'
            });
        }, timeUntilReminder);
    }

    cancelAllNotifications() {
        this.notifications.forEach(notification => {
            notification.close();
        });
        this.notifications.clear();
    }

    formatTimeForNotification(time) {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0);
        
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
} 