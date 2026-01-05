
import React, { useEffect, useRef } from 'react';
import { GeoPoint } from '../types';

interface MapVisualizerProps {
  points: GeoPoint[];
}

declare const L: any;

const MapVisualizer: React.FC<MapVisualizerProps> = ({ points }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([20, 0], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new points
    if (points.length > 0) {
      const bounds = L.latLngBounds([]);
      
      points.forEach(point => {
        const color = point.intensity === 'high' ? '#ef4444' : point.intensity === 'medium' ? '#f59e0b' : '#3b82f6';
        
        const circle = L.circleMarker([point.lat, point.lng], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        })
        .bindPopup(`<strong>${point.label}</strong>`)
        .addTo(mapRef.current);
        
        markersRef.current.push(circle);
        bounds.extend([point.lat, point.lng]);
      });

      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // No explicit cleanup needed for this simple implementation
    };
  }, [points]);

  return (
    <div className="w-full h-[400px] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute top-4 right-4 z-[400] bg-[#0c0c0c]/80 backdrop-blur-sm border border-neutral-800 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        Live Threat Map
      </div>
    </div>
  );
};

export default MapVisualizer;
