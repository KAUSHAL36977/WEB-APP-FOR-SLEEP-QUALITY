// Import modules
import { SleepCalculator } from './sleep-calculator.js';
import { SleepAnalytics } from './sleep-analytics.js';
import { ChartVisualizer } from './chart-visualization.js';
import { NotificationManager } from './notifications.js';
import { StorageManager } from './storage-manager.js';

class App {
    constructor() {
        this.calculator = new SleepCalculator();
        this.analytics = new SleepAnalytics();
        this.charts = new ChartVisualizer();
        this.notifications = new NotificationManager();
        this.storage = new StorageManager();
        
        this.initializeApp();
    }

    async initializeApp() {
        // Initialize theme
        this.initializeTheme();
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Load saved data
        await this.loadSavedData();
        
        // Initialize charts
        this.charts.initializeCharts();
        
        // Request notification permission
        await this.notifications.requestPermission();
    }

    initializeTheme() {
        const savedTheme = this.storage.getTheme();
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.storage.saveTheme(newTheme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    initializeEventListeners() {
        // Calculator form submissions
        const bedtimeForm = document.getElementById('bedtimeForm');
        const wakeupForm = document.getElementById('wakeupForm');
        const napForm = document.getElementById('napForm');

        if (bedtimeForm) {
            bedtimeForm.addEventListener('submit', (e) => this.handleBedtimeCalculation(e));
        }

        if (wakeupForm) {
            wakeupForm.addEventListener('submit', (e) => this.handleWakeupCalculation(e));
        }

        if (napForm) {
            napForm.addEventListener('submit', (e) => this.handleNapCalculation(e));
        }

        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button));
        });

        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeBtn = settingsModal?.querySelector('.close-btn');

        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => this.openSettingsModal());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSettingsModal());
        }

        // Save schedule button
        const saveScheduleBtn = document.getElementById('saveSchedule');
        if (saveScheduleBtn) {
            saveScheduleBtn.addEventListener('click', () => this.saveCurrentSchedule());
        }
    }

    async loadSavedData() {
        const settings = await this.storage.getSettings();
        this.updateSettingsUI(settings);
        
        const calculations = await this.storage.getCalculations();
        if (calculations.length > 0) {
            this.updateResultsDisplay(calculations[calculations.length - 1]);
        }
    }

    updateSettingsUI(settings) {
        // Update notification settings
        const bedtimeNotif = document.getElementById('bedtimeNotif');
        const wakeupNotif = document.getElementById('wakeupNotif');
        
        if (bedtimeNotif) bedtimeNotif.checked = settings.notifications.bedtime;
        if (wakeupNotif) wakeupNotif.checked = settings.notifications.wakeup;

        // Update display settings
        const showCycles = document.getElementById('showCycles');
        const showTips = document.getElementById('showTips');
        
        if (showCycles) showCycles.checked = settings.display.showCycles;
        if (showTips) showTips.checked = settings.display.showTips;
    }

    async handleBedtimeCalculation(e) {
        e.preventDefault();
        
        const wakeTime = document.getElementById('wakeTime').value;
        const ageGroup = document.getElementById('ageGroup').value;
        
        const result = this.calculator.calculateBedtime(wakeTime, ageGroup);
        await this.handleCalculationResult(result);
    }

    async handleWakeupCalculation(e) {
        e.preventDefault();
        
        const bedTime = document.getElementById('bedTime').value;
        const ageGroup = document.getElementById('ageGroupWake').value;
        
        const result = this.calculator.calculateWakeupTime(bedTime, ageGroup);
        await this.handleCalculationResult(result);
    }

    async handleNapCalculation(e) {
        e.preventDefault();
        
        const duration = document.getElementById('napDuration').value;
        const result = this.calculator.calculateNapTime(duration);
        await this.handleCalculationResult(result);
    }

    async handleCalculationResult(result) {
        // Save calculation
        await this.storage.saveCalculation(result);
        
        // Update display
        this.updateResultsDisplay(result);
        
        // Update charts
        this.charts.updateCharts(result);
        
        // Schedule notifications if enabled
        if (result.type === 'bedtime') {
            await this.scheduleBedtimeNotifications(result);
        } else if (result.type === 'wakeup') {
            await this.scheduleWakeupNotifications(result);
        }
    }

    updateResultsDisplay(result) {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;

        // Show results section
        resultsSection.style.display = 'block';
        
        // Update sleep cycles visualization
        const cyclesChart = document.getElementById('cyclesChart');
        if (cyclesChart) {
            this.charts.updateSleepCyclesChart(result.cycles);
        }
        
        // Update sleep tips
        const sleepTips = document.getElementById('sleepTips');
        if (sleepTips) {
            sleepTips.innerHTML = this.generateSleepTips(result);
        }
    }

    generateSleepTips(result) {
        const tips = [];
        
        if (result.type === 'bedtime') {
            tips.push(
                `<div class="tip-card">
                    <i class="fas fa-clock"></i>
                    <h3>Bedtime Reminder</h3>
                    <p>Try to go to bed at ${result.bedtime} for optimal sleep cycles.</p>
                </div>`
            );
        }
        
        if (result.type === 'wakeup') {
            tips.push(
                `<div class="tip-card">
                    <i class="fas fa-sun"></i>
                    <h3>Wake-up Time</h3>
                    <p>Set your alarm for ${result.wakeup} to wake up feeling refreshed.</p>
                </div>`
            );
        }
        
        // Add general tips
        tips.push(
            `<div class="tip-card">
                <i class="fas fa-moon"></i>
                <h3>Sleep Environment</h3>
                <p>Keep your bedroom cool, dark, and quiet for optimal sleep.</p>
            </div>`,
            `<div class="tip-card">
                <i class="fas fa-mobile-alt"></i>
                <h3>Digital Detox</h3>
                <p>Avoid screens 1 hour before bedtime for better sleep quality.</p>
            </div>`
        );
        
        return tips.join('');
    }

    switchTab(selectedTab) {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        selectedTab.classList.add('active');
        
        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${selectedTab.dataset.tab}-calc`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    async saveCurrentSchedule() {
        const currentCalculation = await this.storage.getCalculations();
        if (currentCalculation.length > 0) {
            const latest = currentCalculation[currentCalculation.length - 1];
            await this.storage.saveCalculation(latest);
            
            // Show success message
            this.showToast('Schedule saved successfully!', 'success');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        const container = document.querySelector('.toast-container') || document.body;
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    async scheduleBedtimeNotifications(result) {
        const settings = await this.storage.getSettings();
        if (settings.notifications.bedtime) {
            await this.notifications.scheduleBedtimeReminder(result.bedtime);
        }
    }

    async scheduleWakeupNotifications(result) {
        const settings = await this.storage.getSettings();
        if (settings.notifications.wakeup) {
            await this.notifications.scheduleWakeupReminder(result.wakeup);
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 