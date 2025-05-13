"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/src/context/AuthContext"
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  Mail,
  KeyRound,
  AlertTriangle,
  MailCheck,
  ShieldAlert,
  RefreshCw,
  Info,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import { useResendActivation, extractErrorMessage } from "@/src/api/auth" // Import the new resend activation hook

// Define possible auth error types for better handling
type AuthErrorType =
  | "inactive-account"
  | "invalid-credentials"
  | "account-locked"
  | "forbidden"
  | "server-error"
  | "network-error"
  | "unknown"

interface AuthError {
  type: AuthErrorType
  message: string
  resolution?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

// Function to parse error messages and determine error type
const parseAuthError = (error: any): AuthError => {
  // Extract the error message from the API response
  const errorMessage = extractErrorMessage(error)

  // Check for specific error patterns in the message
  if (errorMessage.toLowerCase().includes("inactive") || errorMessage.toLowerCase().includes("activate your account")) {
    return {
      type: "inactive-account",
      message: errorMessage, // Use the actual error message
      resolution: "Please activate your account by clicking the link in your email",
      action: {
        label: "Resend activation email",
        onClick: () => {}, // This will be defined in the component
      },
    }
  }

  if (errorMessage.toLowerCase().includes("locked") || errorMessage.toLowerCase().includes("suspended")) {
    return {
      type: "account-locked",
      message: errorMessage, // Use the actual error message
      resolution: "Please contact support for assistance",
      action: {
        label: "Contact Support",
        href: "/support",
      },
    }
  }

  if (
    error.response?.status === 401 ||
    errorMessage.toLowerCase().includes("invalid") ||
    errorMessage.toLowerCase().includes("incorrect") ||
    errorMessage.toLowerCase().includes("wrong password")
  ) {
    return {
      type: "invalid-credentials",
      message: errorMessage, // Use the actual error message
      resolution: "Please check your credentials and try again",
    }
  }

  if (error.response?.status === 403) {
    return {
      type: "forbidden",
      message: errorMessage, // Use the actual error message
      resolution: "You don't have permission to access this resource",
    }
  }

  if (error.response?.status >= 500) {
    return {
      type: "server-error",
      message: errorMessage, // Use the actual error message
      resolution: "Please try again later or contact support if the problem persists",
    }
  }

  if (error.name === "NetworkError" || errorMessage.includes("Network Error") || !error.response) {
    return {
      type: "network-error",
      message: "Network connection error",
      resolution: "Please check your internet connection and try again",
    }
  }

  // Default error - display the actual error message from the backend
  return {
    type: "unknown",
    message: errorMessage,
    resolution: "Please try again or contact support if the problem persists",
  }
}

// Error icon mapping
const getErrorIcon = (errorType: AuthErrorType) => {
  switch (errorType) {
    case "inactive-account":
      return <MailCheck className="h-5 w-5" />
    case "account-locked":
      return <ShieldAlert className="h-5 w-5" />
    case "forbidden":
      return <ShieldAlert className="h-5 w-5" />
    case "server-error":
      return <RefreshCw className="h-5 w-5" />
    case "network-error":
      return <AlertTriangle className="h-5 w-5" />
    default:
      return <Info className="h-5 w-5" />
  }
}

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"
  const { login } = useAuth()
  const resendActivation = useResendActivation() // Use the resend activation hook

  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<AuthError | null>(null)
  const [success, setSuccess] = useState(false)
  const [savedEmail, setSavedEmail] = useState("") // Store email for resend activation

  // Background elements
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>
  >([])
  const [gradientPosition, setGradientPosition] = useState({ x: 0, y: 0 })

  // Mouse follow effect for gradient
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      setGradientPosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Initialize particles
  useEffect(() => {
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 1,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.12 + 0.03,
    }))
    setParticles(newParticles)
  }, [])

  // Function to handle resending activation email
  const handleResendActivation = async () => {
    if (!savedEmail) return

    try {
      setIsLoading(true)
      await resendActivation.mutateAsync(savedEmail)

      // Show success message
      setAuthError({
        type: "inactive-account",
        message: "Activation email sent!",
        resolution: "Please check your inbox and click the activation link.",
      })
    } catch (err) {
      // Extract the actual error message
      const errorMessage = extractErrorMessage(err)

      setAuthError({
        type: "unknown",
        message: errorMessage,
        resolution: "Please try again later or contact support.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)
    setSuccess(false)
    setSavedEmail(email) // Save email for potential resend activation

    try {
      // Simulate a brief delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Show success animation briefly before redirecting
      setSuccess(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await login(email, password)
    } catch (err: any) {
      const parsedError = parseAuthError(err)

      // Update the onClick handler for inactive account action
      if (parsedError.type === "inactive-account" && parsedError.action) {
        parsedError.action.onClick = handleResendActivation
      }

      setAuthError(parsedError)
      setSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  }

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0, rotateY: 90 },
    visible: {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: {
        delay: 0.3,
        duration: 0.8,
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 p-4"
      style={{
        backgroundImage: `radial-gradient(circle at ${gradientPosition.x}% ${gradientPosition.y}%, rgba(129, 102, 255, 0.1) 0%, rgba(65, 39, 158, 0.05) 25%, rgba(240, 240, 250, 0) 50%, rgba(240, 240, 250, 0) 100%) dark:radial-gradient(circle at ${gradientPosition.x}% ${gradientPosition.y}%, rgba(129, 102, 255, 0.2) 0%, rgba(65, 39, 158, 0.1) 25%, rgba(20, 20, 40, 0) 50%)`,
      }}
    >
      {/* Animated glowing orb */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-300/20 dark:bg-purple-600/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300/20 dark:bg-indigo-600/10 blur-3xl" />

      {/* Animated grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage:
            "linear-gradient(to right, rgb(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgb(99, 102, 241, 0.2) 1px, transparent 1px)",
        }}
      />

      {/* Animated particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="pointer-events-none absolute rounded-full bg-indigo-400 dark:bg-purple-400"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            opacity: particle.opacity,
          }}
          animate={{
            y: [`${particle.y}vh`, `${(particle.y + 15) % 100}vh`],
            opacity: [particle.opacity, particle.opacity / 2, particle.opacity],
          }}
          transition={{
            duration: 12 / particle.speed,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative w-full max-w-5xl">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="overflow-hidden border-none bg-white/80 dark:bg-black/20 backdrop-blur-xl md:flex">
            {/* Image Section */}
            <div className="relative hidden w-full md:block md:w-6/12">
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute inset-0 z-10 bg-gradient-to-r from-indigo-900 to-violet-800 opacity-80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ duration: 1.5 }}
                />

                {/* Animated light flare */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    scale: [0.8, 1.2, 1.5],
                    top: ["60%", "30%", "10%"],
                    left: ["30%", "50%", "70%"],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  className="absolute h-40 w-40 rounded-full bg-white blur-3xl"
                />

                <motion.img
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2 }}
                  src="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=2070&auto=format&fit=crop"
                  alt="Abstract design"
                  className="h-full w-full object-cover"
                />

                {/* Vertical grid lines */}
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundSize: "20px 20px",
                    backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                  }}
                />
              </div>

              <motion.div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <motion.div variants={logoVariants} initial="hidden" animate="visible" className="mb-8">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 p-2 backdrop-blur-sm">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <motion.path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
                      />
                      <motion.path
                        d="M2 17L12 22L22 17"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 1.2, ease: "easeInOut" }}
                      />
                      <motion.path
                        d="M2 12L12 17L22 12"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 1.0, ease: "easeInOut" }}
                      />
                    </svg>
                  </div>
                </motion.div>

                <div className="relative">
                  <motion.h2
                    className="mb-2 text-4xl font-bold text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  >
                    Skyline
                  </motion.h2>

                  {/* Animated underline */}
                  <motion.div
                    className="mx-auto h-[3px] w-12 bg-gradient-to-r from-purple-400 to-blue-400"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 48, opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                  />
                </div>

                <motion.p
                  className="mt-4 max-w-xs text-lg font-light text-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                >
                  Sign in to unlock your personalized dashboard and powerful analytics tools
                </motion.p>

                {/* Animated dots */}
                <motion.div className="mt-8 flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-white"
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.3,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* Form Section */}
            <div className="w-full md:w-6/12">
              <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-8 md:p-10">
                <CardHeader className="space-y-1 p-0 pb-8">
                  <motion.div variants={itemVariants}>
                    <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Sign in
                    </CardTitle>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <CardDescription className="text-base text-slate-500 dark:text-slate-400">
                      Enter your credentials to access your account
                    </CardDescription>
                  </motion.div>
                </CardHeader>

                <CardContent className="p-0">
                  <AnimatePresence>
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                      >
                        <Alert
                          variant={authError.type === "invalid-credentials" ? "destructive" : "default"}
                          className={`border ${
                            authError.type === "inactive-account"
                              ? "border-amber-800/50 bg-amber-950/50 text-amber-400"
                              : authError.type === "invalid-credentials"
                                ? "border-red-800/50 bg-red-950/50 text-red-400"
                                : authError.type === "forbidden"
                                  ? "border-red-800/50 bg-red-950/50 text-red-400"
                                  : "border-blue-800/50 bg-blue-950/50 text-blue-400"
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5">{getErrorIcon(authError.type)}</div>
                            <div>
                              <AlertTitle className="mb-1 text-base font-medium">{authError.message}</AlertTitle>
                              {authError.resolution && (
                                <AlertDescription className="text-sm">{authError.resolution}</AlertDescription>
                              )}

                              {/* Action button for specific error types */}
                              {authError.action && (
                                <div className="mt-3">
                                  {authError.action.href ? (
                                    <Link href={authError.action.href}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={`${
                                          authError.type === "inactive-account"
                                            ? "border-amber-800 bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                                            : "border-blue-800 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                                        }`}
                                      >
                                        {authError.action.label}
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={authError.action.onClick}
                                      className={`${
                                        authError.type === "inactive-account"
                                          ? "border-amber-800 bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                                          : "border-blue-800 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                                      }`}
                                      disabled={isLoading}
                                    >
                                      {isLoading ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Sending...
                                        </>
                                      ) : (
                                        authError.action.label
                                      )}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email Address
                      </Label>
                      <div className="group relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading || success}
                          className="h-12 rounded-lg border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50 pl-10 text-slate-900 dark:text-white shadow-sm transition-all focus-visible:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500"
                        />
                        <motion.div
                          className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-purple-500 to-blue-500"
                          initial={false}
                          animate={{ width: email ? "100%" : "0%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Password
                      </Label>
                      <div className="group relative">
                        <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading || success}
                          className="h-12 rounded-lg border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50 pl-10 text-slate-900 dark:text-white shadow-sm transition-all focus-visible:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500"
                        />
                        <motion.div
                          className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-purple-500 to-blue-500"
                          initial={false}
                          animate={{ width: password ? "100%" : "0%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        className="relative h-12 w-full overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-base font-medium text-white shadow-lg shadow-purple-900/30 transition-all hover:shadow-purple-800/40 disabled:opacity-90"
                        disabled={isLoading || success}
                      >
                        <AnimatePresence mode="wait">
                          {success ? (
                            <motion.div
                              key="success"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 1.5, opacity: 0 }}
                              className="flex items-center"
                            >
                              <CheckCircle2 className="mr-2 h-5 w-5" />
                              Success!
                            </motion.div>
                          ) : isLoading ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Signing in...
                            </motion.div>
                          ) : (
                            <motion.div
                              key="signin"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              Sign in
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Button background animation */}
                        <motion.div
                          className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0"
                          initial={false}
                          animate={{ opacity: isLoading || success ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Button shine effect */}
                        <motion.div
                          className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={{ x: ["100%", "-100%"] }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatDelay: 5,
                          }}
                        />
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>

                <CardFooter className="mt-6 flex justify-center p-0">
                  <motion.div variants={itemVariants} className="text-sm text-slate-500 dark:text-slate-400">
                    Don't have an account?{" "}
                    <Link
                      href="/sign-up"
                      className="font-medium text-purple-600 dark:text-purple-400 transition-colors hover:text-purple-500 dark:hover:text-purple-300"
                    >
                      Sign up
                    </Link>
                  </motion.div>
                </CardFooter>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
