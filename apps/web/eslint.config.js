import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ['dist/**', '.wrangler/**', 'src/routeTree.gen.ts', 'cloudflare-env.d.ts'] },
  ...config,
  {
    // TypeScript already validates props
    rules: { 'react/prop-types': 'off' },
  },
];
