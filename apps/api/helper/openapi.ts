import { z } from '@hono/zod-openapi';

export const messageSchema = z
  .object({
    message: z.string().openapi({ example: 'No holidays found' }),
  })
  .openapi('Message');

const ERRORS = {
  400: ['Bad request, the query or path parameters are invalid', 'country: Country must be a 2-character code'],
  401: ['Unauthorized, the API key is missing or invalid', 'Invalid API Key'],
  404: ['Not found, no record exists with the given id', 'No holidays found'],
} as const;

type ErrorStatus = keyof typeof ERRORS;

type ErrorResponse = {
  description: string;
  content: {
    'application/json': {
      schema: typeof messageSchema;
      example: { message: string };
    };
  };
};

/** Standard error responses documented for a route */
export const errorResponses = <S extends ErrorStatus>(...statuses: S[]) =>
  Object.fromEntries(
    statuses.map((status) => [
      status,
      {
        description: ERRORS[status][0],
        content: {
          'application/json': {
            schema: messageSchema,
            example: { message: ERRORS[status][1] },
          },
        },
      },
    ])
  ) as { [K in S]: ErrorResponse };

export const apiDescription = `REST API for public holidays, bank holidays and observances of 230+ countries.

## Authentication
Every request needs an API key in the \`Authorization\` header. Get a free key at [11holidays.com/api-key](https://11holidays.com/api-key).

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## SDK
Use the official [npm package](https://www.npmjs.com/package/11holidays): \`npm i 11holidays\`.`;
