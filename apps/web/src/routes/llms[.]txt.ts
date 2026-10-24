import { createFileRoute } from '@tanstack/react-router';
import { COUNTRIES_WITH_SLUG } from '@/lib/countries-data';
import { currentYear } from '@/lib/holidays-api';
import { API_URL, SITE_URL } from '@/lib/seo';

/** Plain-text guide for AI agents and LLMs, see https://llmstxt.org */
function buildLlmsTxt() {
  const countries = COUNTRIES_WITH_SLUG.map(
    (c) => `- [${c.name} holidays ${currentYear}](${SITE_URL}/holidays/${c.code.toLowerCase()}/${currentYear}): code \`${c.code.toLowerCase()}\`, slug \`${c.slug}\``
  ).join('\n');

  return `# 11holidays

> Public holidays, festivals and long weekends for 230+ countries. Every page is server-rendered HTML with schema.org JSON-LD (Event, ItemList, Dataset, FAQPage). Holiday data is also available as free iCal feeds and through a REST API.

Countries are identified by ISO 3166-1 alpha-2 codes in lowercase (\`us\`, \`in\`, \`gb\`) or by a slug of the country name (\`united-states-of-america\`). Dates use ISO 8601 (\`YYYY-MM-DD\`).

## Pages

- [All countries](${SITE_URL}/countries): every supported country with its code
- [Holidays this year](${SITE_URL}/holidays): holidays and festivals around the world
- [Search](${SITE_URL}/search?q=diwali): \`/search?q={name}\` finds a holiday in every country that observes it
- Country holidays by year: \`${SITE_URL}/holidays/{code}/{year}\`, for example [${SITE_URL}/holidays/us/${currentYear}](${SITE_URL}/holidays/us/${currentYear})
- Country holidays and festivals: \`${SITE_URL}/holidays/{code}\`
- A single holiday with dates, history and countdown: \`${SITE_URL}/holidays/{code}/{holiday-slug}\`, for example [${SITE_URL}/holidays/in/diwali](${SITE_URL}/holidays/in/diwali)
- Upcoming holidays: \`${SITE_URL}/upcoming-holidays/{slug}\`
- Long weekends: \`${SITE_URL}/long-weekends/{slug}?year={year}\`
- Holiday calendar maker: \`${SITE_URL}/calendars/{slug}\`

## Tools

- [All tools](${SITE_URL}/tools)
- [Countdown timer](${SITE_URL}/countdown): \`/countdown?title={name}&date={YYYY-MM-DD}\` or \`{YYYY-MM-DDTHH:mm}\`
- [Working days calculator](${SITE_URL}/working-days-calculator): business days between two dates and working days per month, excluding public holidays. \`?country={code}&year={year}\`
- [Leave planner](${SITE_URL}/leave-planner): bridges public holidays and weekends to get the most days off from a leave budget. \`?country={code}&year={year}&leaves={1-40}\`
- Countdown widget: \`${SITE_URL}/embed/countdown?holiday={code}/{holiday-slug}\` as an iframe

## Data feeds (free, no key)

- iCal feed: \`${SITE_URL}/ics/{code}\` returns the current and next year as \`text/calendar\`. Add \`?year={year}\` for one year, or \`?public=1\` for public holidays only.
- [Sitemap](${SITE_URL}/sitemap.xml): every page URL

## REST API (API key required)

- Base URL: \`${API_URL}\`
- Authentication: \`Authorization: Bearer {API_KEY}\`. [Get an API key](${SITE_URL}/api-key), [pricing](${SITE_URL}/pricing), [API reference](${SITE_URL}/docs/api), [OpenAPI spec](${API_URL}/openapi.json)
- \`GET /holidays?country={CODE}&year={YYYY}\`: holidays for a country and year as a JSON array of \`{ holiday_id, date, name, type, country }\`
- \`GET /countries\`: supported countries
- \`GET /occasions\`: holidays and festivals with descriptions

\`\`\`bash
curl "${API_URL}/holidays?country=US&year=${currentYear}" -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

## Optional

- [Embeddable holidays widget](${SITE_URL}/widget)
- [About](${SITE_URL}/about)
- [Terms of service](${SITE_URL}/terms)
- [Contact](${SITE_URL}/contact)

## Countries

${countries}
`;
}

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildLlmsTxt(), {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        }),
    },
  },
});
