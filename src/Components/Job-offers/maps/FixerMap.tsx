// src/Components/Job-offers/maps/FixerMap.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { Map, Marker } from "leaflet";

interface FixerMapProps {
  lat: number;
  lng: number;
  name: string;
  photoUrl?: string | null;
}

export default function FixerMap({ lat, lng, name, photoUrl }: FixerMapProps) {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    const initMap = async () => {
      const L = await import("leaflet");

      // Fix iconos Leaflet en Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: false,
      }).setView([lat, lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const fixerIcon = L.divIcon({
        className: "custom-fixer-marker",
        html: `
          <div class="relative animate-in fade-in zoom-in-50 duration-700">
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/20 rounded-full blur-md"></div>
            <div class="relative group cursor-default">
              <div class="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:bg-primary/50 transition-all duration-500"></div>
              <div class="relative w-16 h-16 rounded-full border-4 border-white shadow-2xl overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-500 group-hover:scale-110">
                ${photoUrl
                  ? `<img src="${photoUrl}" alt="${name}" class="w-full h-full object-cover" />`
                  : `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                       <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                       </svg>
                     </div>`
                }
              </div>
              <div class="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                Fixer
              </div>
            </div>
          </div>
        `,
        iconSize: [64, 80],
        iconAnchor: [32, 80],
        popupAnchor: [0, -80],
      });

      if (markerRef.current) map.removeLayer(markerRef.current);
      const marker = L.marker([lat, lng], { icon: fixerIcon }).addTo(map);
      markerRef.current = marker;

      marker.bindPopup(
        `<div class="text-center p-4">
          <p class="font-bold text-lg text-gray-800">${name}</p>
          <p class="text-sm text-gray-600 mt-1">Trabaja en esta zona</p>
        </div>`,
        { className: "custom-fixer-popup", closeButton: false }
      );

      mapInstanceRef.current = map;

      // Forzar redimensión correcta
      setTimeout(() => map.invalidateSize(), 100);
    };

    initMap();

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [isClient, lat, lng, name, photoUrl]);

  // Forzar redimensión cuando cambia el tamaño del contenedor
  useEffect(() => {
    if (!mapInstanceRef.current || !mapRef.current) return;

    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapRef.current);

    return () => observer.disconnect();
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center">
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-lg rounded-2xl px-6 py-3 shadow-2xl border border-white/30">
        <p className="text-sm font-bold text-gray-800">Ubicación de {name}</p>
      </div>
    </div>
  );
}