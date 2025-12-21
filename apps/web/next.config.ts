import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 300,
      static: 3600,
    },
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
