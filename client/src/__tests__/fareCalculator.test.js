import { describe, it, expect } from 'vitest';

// Replicated fare calculation logic for client-side testing
const VEHICLE_RATES = {
    bike:         { multiplier: 1.0, basePerKm: 0.150 },
    auto:         { multiplier: 1.2, basePerKm: 0.200 },
    truck_small:  { multiplier: 1.5, basePerKm: 0.350 },
    truck_medium: { multiplier: 1.8, basePerKm: 0.500 },
    truck_large:  { multiplier: 2.2, basePerKm: 0.700 },
    truck_xlarge: { multiplier: 2.8, basePerKm: 0.950 }
};
const WEIGHT_RATE = 0.010;
const URGENT_RATE = 0.15;
const MIN_FARE    = 1.500;

function calculateFare(distance, weight, vehicleType, isUrgent = false) {
    const v = VEHICLE_RATES[vehicleType] || VEHICLE_RATES['truck_small'];
    const baseFare = parseFloat((distance * v.basePerKm * v.multiplier).toFixed(3));
    const weightSurcharge = parseFloat((weight * WEIGHT_RATE).toFixed(3));
    let total = baseFare + weightSurcharge;
    if (isUrgent) total = total * (1 + URGENT_RATE);
    return { baseFare, weightSurcharge, estimatedFare: parseFloat(Math.max(total, MIN_FARE).toFixed(3)) };
}

describe('Fare Calculator — Business Logic', () => {
    it('calculates correct fare for truck_medium 100km 200kg', () => {
        const { estimatedFare, baseFare, weightSurcharge } = calculateFare(100, 200, 'truck_medium');
        expect(baseFare).toBe(90.000);
        expect(weightSurcharge).toBe(2.000);
        expect(estimatedFare).toBe(92.000);
    });

    it('applies 15% urgent surcharge', () => {
        const normal = calculateFare(100, 100, 'bike');
        const urgent = calculateFare(100, 100, 'bike', true);
        expect(urgent.estimatedFare).toBeCloseTo(normal.estimatedFare * 1.15, 2);
    });

    it('enforces minimum fare of OMR 1.500', () => {
        const { estimatedFare } = calculateFare(1, 0.1, 'bike');
        expect(estimatedFare).toBeGreaterThanOrEqual(1.500);
    });

    it('truck_xlarge is more expensive than bike for same route', () => {
        const bike   = calculateFare(50, 10, 'bike');
        const xlarge = calculateFare(50, 10, 'truck_xlarge');
        expect(xlarge.estimatedFare).toBeGreaterThan(bike.estimatedFare);
    });
});
