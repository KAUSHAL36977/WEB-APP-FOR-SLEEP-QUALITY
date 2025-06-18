// Import Chart.js
import Chart from 'chart.js/auto';

export class ChartVisualizer {
    constructor() {
        this.charts = {
            sleepCycles: null,
            sleepTracking: null,
            sleepQuality: null
        };
    }

    initializeCharts() {
        this.initializeSleepCyclesChart();
        this.initializeSleepTrackingChart();
        this.initializeSleepQualityChart();
    }

    initializeSleepCyclesChart() {
        const ctx = document.getElementById('sleepCyclesChart').getContext('2d');
        
        this.charts.sleepCycles = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sleep Cycles',
                    data: [],
                    backgroundColor: 'rgba(74, 144, 226, 0.5)',
                    borderColor: 'rgba(74, 144, 226, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Duration (minutes)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Cycle Number'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Sleep Cycle Distribution'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Cycle ${context.label}: ${context.raw} minutes`;
                            }
                        }
                    }
                }
            }
        });
    }

    initializeSleepTrackingChart() {
        const ctx = document.getElementById('sleepTrackingChart').getContext('2d');
        
        this.charts.sleepTracking = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sleep Duration',
                    data: [],
                    borderColor: 'rgba(74, 144, 226, 1)',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Sleep Duration Over Time'
                    }
                }
            }
        });
    }

    initializeSleepQualityChart() {
        const ctx = document.getElementById('sleepQualityChart').getContext('2d');
        
        this.charts.sleepQuality = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Duration', 'Cycles', 'Consistency', 'Quality'],
                datasets: [{
                    label: 'Sleep Quality Metrics',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(74, 144, 226, 0.2)',
                    borderColor: 'rgba(74, 144, 226, 1)',
                    pointBackgroundColor: 'rgba(74, 144, 226, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(74, 144, 226, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Sleep Quality Analysis'
                    }
                }
            }
        });
    }

    updateSleepCycles(cycles) {
        if (!this.charts.sleepCycles) return;

        const labels = cycles.map(cycle => cycle.number);
        const data = cycles.map(cycle => cycle.duration);

        this.charts.sleepCycles.data.labels = labels;
        this.charts.sleepCycles.data.datasets[0].data = data;
        this.charts.sleepCycles.update();
    }

    updateAnalyticsCharts(analytics) {
        this.updateSleepTrackingChart(analytics.weekly);
        this.updateSleepQualityChart(analytics.trends);
    }

    updateSleepTrackingChart(weeklyData) {
        if (!this.charts.sleepTracking) return;

        const labels = weeklyData.map(entry => {
            const date = new Date(entry.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const data = weeklyData.map(entry => entry.averageDuration);

        this.charts.sleepTracking.data.labels = labels;
        this.charts.sleepTracking.data.datasets[0].data = data;
        this.charts.sleepTracking.update();
    }

    updateSleepQualityChart(trends) {
        if (!this.charts.sleepQuality) return;

        // Normalize values to 0-100 scale
        const durationScore = Math.min(100, (trends.averageSleepDuration / 9) * 100);
        const cyclesScore = Math.min(100, (trends.averageCycles / 6) * 100);
        const consistencyScore = trends.consistencyScore;
        const qualityScore = (durationScore + cyclesScore + consistencyScore) / 3;

        this.charts.sleepQuality.data.datasets[0].data = [
            durationScore,
            cyclesScore,
            consistencyScore,
            qualityScore
        ];

        this.charts.sleepQuality.update();
    }

    // Helper method to format time for display
    formatTime(time) {
        return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
    }

    // Method to destroy charts when needed
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
    }
} 