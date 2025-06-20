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
        this.CYCLE_DURATION = 90; // minutes
        this.AGE_GROUPS = {
            'child': { cycles: 9, minSleep: 10 },
            'teen': { cycles: 8, minSleep: 9 },
            'adult': { cycles: 6, minSleep: 7 },
            'senior': { cycles: 5, minSleep: 6 }
        };
        this.sleepCycleDuration = 90; // minutes
        this.fallAsleepTime = 15; // minutes
        this.cyclesForGoodSleep = [5, 6]; // recommended number of sleep cycles
    }

    calculateBedtime(wakeTime, ageGroup) {
        const wakeDate = new Date(`2000-01-01T${wakeTime}`);
        const ageInfo = this.AGE_GROUPS[ageGroup];
        
        // Calculate total sleep time needed
        const totalSleepMinutes = ageInfo.cycles * this.CYCLE_DURATION;
        
        // Calculate bedtime
        const bedtime = new Date(wakeDate.getTime() - (totalSleepMinutes * 60000));
        
        // Calculate sleep cycles
        const cycles = this.generateSleepCycles(bedtime, wakeDate);
        
        return {
            type: 'bedtime',
            bedtime: this.formatTime(bedtime),
            wakeup: wakeTime,
            cycles: cycles,
            totalSleep: totalSleepMinutes / 60,
            ageGroup: ageGroup
        };
    }

    calculateWakeupTime(bedTime, ageGroup) {
        const bedDate = new Date(`2000-01-01T${bedTime}`);
        const ageInfo = this.AGE_GROUPS[ageGroup];
        
        // Calculate total sleep time needed
        const totalSleepMinutes = ageInfo.cycles * this.CYCLE_DURATION;
        
        // Calculate wake-up time
        const wakeup = new Date(bedDate.getTime() + (totalSleepMinutes * 60000));
        
        // Calculate sleep cycles
        const cycles = this.generateSleepCycles(bedDate, wakeup);
        
        return {
            type: 'wakeup',
            bedtime: bedTime,
            wakeup: this.formatTime(wakeup),
            cycles: cycles,
            totalSleep: totalSleepMinutes / 60,
            ageGroup: ageGroup
        };
    }

    calculateNapTime(duration) {
        const now = new Date();
        const napEnd = new Date(now.getTime() + (duration * 60000));
        
        return {
            type: 'nap',
            start: this.formatTime(now),
            end: this.formatTime(napEnd),
            duration: duration,
            cycles: this.generateNapCycles(now, napEnd)
        };
    }

    generateSleepCycles(startTime, endTime) {
        const cycles = [];
        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
            const cycleEnd = new Date(currentTime.getTime() + (this.CYCLE_DURATION * 60000));
            
            cycles.push({
                start: this.formatTime(currentTime),
                end: this.formatTime(cycleEnd),
                duration: this.CYCLE_DURATION
            });
            
            currentTime = cycleEnd;
        }
        
        return cycles;
    }

    generateNapCycles(startTime, endTime) {
        const cycles = [];
        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
            const cycleEnd = new Date(currentTime.getTime() + (this.CYCLE_DURATION * 60000));
            
            if (cycleEnd <= endTime) {
                cycles.push({
                    start: this.formatTime(currentTime),
                    end: this.formatTime(cycleEnd),
                    duration: this.CYCLE_DURATION
                });
            }
            
            currentTime = cycleEnd;
        }
        
        return cycles;
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    validateInput(time, type) {
        if (!time) return false;
        
        const [hours, minutes] = time.split(':').map(Number);
        return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
    }

    getSleepQualityTips(cycles) {
        const tips = [];
        
        if (cycles.length < 5) {
            tips.push('Try to get more sleep cycles for better rest.');
        }
        
        if (cycles.length > 8) {
            tips.push('You might be oversleeping. Consider reducing sleep duration.');
        }
        
        return tips;
    }

    // Calculate bedtimes based on desired wake-up time
    calculateBedtimes(wakeUpTime) {
        const wakeUpDate = new Date(`2000-01-01T${wakeUpTime}`);
        const bedtimes = [];

        for (let cycles = this.cyclesForGoodSleep[0]; cycles <= this.cyclesForGoodSleep[1]; cycles++) {
            const totalSleepMinutes = (cycles * this.sleepCycleDuration) + this.fallAsleepTime;
            const bedtime = new Date(wakeUpDate.getTime() - totalSleepMinutes * 60000);
            bedtimes.push({
                time: bedtime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                cycles: cycles,
                duration: this.formatDuration(totalSleepMinutes)
            });
        }

        return bedtimes.reverse();
    }

    // Calculate wake-up times based on bedtime
    calculateWakeUpTimes(bedTime) {
        const bedTimeDate = new Date(`2000-01-01T${bedTime}`);
        const wakeUpTimes = [];

        // Add fall asleep time
        bedTimeDate.setMinutes(bedTimeDate.getMinutes() + this.fallAsleepTime);

        for (let cycles = this.cyclesForGoodSleep[0]; cycles <= this.cyclesForGoodSleep[1]; cycles++) {
            const totalSleepMinutes = cycles * this.sleepCycleDuration;
            const wakeUpTime = new Date(bedTimeDate.getTime() + totalSleepMinutes * 60000);
            wakeUpTimes.push({
                time: wakeUpTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                cycles: cycles,
                duration: this.formatDuration(totalSleepMinutes + this.fallAsleepTime)
            });
        }

        return wakeUpTimes;
    }

    // Calculate wake-up times from current time
    calculateFromNow() {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        return this.calculateWakeUpTimes(currentTime);
    }

    // Calculate nap wake-up time
    calculateNapWakeTime(duration) {
        const now = new Date();
        const wakeTime = new Date(now.getTime() + (duration * 60000));
        return {
            start: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            end: wakeTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            duration: duration
        };
    }

    // Format duration in hours and minutes
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }
} 