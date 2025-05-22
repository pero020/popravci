"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
// import LocationMap from "./location-map"; // Remove static import

// Dynamically import LocationMap
const LocationMap = dynamic(() => import('./location-map'), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center"><p>Loading map...</p></div>
});

interface LocationSearchDialogProps {
  onLocationSelect: (locationData: {
    lat: number;
    lng: number;
    name: string;
    serviceRadius: number;
  }) => void;
  initialLocationName?: string; // Add this
  initialServiceRadius?: number; // Add this
  buttonVariant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  buttonText?: string;
  triggerClassName?: string;
}

export default function LocationSearchDialog({
  onLocationSelect,
  initialLocationName = "", // Add this
  initialServiceRadius = 20, // Add this
  buttonVariant = "outline",
  buttonText = "Select Location on Map",
  triggerClassName,
}: LocationSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ lat: 45.815399, lng: 15.966568 }); // Default: Zagreb
  const [locationName, setLocationName] = useState(initialLocationName);
  const [serviceRadius, setServiceRadius] = useState(initialServiceRadius);

  // Add useEffect to update state if initial props change and dialog is opened
  useEffect(() => {
    if (open) {
      setLocationName(initialLocationName);
      setServiceRadius(initialServiceRadius);
      // You might also want to set the initial map position here if it should reset
      // based on the overall initialLocation passed to LocationManager, not just the name/radius.
      // For now, it keeps the last map position or default.
    }
  }, [open, initialLocationName, initialServiceRadius]);

  const handleLocationChange = (newPosition: { lat: number; lng: number }) => {
    setPosition(newPosition);
  };

  const handleSubmit = () => {
    onLocationSelect({
      lat: position.lat,
      lng: position.lng,
      name: locationName,
      serviceRadius: serviceRadius,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          className={triggerClassName}
        >
          <MapPin className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Your Location</DialogTitle>
          <DialogDescription>
            Click on the map to set your location. You can also adjust the service radius.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="location-name">Location Name</Label>
            <Input
              id="location-name"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="E.g. Zagreb, Center"
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Position on Map</Label>
            <LocationMap
              initialPosition={position}
              initialRadius={serviceRadius}
              onLocationChange={handleLocationChange}
              onRadiusChange={setServiceRadius}
              height="300px"
            />
          </div>
          
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="service-radius">Service Radius</Label>
              <span className="text-sm text-muted-foreground">{serviceRadius} km</span>
            </div>
            <Input
              id="service-radius"
              type="range"
              min="1"
              max="100"
              step="1"
              value={serviceRadius}
              onChange={(e) => setServiceRadius(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Set how far you're willing to travel to provide your services
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Select Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}