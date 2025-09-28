-- Add encryption metadata columns to documents table
-- This migration adds support for storing encryption metadata for secure document storage

-- Add encryption metadata columns
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS encryption_metadata JSONB,
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

-- Create index for encrypted documents lookup
CREATE INDEX IF NOT EXISTS idx_documents_encrypted ON documents(is_encrypted) WHERE is_encrypted = true;

-- Add comment for documentation
COMMENT ON COLUMN documents.encryption_metadata IS 'Stores encryption parameters (IV, salt, algorithm, etc.) as JSON';
COMMENT ON COLUMN documents.is_encrypted IS 'Flag indicating if the document is encrypted';
COMMENT ON COLUMN documents.encryption_version IS 'Version of encryption algorithm used';

-- Update existing documents to mark them as unencrypted
UPDATE documents SET is_encrypted = FALSE WHERE is_encrypted IS NULL;
