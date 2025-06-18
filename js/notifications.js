export class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.notifications = [];
        this.checkPermission();
    }

    async checkPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return;
        }

        this.permission = Notification.permission;
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            throw new Error('This browser does not support notifications');
        }

        if (this.permission === 'granted') {
            return true;
        }

        if (this.permission === 'denied') {
            throw new Error('Notification permission has been denied');
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            throw error;
        }
    }

    async scheduleNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            throw new Error('Notification permission not granted');
        }

        const defaultOptions = {
            icon: '/assets/icons/notification-icon.png',
            badge: '/assets/icons/notification-badge.png',
            vibrate: [200, 100, 200],
            requireInteraction: true
        };

        const notificationOptions = {
            ...defaultOptions,
            ...options
        };

        try {
            const notification = new Notification(title, notificationOptions);
            this.notifications.push(notification);

            notification.onclose = () => {
                this.removeNotification(notification);
            };

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    removeNotification(notification) {
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }

    async scheduleBedtimeReminder(bedtime) {
        const now = new Date();
        const reminderTime = new Date(bedtime);
        reminderTime.setMinutes(reminderTime.getMinutes() - 30); // 30 minutes before bedtime

        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime();

        setTimeout(async () => {
            try {
                await this.scheduleNotification('Bedtime Reminder', {
                    body: 'It\'s almost time for bed! Start winding down for better sleep quality.',
                    tag: 'bedtime-reminder'
                });
            } catch (error) {
                console.error('Error scheduling bedtime reminder:', error);
            }
        }, timeUntilReminder);
    }

    async scheduleWakeupReminder(wakeTime) {
        const now = new Date();
        const reminderTime = new Date(wakeTime);

        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime();

        setTimeout(async () => {
            try {
                await this.scheduleNotification('Wake Up Time', {
                    body: 'Time to wake up! Start your day with energy.',
                    tag: 'wakeup-reminder'
                });
            } catch (error) {
                console.error('Error scheduling wakeup reminder:', error);
            }
        }, timeUntilReminder);
    }

    async scheduleSleepQualityReminder() {
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(20, 0, 0, 0); // 8:00 PM

        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime();

        setTimeout(async () => {
            try {
                await this.scheduleNotification('Sleep Quality Check', {
                    body: 'How was your sleep last night? Take a moment to track your sleep quality.',
                    tag: 'sleep-quality-reminder'
                });
            } catch (error) {
                console.error('Error scheduling sleep quality reminder:', error);
            }
        }, timeUntilReminder);
    }

    async scheduleSleepHygieneReminder() {
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(21, 0, 0, 0); // 9:00 PM

        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime();

        setTimeout(async () => {
            try {
                await this.scheduleNotification('Sleep Hygiene Reminder', {
                    body: 'Remember to practice good sleep hygiene: dim the lights, avoid screens, and relax.',
                    tag: 'sleep-hygiene-reminder'
                });
            } catch (error) {
                console.error('Error scheduling sleep hygiene reminder:', error);
            }
        }, timeUntilReminder);
    }

    cancelAllNotifications() {
        this.notifications.forEach(notification => {
            notification.close();
        });
        this.notifications = [];
    }

    // Helper method to format time for notifications
    formatTimeForNotification(time) {
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
} 