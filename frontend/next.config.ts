import type { NextConfig } from 'next';

/** Required for @webcontainer/api (SharedArrayBuffer). Scoped to contest pages only. */
const crossOriginIsolationHeaders = [
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/contests/:contestId',
        headers: crossOriginIsolationHeaders,
      },
    ];
  },
};

export default nextConfig;
