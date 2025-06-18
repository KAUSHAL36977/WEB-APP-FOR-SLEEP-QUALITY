// Import modules
import { SleepCalculator } from './sleep-calculator.js';
import { SleepAnalytics } from './sleep-analytics.js';
import { ChartVisualizer } from './chart-visualization.js';
import { NotificationManager } from './notifications.js';
import { StorageManager } from './storage-manager.js';

class SleepCalculatorApp {
    constructor() {
        this.sleepCalculator = new SleepCalculator();
        this.sleepAnalytics = new SleepAnalytics();
        this.chartVisualizer = new ChartVisualizer();
        this.notificationManager = new NotificationManager();
        this.storageManager = new StorageManager();

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
        this.initializeCharts();
        
        // Request notification permission
        this.requestNotificationPermission();
    }

    initializeTheme() {
        const savedTheme = this.storageManager.getTheme();
        document.documentElement.setAttribute('data-theme', savedTheme || 'light');
        
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.storageManager.saveTheme(newTheme);
    }

    initializeEventListeners() {
        // Calculator form submission
        const calculatorForm = document.querySelector('.calculator-form');
        calculatorForm.addEventListener('submit', (e) => this.handleCalculatorSubmit(e));

        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button));
        });

        // Time input changes
        const timeInput = document.getElementById('timeInput');
        timeInput.addEventListener('change', () => this.updateRecommendations());
    }

    async handleCalculatorSubmit(event) {
        event.preventDefault();
        
        const ageGroup = document.getElementById('ageGroup').value;
        const timeInput = document.getElementById('timeInput').value;
        
        try {
            const results = await this.sleepCalculator.calculate(ageGroup, timeInput);
            this.displayResults(results);
            this.saveCalculation(results);
        } catch (error) {
            this.showError(error.message);
        }
    }

    switchTab(selectedTab) {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => tab.classList.remove('active'));
        selectedTab.classList.add('active');
        
        // Update calculator mode
        this.sleepCalculator.setMode(selectedTab.dataset.tab);
    }

    async updateRecommendations() {
        const timeInput = document.getElementById('timeInput').value;
        if (!timeInput) return;

        try {
            const recommendations = await this.sleepCalculator.getRecommendations(timeInput);
            this.displayRecommendations(recommendations);
        } catch (error) {
            this.showError(error.message);
        }
    }

    displayResults(results) {
        // Update sleep cycles visualization
        this.chartVisualizer.updateSleepCycles(results.cycles);
        
        // Update recommendations
        this.displayRecommendations(results.recommendations);
        
        // Show success message
        this.showSuccess('Sleep schedule calculated successfully!');
    }

    displayRecommendations(recommendations) {
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-icon">${rec.icon}</div>
                <div class="recommendation-content">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-description">${rec.description}</div>
                </div>
            </div>
        `).join('');
    }

    async loadSavedData() {
        try {
            const savedData = await this.storageManager.loadData();
            if (savedData) {
                this.sleepAnalytics.loadData(savedData);
                this.updateAnalytics();
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    saveCalculation(results) {
        const calculation = {
            timestamp: new Date().toISOString(),
            ...results
        };
        
        this.storageManager.saveCalculation(calculation);
        this.sleepAnalytics.addCalculation(calculation);
        this.updateAnalytics();
    }

    updateAnalytics() {
        const analytics = this.sleepAnalytics.getAnalytics();
        this.chartVisualizer.updateAnalyticsCharts(analytics);
    }

    initializeCharts() {
        this.chartVisualizer.initializeCharts();
    }

    async requestNotificationPermission() {
        try {
            await this.notificationManager.requestPermission();
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <span class="error-icon">⚠️</span>
            <span>${message}</span>
        `;
        
        document.querySelector('.calculator-container').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <span class="success-icon">✅</span>
            <span>${message}</span>
        `;
        
        document.querySelector('.calculator-container').prepend(successDiv);
        setTimeout(() => successDiv.remove(), 5000);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SleepCalculatorApp();
}); 