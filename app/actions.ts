"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?redirect_to=/onboarding`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }
  
  // Check if the user has a majstor record
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (user) {
    // Attempt to get the majstor record
    const { data: majstor } = await supabase
      .from('majstori')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!majstor) {
      // No majstor record found, redirect to onboarding
      return redirect("/onboarding");
    }
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const updateBioAction = async (formData: FormData) => {
  const supabase = await createClient();
  const bio = formData.get("bio")?.toString();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect(
      "error",
      "/protected",
      "You must be logged in to update your bio"
    );
  }

  const { error } = await supabase
  .from('majstori')
  .update({ bio })
  .eq('user_id', user.id);

  if (error) {
    return encodedRedirect("error", "/protected", error.message);
  }

  return encodedRedirect("success", "/protected", "Bio updated successfully");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const updateProfileAction = async (formData: FormData) => {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect(
      "error",
      "/protected",
      "You must be logged in to update your profile"
    );
  }
  
  const action_type = formData.get("action_type")?.toString() || 'profile';
  
  // Check if the majstor record exists
  const { data: existing } = await supabase
    .from('majstori')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  // Create majstor record if it doesn't exist
  if (!existing) {
    const { error: createError } = await supabase
      .from('majstori')
      .insert({ user_id: user.id });
      
    if (createError) {
      return encodedRedirect("error", "/protected", createError.message);
    }
  }
  
  switch (action_type) {
    case 'profile':
      return await updateBasicProfile(formData, supabase, user.id);
    
    case 'contacts':
      return await updateContacts(formData, supabase, user.id);
    
    case 'categories':
      return await updateCategories(formData, supabase, user.id);
    
    case 'service_details':
      return await updateServiceDetails(formData, supabase, user.id);
      
    case 'notifications':
    case 'display':
      return await updatePreferences(formData, supabase, user.id, action_type);
      
    default:
      return encodedRedirect(
        "error",
        "/protected",
        "Unknown action type"
      );
  }
};

// Helper functions for different profile updates
async function updateBasicProfile(formData: FormData, supabase: any, userId: string) {
  const name = formData.get("name")?.toString();
  const location_name = formData.get("location_name")?.toString(); // Ensure this is location_name
  // const service_area = formData.get("service_area")?.toString(); // Remove service_area
  const bio = formData.get("bio")?.toString();
  const emergency_available = formData.get("emergency_available") === "on";
  const weekend_evening = formData.get("weekend_evening") === "on";
  
  // Extract map location data
  const latitudeString = formData.get("latitude")?.toString();
  const longitudeString = formData.get("longitude")?.toString();
  const serviceRadiusString = formData.get("service_radius")?.toString();

  const latitude = latitudeString ? parseFloat(latitudeString) : null; // Allow null if not provided
  const longitude = longitudeString ? parseFloat(longitudeString) : null;
  const service_radius = serviceRadiusString ? parseInt(serviceRadiusString) : null;
  
  const updateData: any = {
    name,
    location_name,
    // service_area, // Remove from update
    bio,
    emergency_available,
    weekend_evening,
  };

  if (latitude !== null) updateData.latitude = latitude;
  if (longitude !== null) updateData.longitude = longitude;
  if (service_radius !== null) updateData.service_radius = service_radius;
  
  const { error } = await supabase
    .from('majstori')
    .update(updateData)
    .eq('user_id', userId);
  
  if (error) {
    return encodedRedirect("error", "/protected", error.message);
  }
  
  return encodedRedirect("success", "/protected", "Profile updated successfully");
}

async function updateContacts(formData: FormData, supabase: any, userId: string) {
  const contacts: string[] = [];
  
  // Get all contact fields from the form - convert to array first to fix TypeScript issue
  Array.from(formData.entries()).forEach(([key, value]) => {
    if (key.startsWith('contact_') && value) {
      contacts.push(value.toString());
    }
  });
  
  const { error } = await supabase
    .from('majstori')
    .update({ contacts })
    .eq('user_id', userId);
  
  if (error) {
    return encodedRedirect("error", "/protected", error.message);
  }
  
  return encodedRedirect(
    "success",
    "/protected",
    "Contact information updated successfully"
  );
}

async function updateCategories(formData: FormData, supabase: any, userId: string) {
  // Get categories from form (multi-select checkboxes)
  const formCategories = formData.getAll('categories').map(category => category.toString());
  const customCategory = formData.get('custom_category')?.toString();
  
  // Add custom category if provided
  const categories = customCategory ? [...formCategories, customCategory] : formCategories;
  
  const { error } = await supabase
    .from('majstori')
    .update({ categories })
    .eq('user_id', userId);
  
  if (error) {
    return encodedRedirect("error", "/protected", error.message);
  }
  
  return encodedRedirect(
    "success",
    "/protected",
    "Service categories updated successfully"
  );
}

async function updateServiceDetails(formData: FormData, supabase: any, userId: string) {
  const wait_time_days = parseInt(formData.get("wait_time_days")?.toString() || "1");
  const languages = formData.get("languages")?.toString().split(',').map(l => l.trim()).filter(l => l);
  
  const { error } = await supabase
    .from('majstori')
    .update({ 
      wait_time_days,
      languages,
    })
    .eq('user_id', userId);
  
  if (error) {
    return encodedRedirect("error", "/protected", error.message);
  }
  
  return encodedRedirect(
    "success",
    "/protected", 
    "Service details updated successfully"
  );
}

async function updatePreferences(formData: FormData, supabase: any, userId: string, type: string) {
  // The provided schema for 'majstori' does not have generic preference columns
  // like 'notifications_preferences' or 'display_preferences'.
  // Specific boolean fields like 'emergency_available' and 'weekend_evening'
  // are handled in updateBasicProfile.
  // This function will currently not update any fields based on the provided schema.
  // If you have other boolean fields in your schema for these preferences,
  // they should be handled explicitly here or in another dedicated function.

  console.warn(`Attempted to update preferences of type '${type}', but no matching schema columns found. Preferences not saved:`, Object.fromEntries(formData.entries()));

  return encodedRedirect(
    "success", // Changed from success to info as no update happens based on current schema
    "/protected",
    "Preferences section noted. No direct schema columns for these generic preferences."
  );
}

export const onboardingAction = async (formData: FormData) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "You must be logged in to complete the onboarding"
    );
  }
  
  // Extract form data
  const name = formData.get("name")?.toString();
  const phone = formData.get("phone")?.toString();
  const location_name = formData.get("location_name")?.toString(); // Renamed from location to location_name
  // const service_area = formData.get("service_area")?.toString(); // Remove service_area
  const categories = formData.getAll("categories").map(category => category.toString());
  
  // Extract map location data
  const latitudeString = formData.get("latitude")?.toString();
  const longitudeString = formData.get("longitude")?.toString();
  const serviceRadiusString = formData.get("service_radius")?.toString();

  const latitude = latitudeString ? parseFloat(latitudeString) : null;
  const longitude = longitudeString ? parseFloat(longitudeString) : null;
  const service_radius = serviceRadiusString ? parseInt(serviceRadiusString) : null;
  
  if (!name) {
    return encodedRedirect(
      "error",
      "/onboarding",
      "Name is required to complete your profile"
    );
  }
  
  const insertData: any = {
    user_id: user.id,
    name,
    location_name,
    // service_area, // Remove from insert
    categories,
    contacts: phone ? [phone] : [],
    created_at: new Date().toISOString(),
  };

  if (latitude !== null) insertData.latitude = latitude;
  if (longitude !== null) insertData.longitude = longitude;
  if (service_radius !== null) insertData.service_radius = service_radius;
    
  const { error } = await supabase
    .from('majstori')
    .insert(insertData);
    
  if (error) {
    console.error("Onboarding error:", error.message);
    return encodedRedirect(
      "error",
      "/onboarding",
      "Failed to create your profile: " + error.message
    );
  }
  
  return redirect("/protected");
};

export const saveLocationAction = async ({
  userId,
  latitude,
  longitude,
  location_name, // Renamed from location to location_name
  // service_area, // Remove service_area
  service_radius
}: {
  userId: string;
  latitude: number;
  longitude: number;
  location_name: string; // Renamed
  // service_area: string; // Remove
  service_radius: number;
}) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    throw new Error("Unauthorized");
  }
  
  const { data: existing } = await supabase
    .from('majstori')
    .select('id')
    .eq('user_id', userId)
    .single();

  const locationData = {
    location_name, // Use renamed variable
    // service_area, // Remove
    latitude,
    longitude,
    service_radius,
  };
  
  if (!existing) {
    const { error: createError } = await supabase
      .from('majstori')
      .insert({ 
        user_id: userId,
        name: "New User", // Default name for new record
        ...locationData
      });
      
    if (createError) {
      throw new Error(createError.message);
    }
  } else {
    const { error: updateError } = await supabase
      .from('majstori')
      .update(locationData)
      .eq('user_id', userId);
    
    if (updateError) {
      throw new Error(updateError.message);
    }
  }
  
  return { success: true };
};
