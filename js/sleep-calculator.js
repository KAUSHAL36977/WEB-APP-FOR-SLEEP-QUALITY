// Sleep duration recommendations by age group (in hours)
const SLEEP_RECOMMENDATIONS = {
    newborn: { min: 14, max: 17 },
    infant: { min: 12, max: 16 },
    toddler: { min: 11, max: 14 },
    preschool: { min: 10, max: 13 },
    school: { min: 9, max: 12 },
    teen: { min: 8, max: 10 },
    adult: { min: 7, max: 9 },
    older: { min: 7, max: 9 },
    senior: { min: 7, max: 8 }
};

// Sleep cycle duration in minutes
const CYCLE_DURATION = 90;
const FALL_ASLEEP_TIME = 15;

export class SleepCalculator {
    constructor() {
        this.mode = 'bedtime'; // 'bedtime' or 'waketime'
    }

    setMode(mode) {
        if (mode !== 'bedtime' && mode !== 'waketime') {
            throw new Error('Invalid calculator mode');
        }
        this.mode = mode;
    }

    async calculate(ageGroup, timeInput) {
        if (!this.validateInputs(ageGroup, timeInput)) {
            throw new Error('Invalid inputs');
        }

        const time = this.parseTime(timeInput);
        const recommendations = SLEEP_RECOMMENDATIONS[ageGroup];
        
        if (this.mode === 'bedtime') {
            return this.calculateBedtime(time, recommendations);
        } else {
            return this.calculateWakeTime(time, recommendations);
        }
    }

    validateInputs(ageGroup, timeInput) {
        return (
            ageGroup in SLEEP_RECOMMENDATIONS &&
            timeInput &&
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeInput)
        );
    }

    parseTime(timeInput) {
        const [hours, minutes] = timeInput.split(':').map(Number);
        return { hours, minutes };
    }

    calculateBedtime(wakeTime, recommendations) {
        const totalMinutes = this.timeToMinutes(wakeTime);
        const recommendedSleep = this.getRecommendedSleepDuration(recommendations);
        const bedtimeMinutes = totalMinutes - recommendedSleep - FALL_ASLEEP_TIME;
        
        const cycles = this.calculateSleepCycles(bedtimeMinutes, wakeTime);
        const recommendations = this.generateRecommendations(cycles, recommendations);

        return {
            bedtime: this.minutesToTime(bedtimeMinutes),
            wakeTime: this.minutesToTime(totalMinutes),
            cycles,
            recommendations
        };
    }

    calculateWakeTime(bedtime, recommendations) {
        const totalMinutes = this.timeToMinutes(bedtime);
        const recommendedSleep = this.getRecommendedSleepDuration(recommendations);
        const wakeTimeMinutes = totalMinutes + recommendedSleep + FALL_ASLEEP_TIME;
        
        const cycles = this.calculateSleepCycles(totalMinutes, this.minutesToTime(wakeTimeMinutes));
        const recommendations = this.generateRecommendations(cycles, recommendations);

        return {
            bedtime: this.minutesToTime(totalMinutes),
            wakeTime: this.minutesToTime(wakeTimeMinutes),
            cycles,
            recommendations
        };
    }

    timeToMinutes(time) {
        return time.hours * 60 + time.minutes;
    }

    minutesToTime(minutes) {
        // Handle negative minutes by adding 24 hours
        if (minutes < 0) {
            minutes += 24 * 60;
        }
        // Handle minutes over 24 hours
        minutes = minutes % (24 * 60);
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        return {
            hours,
            minutes: mins,
            formatted: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
        };
    }

    getRecommendedSleepDuration(recommendations) {
        // Use the average of min and max recommended hours
        const avgHours = (recommendations.min + recommendations.max) / 2;
        return Math.round(avgHours * 60); // Convert to minutes
    }

    calculateSleepCycles(startTime, endTime) {
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        const totalDuration = endMinutes - startMinutes;
        
        const numCycles = Math.floor(totalDuration / CYCLE_DURATION);
        const cycles = [];

        for (let i = 0; i < numCycles; i++) {
            const cycleStart = this.minutesToTime(startMinutes + (i * CYCLE_DURATION));
            const cycleEnd = this.minutesToTime(startMinutes + ((i + 1) * CYCLE_DURATION));
            
            cycles.push({
                number: i + 1,
                start: cycleStart,
                end: cycleEnd,
                duration: CYCLE_DURATION,
                type: this.getCycleType(i)
            });
        }

        return cycles;
    }

    getCycleType(cycleNumber) {
        // Simplified cycle type determination
        // In reality, sleep cycles are more complex
        const cycleTypes = ['light', 'deep', 'REM'];
        return cycleTypes[cycleNumber % 3];
    }

    generateRecommendations(cycles, ageRecommendations) {
        const recommendations = [];

        // Add cycle count recommendation
        recommendations.push({
            icon: '🔄',
            title: 'Sleep Cycles',
            description: `You'll complete ${cycles.length} sleep cycles, which is ${
                cycles.length >= 4 && cycles.length <= 6 ? 'optimal' : 'suboptimal'
            } for your age group.`
        });

        // Add sleep duration recommendation
        const totalSleep = cycles.length * (CYCLE_DURATION / 60);
        recommendations.push({
            icon: '⏰',
            title: 'Sleep Duration',
            description: `You'll sleep for ${totalSleep.toFixed(1)} hours, which is ${
                totalSleep >= ageRecommendations.min && totalSleep <= ageRecommendations.max
                    ? 'within the recommended range'
                    : 'outside the recommended range'
            } for your age group.`
        });

        // Add quality recommendations
        if (cycles.length < 4) {
            recommendations.push({
                icon: '⚠️',
                title: 'Sleep Quality Warning',
                description: 'You may experience sleep deprivation with fewer than 4 cycles.'
            });
        }

        if (cycles.length > 6) {
            recommendations.push({
                icon: '💤',
                title: 'Extended Sleep',
                description: 'You may feel groggy with more than 6 cycles.'
            });
        }

        return recommendations;
    }

    async getRecommendations(timeInput) {
        const time = this.parseTime(timeInput);
        const currentHour = time.hours;
        
        const recommendations = [];

        // Time-based recommendations
        if (currentHour >= 22 || currentHour < 6) {
            recommendations.push({
                icon: '🌙',
                title: 'Optimal Sleep Window',
                description: 'This is within the optimal sleep window for most adults.'
            });
        } else if (currentHour >= 6 && currentHour < 9) {
            recommendations.push({
                icon: '☀️',
                title: 'Morning Alertness',
                description: 'This time aligns with natural morning alertness patterns.'
            });
        }

        // General sleep hygiene recommendations
        recommendations.push({
            icon: '🚰',
            title: 'Hydration',
            description: 'Avoid drinking water 1-2 hours before bedtime.'
        });

        recommendations.push({
            icon: '📱',
            title: 'Screen Time',
            description: 'Reduce screen time 1 hour before bed to improve sleep quality.'
        });

        return recommendations;
    }
} 