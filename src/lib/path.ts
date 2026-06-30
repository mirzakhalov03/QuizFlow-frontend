export const PATHS = {
  landing: '/',
  about: '/about',
  features: '/features',
  contact: '/contact',
  pricing: '/pricing',
  marketplace: '/marketplace',
  marketplaceListing: (quizId: string) => `/marketplace/${quizId}`,

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
    history: '/app/history',
    account: '/app/account',
    quizzes: '/app/quizzes',
    quiz: (id: string) => `/app/quizzes/${id}`,
    library: '/app/library',
    libraryFolder: (id: string) => `/app/library/${id}`,
    marketplace: '/app/marketplace',
    marketplaceListing: (quizId: string) => `/app/marketplace/${quizId}`,
    quizQuestion: (id: string, questionId: string) => `/app/quizzes/${id}/question/${questionId}`,
    quizResult: (id: string) => `/app/quizzes/${id}/result`,
  },

  public: {
    quiz: (token: string) => `/public/quizzes/${token}`,
  },
} as const
