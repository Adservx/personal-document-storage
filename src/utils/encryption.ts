/**
 * Document Encryption Utility
 * Provides client-side encryption/decryption for document files before storing in Supabase
 */

export interface EncryptedFile {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
}

export interface EncryptionKey {
  key: CryptoKey;
  keyData: ArrayBuffer;
}

class DocumentEncryption {
  private algorithm = 'AES-GCM';
  private keyLength = 256;
  private ivLength = 12; // 96 bits for AES-GCM
  private saltLength = 16; // 128 bits
  private tagLength = 128; // 128 bits authentication tag

  /**
   * Generate a random encryption key
   */
  async generateKey(): Promise<EncryptionKey> {
    const key = await window.crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );

    const keyData = await window.crypto.subtle.exportKey('raw', key);
    
    return { key, keyData };
  }

  /**
   * Derive a key from user password (for password-based encryption)
   */
  async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Import a key from raw key data
   */
  async importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
    return window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.algorithm },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate a random salt
   */
  generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(this.saltLength));
  }

  /**
   * Generate a random IV (Initialization Vector)
   */
  generateIV(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(this.ivLength));
  }

  /**
   * Encrypt a file using AES-GCM
   */
  async encryptFile(file: File, key?: CryptoKey): Promise<EncryptedFile> {
    try {
      // Generate encryption key if not provided
      let encryptionKey = key;
      if (!encryptionKey) {
        const keyPair = await this.generateKey();
        encryptionKey = keyPair.key;
      }

      // Generate random IV and salt
      const iv = this.generateIV();
      const salt = this.generateSalt();

      // Read file as ArrayBuffer
      const fileBuffer = await this.readFileAsArrayBuffer(file);

      // Encrypt the file data
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv,
          tagLength: this.tagLength,
        },
        encryptionKey,
        fileBuffer
      );

      return {
        encryptedData,
        iv,
        salt
      };
    } catch (error) {
      console.error('Error encrypting file:', error);
      throw new Error('Failed to encrypt file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Decrypt a file using AES-GCM
   */
  async decryptFile(encryptedFile: EncryptedFile, key: CryptoKey): Promise<ArrayBuffer> {
    try {
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: encryptedFile.iv,
          tagLength: this.tagLength,
        },
        key,
        encryptedFile.encryptedData
      );

      return decryptedData;
    } catch (error) {
      console.error('Error decrypting file:', error);
      throw new Error('Failed to decrypt file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Create an encrypted blob that can be uploaded to storage
   */
  async createEncryptedBlob(file: File, key?: CryptoKey): Promise<{ blob: Blob; metadata: any; encryptionKey?: ArrayBuffer }> {
    const encryptedFile = await this.encryptFile(file, key);
    
    // Create metadata to store encryption parameters
    const metadata = {
      iv: Array.from(encryptedFile.iv),
      salt: Array.from(encryptedFile.salt),
      algorithm: this.algorithm,
      originalName: file.name,
      originalType: file.type,
      originalSize: file.size,
      encrypted: true,
      encryptedAt: new Date().toISOString()
    };

    // Create blob from encrypted data
    const blob = new Blob([encryptedFile.encryptedData], { 
      type: 'application/octet-stream' 
    });

    // Return encryption key if we generated it
    let encryptionKey;
    if (!key) {
      const keyPair = await this.generateKey();
      encryptionKey = keyPair.keyData;
    }

    return { blob, metadata, encryptionKey };
  }

  /**
   * Decrypt a downloaded blob back to original file
   */
  async decryptBlob(encryptedBlob: Blob, metadata: any, key: CryptoKey): Promise<Blob> {
    try {
      // Read encrypted data
      const encryptedData = await this.readBlobAsArrayBuffer(encryptedBlob);

      // Reconstruct encryption parameters
      const encryptedFile: EncryptedFile = {
        encryptedData,
        iv: new Uint8Array(metadata.iv),
        salt: new Uint8Array(metadata.salt)
      };

      // Decrypt the data
      const decryptedData = await this.decryptFile(encryptedFile, key);

      // Create blob with original type
      return new Blob([decryptedData], { type: metadata.originalType || 'application/octet-stream' });
    } catch (error) {
      console.error('Error decrypting blob:', error);
      throw new Error('Failed to decrypt document: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Utility: Read file as ArrayBuffer
   */
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Utility: Read blob as ArrayBuffer
   */
  private readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * Generate a user-specific encryption key based on their Firebase UID
   */
  async generateUserKey(userId: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const salt = encoder.encode(`securedoc-${userId}-encryption-salt-v1`);
    
    // Use a combination of user ID and a fixed secret to derive a consistent key
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(`${userId}-encryption-key-material`),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }
}

// Export singleton instance
export const documentEncryption = new DocumentEncryption();

// Export utility functions for easier use
export const encryptDocument = (file: File, key?: CryptoKey) => 
  documentEncryption.createEncryptedBlob(file, key);

export const decryptDocument = (blob: Blob, metadata: any, key: CryptoKey) => 
  documentEncryption.decryptBlob(blob, metadata, key);

export const generateUserEncryptionKey = (userId: string) => 
  documentEncryption.generateUserKey(userId);
