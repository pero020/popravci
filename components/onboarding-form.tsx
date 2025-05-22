"use client";

import { useState, useEffect } from 'react';
import { SubmitButton } from "@/components/submit-button";
import { FormMessage, Message } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import LocationMap from "@/components/ui/location-map";
import { TOP_CATEGORIES } from "@/utils/categories";

interface OnboardingFormProps {
  action: any;
  message?: Message;
}

export default function OnboardingForm({ action, message }: OnboardingFormProps) {
  const [position, setPosition] = useState({ lat: 45.815, lng: 15.982 });
  const [serviceRadius, setServiceRadius] = useState(10);

  const handleLocationChange = (newPosition: { lat: number; lng: number }) => {
    setPosition(newPosition);
    
    // Update hidden input fields
    const latInput = document.getElementById('latitude') as HTMLInputElement;
    const lngInput = document.getElementById('longitude') as HTMLInputElement;
    
    if (latInput && lngInput) {
      latInput.value = newPosition.lat.toString();
      lngInput.value = newPosition.lng.toString();
    }
  };

  const handleRadiusChange = (radius: number) => {
    setServiceRadius(radius);
    
    // Update hidden input field
    const radiusInput = document.getElementById('service_radius') as HTMLInputElement;
    if (radiusInput) {
      radiusInput.value = radius.toString();
    }
  };

  // Set initial values for hidden fields on component mount
  useEffect(() => {
    const latInput = document.getElementById('latitude') as HTMLInputElement;
    const lngInput = document.getElementById('longitude') as HTMLInputElement;
    const radiusInput = document.getElementById('service_radius') as HTMLInputElement;
    
    if (latInput && lngInput && radiusInput) {
      latInput.value = position.lat.toString();
      lngInput.value = position.lng.toString();
      radiusInput.value = serviceRadius.toString();
    }
  }, []);

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <p className="text-sm text-slate-500">
          Tell us about yourself and your business.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="required">Full Name / Business Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Your name or business name"
            required
          />
          <p className="text-xs text-slate-500">
            This is how you'll appear in search results
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Your contact phone number"
          />
          <p className="text-xs text-slate-500">
            Your primary contact number for clients
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Services Offered</h2>
          <p className="text-sm text-slate-500">
            Select the categories of services you provide (select at least one).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TOP_CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox 
                id={`category_${category}`}
                name="categories"
                value={category}
              />
              <Label htmlFor={`category_${category}`}>{category}</Label>
            </div>
          ))}
        </div>
      </div>

      {message && <FormMessage message={message} /> }

      <div className="flex justify-end pt-4">
        <SubmitButton className="w-full md:w-auto">
          Complete Setup & Continue
        </SubmitButton>
      </div>

      <p className="text-center text-xs text-slate-500 mt-2">
        You can add more details to your profile after completing the initial setup.
      </p>
    </form>
  );
}