"use client"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useState } from "react"
import {
  Loader2,
  LogIn,
  Lock,
  User,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"


const SignInPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const form = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: { identifier: string; password: string }) => {
    setIsSubmitting(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    })

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid credentials. Please check your username/email and password.");
      return;
    }

    if (result?.url) {
      router.replace("/dashboard")
    }
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0,},
    
    transition: { duration: 0.2 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.8
            }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Back to Home */}
      <Link 
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Home</span>
      </Link>

      <motion.div
        className="w-full max-w-md relative z-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Main Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 relative overflow-hidden"
          {...fadeInUp}
        >
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="absolute top-4 left-12 w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="absolute top-4 left-20 w-3 h-3 bg-green-400 rounded-full"></div>

          {/* Header */}
          <div className="text-center mb-8 mt-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <LogIn className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to continue your journey
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center"
              >
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Username/Email Field */}
            <motion.div {...fadeInUp}>
              <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="identifier"
                  type="text"
                  {...form.register("identifier", { required: "This field is required" })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your username or email"
                />
              </div>
              {form.formState.errors.identifier && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-2 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {form.formState.errors.identifier.message}
                </motion.div>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div {...fadeInUp}>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  {...form.register("password", { required: "This field is required" })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
              </div>
              {form.formState.errors.password && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-2 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {form.formState.errors.password.message}
                </motion.div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              {...fadeInUp}
              whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-center">
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                {isSubmitting ? "Signing In..." : "Sign In"}
              </div>
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div
            className="mt-6 text-center"
            {...fadeInUp}
          >
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-500 text-sm font-medium">Don't have an account?</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <Link
              href="/sign-up"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors font-semibold group"
            >
              Create Account
              <motion.div
                className="ml-2"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                →
              </motion.div>
            </Link>
          </motion.div>

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-green-50 opacity-30 rounded-3xl pointer-events-none"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SignInPage
