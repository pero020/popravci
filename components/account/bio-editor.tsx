'use client';

import { useState } from 'react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Button } from '@/components/ui/button';
import { updateBioAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import DOMPurify from 'dompurify';

interface BioEditorProps {
  initialBio: string;
}

export function BioEditor({ initialBio }: BioEditorProps) {
  const [bio, setBio] = useState(initialBio || '');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleBioChange = (html: string) => {
    setBio(html);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    DOMPurify.addHook('afterSanitizeAttributes', function(node) {
      if (node.nodeName.toLowerCase() === 'a' && node.hasAttribute('href')) {
        node.setAttribute('target', '_blank');
      }
    });
    
    // Sanitize HTML before saving to prevent XSS attacks
    const sanitizedBio = DOMPurify.sanitize(bio, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 
        'h2', 'h3', 'br', 'span'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
    });
    
    // Remove the hook after sanitization
    DOMPurify.removeHook('afterSanitizeAttributes');
    
    const formData = new FormData();
    formData.append('bio', sanitizedBio);
    
    try {
      await updateBioAction(formData);
      router.refresh();
    } catch (error) {
      console.error('Error saving bio:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <RichTextEditor content={bio} onChange={handleBioChange} />
      <p className="text-xs text-slate-500 pt-1">
        Use the rich text editor to format your bio and make it more professional
      </p>
      
      <div className="pt-4">
        <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Bio'}
        </Button>
      </div>
    </>
  );
}