#define DAY_LENGTH 24000.0

#define MORNING 0
#define NOON 0.25
#define EVENING 0.5
#define MIDNIGHT 0.75

#define SUNSET_START 12.0 / 24.0
#define SUNSET_END 14.0 / 24.0
#define SUNRISE_START -2.0 / 24.0
#define SUNRISE_END 0.0

// float representing the number of days since the world started
// so 1.5 would mean 1 day and 12000 ticks
float daysSinceWorldStart() {
    return frx_worldDay + frx_worldTime;
}

// 0 = full moon, 4 = new moon
int moonPhase() {
    int dayTime = int(daysSinceWorldStart() * DAY_LENGTH);
    return (dayTime / int(DAY_LENGTH) % 8 + 8) % 8;
}

