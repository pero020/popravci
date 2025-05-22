"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import LocationSearchDialog from "@/components/ui/location-search-dialog";

export interface LocationState {
  latitude: number;
  longitude: number;
  location: string;
  service_radius: number;
}

interface LocationManagerProps {
  initialLocation?: Partial<LocationState> | null;
  onLocationDataChange?: (locationData: LocationState) => void;
  isOnboarding?: boolean;
}

export default function LocationManager({ 
  initialLocation, 
  onLocationDataChange,
  isOnboarding = false 
}: LocationManagerProps) {
  const [location, setLocation] = useState<LocationState>(() => ({
    latitude: initialLocation?.latitude || 45.815399,
    longitude: initialLocation?.longitude || 15.966568,
    location: initialLocation?.location || "",
    service_radius: initialLocation?.service_radius || 20,
  }));

  useEffect(() => {
    // This effect syncs the parent's initialLocation to the local state.
    // It should only update if initialLocation is provided and values actually differ.
    if (initialLocation) {
      setLocation(prevLocation => {
        const newLat = initialLocation.latitude ?? prevLocation.latitude;
        const newLng = initialLocation.longitude ?? prevLocation.longitude;
        const newLocName = initialLocation.location ?? prevLocation.location;
        const newRadius = initialLocation.service_radius ?? prevLocation.service_radius;

        if (
          newLat !== prevLocation.latitude ||
          newLng !== prevLocation.longitude ||
          newLocName !== prevLocation.location ||
          newRadius !== prevLocation.service_radius
        ) {
          return {
            latitude: newLat,
            longitude: newLng,
            location: newLocName,
            service_radius: newRadius,
          };
        }
        return prevLocation; // No change, return previous state to avoid re-render
      });
    }
    // If initialLocation is null/undefined, we don't change the current state based on it here,
    // as the initial useState already sets defaults.
  }, [initialLocation]);

  useEffect(() => {
    if (onLocationDataChange) {
      onLocationDataChange(location);
    }
  }, [location, onLocationDataChange]);
  
  const handleLocationSelect = (newLocation: {
    lat: number;
    lng: number;
    name: string;
    serviceRadius: number;
  }) => {
    setLocation({
      latitude: newLocation.lat,
      longitude: newLocation.lng,
      location: newLocation.name,
      service_radius: newLocation.serviceRadius
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isOnboarding ? "Set Your Location" : "Location Settings"}</CardTitle>
        <CardDescription>
          {isOnboarding 
            ? "This helps us show you relevant services in your area" 
            : "Update your location and service area"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-sm font-medium">Location Name:</span>
              <p className="text-sm">{location.location || "Not set"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-sm font-medium">Coordinates:</span>
              <p className="text-sm">
                {location.latitude ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : "Not set"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Service Radius:</span>
              <p className="text-sm">{location.service_radius ? `${location.service_radius} km` : "Not set"}</p>
            </div>
          </div>
        </div>
        
        <LocationSearchDialog
          onLocationSelect={handleLocationSelect}
          initialLocationName={location.location} // Pass current location name
          initialServiceRadius={location.service_radius} // Pass current service radius
          buttonVariant="outline"
          buttonText="Change Location"
          triggerClassName="w-full"
        />
      </CardContent>
    </Card>
  );
}