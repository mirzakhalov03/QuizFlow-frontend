import { Suspense } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Spinner from "@/components/ui/spinner"
import { routes } from "./routes"

const router = createBrowserRouter(routes)

function RouterFallback() {
  return (
    <div className="min-h-screen grid place-items-center">
      <Spinner size="lg" />
    </div>
  )
}

export const AppRouter = () => (
  <Suspense fallback={<RouterFallback />}>
    <RouterProvider router={router} />
  </Suspense>
)
