"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { DeepPartial } from 'ai';
import type { AITripResponse } from '@/lib/schema';
import StaysList from './StaysList';
import dynamic from 'next/dynamic';
import { Lock } from 'lucide-react';

const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-teal-500">Loading Map...</div>
});

export default function TripDashboard({ tripData, isLoading }: { tripData: DeepPartial<AITripResponse> | undefined, isLoading: boolean }) {
  if (!tripData) return null;

  return (
    <div className="flex flex-col gap-6 text-white pb-20">
      
      {/* Destination Preview */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle>Destination Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-300">Weather</p>
            <p className="font-semibold">{tripData.destination_preview?.weather || 'Loading...'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Best Season</p>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 whitespace-normal text-center h-auto py-1">
              {tripData.destination_preview?.best_season || '...'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-300">Crowd Level</p>
            <p className="font-semibold">{tripData.destination_preview?.crowd_level || 'Loading...'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Budget Range</p>
            <p className="font-semibold">{tripData.destination_preview?.budget_range || 'Loading...'}</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendation */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ AI Top Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-2 whitespace-normal break-words leading-relaxed">{tripData.ai_recommendation?.highlights || 'Analyzing the best options for you...'}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="bg-green-500/20 text-green-200 whitespace-normal text-center h-auto py-1">
              Savings: {tripData.ai_recommendation?.estimated_savings || '...'}
            </Badge>
            <Badge className="bg-white/10">Mode: {tripData.ai_recommendation?.transport_mode}</Badge>
            <Badge className="bg-white/10">Stay: {tripData.ai_recommendation?.stay_type}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Transport Options */}
      {tripData.transport_options && tripData.transport_options.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle>Transport Options</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tripData.transport_options.map((transport, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg">{transport?.mode} via {transport?.provider}</h4>
                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">{transport?.tag}</Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-1">Duration: {transport?.duration}</p>
                  <p className="text-xl font-bold text-white mb-4">₹{transport?.cost?.toLocaleString('en-IN')}</p>
                </div>
                <a 
                  href={`https://www.makemytrip.com/${transport?.mode?.toLowerCase() === 'train' ? 'railways' : transport?.mode?.toLowerCase() === 'bus' ? 'bus-tickets' : 'flights'}/`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 rounded-lg transition-colors text-sm font-semibold flex justify-center"
                >
                  Book on MakeMyTrip
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Itinerary */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle>Day-by-Day Itinerary</CardTitle>
          </CardHeader>
          <CardContent>
            {tripData.itinerary && tripData.itinerary.length > 0 ? (
              <Accordion className="w-full">
                {tripData.itinerary.map((day, idx) => (
                  <AccordionItem value={`day-${idx}`} key={idx} className="border-white/20">
                    <AccordionTrigger className="hover:no-underline">
                      Day {day?.day || idx + 1}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-gray-200">
                      {day?.activities?.map((activity: any, actIdx: number) => (
                        <div key={actIdx} className="border-l-2 border-teal-500/50 pl-4 py-1 relative">
                          <div className="absolute w-2 h-2 rounded-full bg-teal-400 -left-[5px] top-2"></div>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                            <span className="text-teal-300 text-sm font-semibold">{activity?.time_block}</span>
                            <Badge variant="outline" className="text-gray-400 border-gray-600 self-start md:self-auto w-fit text-xs">
                              {activity?.duration}
                            </Badge>
                          </div>
                          <div className="font-bold text-white text-base mb-1">{activity?.place}</div>
                          <p className="text-sm text-gray-300 leading-snug">{activity?.description}</p>
                        </div>
                      ))}
                      <div className="text-sm text-blue-300 mt-2 font-semibold">Day Est. Cost: ₹{day?.estimated_cost}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-gray-400 text-sm">Building itinerary...</p>
            )}
          </CardContent>
        </Card>

        {/* Culinary Highlights */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle>Culinary & Dining Guide</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {tripData.culinary_highlights ? (
              <>
                <div>
                  <h4 className="text-sm text-teal-300 font-semibold mb-2">Veg/Non-Veg Availability</h4>
                  <p className="text-gray-200 text-sm leading-relaxed">{tripData.culinary_highlights.veg_availability}</p>
                </div>
                
                <div>
                  <h4 className="text-sm text-teal-300 font-semibold mb-2">Local Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {tripData.culinary_highlights.specialties?.map((dish, i) => (
                      <Badge key={i} className="bg-orange-500/20 text-orange-200 border-orange-500/30">{dish}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-teal-300 font-semibold mb-2">Top Recommended Restaurants</h4>
                  <ul className="list-disc pl-5 text-gray-200 text-sm space-y-1">
                    {tripData.culinary_highlights.top_restaurants?.map((rest, i) => (
                      <li key={i}>{rest}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-sm">Curating the best local food and restaurants...</p>
            )}
          </CardContent>
        </Card>

        {/* Packing List */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle>AI Smart Packing Guide</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {tripData.packing_list ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-teal-300 font-semibold mb-2">Clothing</h4>
                  <ul className="list-disc pl-5 text-gray-200 text-sm space-y-1">
                    {tripData.packing_list.clothing?.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm text-teal-300 font-semibold mb-2">Essentials</h4>
                  <ul className="list-disc pl-5 text-gray-200 text-sm space-y-1">
                    {tripData.packing_list.essentials?.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm text-teal-300 font-semibold mb-2">Electronics</h4>
                  <ul className="list-disc pl-5 text-gray-200 text-sm space-y-1">
                    {tripData.packing_list.electronics?.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm text-teal-300 font-semibold mb-2">Destination Specific</h4>
                  <ul className="list-disc pl-5 text-gray-200 text-sm space-y-1">
                    {tripData.packing_list.destination_specific?.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Packing your bags...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map and Stays */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Interactive Map */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-teal-300">Stays & Map</h2>
          <InteractiveMap stays={tripData.accommodation_options as any} />
        </div>

        {/* Stays List */}
        <div className="flex flex-col gap-4 mt-12 md:mt-0">
          <StaysList stays={tripData.accommodation_options as any} />
        </div>
      </div>
    </div>
  );
}
