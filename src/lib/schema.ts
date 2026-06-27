import { z } from 'zod';

export const aiTripSchema = z.object({
  destination_preview: z.object({
    weather: z.string(),
    best_season: z.string(),
    top_attractions: z.array(z.string()),
    budget_range: z.string(),
    crowd_level: z.string(),
  }),
  ai_recommendation: z.object({
    transport_mode: z.string(),
    stay_type: z.string(),
    highlights: z.string(),
    estimated_savings: z.string(),
  }),
  transport_options: z.array(
    z.object({
      mode: z.string(),
      provider: z.string(),
      duration: z.string(),
      cost: z.number().describe('Cost in INR'),
      tag: z.enum(['Best Value', 'Fastest', 'Cheapest']),
    })
  ),
  itinerary: z.array(
    z.object({
      day: z.number(),
      activities: z.array(
        z.object({
          time_block: z.string().describe('Exact time block e.g. 09:00 AM - 11:30 AM'),
          place: z.string().describe('Name of the attraction or activity'),
          duration: z.string().describe('Estimated duration e.g. 2.5 hours'),
          description: z.string().describe('Brief description of what to do there'),
        })
      ),
      estimated_cost: z.number().describe('Estimated total cost for the day in INR'),
    })
  ),
  accommodation_options: z.array(
    z.object({
      type: z.enum(['Dorm', 'Hostel', 'Homestay', 'Hotel', 'Resort', 'Other']).catch('Other'),
      name: z.string(),
      price_per_night: z.number().describe('Cost in INR'),
      rating: z.number(),
      booking_url: z.string().optional(),
      latitude: z.number().describe('Approximate latitude of the location'),
      longitude: z.number().describe('Approximate longitude of the location'),
      contact_info: z.string().describe('Phone number or website'),
    })
  ).describe('List of 10 recommended stays tailored strictly to the budget constraint'),
  budget_breakdown: z.object({
    transport: z.number(),
    stay: z.number(),
    food: z.number(),
    activities: z.number(),
    buffer: z.number(),
    total: z.number(),
  }),
  packing_list: z.object({
    clothing: z.array(z.string()),
    essentials: z.array(z.string()),
    electronics: z.array(z.string()),
    destination_specific: z.array(z.string()),
  }),
  culinary_highlights: z.object({
    specialties: z.array(z.string()).describe('List of 3-5 local must-try dishes'),
    veg_availability: z.string().describe('Detailed description of how easy it is to find vegetarian food, and any veg local specialties'),
    top_restaurants: z.array(z.string()).describe('List of 3-5 highly rated local restaurants or cafes'),
  }),
  local_tips: z.array(z.string()),
});

export type AITripResponse = z.infer<typeof aiTripSchema>;
