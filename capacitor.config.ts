import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pitchiq.app',
  appName: 'PitchIQ',
  server: {
    url: 'https://pitch-iq.up.railway.app/',
    cleartext: false,
  },
};

export default config;