export class SleepAnalytics {
    constructor() {
        this.calculations = [];
        this.analytics = {
            weekly: [],
            monthly: [],
            trends: {
                averageSleepDuration: 0,
                averageCycles: 0,
                consistencyScore: 0
            }
        };
    }

    loadData(data) {
        this.calculations = data.calculations || [];
        this.updateAnalytics();
    }

    addCalculation(calculation) {
        this.calculations.push(calculation);
        this.updateAnalytics();
    }

    updateAnalytics() {
        this.calculateWeeklyAnalytics();
        this.calculateMonthlyAnalytics();
        this.calculateTrends();
    }

    calculateWeeklyAnalytics() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);

        const weeklyData = this.calculations
            .filter(calc => new Date(calc.timestamp) >= weekStart)
            .map(calc => ({
                date: new Date(calc.timestamp),
                duration: this.calculateSleepDuration(calc),
                cycles: calc.cycles.length,
                quality: this.calculateSleepQuality(calc)
            }));

        this.analytics.weekly = this.groupByDay(weeklyData);
    }

    calculateMonthlyAnalytics() {
        const now = new Date();
        const monthStart = new Date(now);
        monthStart.setDate(now.getDate() - 30);

        const monthlyData = this.calculations
            .filter(calc => new Date(calc.timestamp) >= monthStart)
            .map(calc => ({
                date: new Date(calc.timestamp),
                duration: this.calculateSleepDuration(calc),
                cycles: calc.cycles.length,
                quality: this.calculateSleepQuality(calc)
            }));

        this.analytics.monthly = this.groupByWeek(monthlyData);
    }

    calculateTrends() {
        if (this.calculations.length === 0) return;

        const durations = this.calculations.map(calc => this.calculateSleepDuration(calc));
        const cycles = this.calculations.map(calc => calc.cycles.length);

        this.analytics.trends = {
            averageSleepDuration: this.calculateAverage(durations),
            averageCycles: this.calculateAverage(cycles),
            consistencyScore: this.calculateConsistencyScore()
        };
    }

    calculateSleepDuration(calculation) {
        const bedtime = this.timeToMinutes(calculation.bedtime);
        const wakeTime = this.timeToMinutes(calculation.wakeTime);
        let duration = wakeTime - bedtime;

        // Handle overnight sleep
        if (duration < 0) {
            duration += 24 * 60;
        }

        return duration / 60; // Convert to hours
    }

    calculateSleepQuality(calculation) {
        const cycles = calculation.cycles.length;
        const duration = this.calculateSleepDuration(calculation);
        
        // Simple quality score based on cycle count and duration
        let qualityScore = 0;
        
        // Cycle count quality (optimal: 4-6 cycles)
        if (cycles >= 4 && cycles <= 6) {
            qualityScore += 50;
        } else if (cycles >= 3 && cycles <= 7) {
            qualityScore += 30;
        } else {
            qualityScore += 10;
        }
        
        // Duration quality (optimal: 7-9 hours)
        if (duration >= 7 && duration <= 9) {
            qualityScore += 50;
        } else if (duration >= 6 && duration <= 10) {
            qualityScore += 30;
        } else {
            qualityScore += 10;
        }
        
        return qualityScore;
    }

    calculateConsistencyScore() {
        if (this.calculations.length < 2) return 0;

        const bedtimes = this.calculations.map(calc => 
            this.timeToMinutes(calc.bedtime)
        );

        const wakeTimes = this.calculations.map(calc => 
            this.timeToMinutes(calc.wakeTime)
        );

        const bedtimeVariance = this.calculateVariance(bedtimes);
        const wakeTimeVariance = this.calculateVariance(wakeTimes);

        // Convert variance to a 0-100 score (lower variance = higher score)
        const maxVariance = 720; // 12 hours in minutes
        const bedtimeScore = Math.max(0, 100 - (bedtimeVariance / maxVariance) * 100);
        const wakeTimeScore = Math.max(0, 100 - (wakeTimeVariance / maxVariance) * 100);

        return (bedtimeScore + wakeTimeScore) / 2;
    }

    calculateVariance(values) {
        const mean = this.calculateAverage(values);
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        return this.calculateAverage(squaredDiffs);
    }

    calculateAverage(values) {
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    timeToMinutes(time) {
        return time.hours * 60 + time.minutes;
    }

    groupByDay(data) {
        const grouped = {};
        
        data.forEach(entry => {
            const date = entry.date.toISOString().split('T')[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(entry);
        });

        return Object.entries(grouped).map(([date, entries]) => ({
            date,
            averageDuration: this.calculateAverage(entries.map(e => e.duration)),
            averageCycles: this.calculateAverage(entries.map(e => e.cycles)),
            averageQuality: this.calculateAverage(entries.map(e => e.quality))
        }));
    }

    groupByWeek(data) {
        const grouped = {};
        
        data.forEach(entry => {
            const weekStart = this.getWeekStart(entry.date);
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!grouped[weekKey]) {
                grouped[weekKey] = [];
            }
            grouped[weekKey].push(entry);
        });

        return Object.entries(grouped).map(([week, entries]) => ({
            week,
            averageDuration: this.calculateAverage(entries.map(e => e.duration)),
            averageCycles: this.calculateAverage(entries.map(e => e.cycles)),
            averageQuality: this.calculateAverage(entries.map(e => e.quality))
        }));
    }

    getWeekStart(date) {
        const result = new Date(date);
        result.setDate(date.getDate() - date.getDay());
        return result;
    }

    getAnalytics() {
        return this.analytics;
    }

    getSleepTips() {
        const tips = [];
        const trends = this.analytics.trends;

        // Duration-based tips
        if (trends.averageSleepDuration < 7) {
            tips.push({
                icon: '⏰',
                title: 'Increase Sleep Duration',
                description: 'Your average sleep duration is below recommended levels. Try going to bed 30 minutes earlier.'
            });
        } else if (trends.averageSleepDuration > 9) {
            tips.push({
                icon: '💤',
                title: 'Optimize Sleep Duration',
                description: 'You might be sleeping too much. Try reducing your sleep time by 30 minutes.'
            });
        }

        // Consistency-based tips
        if (trends.consistencyScore < 70) {
            tips.push({
                icon: '🔄',
                title: 'Improve Sleep Consistency',
                description: 'Try to maintain a more consistent sleep schedule by going to bed and waking up at the same time.'
            });
        }

        // Cycle-based tips
        if (trends.averageCycles < 4) {
            tips.push({
                icon: '⚠️',
                title: 'Increase Sleep Cycles',
                description: 'You\'re getting fewer than optimal sleep cycles. Consider adjusting your sleep schedule.'
            });
        }

        return tips;
    }
} 