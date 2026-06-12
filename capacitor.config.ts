import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pitchperfect.app',
  appName: 'Pitch Perfect',
  server: {
    url: 'https://pitch-perfect.up.railway.app/',
    cleartext: false,
  },
};

export default config;