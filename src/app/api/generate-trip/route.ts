import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { aiTripSchema } from '@/lib/schema';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { cookies } from 'next/headers';
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Bypass TLS verification locally on Windows
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { origin, destination, mustVisit, dates, travelers, budget, travelMode, tripPacing } = await req.json();

    // Basic Input Validation
    if (!destination || !dates || !travelers || !budget || !travelMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Tiered Rate Limiting Check
    const session = await getServerSession(authOptions);
    let anonCookieCount = 0;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayStr = startOfDay.toISOString();

    if (!session || !session.user) {
      // Anonymous User Logic
      const cookieStore = await cookies();
      const anonDate = cookieStore.get('anon_date')?.value;
      const anonCount = cookieStore.get('anon_count')?.value;

      if (anonDate !== todayStr) {
        anonCookieCount = 0;
      } else {
        anonCookieCount = parseInt(anonCount || '0', 10);
      }

      if (anonCookieCount >= 2) {
        return NextResponse.json(
          { error: "You've used your 2 free guest trips! Sign in to get 5 trips per day.", type: 'AUTH_REQUIRED' },
          { status: 401 }
        );
      }
    } else {
      // Logged-in User Logic (5 trips per day)
      const tripCount = await prisma.trip.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfDay },
        },
      });

      if (tripCount >= 5) {
        return NextResponse.json(
          { error: 'You have reached your daily limit of 5 trips! Please come back tomorrow.', type: 'LIMIT_REACHED' },
          { status: 429 }
        );
      }
    }

    // Edge Case: Check for Hindi script or invalid input length
    // For simplicity, we sanitize input slightly
    const sanitizedDestination = destination.substring(0, 100);
    const sanitizedOrigin = origin ? origin.substring(0, 100) : "Not specified";

    const promptContext = `
      You are an expert Indian travel planner. Create a detailed itinerary and travel plan for:
      Origin (Departure City): ${sanitizedOrigin}
      Destination: ${sanitizedDestination}
      Specific Places the User Wants to Visit: ${mustVisit || "None specified. Suggest the best highlights."}
      Travel Dates: ${dates}
      Number of Travelers: ${travelers}
      Total Budget: ₹${budget}
      Preferred Travel Mode: ${travelMode}

      Critical constraints:
      1. All monetary values MUST be in INR (₹) and realistic for current Indian market rates.
      2. If the budget is below a viable threshold (e.g. ₹5,000 for a 5-day trip), allocate it as best as possible but note the extreme constraint in "highlights" or "local_tips".
      3. If the destination has no train connectivity (e.g., Andaman Islands, Lakshadweep), DO NOT recommend trains.
      4. If travel dates fall in peak season, flag crowd levels and price surges.
      5. The total budget breakdown MUST equal the given total budget or slightly below it.
      6. Provide EXACTLY 5 accommodation options spanning from budget to luxury, but heavily prioritize preferences based on the user's Total Budget and Preferred Travel Mode. Include realistic approximate latitude and longitude coordinates.
      7. Calculate realistic travel time and cost FROM the Origin TO the Destination and include it in the transport_options array. Ensure the transport mode makes sense for the distance.
      8. STRICT ACCOMMODATION PRICING RULES:
         - If Preferred Travel Mode is "Budget": Stays MUST be strictly between ₹300 and ₹1500 per night (Hostels, Dorms, Budget Homestays).
         - If Preferred Travel Mode is "Comfort": Stays MUST be strictly between ₹1500 and ₹5000 per night (Mid-range Hotels, Premium Homestays).
         - If Preferred Travel Mode is "Luxury": Stays MUST be 5-star hotels or luxury resorts (₹5000+ per night).
      9. SPECIFIC PLACES RULE: If the user provided "Specific Places the User Wants to Visit", you MUST ensure those exact locations are prominently featured in the day-by-day itinerary and factor their entry fees (if any) into the budget.
      10. PACING RULE: The user selected "${tripPacing || 'Action-Packed'}" pacing. 
          - If "Action-Packed", calculate exact realistic time blocks (e.g. 09:00 AM - 11:30 AM) and pack the days efficiently to cover maximum ground.
          - If "Relaxed", ensure a slow, relaxed pace with plenty of downtime, late starts (e.g. 11:00 AM), and longer durations at fewer places.

      Generate a highly detailed and realistic plan fitting the exact JSON schema provided.
    `;

    // Mock Mode if API key is a dummy
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY === 'your-gemini-api-key-here') {
      
      // Generate mock accommodations based on the user's selected mode
      let mockAccommodations = [];
      if (travelMode === 'Budget') {
        mockAccommodations = [
          { type: "Hostel", name: "Zostel Goa", price_per_night: 800, rating: 4.5, booking_url: "https://zostel.com", latitude: 15.5494, longitude: 73.7535, contact_info: "+91 12345 67890" },
          { type: "Hostel", name: "The Hosteller Goa", price_per_night: 600, rating: 4.2, booking_url: "https://thehosteller.com", latitude: 15.5862, longitude: 73.7431, contact_info: "+91 77777 66666" },
          { type: "Hostel", name: "Woke Hostel Arpora", price_per_night: 1200, rating: 4.6, booking_url: "https://wokehostel.com", latitude: 15.5683, longitude: 73.7656, contact_info: "+91 98765 43210" },
          { type: "Dorm", name: "Jungle by Sturmfrei", price_per_night: 550, rating: 4.4, booking_url: "", latitude: 15.5921, longitude: 73.7441, contact_info: "+91 98888 77777" },
          { type: "Villa", name: "Pappu's Beach Shack & Villa", price_per_night: 1400, rating: 4.1, booking_url: "", latitude: 15.5342, longitude: 73.7654, contact_info: "+91 88888 66666" },
          { type: "Hostel", name: "Craft Hostels", price_per_night: 700, rating: 4.7, booking_url: "", latitude: 15.5812, longitude: 73.7456, contact_info: "+91 99999 55555" },
          { type: "Dorm", name: "Pappi Chulo Hostel", price_per_night: 500, rating: 4.3, booking_url: "", latitude: 15.5901, longitude: 73.7422, contact_info: "+91 77777 44444" },
          { type: "Hostel", name: "Red Door Hostel", price_per_night: 900, rating: 4.4, booking_url: "", latitude: 15.5945, longitude: 73.7410, contact_info: "+91 66666 33333" },
          { type: "Homestay", name: "Anjuna Beach House", price_per_night: 1500, rating: 4.0, booking_url: "", latitude: 15.5840, longitude: 73.7405, contact_info: "+91 55555 22222" },
          { type: "Hostel", name: "That Crazy Hostel", price_per_night: 1100, rating: 4.8, booking_url: "", latitude: 15.5872, longitude: 73.7460, contact_info: "+91 44444 11111" }
        ];
      } else if (travelMode === 'Comfort') {
        mockAccommodations = [
          { type: "Hotel", name: "Ginger Goa", price_per_night: 3500, rating: 4.0, booking_url: "https://gingerhotels.com", latitude: 15.4989, longitude: 73.8278, contact_info: "+91 832 243 3333" },
          { type: "Homestay", name: "Casa Menezes", price_per_night: 4500, rating: 4.8, booking_url: "https://casamenezes.com", latitude: 15.4485, longitude: 73.8961, contact_info: "+91 88888 77777" },
          { type: "Homestay", name: "The Figueiredo Mansion", price_per_night: 4800, rating: 4.7, booking_url: "", latitude: 15.3134, longitude: 74.0084, contact_info: "+91 99999 88888" },
          { type: "Hotel", name: "Ibis Styles Goa", price_per_night: 4200, rating: 4.3, booking_url: "https://all.accor.com", latitude: 15.5321, longitude: 73.7663, contact_info: "+91 832 711 1111" },
          { type: "Hotel", name: "Bloom Suites", price_per_night: 3800, rating: 4.5, booking_url: "", latitude: 15.5345, longitude: 73.7634, contact_info: "+91 832 666 2222" },
          { type: "Resort", name: "Sonesta Inns", price_per_night: 4900, rating: 4.2, booking_url: "", latitude: 15.5301, longitude: 73.7680, contact_info: "+91 832 555 3333" },
          { type: "Hotel", name: "Kyriad Hotel", price_per_night: 2800, rating: 4.0, booking_url: "", latitude: 15.5412, longitude: 73.7550, contact_info: "+91 832 444 4444" },
          { type: "Hotel", name: "Lemon Tree Amarante", price_per_night: 4999, rating: 4.6, booking_url: "", latitude: 15.5123, longitude: 73.7690, contact_info: "+91 832 333 5555" },
          { type: "Homestay", name: "Arco Iris Boutique", price_per_night: 4700, rating: 4.9, booking_url: "", latitude: 15.3210, longitude: 74.0150, contact_info: "+91 832 222 6666" },
          { type: "Hotel", name: "Spazio Leisure Resort", price_per_night: 3200, rating: 4.4, booking_url: "", latitude: 15.5900, longitude: 73.7480, contact_info: "+91 832 111 7777" }
        ];
      } else { // Luxury
        mockAccommodations = [
          { type: "Resort", name: "Taj Exotica Resort & Spa", price_per_night: 25000, rating: 4.9, booking_url: "https://tajhotels.com", latitude: 15.2346, longitude: 73.9317, contact_info: "+91 832 668 3333" },
          { type: "Resort", name: "W Goa", price_per_night: 20000, rating: 4.7, booking_url: "https://marriott.com/w-goa", latitude: 15.6022, longitude: 73.7380, contact_info: "+91 832 671 8888" },
          { type: "Resort", name: "Marriott Resort & Spa", price_per_night: 15000, rating: 4.8, booking_url: "https://marriott.com", latitude: 15.4851, longitude: 73.8118, contact_info: "+91 832 246 3333" },
          { type: "Hotel", name: "Novotel Goa Resort", price_per_night: 9000, rating: 4.5, booking_url: "https://all.accor.com", latitude: 15.5262, longitude: 73.7663, contact_info: "+91 832 711 2223" },
          { type: "Resort", name: "ITC Grand Goa", price_per_night: 18000, rating: 4.8, booking_url: "", latitude: 15.3190, longitude: 73.9000, contact_info: "+91 832 888 1111" },
          { type: "Hotel", name: "The Leela Goa", price_per_night: 22000, rating: 4.9, booking_url: "", latitude: 15.1500, longitude: 73.9450, contact_info: "+91 832 999 2222" },
          { type: "Resort", name: "Alila Diwa", price_per_night: 14000, rating: 4.7, booking_url: "", latitude: 15.2890, longitude: 73.9110, contact_info: "+91 832 777 3333" },
          { type: "Resort", name: "Grand Hyatt Goa", price_per_night: 16000, rating: 4.8, booking_url: "", latitude: 15.4560, longitude: 73.8440, contact_info: "+91 832 666 4444" },
          { type: "Hotel", name: "Hard Rock Hotel", price_per_night: 8500, rating: 4.4, booking_url: "", latitude: 15.5450, longitude: 73.7600, contact_info: "+91 832 555 5555" },
          { type: "Resort", name: "Caravela Beach Resort", price_per_night: 11000, rating: 4.5, booking_url: "", latitude: 15.2200, longitude: 73.9350, contact_info: "+91 832 444 6666" }
        ];
      }

      const mockData = {
        destination_preview: {
          weather: "Warm and humid, 30°C",
          best_season: "November to February",
          top_attractions: ["Baga Beach", "Dudhsagar Falls", "Old Goa"],
          budget_range: "₹10,000 - ₹50,000",
          crowd_level: "High",
        },
        ai_recommendation: {
          transport_mode: travelMode === "Budget" ? "Scooter rental" : (travelMode === "Comfort" ? "Private Cabs" : "Chauffeur Service"),
          stay_type: travelMode === "Budget" ? "Hostels & Backpackers" : (travelMode === "Comfort" ? "Premium Homestays & 3/4-Star Hotels" : "5-Star Resorts"),
          highlights: "Focus on North Goa beaches and Portuguese heritage.",
          estimated_savings: "₹5000 by booking in advance",
        },
        transport_options: [
          { mode: "Flight", provider: "Standard Carriers", duration: "Dependent on Origin", cost: 5000, tag: "Fastest" },
          { mode: "Train", provider: "Indian Railways", duration: "Overnight", cost: 1500, tag: "Budget" },
        ],
        itinerary: [
          { 
            day: 1, 
            activities: [
              { time_block: "10:00 AM - 12:00 PM", place: "Resort Check-in", duration: "2 hours", description: "Arrive and settle in to your beautiful room." },
              { time_block: "01:00 PM - 04:00 PM", place: "Baga Beach", duration: "3 hours", description: "Relax at the beach, try some water sports." },
              { time_block: "06:00 PM - 10:00 PM", place: "Tito's Lane", duration: "4 hours", description: "Enjoy the vibrant nightlife and dinner." }
            ],
            estimated_cost: 3000 
          },
          { 
            day: 2, 
            activities: [
              { time_block: "09:00 AM - 11:00 AM", place: "Basilica of Bom Jesus", duration: "2 hours", description: "Explore the UNESCO World Heritage site." },
              { time_block: "11:30 AM - 01:30 PM", place: "Fontainhas", duration: "2 hours", description: "Walk through the colorful Latin Quarter." },
              { time_block: "05:00 PM - 07:00 PM", place: "Mandovi River Cruise", duration: "2 hours", description: "Sunset cruise with music and dancing." }
            ],
            estimated_cost: 4000 
          }
        ],
        accommodation_options: mockAccommodations,
        budget_breakdown: { transport: 5000, stay: 15000, food: 8000, activities: 7000, buffer: 5000, total: 40000 },
        culinary_highlights: {
          specialties: ["Goan Fish Curry", "Prawn Balchao", "Bebinca", "Pork Vindaloo"],
          veg_availability: "Very easy to find. North Goa has countless pure veg restaurants, Udupi cafes, and vegan spots. Local veg specialties include Mushroom Xacuti and Cashew Curry.",
          top_restaurants: ["Gunpowder (Assagao)", "Mum's Kitchen (Panjim)", "Thalassa (Siolim)", "Artjuna (Anjuna)"]
        },
        packing_list: { clothing: ["Beachwear", "Cotton clothes"], essentials: ["Sunscreen", "Sunglasses"], electronics: ["Power bank"], destination_specific: ["Waterproof bag"] },
        local_tips: ["Rent a scooty for ₹400/day.", "Always bargain at flea markets."],
      };

      const jsonString = JSON.stringify(mockData);
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          const chunkSize = 100;
          for (let i = 0; i < jsonString.length; i += chunkSize) {
            controller.enqueue(encoder.encode(jsonString.slice(i, i + chunkSize)));
            await new Promise(r => setTimeout(r, 50)); // Delay for smooth UI streaming animation without lagging the browser
          }
          controller.close();
        }
      });

      const response = new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      
      if (!session || !session.user) {
        const newCount = anonCookieCount + 1;
        response.headers.append('Set-Cookie', `anon_date=${todayStr}; Path=/; Max-Age=86400; HttpOnly`);
        response.headers.append('Set-Cookie', `anon_count=${newCount}; Path=/; Max-Age=86400; HttpOnly`);
      }
      
      return response;
    }

    // Stream the JSON response back to the client using streamObject
    const result = await streamObject({
      model: google('gemini-2.5-flash'),
      schema: aiTripSchema,
      prompt: promptContext,
      temperature: 0.7,
      maxRetries: 3,
      onFinish: async ({ object }) => {
        // Asynchronously save the trip to the database if the user is logged in
        if (session && session.user && object) {
          try {
            await prisma.trip.create({
              data: {
                userId: session.user.id,
                destination: destination,
                travelers: parseInt(travelers) || 1,
                budgetLevel: budget > 30000 ? (budget > 100000 ? "Luxury" : "Comfort") : "Budget",
                travelMode: travelMode,
                aiPlan: object, // Save the entire raw generated JSON
              }
            });
            console.log("Successfully saved trip to database for user:", session.user.id);
          } catch (dbError) {
            console.error("Failed to save trip to database:", dbError);
          }
        }
      }
    });

    const response = result.toTextStreamResponse();
    
    if (!session || !session.user) {
      const newCount = anonCookieCount + 1;
      response.headers.append('Set-Cookie', `anon_date=${todayStr}; Path=/; Max-Age=86400; HttpOnly`);
      response.headers.append('Set-Cookie', `anon_count=${newCount}; Path=/; Max-Age=86400; HttpOnly`);
    }

    return response;
  } catch (error) {
    console.error('Error generating trip:', error);
    return NextResponse.json(
      { error: 'Failed to generate trip plan. Please try again.' },
      { status: 500 }
    );
  }
}
