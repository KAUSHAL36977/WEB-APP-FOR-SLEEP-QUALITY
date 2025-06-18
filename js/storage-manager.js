export class StorageManager {
    constructor() {
        this.STORAGE_KEYS = {
            CALCULATIONS: 'sleep_calculator_calculations',
            THEME: 'sleep_calculator_theme',
            SETTINGS: 'sleep_calculator_settings',
            NOTIFICATIONS: 'sleep_calculator_notifications'
        };

        this.DEFAULT_SETTINGS = {
            notifications: {
                bedtime: true,
                wakeup: true,
                quality: true,
                hygiene: true
            },
            reminders: {
                bedtimeOffset: 30, // minutes before bedtime
                wakeupOffset: 0,   // minutes before wakeup
                qualityCheck: '20:00', // 8:00 PM
                hygieneReminder: '21:00' // 9:00 PM
            },
            display: {
                showCycles: true,
                showQuality: true,
                showTrends: true
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
            calculations.push(calculation);
            localStorage.setItem(this.STORAGE_KEYS.CALCULATIONS, JSON.stringify(calculations));
            return true;
        } catch (error) {
            console.error('Error saving calculation:', error);
            return false;
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
            return true;
        } catch (error) {
            console.error('Error clearing calculations:', error);
            return false;
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
            const currentSettings = await this.getSettings();
            const updatedSettings = { ...currentSettings, ...settings };
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    async resetSettings() {
        try {
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.DEFAULT_SETTINGS));
            return true;
        } catch (error) {
            console.error('Error resetting settings:', error);
            return false;
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
            const settings = await this.getSettings();
            settings.notifications = preferences;
            await this.saveSettings(settings);
            return true;
        } catch (error) {
            console.error('Error saving notification preferences:', error);
            return false;
        }
    }

    // Data Export/Import
    async exportData() {
        try {
            const data = {
                calculations: await this.getCalculations(),
                settings: await this.getSettings(),
                theme: this.getTheme(),
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `sleep-calculator-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            return false;
        }
    }

    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate imported data
            if (!this.validateImportData(data)) {
                throw new Error('Invalid data format');
            }

            // Import data
            if (data.calculations) {
                localStorage.setItem(this.STORAGE_KEYS.CALCULATIONS, JSON.stringify(data.calculations));
            }

            if (data.settings) {
                localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
            }

            if (data.theme) {
                this.saveTheme(data.theme);
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    validateImportData(data) {
        // Basic validation of imported data structure
        return (
            data &&
            typeof data === 'object' &&
            (!data.calculations || Array.isArray(data.calculations)) &&
            (!data.settings || typeof data.settings === 'object') &&
            (!data.theme || typeof data.theme === 'string')
        );
    }

    // Storage Management
    async clearAllData() {
        try {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }

    getStorageUsage() {
        try {
            let totalSize = 0;
            Object.values(this.STORAGE_KEYS).forEach(key => {
                const value = localStorage.getItem(key);
                if (value) {
                    totalSize += value.length * 2; // Approximate size in bytes
                }
            });
            return totalSize;
        } catch (error) {
            console.error('Error calculating storage usage:', error);
            return 0;
        }
    }

    // Helper Methods
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTime(time) {
        return new Date(time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
} 