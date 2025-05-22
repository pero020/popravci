"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { onboardingAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import OnboardingForm from "@/components/onboarding-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocationManager, { LocationState } from "@/components/account/location-manager"; // Import LocationState
import { Button } from "@/components/ui/button";
import { saveLocationAction } from "@/app/actions"; // For potential direct save if needed, or use in publish
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [userId, setUserId] = useState<string | null>(null);
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    phone: "",
    categories: [] as string[],
  });
  const [currentLocationData, setCurrentLocationData] = useState<LocationState>({
    latitude: 45.815399,
    longitude: 15.966568,
    location: "",
    service_radius: 20,
  });
  const [isSavingLocation, setIsSavingLocation] = useState(false); // Renamed for clarity, can be used if saving location separately
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }
      setUserId(user.id);
    };
    fetchUserId();
  }, [router]);

  // Step 1: Basic Info form handler
  const handleBasicInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setBasicInfo({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      categories: formData.getAll("categories").map(c => c.toString()),
    });
    setActiveTab("location");
  };

  // Step 2: Location data handler from LocationManager
  const handleLocationDataChange = (newLocationData: LocationState) => {
    setCurrentLocationData(newLocationData);
  };

  // Handler for the new "Continue" button in the location tab
  const handleContinueFromLocation = async () => {
    // Currently, saving happens at the final publish step.
    // If you wanted to save location here before proceeding:
    // setIsSavingLocation(true);
    // try {
    //   if (!userId) throw new Error("User ID not found.");
    //   await saveLocationAction({ 
    //     userId, 
    //     latitude: currentLocationData.latitude,
    //     longitude: currentLocationData.longitude,
    //     location_name: currentLocationData.location,
    //     service_radius: currentLocationData.service_radius
    //   });
    //   toast.success("Location saved!");
    // } catch (err: any) {
    //   toast.error("Failed to save location: " + err.message);
    //   setIsSavingLocation(false);
    //   return; // Don't proceed if save fails
    // }
    // setIsSavingLocation(false);
    setActiveTab("publish");
  };

  // Step 3: Publish handler
  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    if (!userId) {
      setError("User ID not found. Please try again.");
      setIsPublishing(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", basicInfo.name);
      formData.append("phone", basicInfo.phone);
      basicInfo.categories.forEach(c => formData.append("categories", c));
      
      // Use currentLocationData for the final submission
      formData.append("location_name", currentLocationData.location);
      formData.append("latitude", currentLocationData.latitude.toString());
      formData.append("longitude", currentLocationData.longitude.toString());
      formData.append("service_radius", currentLocationData.service_radius.toString());
      
      await onboardingAction(formData);
      router.push("/protected");
    } catch (err: any) {
      setError(err.message || "Failed to publish profile");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!userId) {
    return (
      <div className="flex-1 max-w-3xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3">Welcome to Popravci!</h1>
        <p className="text-slate-600 mb-6">
          Let's set up your professional profile so customers can find you.
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="basic-info">1. Basic Info</TabsTrigger>
          <TabsTrigger value="location">2. Location</TabsTrigger>
          <TabsTrigger value="publish">3. Publish</TabsTrigger>
        </TabsList>
        <TabsContent value="basic-info">
          <form onSubmit={handleBasicInfoSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8 space-y-6">
            <div>
              <label className="block font-medium mb-1" htmlFor="name">Full Name / Business Name</label>
              <input className="w-full border rounded px-3 py-2" id="name" name="name" required defaultValue={basicInfo.name} />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="phone">Phone Number</label>
              <input className="w-full border rounded px-3 py-2" id="phone" name="phone" type="tel" defaultValue={basicInfo.phone} />
            </div>
            <div>
              <label className="block font-medium mb-1">Services Offered</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'HVAC', 'Appliance Repair', 'Landscaping', 'Cleaning', 'Moving', 'Roofing', 'Flooring', 'General Contractor'].map((category) => (
                  <label key={category} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="categories"
                      value={category}
                      defaultChecked={basicInfo.categories.includes(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">Continue</Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="location">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
            <LocationManager
              initialLocation={currentLocationData} // Pass the current location state
              onLocationDataChange={handleLocationDataChange} // Listen for changes
              isOnboarding={true}
            />
            <div className="flex justify-between mt-6 pt-6 border-t border-slate-200">
              <Button variant="ghost" onClick={() => setActiveTab("basic-info")}>Back</Button>
              <Button onClick={handleContinueFromLocation} disabled={isSavingLocation}>
                {isSavingLocation ? "Saving..." : "Continue to Publish"}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="publish">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Review & Publish</h2>
            <div>
              <h3 className="font-medium mb-1">Basic Info</h3>
              <div>Name: {basicInfo.name}</div>
              <div>Phone: {basicInfo.phone}</div>
              <div>Categories: {basicInfo.categories.join(", ")}</div>
            </div>
            <div>
              <h3 className="font-medium mb-1">Location</h3>
              <div>Location Name: {currentLocationData.location}</div>
              <div>
          Coordinates: {currentLocationData.latitude.toFixed(6)}, {currentLocationData.longitude.toFixed(6)}
              </div>
              <div>Service Radius: {currentLocationData.service_radius} km</div>
            </div>
            {error && <div className="text-red-600">{error}</div>}
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setActiveTab("location")}>Back</Button>
              <Button onClick={handlePublish} disabled={isPublishing}>
          {isPublishing ? "Publishing..." : "Publish Profile"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}