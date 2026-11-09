import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'gt.edu.umg.sistemacitas',
  appName: 'Citas Medicas',
  webDir: 'dist/sistema-citas-movil/browser',
  android: {
    allowMixedContent: true
  }
};

export default config;
