'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AITripResponse } from '@/lib/schema';
import { Badge } from '@/components/ui/badge';
import { Phone, ExternalLink } from 'lucide-react';

// Fix for default Leaflet marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface InteractiveMapProps {
  stays: AITripResponse['accommodation_options'];
}

export default function InteractiveMap({ stays }: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[400px] w-full bg-slate-800 animate-pulse rounded-xl" />;

  // Calculate center of map based on the first stay, or a default fallback
  const centerPosition: [number, number] = stays?.length > 0 && stays[0].latitude
    ? [stays[0].latitude, stays[0].longitude]
    : [15.2993, 74.1240]; // Default Goa coordinates

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-teal-500/20 z-0">
      <MapContainer 
        center={centerPosition} 
        zoom={10} 
        scrollWheelZoom={false} 
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {stays?.map((stay, index) => {
          if (!stay.latitude || !stay.longitude) return null;
          
          return (
            <Marker key={index} position={[stay.latitude, stay.longitude]}>
              <Popup className="custom-popup">
                <div className="p-1">
                  <h3 className="font-bold text-teal-800 text-lg mb-1">{stay.name}</h3>
                  <Badge variant="secondary" className="mb-2 bg-teal-100 text-teal-800 hover:bg-teal-200">
                    {stay.type}
                  </Badge>
                  <p className="text-sm font-semibold mb-2">₹{stay.price_per_night.toLocaleString('en-IN')} / night</p>
                  
                  {stay.contact_info && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Phone className="w-3 h-3" />
                      <span>{stay.contact_info}</span>
                    </div>
                  )}
                  
                  {stay.booking_url && (
                    <a 
                      href={stay.booking_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium mt-2"
                    >
                      Visit Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
