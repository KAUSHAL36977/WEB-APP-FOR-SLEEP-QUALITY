export class SleepAnalytics {
    constructor() {
        this.data = {
            sleepRecords: [],
            trends: {
                averageSleepDuration: 0,
                averageSleepQuality: 0,
                consistencyScore: 0
            }
        };
    }

    async loadData() {
        try {
            const savedData = localStorage.getItem('sleepAnalytics');
            if (savedData) {
                this.data = JSON.parse(savedData);
            }
        } catch (error) {
            console.error('Error loading sleep analytics data:', error);
        }
    }

    async saveData() {
        try {
            localStorage.setItem('sleepAnalytics', JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving sleep analytics data:', error);
        }
    }

    addSleepRecord(record) {
        this.data.sleepRecords.push({
            ...record,
            date: new Date().toISOString(),
            quality: this.calculateSleepQuality(record)
        });
        
        this.updateTrends();
        this.saveData();
    }

    calculateSleepQuality(record) {
        let quality = 0;
        
        // Check sleep duration
        const recommendedHours = this.getRecommendedSleepHours(record.ageGroup);
        const sleepHours = record.totalSleep;
        
        if (sleepHours >= recommendedHours.min && sleepHours <= recommendedHours.max) {
            quality += 40; // 40% weight for duration
        } else if (sleepHours >= recommendedHours.min - 1 && sleepHours <= recommendedHours.max + 1) {
            quality += 20;
        }
        
        // Check sleep cycles
        const cycleCount = record.cycles.length;
        if (cycleCount >= 5 && cycleCount <= 7) {
            quality += 40; // 40% weight for cycles
        } else if (cycleCount >= 4 && cycleCount <= 8) {
            quality += 20;
        }
        
        // Check bedtime consistency
        if (this.isConsistentBedtime(record)) {
            quality += 20; // 20% weight for consistency
        }
        
        return quality;
    }

    getRecommendedSleepHours(ageGroup) {
        const recommendations = {
            'child': { min: 9, max: 11 },
            'teen': { min: 8, max: 10 },
            'adult': { min: 7, max: 9 },
            'senior': { min: 7, max: 8 }
        };
        
        return recommendations[ageGroup] || recommendations.adult;
    }

    isConsistentBedtime(record) {
        if (this.data.sleepRecords.length < 2) return true;
        
        const lastRecord = this.data.sleepRecords[this.data.sleepRecords.length - 1];
        const lastBedtime = new Date(`2000-01-01T${lastRecord.bedtime}`);
        const currentBedtime = new Date(`2000-01-01T${record.bedtime}`);
        
        const diffHours = Math.abs(lastBedtime - currentBedtime) / (1000 * 60 * 60);
        return diffHours <= 1; // Consider consistent if within 1 hour
    }

    updateTrends() {
        if (this.data.sleepRecords.length === 0) return;
        
        // Calculate average sleep duration
        const totalDuration = this.data.sleepRecords.reduce((sum, record) => sum + record.totalSleep, 0);
        this.data.trends.averageSleepDuration = totalDuration / this.data.sleepRecords.length;
        
        // Calculate average sleep quality
        const totalQuality = this.data.sleepRecords.reduce((sum, record) => sum + record.quality, 0);
        this.data.trends.averageSleepQuality = totalQuality / this.data.sleepRecords.length;
        
        // Calculate consistency score
        this.data.trends.consistencyScore = this.calculateConsistencyScore();
    }

    calculateConsistencyScore() {
        if (this.data.sleepRecords.length < 2) return 100;
        
        let consistentDays = 0;
        for (let i = 1; i < this.data.sleepRecords.length; i++) {
            const prev = this.data.sleepRecords[i - 1];
            const curr = this.data.sleepRecords[i];
            
            if (this.isConsistentBedtime(curr)) {
                consistentDays++;
            }
        }
        
        return (consistentDays / (this.data.sleepRecords.length - 1)) * 100;
    }

    getSleepTrends() {
        return {
            averageSleepDuration: this.data.trends.averageSleepDuration.toFixed(1),
            averageSleepQuality: Math.round(this.data.trends.averageSleepQuality),
            consistencyScore: Math.round(this.data.trends.consistencyScore)
        };
    }

    getSleepHistory(days = 7) {
        const now = new Date();
        const cutoff = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        
        return this.data.sleepRecords
            .filter(record => new Date(record.date) >= cutoff)
            .map(record => ({
                date: new Date(record.date).toLocaleDateString(),
                duration: record.totalSleep,
                quality: record.quality,
                bedtime: record.bedtime,
                wakeup: record.wakeup
            }));
    }

    getSleepQualityDistribution() {
        const distribution = {
            excellent: 0, // 80-100
            good: 0,     // 60-79
            fair: 0,     // 40-59
            poor: 0      // 0-39
        };
        
        this.data.sleepRecords.forEach(record => {
            if (record.quality >= 80) distribution.excellent++;
            else if (record.quality >= 60) distribution.good++;
            else if (record.quality >= 40) distribution.fair++;
            else distribution.poor++;
        });
        
        return distribution;
    }

    getSleepDurationTrend() {
        return this.data.sleepRecords
            .slice(-7) // Last 7 records
            .map(record => ({
                date: new Date(record.date).toLocaleDateString(),
                duration: record.totalSleep
            }));
    }

    getSleepQualityTrend() {
        return this.data.sleepRecords
            .slice(-7) // Last 7 records
            .map(record => ({
                date: new Date(record.date).toLocaleDateString(),
                quality: record.quality
            }));
    }

    clearData() {
        this.data = {
            sleepRecords: [],
            trends: {
                averageSleepDuration: 0,
                averageSleepQuality: 0,
                consistencyScore: 0
            }
        };
        this.saveData();
    }
} 