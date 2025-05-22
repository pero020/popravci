import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { updateProfileAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage, Message } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BioEditor } from "@/components/account/bio-editor";
import { TOP_CATEGORIES } from "@/utils/categories";
import { 
  User, 
  Settings, 
  Shield, 
  Plus,
  Languages,
  Phone,
  Wrench
} from "lucide-react";
import { Label } from "@/components/ui/label";

export default async function AccountPage(props: {
  searchParams: Promise<Message>;
}) {
  const supabase = await createClient();
  const searchParams = await props.searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  
  // Fetch user data from majstori table using user_id field
  const { data: majstor } = await supabase
    .from('majstori')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-slate-600">
          Manage your profile information, service details, and account preferences.
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid grid-cols-4 md:w-fit w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Services</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            
            <form action={updateProfileAction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={majstor?.name || ''}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label> {/* Changed from location to location to match schema*/}
                  <div className="flex gap-2">
                    <Input
                      id="location" // Changed from location to location
                      name="location" // Changed from location to location
                      defaultValue={majstor?.location || ''} // Changed from location to location
                      placeholder="City, Country"
                      className="flex-1"
                    />
                  </div>
                </div>
                
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio/Description</Label>
                <BioEditor initialBio={majstor?.bio || ''} />
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="emergency_available" 
                    name="emergency_available"
                    defaultChecked={majstor?.emergency_available}
                  />
                  <Label htmlFor="emergency_available">Available for emergency calls</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="weekend_evening" 
                    name="weekend_evening"
                    defaultChecked={majstor?.weekend_evening}
                  />
                  <Label htmlFor="weekend_evening">Available on weekends & evenings</Label>
                </div>
              </div>
              
              <FormMessage message={searchParams} />
              
              <div className="pt-4">
                <SubmitButton>Update Profile</SubmitButton>
              </div>
            </form>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            
            <form action={updateProfileAction} className="space-y-4">
              <input type="hidden" name="action_type" value="contacts" />
              
              <div className="space-y-4">
                {majstor?.contacts && majstor.contacts.length > 0 ? (
                  majstor.contacts.map((contact: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <Input
                        name={`contact_${index}`}
                        defaultValue={contact}
                        placeholder="Phone number or contact method"
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <Input
                      name="contact_0"
                      placeholder="Phone number or contact method"
                    />
                  </div>
                )}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Contact Method
                </Button>
              </div>
              
              <div className="pt-4">
                <SubmitButton>Save Contact Information</SubmitButton>
              </div>
            </form>
          </div>
        </TabsContent>
        
        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Service Categories</h2>
            
            <form action={updateProfileAction} className="space-y-4">
              <input type="hidden" name="action_type" value="categories" />
              
              <div className="space-y-4">
                <Label>Select the categories that best describe your services</Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {TOP_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category_${category}`}
                        name="categories"
                        value={category}
                        defaultChecked={majstor?.categories?.includes(category)}
                      />
                      <Label htmlFor={`category_${category}`}>{category}</Label>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2">
                  <Label htmlFor="custom_category">Custom Category</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="custom_category"
                      name="custom_category"
                      placeholder="Add a custom category"
                    />
                    <Button type="button" variant="outline">Add</Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <SubmitButton>Update Service Categories</SubmitButton>
              </div>
            </form>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Service Details</h2>
            
            <form action={updateProfileAction} className="space-y-4">
              <input type="hidden" name="action_type" value="service_details" />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wait_time_days">Typical Wait Time (Days)</Label>
                  <Input
                    id="wait_time_days"
                    name="wait_time_days"
                    type="number"
                    min="0"
                    defaultValue={majstor?.wait_time_days || '1'}
                  />
                  <p className="text-xs text-slate-500">How many days clients typically wait before you can service them</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages Spoken</Label>
                  <div className="flex items-center space-x-2">
                    <Languages className="h-4 w-4 text-slate-500" />
                    <Input
                      id="languages"
                      name="languages"
                      placeholder="e.g., English, Croatian, German"
                      defaultValue={majstor?.languages?.join(', ')}
                    />
                  </div>
                  <p className="text-xs text-slate-500">Comma-separated list of languages you speak</p>
                </div>
              </div>
              
              <div className="pt-4">
                <SubmitButton>Update Service Details</SubmitButton>
              </div>
            </form>
          </div>
        </TabsContent>
        
        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
            
            <form action={updateProfileAction} className="space-y-4">
              <input type="hidden" name="action_type" value="notifications" />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="email_notifications" name="email_notifications" defaultChecked />
                  <Label htmlFor="email_notifications">Receive email notifications</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="contact_requests" name="contact_requests" defaultChecked />
                  <Label htmlFor="contact_requests">Notify me of new contact requests</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="marketing_emails" name="marketing_emails" />
                  <Label htmlFor="marketing_emails">Receive promotional emails and updates</Label>
                </div>
              </div>
              
              <div className="pt-4">
                <SubmitButton>Save Preferences</SubmitButton>
              </div>
            </form>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Display Settings</h2>
            
            <form action={updateProfileAction} className="space-y-4">
              <input type="hidden" name="action_type" value="display" />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="profile_visible" name="profile_visible" defaultChecked />
                  <div>
                    <Label htmlFor="profile_visible">Make my profile visible to others</Label>
                    <p className="text-xs text-slate-500">Turn this off to temporarily hide your profile from searches</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="show_contacts" name="show_contacts" defaultChecked />
                  <div>
                    <Label htmlFor="show_contacts">Display my contact information publicly</Label>
                    <p className="text-xs text-slate-500">If disabled, users must request your contact information</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <SubmitButton>Save Display Settings</SubmitButton>
              </div>
            </form>
          </div>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Account Security</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Email Address</h3>
                <p className="text-sm text-slate-600">{user.email}</p>
                <div className="mt-2 flex items-center">
                  {user.email_confirmed_at ? (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Not verified
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-slate-600">Last updated: {new Date(user.updated_at || '').toLocaleDateString()}</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/protected/reset-password">Change Password</a>
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="font-medium text-red-600">Danger Zone</h3>
                <p className="text-sm text-slate-600 mt-1 mb-3">Permanently delete your account and all your data</p>
                <Button variant="destructive" size="sm">Delete Account</Button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Login Sessions</h2>
            
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Current Session</h3>
                    <p className="text-xs text-slate-500 mt-1">Started: {new Date().toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500">Device: Browser</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                </div>
              </div>
              
              <div className="pt-3">
                <form action="/api/sign-out" method="post">
                  <Button variant="outline" type="submit" className="w-full sm:w-auto">
                    Sign Out of All Devices
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
