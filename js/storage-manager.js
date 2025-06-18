class StorageManager {
    constructor() {
        this.storageKeys = {
            THEME: 'theme',
            HISTORY: 'calculationHistory',
            PREFERENCES: 'userPreferences',
            NOTIFICATIONS: 'notificationSettings'
        };
    }

    // Theme Management
    getTheme() {
        return localStorage.getItem(this.storageKeys.THEME) || 'light';
    }

    saveTheme(theme) {
        localStorage.setItem(this.storageKeys.THEME, theme);
    }

    // Calculation History
    getCalculationHistory() {
        try {
            const history = localStorage.getItem(this.storageKeys.HISTORY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error reading calculation history:', error);
            return [];
        }
    }

    saveCalculation(calculation) {
        try {
            const history = this.getCalculationHistory();
            history.unshift({
                ...calculation,
                timestamp: new Date().toISOString()
            });
            // Keep only last 10 calculations
            history.splice(10);
            localStorage.setItem(this.storageKeys.HISTORY, JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('Error saving calculation:', error);
            return false;
        }
    }

    clearHistory() {
        localStorage.removeItem(this.storageKeys.HISTORY);
    }

    // User Preferences
    getUserPreferences() {
        try {
            const preferences = localStorage.getItem(this.storageKeys.PREFERENCES);
            return preferences ? JSON.parse(preferences) : this.getDefaultPreferences();
        } catch (error) {
            console.error('Error reading user preferences:', error);
            return this.getDefaultPreferences();
        }
    }

    saveUserPreferences(preferences) {
        try {
            localStorage.setItem(this.storageKeys.PREFERENCES, JSON.stringify(preferences));
            return true;
        } catch (error) {
            console.error('Error saving user preferences:', error);
            return false;
        }
    }

    getDefaultPreferences() {
        return {
            showSleepCycles: true,
            showTips: true,
            use24HourFormat: true,
            ageGroup: 'adult'
        };
    }

    // Notification Settings
    getNotificationSettings() {
        try {
            const settings = localStorage.getItem(this.storageKeys.NOTIFICATIONS);
            return settings ? JSON.parse(settings) : this.getDefaultNotificationSettings();
        } catch (error) {
            console.error('Error reading notification settings:', error);
            return this.getDefaultNotificationSettings();
        }
    }

    saveNotificationSettings(settings) {
        try {
            localStorage.setItem(this.storageKeys.NOTIFICATIONS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving notification settings:', error);
            return false;
        }
    }

    getDefaultNotificationSettings() {
        return {
            enabled: false,
            bedtimeReminder: true,
            wakeupReminder: true,
            reminderTime: 30 // minutes before
        };
    }

    // General Storage Management
    clearAllData() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }

    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    getStorageUsage() {
        try {
            let total = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                total += key.length + value.length;
            }
            return {
                used: total,
                total: 5 * 1024 * 1024, // 5MB typical localStorage limit
                percentage: (total / (5 * 1024 * 1024)) * 100
            };
        } catch (error) {
            console.error('Error calculating storage usage:', error);
            return null;
        }
    }
} 
    }
} 