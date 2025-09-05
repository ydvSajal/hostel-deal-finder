import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ProfileAvatarProps {
  size?: "sm" | "md" | "lg";
  showUploadButton?: boolean;
  userId?: string;
}

const ProfileAvatar = ({ size = "md", showUploadButton = false, userId }: ProfileAvatarProps) => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-20 w-20"
  };

  useEffect(() => {
    if (userId || user?.id) {
      loadProfile(userId || user!.id);
    }
  }, [userId, user?.id]);

  const loadProfile = async (profileUserId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('id', profileUserId)
        .single();

      if (profile) {
        setAvatarUrl(profile.avatar_url);
        setDisplayName(profile.display_name || "");
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(data.publicUrl);
      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.split('@')[0].slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl || undefined} alt={displayName || "Profile"} />
        <AvatarFallback>
          {avatarUrl ? <User className="h-4 w-4" /> : getInitials()}
        </AvatarFallback>
      </Avatar>
      
      {showUploadButton && user && (
        <div className="absolute -bottom-1 -right-1">
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 rounded-full p-0"
            disabled={uploading}
            asChild
          >
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <Camera className="h-3 w-3" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;