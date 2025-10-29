import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.securedoc.manager',
  appName: 'SecureDoc Manager',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Allow navigation to Firebase auth domains
    allowNavigation: [
      '*.firebaseapp.com',
      '*.google.com',
      'accounts.google.com'
    ]
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
