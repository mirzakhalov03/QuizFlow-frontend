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
    account: '/app/account',
    quizzes: '/app/quizzes',
    quiz: (id: string) => `/app/quizzes/${id}`,
    settings: '/app/settings',
  },
} as const
