export const PATHS = {
  landing: '/',
  about: '/about',
  features: '/features',
  contact: '/contact',
  pricing: '/pricing',

  auth: {
    root: '/auth',
    login: '/auth/login',
    register: '/auth/register',
  },

  app: {
    root: '/app',
    dashboard: '/app/dashboard',
    quizzes: '/app/quizzes',
    settings: '/app/settings',
  },
} as const
