import { Navigate, type RouteObject } from 'react-router-dom'

import RootLayout from '@/layouts/root-layout'
import PublicLayout from '@/layouts/public-layout'
import AuthLayout from '@/layouts/auth-layout'
import AppLayout from '@/layouts/app-layout'
import { requireAuth, requireGuest } from '@/lib/guards'
import { lazyPage } from '@/lib/lazy'
import { PATHS } from '@/lib/path'

const Landing = lazyPage(() => import('@/pages/landing'))
const Features = lazyPage(() => import('@/pages/landing/features'))
const Contact = lazyPage(() => import('@/pages/landing/contact'))
const Pricing = lazyPage(() => import('@/pages/landing/pricing'))

const Login = lazyPage(() => import('@/pages/auth/login'))
const Register = lazyPage(() => import('@/pages/auth/register'))
const ForgotPassword = lazyPage(() => import('@/pages/auth/forgot-password'))
const ResetPassword = lazyPage(() => import('@/pages/auth/reset-password'))

const Analytics = lazyPage(() => import('@/pages/main/analytics'))
const History = lazyPage(() => import('@/pages/main/history'))
const Account = lazyPage(() => import('@/pages/main/account'))
const Quizzes = lazyPage(() => import('@/pages/main/quizzes'))
const Library = lazyPage(() => import('@/pages/main/library'))
const LibraryFolder = lazyPage(() => import('@/pages/main/library-folder'))
const QuizSolvingLayout = lazyPage(() => import('@/pages/main/quiz-solving/layout'))
const QuizIntroView = lazyPage(() => import('@/pages/main/quiz-solving/intro-view'))
const QuizQuestionView = lazyPage(() => import('@/pages/main/quiz-solving/question-view'))
const QuizResultView = lazyPage(() => import('@/pages/main/quiz-solving/result-view'))

const PublicQuizView = lazyPage(() => import('@/pages/public/quiz-view'))

const Marketplace = lazyPage(() => import('@/pages/main/marketplace'))
const MarketplaceListing = lazyPage(() => import('@/pages/main/marketplace-listing'))

const IntegrationSuccess = lazyPage(() => import('@/pages/integrations/success'))
const IntegrationFailure = lazyPage(() => import('@/pages/integrations/failure'))

const NotFound = lazyPage(() => import('@/pages/not-found'))

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: PATHS.landing, lazy: Landing, loader: requireGuest },
          { path: PATHS.features, lazy: Features },
          { path: PATHS.contact, lazy: Contact },
          { path: PATHS.pricing, lazy: Pricing },
          { path: 'public/quizzes/:shareToken', lazy: PublicQuizView },
          { path: 'marketplace', lazy: Marketplace },
          { path: 'marketplace/:quizId', lazy: MarketplaceListing },
        ],
      },

      {
        path: PATHS.auth.root,
        element: <AuthLayout />,
        children: [
          { index: true, element: <Navigate to={PATHS.auth.login} replace /> },
          { path: 'login', lazy: Login, loader: requireGuest },
          { path: 'register', lazy: Register, loader: requireGuest },
          { path: 'forgot-password', lazy: ForgotPassword, loader: requireGuest },
          { path: 'reset-password', lazy: ResetPassword },
        ],
      },

      {
        path: PATHS.app.root,
        element: <AppLayout />,
        loader: requireAuth,
        children: [
          { index: true, element: <Navigate to={PATHS.app.quizzes} replace /> },
          { path: 'analytics', lazy: Analytics },
          { path: 'history', lazy: History },
          { path: 'account', lazy: Account },
          { path: 'quizzes', lazy: Quizzes },
          { path: 'library', lazy: Library },
          { path: 'library/:folderId', lazy: LibraryFolder },
          { path: 'marketplace', lazy: Marketplace },
          { path: 'marketplace/:quizId', lazy: MarketplaceListing },
          {
            path: 'quizzes/:id',
            lazy: QuizSolvingLayout,
            children: [
              { index: true, lazy: QuizIntroView },
              { path: 'question/:questionId', lazy: QuizQuestionView },
              { path: 'result', lazy: QuizResultView },
            ],
          },
        ],
      },

      { path: 'integrations/success', lazy: IntegrationSuccess },
      { path: 'integrations/failure', lazy: IntegrationFailure },

      { path: '*', lazy: NotFound },
    ],
  },
]
