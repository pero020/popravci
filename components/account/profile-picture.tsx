'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// Simple image compression - reduces size and dimensions before upload
async function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement('img'); // Changed: Use document.createElement
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error: string | Event) => reject(error); // Added type for error
    };
    reader.onerror = (error: ProgressEvent<FileReader>) => reject(error); // Added type for error
  });
}

interface ProfilePictureProps {
  userId: string;
  existingUrl?: string | null;
  onUpdate?: (url: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}

export function ProfilePicture({ 
  userId, 
  existingUrl, 
  onUpdate,
  size = 'md',
  editable = true 
}: ProfilePictureProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const sizeStyles = {
    sm: { containerClass: 'w-16 h-16', imgWidth: 64, imgHeight: 64, placeholderSize: 'w-8 h-8' },
    md: { containerClass: 'w-24 h-24', imgWidth: 96, imgHeight: 96, placeholderSize: 'w-12 h-12' },
    lg: { containerClass: 'w-32 h-32', imgWidth: 128, imgHeight: 128, placeholderSize: 'w-16 h-16' }
  };
  
  const currentStyle = sizeStyles[size];

  useEffect(() => {
    // When existingUrl (clean URL from props) changes, update the internal imageUrl
    // If filenames are unique, cache-busting query param is less critical here
    // but doesn't hurt for ensuring refresh if existingUrl itself is updated.
    if (existingUrl) {
      setImageUrl(`${existingUrl.split('?')[0]}?t=${new Date().getTime()}`);
    } else {
      setImageUrl(null);
    }
  }, [existingUrl]);
  
  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      setError(null);
      
      const compressedImage = await compressImage(file);
      // Revert to using a timestamp in the filename for unique uploads
      const fileName = `profile-${userId}-${Date.now()}.jpg`; 
      const compressedFile = new File([compressedImage], fileName, { 
        type: 'image/jpeg'
      });
      
      const supabase = createClient();
      console.log(`Attempting to upload new unique file: ${fileName}`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(`public/${fileName}`, compressedFile, { 
          // Remove upsert: true, as each file is new
          cacheControl: 'no-store, must-revalidate' 
        });
        
      if (uploadError) {
        console.error('Upload Error Details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log('Upload successful. Response data:', uploadData);
      
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(`public/${fileName}`);

      if (!urlData || !urlData.publicUrl) {
        console.error('Public URL response:', urlData);
        throw new Error('Public URL not found in response from Supabase.');
      }
      const newPublicUrl = urlData.publicUrl; // This URL is now unique
        
      const { error: updateError } = await supabase
        .from('majstori')
        .update({ profile_picture: newPublicUrl }) // Store the new unique URL
        .eq('user_id', userId);
        
      if (updateError) {
        // Note: If this fails, the file is uploaded but DB not updated.
        // Consider cleanup or retry logic for production.
        throw new Error(updateError.message);
      }
      
      // Update internal state with the new unique URL (can add cache-buster for immediate effect if needed)
      setImageUrl(`${newPublicUrl}?t=${new Date().getTime()}`);
      // Inform parent with the new unique URL
      if (onUpdate) onUpdate(newPublicUrl); 
      
    } catch (err: any) { 
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  
  // Handle deleting the profile picture
  const handleRemove = async () => {
    if (!imageUrl) return;
    
    try {
      setUploading(true);
      setError(null);
      
      const supabase = createClient();
      
      // Extract the clean filename from the potentially cache-busted imageUrl state
      // The filename in storage includes the timestamp.
      const cleanImageUrlForPath = imageUrl.split('?')[0];
      const urlParts = cleanImageUrlForPath.split('/');
      const fullFileName = urlParts[urlParts.length - 1]; // e.g., profile-userid-timestamp.jpg
      const filePath = `public/${fullFileName}`;
      
      console.log(`Attempting to remove file: ${filePath}`);
      await supabase.storage
        .from('profile-pictures')
        .remove([filePath]);
        
      await supabase
        .from('majstori')
        .update({ profile_picture: null })
        .eq('user_id', userId);
        
      setImageUrl(null);
      if (onUpdate) onUpdate(null); 
      
    } catch (err: any) { 
      setError(err.message || 'Failed to remove image');
    } finally {
      setUploading(false);
    }
  };
  
  // Trigger file input click
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${currentStyle.containerClass} rounded-full overflow-hidden bg-slate-200 mb-2`}>
        {imageUrl ? (
          <Image 
            src={imageUrl}
            alt="Profile" 
            width={currentStyle.imgWidth}
            height={currentStyle.imgHeight}
            className="object-contain w-full h-full" // Added w-full h-full
          />
        ) : (
          <div className={`h-full w-full flex items-center justify-center text-slate-400`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none"
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className={currentStyle.placeholderSize}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" 
              />
            </svg>
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>
      
      {editable && (
        <div className="flex items-center justify-center gap-2">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg"
          />
          
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={openFileSelector}
            disabled={uploading}
          >
            <Camera className="w-4 h-4 mr-1" />
            {imageUrl ? 'Change' : 'Upload'}
          </Button>
          
          {imageUrl && (
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}