import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import TripDashboard from '@/components/TripDashboard';
import ShareButtons from '@/components/ShareButtons';
import { AITripResponse } from '@/lib/schema';

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate dynamic Metadata for SEO and WhatsApp shares
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const trip = await prisma.trip.findUnique({
    where: { id: params.slug },
  });

  if (!trip) {
    return { title: 'Trip Not Found' };
  }

  const { destination, budgetLevel, travelers } = trip;
  
  return {
    title: `${destination} Trip Plan | Plan My Trip`,
    description: `An exclusive AI-generated travel plan for ${destination} for ${travelers} travelers on a ${budgetLevel} budget.`,
    openGraph: {
      title: `${destination} Trip Plan`,
      description: `An exclusive AI-generated travel plan for ${destination}.`,
      type: 'article',
    },
  };
}

export default async function SharedTripPage(props: Props) {
  const params = await props.params;
  // Fetch trip data
  const trip = await prisma.trip.findUnique({
    where: { id: params.slug },
  });

  if (!trip) {
    notFound();
  }

  const tripData = trip.aiPlan as unknown as AITripResponse;
  
  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: `Trip to ${trip.destination}`,
    description: `A ${trip.travelMode} trip for ${trip.travelers} people.`,
    itinerary: tripData.itinerary?.map(day => ({
      '@type': 'City',
      name: `Day ${day.day} Activities`,
      description: day.activities?.map(a => a.place).join(', ') || '',
    })) || []
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/scroll_up_to_down.mp4" type="video/mp4" />
      </video>
      {/* Subtle Overlay to keep text readable but keep video clear */}
      <div className="absolute inset-0 z-0 bg-black/40" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Content Overlay */}
      <div className="relative z-10 min-h-screen p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto pt-10 md:pt-20">
          <header className="mb-12 text-center md:text-left text-white drop-shadow-lg">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Trip to {trip.destination}
            </h1>
            {trip.startDate && trip.endDate && (
              <p className="text-lg opacity-90 mb-4">
                {new Date(trip.startDate).toDateString()} - {new Date(trip.endDate).toDateString()}
              </p>
            )}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">👥 {trip.travelers} Travelers</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">💰 {trip.budgetLevel}</span>
            </div>
          </header>

          <TripDashboard tripData={tripData} isLoading={false} />
          
          <div className="pb-16">
            <ShareButtons 
              url={`/trip/${trip.id}`} 
              title={`Check out my exclusive AI-generated trip to ${trip.destination}! Plan your own in seconds:`} 
            />
          </div>
        </div>
      </div>
    </main>
  );
}
