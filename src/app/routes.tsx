import { Navigate, type RouteObject } from 'react-router-dom'

import RootLayout from '@/layouts/root-layout'
import PublicLayout from '@/layouts/public-layout'
import AuthLayout from '@/layouts/auth-layout'
import AppLayout from '@/layouts/app-layout'

import { requireAuth, requireGuest } from '@/lib/router/guards'
import { lazyPage } from '@/lib/router/lazy'
import { PATHS } from '@/lib/router/path'

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: PATHS.landing, lazy: lazyPage(() => import('@/pages/landing')) },
          { path: PATHS.features, lazy: lazyPage(() => import('@/pages/landing/features')) },
          { path: PATHS.contact, lazy: lazyPage(() => import('@/pages/landing/contact')) },
          { path: PATHS.pricing, lazy: lazyPage(() => import('@/pages/landing/pricing')) },
        ],
      },

      {
        path: PATHS.auth.root,
        element: <AuthLayout />,
        loader: requireGuest,
        children: [
          { index: true, element: <Navigate to={PATHS.auth.login} replace /> },
          { path: 'login', lazy: lazyPage(() => import('@/pages/auth/login')) },
          { path: 'register', lazy: lazyPage(() => import('@/pages/auth/register')) },
        ],
      },

      {
        path: PATHS.app.root,
        element: <AppLayout />,
        loader: requireAuth,
        children: [
          { index: true, element: <Navigate to={PATHS.app.dashboard} replace /> },
          { path: 'dashboard', lazy: lazyPage(() => import('@/pages/main/dashboard')) },
          { path: 'account', lazy: lazyPage(() => import('@/pages/main/account')) },
          { path: 'quizzes', lazy: lazyPage(() => import('@/pages/main/quizzes')) },
          { path: 'settings', lazy: lazyPage(() => import('@/pages/main/settings')) },
        ],
      },

      { path: '*', lazy: lazyPage(() => import('@/pages/not-found')) },
    ],
  },
]
