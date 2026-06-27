import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Users, Wallet } from "lucide-react";

export default async function MyTrips() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  // Fetch trips for the logged in user
  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen relative bg-slate-950 pt-24 px-6 md:px-12 pb-12">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src="/scroll_up_to_down.mp4" type="video/mp4" />
      </video>
      {/* Subtle Overlay to ensure text readability */}
      <div className="fixed inset-0 z-0 bg-black/40 pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-8">My Saved Trips</h1>
        
        {trips.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <p className="text-xl text-gray-300 mb-6">You haven't generated any trips yet.</p>
            <Link href="/" className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-8 rounded-full transition-colors">
              Plan Your First Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:border-teal-500/50 transition-colors cursor-pointer group relative overflow-hidden">
                <Link href={`/trip/${trip.id}`} className="absolute inset-0 z-10" />
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white group-hover:text-teal-300 transition-colors">
                    {trip.destination}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <span className="text-sm">Generated: {new Date(trip.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-400" />
                    <span className="text-sm">{trip.travelers} Travelers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-teal-400" />
                    <span className="text-sm">{trip.budgetLevel} Budget</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
