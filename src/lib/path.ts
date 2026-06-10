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
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  app: {
    root: '/app',
    analytics: '/app/analytics',
    account: '/app/account',
    quizzes: '/app/quizzes',
    quiz: (id: string) => `/app/quizzes/${id}`,
  },

  public: {
    quiz: (token: string) => `/public/quizzes/${token}`,
  },
} as const
