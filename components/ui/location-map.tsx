"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  initialPosition: { lat: number; lng: number };
  initialRadius?: number;
  onLocationChange?: (position: { lat: number; lng: number }) => void;
  onRadiusChange?: (radius: number) => void;
  readOnly?: boolean;
  height?: string;
}

// A component to handle map events
function MapEvents({ 
  onLocationChange 
}: { 
  onLocationChange?: (position: { lat: number; lng: number }) => void 
}) {
  const map = useMapEvents({
    click: (e) => {
      if (onLocationChange) {
        onLocationChange({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    },
  });
  return null;
}

export default function LocationMap({
  initialPosition,
  initialRadius = 10,
  onLocationChange,
  onRadiusChange,
  readOnly = false,
  height = "400px"
}: LocationMapProps) {
  const [position, setPosition] = useState(initialPosition);
  const [radius, setRadius] = useState(initialRadius * 1000);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then(L => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });
      });
    }
  }, []);

  // Update position when initialPosition changes
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  // Update radius when initialRadius changes
  useEffect(() => {
    setRadius(initialRadius * 1000);
  }, [initialRadius]);

  const handlePositionChange = (newPosition: { lat: number; lng: number }) => {
    if (readOnly) return;
    
    setPosition(newPosition);
    
    if (onLocationChange) {
      onLocationChange(newPosition);
    }
    
    // Center the map on the new position
    if (mapRef.current) {
      mapRef.current.setView(newPosition);
    }
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    
    const newRadiusKm = parseInt(e.target.value);
    setRadius(newRadiusKm * 1000); // Convert km to meters
    
    if (onRadiusChange) {
      onRadiusChange(newRadiusKm);
    }
  };

  return (
    <div className="space-y-4">
      <div style={{ height, width: "100%" }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%", borderRadius: "0.375rem" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <Circle 
            center={position} 
            radius={radius} 
            pathOptions={{ 
              color: 'blue', 
              fillColor: 'blue', 
              fillOpacity: 0.1 
            }} 
          />
          
          {!readOnly && (
            <MapEvents onLocationChange={handlePositionChange} />
          )}
        </MapContainer>
      </div>
      
      {!readOnly && onRadiusChange && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="radius-slider" className="text-sm font-medium">
              Service Radius: {radius / 1000} km
            </label>
            <span className="text-sm text-muted-foreground">
              {radius / 1000} kilometers
            </span>
          </div>
          <input
            type="range"
            id="radius-slider"
            min="1"
            max="50"
            step="1"
            value={radius / 1000}
            onChange={handleRadiusChange}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Set how far you're willing to travel to provide your services
          </p>
        </div>
      )}
    </div>
  );
}