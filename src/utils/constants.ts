export const DOCUMENT_CATEGORIES = {
  nepali_citizenship: {
    label: 'नेपाली नागरिकता प्रमाणपत्र (Citizenship Certificate)',
    icon: '🇳🇵',
    description: 'नेपाली नागरिकता प्रमाणपत्रहरू (Nepali citizenship certificates)'
  },
  birth_registration: {
    label: 'जन्म दर्ता प्रमाणपत्र (Birth Certificate)',
    icon: '👶',
    description: 'जन्म दर्ता प्रमाणपत्रहरू (Birth registration certificates)'
  },
  passport: {
    label: 'राहदानी (Passport)',
    icon: '📘',
    description: 'राहदानी र यात्रा कागजातहरू (Passport and travel documents)'
  },
  national_id: {
    label: 'राष्ट्रिय परिचयपत्र (National ID)',
    icon: '🆔',
    description: 'राष्ट्रिय परिचयपत्रहरू (National identity cards)'
  },
  driving_license: {
    label: 'सवारी चालक अनुमतिपत्र (Driving License)',
    icon: '🚗',
    description: 'सवारी चालक अनुमतिपत्रहरू (Driving licenses)'
  },
  slc_see: {
    label: 'एसएलसी/एसईई प्रमाणपत्र (SLC/SEE Certificate)',
    icon: '📜',
    description: 'एसएलसी वा माध्यमिक शिक्षा परीक्षा प्रमाणपत्रहरू (SLC or SEE certificates)'
  },
  higher_secondary: {
    label: 'उच्च माध्यमिक शिक्षा प्रमाणपत्र (+2 Certificate)',
    icon: '🎓',
    description: 'उच्च माध्यमिक शिक्षा प्रमाणपत्र (Higher secondary education certificate)'
  },
  academic_transcripts: {
    label: 'शैक्षिक विवरणपत्र (Academic Transcripts)',
    icon: '📊',
    description: 'शैक्षिक विवरणपत्र र अंक प्रतिवेदनहरू (Academic transcripts and grade reports)'
  },
  character_certificate: {
    label: 'चरित्र प्रमाणपत्र (Character Certificate)',
    icon: '📋',
    description: 'शैक्षिक संस्थाहरूबाट चरित्र प्रमाणपत्रहरू (Character certificates from institutions)'
  },
  bachelors_degree: {
    label: 'स्नातक डिग्री प्रमाणपत्र (Bachelor\'s Degree)',
    icon: '🎓',
    description: 'स्नातक डिग्री प्रमाणपत्रहरू (Bachelor\'s degree certificates)'
  },
  masters_degree: {
    label: 'स्नातकोत्तर डिग्री प्रमाणपत्र (Master\'s Degree)',
    icon: '🎓',
    description: 'स्नातकोत्तर डिग्री प्रमाणपत्रहरू (Master\'s degree certificates)'
  },
  voter_id: {
    label: 'मतदाता परिचयपत्र (Voter ID)',
    icon: '🗳️',
    description: 'मतदाता परिचयपत्रहरू (Voter identification cards)'
  },
  marriage_registration: {
    label: 'विवाह दर्ता प्रमाणपत्र (Marriage Certificate)',
    icon: '💒',
    description: 'विवाह दर्ता प्रमाणपत्रहरू (Marriage registration certificates)'
  },
  death_registration: {
    label: 'मृत्यु दर्ता प्रमाणपत्र (Death Certificate)',
    icon: '⚱️',
    description: 'मृत्यु दर्ता प्रमाणपत्रहरू (Death registration certificates)'
  },
  minor_citizenship: {
    label: 'नाबालक नागरिकता प्रमाणपत्र (Minor Citizenship)',
    icon: '👦',
    description: 'नाबालक नागरिकता प्रमाणपत्रहरू (Minor citizenship certificates)'
  },
  nrn_id: {
    label: 'अनिवासी नेपाली परिचयपत्र (NRN ID Card)',
    icon: '🌍',
    description: 'अनिवासी नेपाली परिचयपत्रहरू (Non-Resident Nepali ID cards)'
  }
} as const;

// Export type for document category keys
export type DocumentCategoryKey = keyof typeof DOCUMENT_CATEGORIES;

// Helper function to safely get category info
export const getDocumentCategory = (key: string) => {
  return DOCUMENT_CATEGORIES[key as DocumentCategoryKey];
};

export const SUPPORTED_FILE_TYPES = {
  'image/jpeg': { extension: 'jpg', maxSize: 10 * 1024 * 1024 }, // 10MB
  'image/png': { extension: 'png', maxSize: 10 * 1024 * 1024 },
  'image/gif': { extension: 'gif', maxSize: 5 * 1024 * 1024 },
  'image/webp': { extension: 'webp', maxSize: 10 * 1024 * 1024 },
  'application/pdf': { extension: 'pdf', maxSize: 25 * 1024 * 1024 }, // 25MB
  'application/msword': { extension: 'doc', maxSize: 10 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    extension: 'docx', 
    maxSize: 10 * 1024 * 1024 
  },
  'text/plain': { extension: 'txt', maxSize: 1 * 1024 * 1024 }
} as const;

export const API_ENDPOINTS = {
  DOCUMENTS: '/documents',
  UPLOAD: '/upload',
  DOWNLOAD: '/download',
  SHARE: '/share',
  USERS: '/users',
  AUTH: '/auth'
} as const;

export const STORAGE_KEYS = {
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  USER_PREFERENCES: 'user_preferences',
  UPLOAD_QUEUE: 'upload_queue'
} as const;

export const ERROR_MESSAGES = {
  UPLOAD_FAILED: 'Failed to upload document',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'File type not supported',
  NETWORK_ERROR: 'Network connection error',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'Document not found',
  GENERIC_ERROR: 'An unexpected error occurred'
} as const;