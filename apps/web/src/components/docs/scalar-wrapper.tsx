import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useTheme } from '@/components/theme-provider';
import { OPENAPI_URL } from '@/lib/seo';

/** Scalar API reference for the 11holidays OpenAPI spec. Browser only, load it lazily */
export function ScalarWrapper() {
  const { resolvedTheme } = useTheme();

  return (
    <ApiReferenceReact
      configuration={{
        sources: [
          {
            title: '11holidays API',
            slug: '11holidays-api',
            url: OPENAPI_URL,
            default: true,
            agent: { disabled: true },
          },
        ],
        withDefaultFonts: false,
        // Hide Scalar's own tooling and upsells, keep the reference and "Test Request"
        showDeveloperTools: 'never',
        mcp: { disabled: true },
        hideDarkModeToggle: true,
        forceDarkModeState: resolvedTheme === 'dark' ? 'dark' : 'light',
        customCss: `.scalar-app { --scalar-font: 'Inter', ui-sans-serif, system-ui, sans-serif; }`,
      }}
    />
  );
}
