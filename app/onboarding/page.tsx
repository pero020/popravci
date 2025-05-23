"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { onboardingAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import OnboardingForm from "@/components/onboarding-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TOP_CATEGORIES } from "@/utils/categories";

export default function OnboardingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [userId, setUserId] = useState<string | null>(null);
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    phone: "",
    location: "",
    categories: [] as string[],
  });
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
      location: formData.get("location") as string,
      categories: formData.getAll("categories").map(c => c.toString()),
    });
    setActiveTab("review");
  };

  // Step 2: Publish handler
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
      formData.append("location", basicInfo.location);
      basicInfo.categories.forEach(c => formData.append("categories", c));
      
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="basic-info">1. Basic Info</TabsTrigger>
          <TabsTrigger value="review">2. Review</TabsTrigger>
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
              <label className="block font-medium mb-1" htmlFor="location">Location</label>
              <input className="w-full border rounded px-3 py-2" id="location" name="location" defaultValue={basicInfo.location} />
            </div>
            <div>
              <label className="block font-medium mb-1">Services Offered</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TOP_CATEGORIES.map((category) => (
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
        <TabsContent value="review">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Review & Publish</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Profile Information</h3>
                <div className="text-slate-600">Name: {basicInfo.name}</div>
                <div className="text-slate-600">Phone: {basicInfo.phone}</div>
                <div className="text-slate-600">Location: {basicInfo.location}</div>
                <div className="text-slate-600">Categories: {basicInfo.categories.join(", ")}</div>
              </div>
            </div>
            {error && <div className="text-red-600">{error}</div>}
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setActiveTab("basic-info")}>Back</Button>
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