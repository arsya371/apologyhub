export const SITE_CONFIG = {
  name: "I'm Sorry",
  description: "An anonymous platform to share your apologies",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;

export const ROUTES = {
  home: "/",
  submit: "/submit",
  browse: "/browse",
  apology: (id: string) => `/apology/${id}`,
  admin: {
    login: "/pradmin/login",
    dashboard: "/pradmin/dashboard",
    apologies: "/pradmin/apologies",
    settings: "/pradmin/settings",
  },
} as const;

export const API_ROUTES = {
  apologies: "/api/apologies",
  apology: (id: string) => `/api/apologies/${id}`,
  turnstile: "/api/turnstile/verify",
  admin: {
    analytics: "/api/admin/analytics",
    settings: "/api/admin/settings",
    announcement: "/api/admin/announcement",
    logs: "/api/admin/logs",
  },
} as const;

export const RATE_LIMITS = {
  apologySubmission: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
  },
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export const APOLOGY_CONSTRAINTS = {
  minLength: 10,
  maxLength: 500,
  toWhoMaxLength: 100,
} as const;
