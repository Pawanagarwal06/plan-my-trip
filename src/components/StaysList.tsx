'use client';

import { AITripResponse } from '@/lib/schema';
import { Badge } from '@/components/ui/badge';
import { Phone, ExternalLink, MapPin } from 'lucide-react';

interface StaysListProps {
  stays: AITripResponse['accommodation_options'];
}

export default function StaysList({ stays }: StaysListProps) {
  if (!stays || stays.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {stays.map((stay, idx) => (
        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-lg text-white">{stay.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-teal-300 border-teal-500/30">
                  {stay.type}
                </Badge>
                <span className="text-sm text-yellow-400">★ {stay.rating}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-white">
                ₹{stay?.price_per_night ? stay.price_per_night.toLocaleString('en-IN') : '...'}
              </span>
              <p className="text-xs text-gray-400">per night</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {stay.contact_info && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-teal-400" />
                <span>{stay.contact_info}</span>
              </div>
            )}
            
            {stay.latitude && stay.longitude && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>Lat: {stay.latitude.toFixed(2)}, Lng: {stay.longitude.toFixed(2)}</span>
              </div>
            )}

            {/* Dynamic Affiliate Routing */}
            {['Homestay', 'Villa', 'Resort'].includes(stay.type) ? (
              <a 
                href={`https://www.airbnb.co.in/s/${encodeURIComponent(stay.name)}/homes`}
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 w-full py-2 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/50 text-rose-300 rounded-lg transition-colors text-sm font-semibold"
              >
                Search on Airbnb <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <a 
                href={`https://www.makemytrip.com/hotels/hotel-listing/?searchText=${encodeURIComponent(stay.name)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 rounded-lg transition-colors text-sm font-semibold"
              >
                Book on MakeMyTrip <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
