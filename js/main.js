// Import modules
import { SleepCalculator } from './sleep-calculator.js';
import { SleepAnalytics } from './sleep-analytics.js';
import { ChartVisualizer } from './chart-visualization.js';
import { NotificationManager } from './notifications.js';
import { StorageManager } from './storage-manager.js';

// Theme Management
class ThemeManager {
    constructor() {
        this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.initTheme();
        this.listenToSystemChanges();
    }

    initTheme() {
        // Check local storage first
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Use system preference
            this.setTheme(this.darkModeMediaQuery.matches ? 'dark' : 'light');
        }
    }

    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(currentTheme === 'light' ? 'dark' : 'light');
    }

    listenToSystemChanges() {
        this.darkModeMediaQuery.addEventListener('change', (e) => {
            this.setTheme(e.matches ? 'dark' : 'light');
        });
    }
}

// App State Management
class AppState {
    constructor() {
        this.currentTab = 'bedtime';
        this.lastCalculation = null;
    }

    setCurrentTab(tab) {
        this.currentTab = tab;
    }

    setLastCalculation(calculation) {
        this.lastCalculation = calculation;
    }
}

class App {
    constructor() {
        this.calculator = new SleepCalculator();
        this.analytics = new SleepAnalytics();
        this.charts = new ChartVisualizer();
        this.notifications = new NotificationManager();
        this.storage = new StorageManager();
        this.themeManager = new ThemeManager();
        this.state = new AppState();
        
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
            themeToggle.addEventListener('click', () => this.themeManager.toggleTheme());
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

        // Theme toggle
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 't') {
                this.themeManager.toggleTheme();
            }
        });

        // Save calculation results
        document.addEventListener('calculation-complete', (e) => {
            this.state.setLastCalculation(e.detail);
            this.saveToHistory(e.detail);
        });
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

    saveToHistory(calculation) {
        const history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
        history.unshift({
            ...calculation,
            timestamp: new Date().toISOString()
        });
        // Keep only last 10 calculations
        history.splice(10);
        localStorage.setItem('calculationHistory', JSON.stringify(history));
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();

    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', (e) => {
            const tip = document.createElement('div');
            tip.className = 'tooltip';
            tip.textContent = e.target.dataset.tooltip;
            document.body.appendChild(tip);

            const rect = e.target.getBoundingClientRect();
            tip.style.top = `${rect.bottom + 10}px`;
            tip.style.left = `${rect.left + (rect.width / 2) - (tip.offsetWidth / 2)}px`;

            e.target.addEventListener('mouseleave', () => {
                tip.remove();
            }, { once: true });
        });
    });
}); 