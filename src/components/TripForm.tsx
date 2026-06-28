'use client';

import { useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { aiTripSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PlaneTakeoff, Sparkles, ChevronDown } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { DestinationType } from './3d/SceneManager';
import TripDashboard from './TripDashboard';
import ShareButtons from './ShareButtons';

export default function TripForm({ setSceneType }: { setSceneType: (type: DestinationType) => void }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mustVisit, setMustVisit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState<number>(2);
  const [budget, setBudget] = useState<number[]>([40000]);
  const [travelMode, setTravelMode] = useState<'Budget' | 'Comfort' | 'Luxury'>('Comfort');
  const [tripPacing, setTripPacing] = useState<'Action-Packed' | 'Relaxed'>('Action-Packed');
  const [tripTheme, setTripTheme] = useState<'Spiritual & Temples' | 'Nature & Adventure' | 'Leisure & Chill' | 'Culture & History'>('Leisure & Chill');

  const { object, submit, isLoading, error } = useObject({
    api: '/api/generate-trip',
    schema: aiTripSchema,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple logic to set scene type based on destination text for the demo
    const d = destination.toLowerCase();
    if (d.includes('goa') || d.includes('andaman')) setSceneType('beach');
    else if (d.includes('rajasthan') || d.includes('desert')) setSceneType('desert');
    else if (d.includes('delhi') || d.includes('mumbai')) setSceneType('city');
    else if (d.includes('coorg') || d.includes('meghalaya')) setSceneType('forest');
    else setSceneType('mountains');

    // Format the date string and duration
    let formattedDates = 'Not specified';
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      const formattedStart = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const formattedEnd = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      formattedDates = `${days} Days (${formattedStart} - ${formattedEnd})`;
    }

    submit({ origin, destination, mustVisit, dates: formattedDates, travelers, budget: budget[0], travelMode, tripPacing, tripTheme });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl shadow-xl flex flex-col gap-6 text-white">
        <h1 className="text-3xl font-bold">Plan Your Next Adventure</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="origin">Origin / Departure City</Label>
            <Input 
              id="origin" 
              placeholder="e.g. Mumbai, Delhi" 
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
              className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="destination">Destination</Label>
            <Input 
              id="destination" 
              placeholder="e.g. Goa, Rajasthan" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="mustVisit">What places are on your mind? (1 or 2 maybe)</Label>
            <Input 
              id="mustVisit" 
              placeholder="e.g. Baga Beach, Tito's Lane (Optional)" 
              value={mustVisit}
              onChange={(e) => setMustVisit(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label>Departure Date</Label>
            <Input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="bg-white/20 border-white/30 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Return Date</Label>
            <Input 
              type="date" 
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="bg-white/20 border-white/30 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="travelers">Travelers: {travelers}</Label>
            <Input 
              id="travelers" 
              type="number" 
              min={1} 
              max={10} 
              value={travelers}
              onChange={(e) => setTravelers(parseInt(e.target.value))}
              required
              className="bg-white/20 border-white/30 text-white"
            />
          </div>

          <div className="flex flex-col gap-4">
            <Label>Budget: ₹{(Array.isArray(budget) ? budget[0] : budget).toLocaleString('en-IN')}</Label>
            <Slider 
              value={budget} 
              onValueChange={(val) => setBudget(Array.isArray(val) ? val : [val as number])} 
              max={500000} 
              min={1000} 
              step={500} 
              className="py-2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2 md:gap-4 items-center">
            <Label className="mr-2">Trip Vibe:</Label>
            {['Spiritual & Temples', 'Nature & Adventure', 'Leisure & Chill', 'Culture & History'].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setTripTheme(theme as any)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  tripTheme === theme ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'border-white/30 hover:bg-white/20 text-gray-300'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center">
            <div className="flex flex-wrap gap-2 md:gap-4 items-center">
              <Label className="mr-2">Travel Mode:</Label>
              {['Budget', 'Comfort', 'Luxury'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTravelMode(mode as any)}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    travelMode === mode ? 'bg-white text-black border-white' : 'border-white/30 hover:bg-white/20'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 md:gap-4 items-center">
              <Label className="mr-2">Pacing:</Label>
              {['Action-Packed', 'Relaxed'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTripPacing(mode as any)}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    tripPacing === mode ? 'bg-teal-500 text-white border-teal-500' : 'border-white/30 hover:bg-white/20 text-gray-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-teal-500/25 transition-all group relative overflow-hidden"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3 w-full">
              <div className="w-6 h-6 flex items-center justify-center relative">
                <PlaneTakeoff className="w-6 h-6 absolute text-white animate-fly" />
              </div>
              Building your itinerary...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2 w-full">
              <Sparkles className="w-5 h-5 text-teal-200 group-hover:scale-125 transition-transform duration-300" />
              Generate My Trip
            </span>
          )}
        </Button>

        {error && (
          (() => {
            let parsedError = error.message;
            let errorType = 'UNKNOWN';
            
            try {
              const parsed = JSON.parse(error.message);
              parsedError = parsed.error || error.message;
              errorType = parsed.type || 'UNKNOWN';
            } catch (e) {
              // Ignore
            }

            if (errorType === 'AUTH_REQUIRED') {
              return (
                <div className="p-8 mt-4 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-3xl text-center shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)] backdrop-blur-md flex flex-col items-center justify-center gap-6 transform transition-all animate-in fade-in zoom-in duration-500">
                  <div className="bg-white/10 p-4 rounded-full">
                    <Sparkles className="w-10 h-10 text-pink-300 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Oops! That was your last free trip 🥺</h3>
                    <p className="text-purple-100 text-lg max-w-md mx-auto leading-relaxed">
                      {parsedError}
                    </p>
                  </div>
                  <Button 
                    type="button"
                    onClick={() => signIn('google')} 
                    className="mt-2 bg-white text-black hover:bg-gray-100 hover:scale-105 font-bold px-8 py-6 rounded-full shadow-xl transition-all duration-300 flex items-center gap-3 text-lg"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign in to unlock more
                  </Button>
                </div>
              );
            }

            // Standard Error (LIMIT_REACHED or validation)
            return (
              <div className="p-4 mt-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-2xl font-medium text-center shadow-lg backdrop-blur-sm flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-red-500/20 p-2 rounded-full">
                  <PlaneTakeoff className="w-5 h-5 text-red-300" />
                </div>
                {parsedError}
              </div>
            );
          })()
        )}

        {(isLoading || object) && (
          <div className="flex justify-center mt-2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/50" />
          </div>
        )}
      </form>

      {/* Render the Dashboard progressively as the object streams in */}
      {(object || isLoading) && (
        <div className="mt-12 w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700">
          <TripDashboard tripData={object} isLoading={isLoading} />
          
          {!isLoading && object && (
            <div className="pb-16 animate-in fade-in zoom-in duration-700">
              <ShareButtons 
                url="/" 
                title="I just planned my entire vacation in seconds using AI! Try Plan My Trip for free:" 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
