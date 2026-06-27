import { aiTripSchema } from '../src/lib/schema';

describe('AI Trip Zod Schema', () => {
  it('should validate a correct payload', () => {
    const validPayload = {
      destination_preview: {
        weather: 'Sunny 25C',
        best_season: 'Winter',
        top_attractions: ['Beach', 'Fort'],
        budget_range: 'Medium',
        crowd_level: 'High'
      },
      ai_recommendation: {
        transport_mode: 'Flight',
        stay_type: 'Resort',
        highlights: 'Relaxing beach vacation',
        estimated_savings: '₹2000'
      },
      transport_options: [
        { mode: 'Flight', provider: 'IndiGo', duration: '2h', cost: 5000, tag: 'Fastest' }
      ],
      itinerary: [
        { day: 1, morning: 'Beach', afternoon: 'Lunch', evening: 'Sunset', estimated_cost: 1500 }
      ],
      accommodation_options: [
        { type: 'Resort', name: 'Taj Goa', price_per_night: 12000, rating: 5, booking_url: 'https://taj.com' }
      ],
      budget_breakdown: {
        transport: 10000,
        stay: 24000,
        food: 5000,
        activities: 3000,
        buffer: 2000,
        total: 44000
      },
      packing_list: {
        clothing: ['Shorts', 'T-shirts'],
        essentials: ['Sunscreen'],
        electronics: ['Camera'],
        destination_specific: ['Swimwear']
      },
      local_tips: ['Bargain at flea markets']
    };

    const result = aiTripSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should invalidate an incorrect payload (missing fields)', () => {
    const invalidPayload = {
      destination_preview: {
        weather: 'Sunny 25C'
      }
    };

    const result = aiTripSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
