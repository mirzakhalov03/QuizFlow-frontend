import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PATHS } from "@/lib/router/path"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

const inputClass = cn(
  "w-full h-10 px-3 rounded-md border border-border bg-background text-sm",
  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
)

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: replace with real API call
      await new Promise((r) => setTimeout(r, 500))
      localStorage.setItem("token", "demo-token")
      toast.success("Signed in")
      const from = params.get("from")
      navigate(from?.startsWith("/app") ? from : PATHS.app.dashboard, {
        replace: true,
      })
    } catch {
      toast.error("Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back — sign in to continue.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Link to="#" className="text-xs text-muted-foreground hover:text-foreground">
            Forgot?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Sign in
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        No account?{" "}
        <Link to={PATHS.auth.register} className="text-foreground hover:underline">
          Create one
        </Link>
      </p>
    </form>
  )
}
