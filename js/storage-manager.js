export class StorageManager {
    constructor() {
        this.STORAGE_KEYS = {
            CALCULATIONS: 'sleep_calculations',
            THEME: 'sleep_theme',
            SETTINGS: 'sleep_settings',
            NOTIFICATIONS: 'sleep_notifications'
        };

        this.DEFAULT_SETTINGS = {
            notifications: {
                bedtime: true,
                wakeup: true,
                quality: true,
                hygiene: true
            },
            reminders: {
                bedtime: 30, // minutes before
                wakeup: 0,   // minutes before
                quality: '20:00', // 8:00 PM
                hygiene: '21:00'  // 9:00 PM
            },
            display: {
                showCycles: true,
                showTips: true,
                showAnalytics: true
            }
        };
    }

    // Theme Management
    getTheme() {
        return localStorage.getItem(this.STORAGE_KEYS.THEME) || 'light';
    }

    saveTheme(theme) {
        localStorage.setItem(this.STORAGE_KEYS.THEME, theme);
    }

    // Calculations Management
    async saveCalculation(calculation) {
        try {
            const calculations = await this.getCalculations();
            calculations.push({
                ...calculation,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem(this.STORAGE_KEYS.CALCULATIONS, JSON.stringify(calculations));
        } catch (error) {
            console.error('Error saving calculation:', error);
        }
    }

    async getCalculations() {
        try {
            const calculations = localStorage.getItem(this.STORAGE_KEYS.CALCULATIONS);
            return calculations ? JSON.parse(calculations) : [];
        } catch (error) {
            console.error('Error getting calculations:', error);
            return [];
        }
    }

    async clearCalculations() {
        try {
            localStorage.removeItem(this.STORAGE_KEYS.CALCULATIONS);
        } catch (error) {
            console.error('Error clearing calculations:', error);
        }
    }

    // Settings Management
    async getSettings() {
        try {
            const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
            return settings ? JSON.parse(settings) : this.DEFAULT_SETTINGS;
        } catch (error) {
            console.error('Error getting settings:', error);
            return this.DEFAULT_SETTINGS;
        }
    }

    async saveSettings(settings) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    async resetSettings() {
        try {
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.DEFAULT_SETTINGS));
        } catch (error) {
            console.error('Error resetting settings:', error);
        }
    }

    // Notification Preferences
    async getNotificationPreferences() {
        try {
            const preferences = localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS);
            return preferences ? JSON.parse(preferences) : this.DEFAULT_SETTINGS.notifications;
        } catch (error) {
            console.error('Error getting notification preferences:', error);
            return this.DEFAULT_SETTINGS.notifications;
        }
    }

    async saveNotificationPreferences(preferences) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving notification preferences:', error);
        }
    }

    // Data Export/Import
    async exportData() {
        try {
            const data = {
                calculations: await this.getCalculations(),
                settings: await this.getSettings(),
                notifications: await this.getNotificationPreferences(),
                theme: this.getTheme(),
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `sleep-calculator-backup-${this.formatDate(new Date())}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!this.validateImportData(data)) {
                throw new Error('Invalid import data format');
            }
            
            if (data.calculations) {
                localStorage.setItem(this.STORAGE_KEYS.CALCULATIONS, JSON.stringify(data.calculations));
            }
            
            if (data.settings) {
                localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
            }
            
            if (data.notifications) {
                localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
            }
            
            if (data.theme) {
                this.saveTheme(data.theme);
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }

    validateImportData(data) {
        return (
            data &&
            typeof data === 'object' &&
            (!data.calculations || Array.isArray(data.calculations)) &&
            (!data.settings || typeof data.settings === 'object') &&
            (!data.notifications || typeof data.notifications === 'object') &&
            (!data.theme || typeof data.theme === 'string')
        );
    }

    // Storage Management
    async clearAllData() {
        try {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error clearing all data:', error);
        }
    }

    getStorageUsage() {
        try {
            let total = 0;
            Object.values(this.STORAGE_KEYS).forEach(key => {
                const value = localStorage.getItem(key);
                if (value) {
                    total += value.length * 2; // Approximate size in bytes
                }
            });
            return total;
        } catch (error) {
            console.error('Error calculating storage usage:', error);
            return 0;
        }
    }

    // Helper Methods
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatTime(time) {
        return time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
} 