import React, { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "./ui/button";

interface Place {
  name: string;
  vicinity: string;
  lat: number;
  lng: number;
}

export const CrisisMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Leaflet CSS and JS from CDN
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => initMap();
    document.head.appendChild(script);

    const initMap = () => {
      if (!mapRef.current || !window.L) return;

      const L = window.L;
      // Default center (India)
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos: [number, number] = [position.coords.latitude, position.coords.longitude];
            map.setView(userPos, 13);

            // Add a beautiful pulse marker for user
            L.circleMarker(userPos, {
              radius: 8,
              fillColor: "#4285F4",
              fillOpacity: 0.8,
              color: "#fff",
              weight: 2
            }).addTo(map).bindPopup("You are here");

            fetchSupportPlaces(userPos[0], userPos[1], map);
          },
          () => {
            setError("Location access denied. Using default view.");
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    };

    const fetchSupportPlaces = async (lat: number, lng: number, mapInstance: any) => {
      // Use Overpass API (OpenStreetMap) to find hospitals and clinics
      const query = `[out:json];
        (
          node["amenity"="hospital"](around:5000, ${lat}, ${lng});
          node["amenity"="clinic"](around:5000, ${lat}, ${lng});
          node["healthcare"="mental_health"](around:10000, ${lat}, ${lng});
        );
        out body;`;
      
      try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        const L = window.L;
        const results: Place[] = data.elements.slice(0, 8).map((el: any) => ({
          name: el.tags.name || "Mental Health Support",
          vicinity: el.tags["addr:full"] || el.tags["addr:street"] || "Nearby Support Center",
          lat: el.lat,
          lng: el.lng
        }));

        setPlaces(results);

        results.forEach(place => {
          L.marker([place.lat, place.lng]).addTo(mapInstance)
            .bindPopup(`<b>${place.name}</b><br>${place.vicinity}`);
        });

      } catch (err) {
        console.error("Failed to fetch places:", err);
      } finally {
        setLoading(false);
      }
    };

    return () => {
      // Cleanup script tags if needed
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={mapRef} 
        className="h-64 md:h-80 w-full rounded-2xl bg-slate-100 shadow-inner overflow-hidden border-2 border-slate-50 z-0"
      >
        {loading && (
          <div className="flex h-full w-full items-center justify-center bg-slate-50/50 backdrop-blur-sm z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
          </div>
        )}
        {error && !places.length && (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <MapPin className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500 font-medium">{error}</p>
          </div>
        )}
      </div>

      {!loading && places.length > 0 && (
        <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {places.map((place) => (
            <div 
              key={`${place.name}-${place.lat}`} 
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-primary/20 transition-colors shadow-sm group"
            >
              <div className="flex-1 min-w-0 text-left">
                <p className="font-bold text-sm text-slate-800 truncate">{place.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{place.vicinity}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full h-8 w-8 p-0 text-primary hover:bg-primary/10"
                onClick={() => {
                   const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
                   window.open(url, "_blank");
                }}
              >
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add Leaflet types to window
declare global {
  interface Window {
    L: any;
  }
}
