export class NotificationManager {
    constructor() {
        this.hasPermission = false;
        this.checkPermission();
        this.activeNotifications = new Set();
    }

    async checkPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.hasPermission = true;
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.hasPermission = permission === 'granted';
            return this.hasPermission;
        }

        return false;
    }

    async requestPermission() {
        return await this.checkPermission();
    }

    scheduleNotification(time, title, options = {}) {
        if (!this.hasPermission) {
            console.log('Notification permission not granted');
            return null;
        }

        const now = new Date();
        const notificationTime = new Date(time);

        if (notificationTime <= now) {
            console.log('Cannot schedule notification for past time');
            return null;
        }

        const timeoutId = setTimeout(() => {
            this.showNotification(title, options);
        }, notificationTime.getTime() - now.getTime());

        this.activeNotifications.add(timeoutId);
        return timeoutId;
    }

    showNotification(title, options = {}) {
        if (!this.hasPermission) {
            console.log('Notification permission not granted');
            return null;
        }

        const defaultOptions = {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            silent: false,
            requireInteraction: true
        };

        const notification = new Notification(title, { ...defaultOptions, ...options });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    }

    cancelNotification(timeoutId) {
        if (this.activeNotifications.has(timeoutId)) {
            clearTimeout(timeoutId);
            this.activeNotifications.delete(timeoutId);
            return true;
        }
        return false;
    }

    cancelAllNotifications() {
        this.activeNotifications.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.activeNotifications.clear();
    }

    scheduleBedtimeReminder(bedtime, reminderMinutes = 30) {
        const reminderTime = new Date(bedtime);
        reminderTime.setMinutes(reminderTime.getMinutes() - reminderMinutes);

        return this.scheduleNotification(
            reminderTime,
            'Bedtime Reminder',
            {
                body: `Time to start preparing for bed! Your target bedtime is ${bedtime.toLocaleTimeString()}.`,
                tag: 'bedtime-reminder',
                data: { type: 'bedtime', time: bedtime }
            }
        );
    }

    scheduleWakeupReminder(wakeupTime) {
        return this.scheduleNotification(
            wakeupTime,
            'Wake Up Time!',
            {
                body: 'Rise and shine! It\'s time to wake up refreshed.',
                tag: 'wakeup-reminder',
                data: { type: 'wakeup', time: wakeupTime }
            }
        );
    }

    scheduleNapReminder(napDuration) {
        const now = new Date();
        const wakeTime = new Date(now.getTime() + napDuration * 60000);

        return this.scheduleNotification(
            wakeTime,
            'Nap Time Over',
            {
                body: 'Time to wake up from your power nap!',
                tag: 'nap-reminder',
                data: { type: 'nap', duration: napDuration }
            }
        );
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