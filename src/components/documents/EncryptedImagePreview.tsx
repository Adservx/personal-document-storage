import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { decryptDocument, generateUserEncryptionKey } from '../../utils/encryption';
import type { Document } from '../../types';

interface EncryptedImagePreviewProps {
  document: Document;
  className?: string;
  alt?: string;
}

export const EncryptedImagePreview: React.FC<EncryptedImagePreviewProps> = ({ 
  document, 
  className = '',
  alt 
}) => {
  const { user } = useSupabaseAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    const loadEncryptedImage = async () => {
      if (!user?.id) {
        console.log('No user ID available for decryption');
        setLoading(false);
        return;
      }

      if (!document.is_encrypted || !document.encryption_metadata) {
        console.log('Document not encrypted or missing metadata');
        setLoading(false);
        setError(true);
        return;
      }

      // Skip if not an image
      if (!document.file_type?.startsWith('image/')) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        console.log(`🔓 Decrypting image: ${document.name}`);

        // Download encrypted file
        const { data: encryptedBlob, error: downloadError } = await supabase.storage
          .from('documents')
          .download(document.file_path);

        if (downloadError) {
          console.error('Download error:', downloadError);
          throw downloadError;
        }

        // Generate user encryption key
        const encryptionKey = await generateUserEncryptionKey(user.id);

        // Decrypt the image
        const decryptedBlob = await decryptDocument(
          encryptedBlob, 
          document.encryption_metadata, 
          encryptionKey
        );

        if (mounted) {
          // Create object URL for decrypted image
          objectUrl = URL.createObjectURL(decryptedBlob);
          setImageUrl(objectUrl);
          console.log(`✅ Image decrypted successfully: ${document.name}`);
        }
      } catch (err) {
        console.error('Error loading encrypted image:', err);
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEncryptedImage();

    // Cleanup function
    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [document.file_path, document.is_encrypted, document.encryption_metadata, user?.id, document.file_type, document.name]);

  if (loading) {
    return (
      <div className={`encrypted-image-loading ${className}`}>
        <div className="loading-spinner">🔄</div>
        <div className="loading-text">Decrypting...</div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`encrypted-image-error ${className}`}>
        <div className="error-icon">🔒</div>
        <div className="error-text">Encrypted Image</div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt || document.name}
      className={className}
      loading="lazy"
    />
  );
};
