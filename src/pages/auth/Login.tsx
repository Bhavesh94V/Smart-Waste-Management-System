'use client'

import React from 'react'

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Recycle, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        toast({
          title: 'Welcome back!',
          description: 'You have been logged in successfully.'
        })

        // Role based redirect
        const storedUser = JSON.parse(localStorage.getItem('wms_user') || '{}')

        if (storedUser.role === 'admin') navigate('/admin')
        else if (storedUser.role === 'collector') navigate('/collector')
        else navigate('/citizen')
      } else {
        toast({
          title: 'Login Failed',
          description: result.error || 'Invalid email or password.',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4'>
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl' />
      </div>

      <Card className='w-full max-w-md relative animate-scale-in shadow-xl border-0'>
        <CardHeader className='text-center space-y-4'>
          <div className='mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-glow'>
            <Recycle className='w-8 h-8 text-primary-foreground' />
          </div>
          <div>
            <CardTitle className='text-2xl font-bold'>Welcome Back</CardTitle>
            <CardDescription className='mt-2'>
              Sign in to your Smart Waste Management account
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  id='email'
                  type='email'
                  placeholder='you@example.com'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className='pl-10'
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='pl-10 pr-10'
                  disabled={isLoading}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
            </div>

            {/* Demo credentials */}
            <div className='bg-muted/50 rounded-lg p-3 text-sm space-y-1'>
              <p className='font-medium text-foreground'>Demo Credentials:</p>
              <p className='text-muted-foreground'>
                <span className='font-mono text-xs'>citizen@test.com</span> /{' '}
                <span className='font-mono text-xs'>password123</span>
              </p>
              <p className='text-muted-foreground'>
                <span className='font-mono text-xs'>collector@test.com</span> /{' '}
                <span className='font-mono text-xs'>password123</span>
              </p>
              <p className='text-muted-foreground'>
                <span className='font-mono text-xs'>admin@test.com</span> /{' '}
                <span className='font-mono text-xs'>password123</span>
              </p>
            </div>
          </CardContent>

          <CardFooter className='flex flex-col gap-4'>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <p className='text-sm text-muted-foreground text-center'>
              Don't have an account?{' '}
              <Link
                to='/register'
                className='text-primary font-medium hover:underline'
              >
                Register here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
