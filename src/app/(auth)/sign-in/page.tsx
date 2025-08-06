"use client"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useState } from "react"
import Container from "@/components/Container"
import {
  Loader2,
  LogIn,
  Lock,
  User,
  AlertCircle,
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
    <Container className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-lg"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >


        {/* Main Card */}
        <motion.div
          className="bg-base-200 backdrop-blur-sm border border-white/20 p-8"

          {...fadeInUp}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 text-primary">
              Welcome Back
            </h1>
            <p className="text-neutral-300 text-lg">
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
                className="mb-6 p-4 bg-red-400/10 border border-red-200 rounded-xl text-red-700 text-sm flex items-center"
              >
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Username/Email Field */}
            <motion.div {...fadeInUp}>
              <label htmlFor="identifier" className="block text-sm font-semibold text-gray-200 mb-3">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" />
                <input
                  id="identifier"
                  type="text"
                  {...form.register("identifier", { required: "This field is required" })}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border border-gray-200 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none "
                  placeholder="Enter your username or email"
                />
              </div>
              {form.formState.errors.identifier && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-3 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {form.formState.errors.identifier.message}
                </motion.div>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div {...fadeInUp}>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" />
                <input
                  id="password"
                  type="password"
                  {...form.register("password", { required: "This field is required" })}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border border-gray-200 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none"
                  placeholder="Enter your password"
                />
              </div>
              {form.formState.errors.password && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-3 text-sm text-red-600"
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
              className="btn btn-primary w-full py-4 text-lg font-semibold"
              {...fadeInUp}
              whileHover={!isSubmitting ? { scale: 1.02, y: -2, skewX: '-5deg' } : {}}
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
            className="mt-8 text-center"
            {...fadeInUp}
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-neutral-300 text-sm font-medium">Don't have an account?</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <Link
              href="/sign-up"
              className="inline-flex items-center text-primary hover:text-primary/50 transition-colors font-semibold text-lg group"
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


        </motion.div>


      </motion.div>
    </Container>
  );
}

export default SignInPage
