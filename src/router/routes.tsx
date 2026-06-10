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
const Account = lazyPage(() => import('@/pages/main/account'))
const Quizzes = lazyPage(() => import('@/pages/main/quizzes'))
const QuizSolvingUI = lazyPage(() => import('@/pages/main/quizSolvingUI'))

const PublicQuizView = lazyPage(() => import('@/pages/public/quiz-view'))

const IntegrationSuccess = lazyPage(() => import('@/pages/integrations/success'))

const NotFound = lazyPage(() => import('@/pages/not-found'))

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: PATHS.landing, lazy: Landing },
          { path: PATHS.features, lazy: Features },
          { path: PATHS.contact, lazy: Contact },
          { path: PATHS.pricing, lazy: Pricing },
          { path: 'public/quizzes/:shareToken', lazy: PublicQuizView },
        ],
      },

      {
        path: PATHS.auth.root,
        element: <AuthLayout />,
        loader: requireGuest,
        children: [
          { index: true, element: <Navigate to={PATHS.auth.login} replace /> },
          { path: 'login', lazy: Login },
          { path: 'register', lazy: Register },
          { path: 'forgot-password', lazy: ForgotPassword },
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
          { path: 'account', lazy: Account },
          { path: 'quizzes', lazy: Quizzes },
          { path: 'quizzes/:id', lazy: QuizSolvingUI },
        ],
      },

      { path: 'integrations/success', lazy: IntegrationSuccess },

      { path: '*', lazy: NotFound },
    ],
  },
]
