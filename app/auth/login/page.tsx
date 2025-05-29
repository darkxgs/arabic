"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

// Create a client component for the login form
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [redirectPath, setRedirectPath] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  
  const supabase = createClient()

  // Check if user was redirected from registration
  useEffect(() => {
    const registered = searchParams.get('registered')
    if (registered === 'true') {
      setSuccessMessage("تم إنشاء الحساب بنجاح. جميع الحسابات الجديدة تحتاج إلى موافقة الإدارة قبل أن تتمكن من تسجيل الدخول. سيتم إبلاغك عندما يتم تأكيد حسابك.")
    }
  }, [searchParams])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Process the login entirely client-side
  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError("")
      setSuccessMessage("")
      
      // Check for empty fields
      if (!formData.email || !formData.password) {
        setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور")
        return
      }
      
      // Sign in with Supabase client
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })
      
      if (signInError) {
        console.error("Login error:", signInError)
        setError(signInError.message || "فشل تسجيل الدخول. الرجاء التحقق من بيانات الاعتماد الخاصة بك")
        return
      }
      
      // Get user role to redirect to proper dashboard
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError("فشل إنشاء جلسة. يرجى المحاولة مرة أخرى")
        return
      }
      
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role_id, is_confirmed")
        .eq("id", session.user.id)
        .single()
      
      if (userError || !userData) {
        console.error("Error fetching user data:", userError)
        setError("حدث خطأ في جلب بيانات المستخدم. يرجى المحاولة مرة أخرى")
        return
      }

      // Check if the account is confirmed
      if (!userData.is_confirmed) {
        await supabase.auth.signOut()
        setError("حسابك بحاجة إلى موافقة الإدارة قبل تسجيل الدخول")
        return
      }
      
      // Determine redirect path based on role
      const dashboardPaths = {
        1: "/student",
        2: "/parent",
        3: "/teacher",
        4: "/admin",
      }
      
      const redirectTo = dashboardPaths[userData.role_id as keyof typeof dashboardPaths] || "/"
      
      // Show success toast and redirect
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "جاري تحويلك إلى لوحة التحكم...",
      })
      
      // Redirect to dashboard
      router.push(redirectTo)
      
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setLoading(false)
    }
  }

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    await handleClientLogin(e)
  }

  return (
    <div className="flex min-h-screen items-center justify-center flex-col p-4 bg-muted/40">
      <div className="text-center space-y-4 mb-10">
          {/* Logo without white frame */}
          <div className="mx-auto">
            <img 
              src="/rased-logo.png" 
              alt="راصد التحفيزية" 
              className="h-28 w-auto" 
              style={{ filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 0.1))' }}
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">أهلاً بك في منصة</h1>
            <h1 className="text-3xl font-bold">راصد التحفيزية</h1>
          </div>
          <p className="text-muted-foreground">الرجاء تسجيل الدخول أو إنشاء حساب جديد للمتابعة</p>
        </div>
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl mb-2">تسجيل الدخول</CardTitle>
          <CardDescription>
            أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="bg-green-50 border border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                placeholder="example@example.com"
                required
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                required
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <Button
              className="w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </span>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            ليس لديك حساب؟{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              إنشاء حساب جديد
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

// Main page component
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
