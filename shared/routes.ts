import { z } from 'zod';
import { insertReportSchema, analysis_reports, analysisDataSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  })
};

export const api = {
  reports: {
    create: {
      method: 'POST' as const,
      path: '/api/reports/analyze',
      input: z.object({
        address: z.string().min(1, "Address is required"),
        businessType: z.string().min(1, "Business type is required"),
      }),
      responses: {
        201: z.custom<typeof analysis_reports.$inferSelect>(),
        500: errorSchemas.internal,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/reports/:id',
      responses: {
        200: z.custom<typeof analysis_reports.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/reports',
      responses: {
        200: z.array(z.custom<typeof analysis_reports.$inferSelect>()),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
