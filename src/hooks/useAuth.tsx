import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import { getMe } from "@/lib/api/auth"
import {
  clearToken,
  getToken,
  setToken,
  UNAUTHORIZED_EVENT,
} from "@/lib/auth/token"
import type { User } from "@/types/auth"

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Mirror of `user` for event handlers, to avoid stale closures / re-subscribing.
  const userRef = useRef<User | null>(null)
  userRef.current = user

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const login = useCallback((token: string, nextUser: User) => {
    setToken(token)
    setUser(nextUser)
  }, [])

  useEffect(() => {
    async function initAuth() {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const me = await getMe()
        setUser(me)
      } catch {
        clearToken()
      } finally {
        setLoading(false)
      }
    }

    void initAuth()
  }, [])

  // When any API call reports a 401, the token is already cleared; drop the
  // in-memory user too so route guards redirect to /login. Only notify if the
  // user was actually signed in (avoids a spurious toast on initial load).
  useEffect(() => {
    const handleUnauthorized = () => {
      if (userRef.current) {
        toast.error("Your session expired. Please sign in again.")
      }
      setUser(null)
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
