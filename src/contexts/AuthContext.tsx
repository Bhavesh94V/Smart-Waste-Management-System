'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect
} from 'react'
import { User, UserRole } from '@/types'
import { authAPI } from '@/services/api'

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  address: string
  password: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  register: (
    userData: RegisterData
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('wms_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response: any = await authAPI.login(email, password)

      const userData = response?.data?.user

      if (!userData) throw new Error('Invalid login response')

      setUser(userData)
      localStorage.setItem('wms_user', JSON.stringify(userData))

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }, [])

  const register = useCallback(async (userData: RegisterData) => {
    try {
      const response: any = await authAPI.register(userData)

      const newUser = response?.data?.user

      if (!newUser) throw new Error('Invalid register response')

      setUser(newUser)
      localStorage.setItem('wms_user', JSON.stringify(newUser))

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }, [])

  const logout = useCallback(async () => {
    await authAPI.logout()
    setUser(null)
    localStorage.removeItem('wms_user')
    localStorage.removeItem('wms_token')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
