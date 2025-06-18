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
        const ctx = document.getElementById('cyclesChart');
        if (!ctx) return;

        this.charts.sleepCycles = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Cycle 1', 'Cycle 2', 'Cycle 3', 'Cycle 4', 'Cycle 5', 'Cycle 6'],
                datasets: [{
                    label: 'Sleep Cycles',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Duration (minutes)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Sleep Cycles Distribution'
                    }
                }
            }
        });
    }

    initializeSleepTrackingChart() {
        const ctx = document.getElementById('trackingChart');
        if (!ctx) return;

        this.charts.sleepTracking = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sleep Duration',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Sleep Duration Trend'
                    }
                }
            }
        });
    }

    initializeSleepQualityChart() {
        const ctx = document.getElementById('qualityChart');
        if (!ctx) return;

        this.charts.sleepQuality = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Duration', 'Cycles', 'Consistency', 'Quality'],
                datasets: [{
                    label: 'Sleep Quality',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
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

    updateCharts(data) {
        this.updateSleepCyclesChart(data.cycles);
        this.updateSleepTrackingChart(data);
        this.updateSleepQualityChart(data);
    }

    updateSleepCyclesChart(cycles) {
        if (!this.charts.sleepCycles) return;

        const cycleData = cycles.map(cycle => cycle.duration);
        this.charts.sleepCycles.data.datasets[0].data = cycleData;
        this.charts.sleepCycles.update();
    }

    updateSleepTrackingChart(data) {
        if (!this.charts.sleepTracking) return;

        const history = this.getSleepHistory();
        this.charts.sleepTracking.data.labels = history.map(record => record.date);
        this.charts.sleepTracking.data.datasets[0].data = history.map(record => record.duration);
        this.charts.sleepTracking.update();
    }

    updateSleepQualityChart(data) {
        if (!this.charts.sleepQuality) return;

        const qualityData = [
            this.calculateDurationScore(data.totalSleep),
            this.calculateCyclesScore(data.cycles.length),
            this.calculateConsistencyScore(data),
            data.quality || 0
        ];

        this.charts.sleepQuality.data.datasets[0].data = qualityData;
        this.charts.sleepQuality.update();
    }

    calculateDurationScore(duration) {
        // Score based on recommended 7-9 hours for adults
        if (duration >= 7 && duration <= 9) return 100;
        if (duration >= 6 && duration <= 10) return 75;
        if (duration >= 5 && duration <= 11) return 50;
        return 25;
    }

    calculateCyclesScore(cycleCount) {
        // Score based on optimal 5-7 cycles
        if (cycleCount >= 5 && cycleCount <= 7) return 100;
        if (cycleCount >= 4 && cycleCount <= 8) return 75;
        if (cycleCount >= 3 && cycleCount <= 9) return 50;
        return 25;
    }

    calculateConsistencyScore(data) {
        // This would ideally use historical data
        // For now, return a default score
        return 75;
    }

    getSleepHistory() {
        // This would ideally get data from the analytics module
        // For now, return dummy data
        return [
            { date: '2024-03-01', duration: 7.5 },
            { date: '2024-03-02', duration: 8.0 },
            { date: '2024-03-03', duration: 7.0 },
            { date: '2024-03-04', duration: 8.5 },
            { date: '2024-03-05', duration: 7.5 },
            { date: '2024-03-06', duration: 8.0 },
            { date: '2024-03-07', duration: 7.5 }
        ];
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
    }
} 