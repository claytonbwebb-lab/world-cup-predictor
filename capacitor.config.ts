import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playpredictwin.app',
  appName: 'PlayPredictWin',
  webDir: 'public',
  server: {
    url: 'https://playpredictwin.com',
    iosScheme: 'https',
  },
};

export default config;
