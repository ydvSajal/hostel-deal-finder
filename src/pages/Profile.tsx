import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, User, Shield, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Helmet } from "react-helmet-async";

interface ProfileData {
  display_name: string;
  bio: string;
  full_name: string;
  mobile_number: string;
  hostel_name: string;
  room_number: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: "",
    bio: "",
    full_name: "",
    mobile_number: "",
    hostel_name: "",
    room_number: ""
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (profile) {
        setProfileData({
          display_name: profile.display_name || "",
          bio: profile.bio || "",
          full_name: profile.full_name || "",
          mobile_number: profile.mobile_number || "",
          hostel_name: profile.hostel_name || "",
          room_number: profile.room_number || ""
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    // Client-side validation
    if (profileData.display_name && profileData.display_name.length < 2) {
      toast({
        title: "Validation Error",
        description: "Display name must be at least 2 characters long",
        variant: "destructive",
      });
      return;
    }

    if (profileData.mobile_number && !/^\+?[6-9]\d{9}$/.test(profileData.mobile_number)) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid mobile number",
        variant: "destructive",
      });
      return;
    }

    if (profileData.bio && profileData.bio.length > 500) {
      toast({
        title: "Validation Error",
        description: "Bio cannot exceed 500 characters",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: profileData.display_name?.trim(),
          bio: profileData.bio?.trim(),
          full_name: profileData.full_name?.trim(),
          mobile_number: profileData.mobile_number?.trim(),
          hostel_name: profileData.hostel_name?.trim(),
          room_number: profileData.room_number?.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-atmospheric">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-atmospheric">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-muted-foreground">Please log in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-atmospheric">
      <Helmet>
        <title>Your Profile — BU_Basket | Account Settings</title>
        <meta name="description" content="Manage your BU_Basket profile, update personal information, and customize your marketplace settings. Verified student account." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Picture Section */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload a profile picture that will be visible to other users.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <ProfileAvatar size="lg" showUploadButton={true} />
              <p className="text-sm text-muted-foreground text-center">
                Click the camera icon to upload a new picture
              </p>
            </CardContent>
          </Card>

          {/* Public Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Public Information
              </CardTitle>
              <CardDescription>
                This information will be visible to other users on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={profileData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="How you want to be known on the platform"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell others about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Private Information */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Private Information
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                  className="ml-auto"
                >
                  {showPrivateInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPrivateInfo ? "Hide" : "Show"}
                </Button>
              </CardTitle>
              <CardDescription>
                This information is private and only visible to administrators. It's used for verification and support purposes.
              </CardDescription>
            </CardHeader>
            {showPrivateInfo && (
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Your complete name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile_number">Mobile Number</Label>
                    <Input
                      id="mobile_number"
                      value={profileData.mobile_number}
                      onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                      placeholder="Your mobile number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hostel_name">Hostel Name</Label>
                    <Input
                      id="hostel_name"
                      value={profileData.hostel_name}
                      onChange={(e) => handleInputChange('hostel_name', e.target.value)}
                      placeholder="Your hostel name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="room_number">Room Number</Label>
                    <Input
                      id="room_number"
                      value={profileData.room_number}
                      onChange={(e) => handleInputChange('room_number', e.target.value)}
                      placeholder="Your room number"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <Separator className="my-8" />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;