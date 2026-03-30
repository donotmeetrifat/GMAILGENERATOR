import React, { useEffect } from 'react'
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  useLocation,
} from '@tanstack/react-router'
import { Navbar } from '@/components/Navbar'
import { GeneratorPage } from '@/pages/GeneratorPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ToastContainer } from '@/components/ui/Toast'
import { blink } from '@/blink/client'

function AnalyticsTracker() {
  const location = useLocation()
  useEffect(() => {
    blink.analytics.log('page_view', { path: location.pathname })
  }, [location.pathname])
  return null
}

const rootRoute = createRootRoute({
  component: () => (
    <div className="page-bg" style={{ minHeight: '100vh' }}>
      <AnalyticsTracker />
      <Navbar />
      <div style={{ paddingTop: '56px' }}>
        <Outlet />
      </div>
      <ToastContainer />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: GeneratorPage,
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: typeof search.email === 'string' ? search.email : undefined,
  }),
})

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
})

const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$id',
  component: ProjectDetailPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  projectsRoute,
  projectDetailRoute,
  settingsRoute,
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

export default function App() {
  return <RouterProvider router={router} />
}
