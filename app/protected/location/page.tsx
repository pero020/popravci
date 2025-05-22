"use client";

import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { createClient } from "@/utils/supabase/client"; // Switch to client
import { useRouter } from "next/navigation"; // For potential redirect if user is not found
import LocationManager, { LocationState } from "@/components/account/location-manager";
import { Button } from "@/components/ui/button";
import { saveLocationAction } from "@/app/actions";
import { toast } from "sonner";

// Define a type for the Majstor data we expect
interface MajstorLocationData {
  location_name: string | null; // Updated from location to location_name
  latitude: number | null;
  longitude: number | null;
  service_radius: number | null;
}

export default function AccountLocationPage() {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [initialLocationData, setInitialLocationData] = useState<Partial<LocationState> | null>(null);
  const [currentLocationData, setCurrentLocationData] = useState<LocationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }
      setUserId(user.id);

      const { data: majstor, error } = await supabase
        .from('majstori')
        .select('location_name, latitude, longitude, service_radius') // Ensure correct field names
        .eq('user_id', user.id)
        .single<MajstorLocationData>();

      if (error && error.code !== 'PGRST116') { // PGRST116: single row not found, which is fine if new user
        console.error("Error fetching majstor data:", error);
        toast.error("Failed to load location data.");
      }
      
      const initialData = {
        location: majstor?.location_name || "",
        latitude: majstor?.latitude || 45.815399, // Default to Zagreb or null
        longitude: majstor?.longitude || 15.966568, // Default to Zagreb or null
        service_radius: majstor?.service_radius || 20, // Default radius
      };
      setInitialLocationData(initialData);
      setCurrentLocationData(initialData);
      setIsLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  const handleLocationDataChange = useCallback((newLocationData: LocationState) => {
    setCurrentLocationData(newLocationData);
  }, []); // setCurrentLocationData is stable, so empty dependency array is fine

  const handleSaveLocation = async () => {
    if (!userId || !currentLocationData) {
      toast.error("User data or location data is missing.");
      return;
    }
    setIsSaving(true);
    try {
      await saveLocationAction({
        userId,
        latitude: currentLocationData.latitude,
        longitude: currentLocationData.longitude,
        location_name: currentLocationData.location, // Ensure this matches the action's expectation
        service_radius: currentLocationData.service_radius,
      });
      toast.success("Location saved successfully!");
      setInitialLocationData(currentLocationData); // Update initial data to current after save
    } catch (error: any) {
      toast.error("Failed to save location: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 flex justify-center items-center min-h-[300px]">
        <p>Loading location settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-medium">Location Settings</h3>
        <p className="text-muted-foreground">
          Manage your default location and service radius.
        </p>
      </div>
      
      <div className="mt-8">
        <LocationManager 
          initialLocation={initialLocationData} 
          onLocationDataChange={handleLocationDataChange}
          isOnboarding={false} 
        />
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveLocation} disabled={isSaving || !currentLocationData}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}