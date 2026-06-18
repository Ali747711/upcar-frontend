import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { LogIn, ArrowRight, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { login as loginApi } from "@/lib/api/auth"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const { token, user } = await loginApi({ email, password })
      login(token, user)
      toast.success("Logged in successfully")
      navigate("/")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full bg-background">
      {/* Left Side - Cinematic Visual */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px]" />
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80"
          alt="Luxury car detail"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Branding Overlay */}
        <div className="relative z-20 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-lg shadow-primary/20">
              <img
                src="/logo.png"
                alt="Upcar Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight">Upcar</span>
          </div>

          <div className="max-w-md space-y-6">
            <h1 className="text-5xl leading-tight font-bold tracking-tighter">
              Precision Managed <br />
              <span className="text-primary">Parts Studio.</span>
            </h1>
            <p className="text-lg text-white/70">
              The professional suite for high-performance automotive parts
              inventory and inspection.
            </p>

            <div className="flex flex-col gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <ShieldCheck className="size-4 text-primary" />
                </div>
                <span className="text-sm font-medium">
                  Enterprise Grade Security
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <ArrowRight className="size-4 text-primary" />
                </div>
                <span className="text-sm font-medium">
                  Real-time Cloud Sync
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-white/40">
            © 2026 Upcar Technologies. All rights reserved.
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 z-15 [mask-image:radial-gradient(600px_at_50%_50%,white,transparent)] opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Right Side - Clean Auth Form */}
      <div className="flex w-full flex-col items-center justify-center px-8 py-12 lg:w-1/2">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Sign in</h2>
            <p className="text-muted-foreground">
              Welcome back. Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                />
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              className={cn(
                "h-11 w-full text-base font-semibold transition-all active:scale-[0.98]",
                "shadow-[0_0_20px_rgba(var(--primary),0.3)]"
              )}
              disabled={loading}
            >
              {loading ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <LogIn data-icon="inline-start" />
              )}
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-11" type="button">
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.02 1.024-2.6 2.12-5.912 2.12-5.416 0-9.84-4.392-9.84-9.808s4.424-9.808 9.84-9.808c2.936 0 5.144 1.152 6.752 2.68l2.304-2.304C19.24 1.576 16.24 0 12.48 0 5.584 0 0 5.584 0 12.48s5.584 12.48 12.48 12.48c3.752 0 6.576-1.24 8.712-3.488 2.2-2.192 2.896-5.296 2.896-7.752 0-.744-.064-1.464-.184-2.128h-11.416Z"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-11" type="button">
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                />
              </svg>
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Get started for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
