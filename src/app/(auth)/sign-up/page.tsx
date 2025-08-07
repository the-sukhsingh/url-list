"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Form validation schema
const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const debounced = useDebounceCallback(setUsername, 500);
  const router = useRouter();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username.length >= 3) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await fetch(`/api/check-username-unique?username=${username}`);
          const data = await response.json();
          setUsernameMessage(data.message);
        } catch (error) {
          setUsernameMessage("Error checking username availability");
        } finally {
          setIsCheckingUsername(false);
        }
      } else {
        setUsernameMessage("");
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong");
        return;
      }

      router.replace("/sign-in");
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
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
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join our community and start your journey
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
            {/* Username Field */}
            <motion.div {...fadeInUp}>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  {...form.register("username")}
                  onChange={(e) => {
                    form.setValue("username", e.target.value);
                    debounced(e.target.value);
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Choose your username"
                />
              </div>

              {/* Username validation messages */}
              <AnimatePresence>
                {isCheckingUsername && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center mt-2 text-sm text-blue-600"
                  >
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking availability...
                  </motion.div>
                )}
                {usernameMessage && !isCheckingUsername && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`flex items-center mt-2 text-sm ${usernameMessage.includes("unique") ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {usernameMessage.includes("unique") ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    {usernameMessage}
                  </motion.div>
                )}
                {form.formState.errors.username && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center mt-2 text-sm text-red-600"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {form.formState.errors.username.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Email Field */}
            <motion.div {...fadeInUp}>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email address"
                />
              </div>
              {form.formState.errors.email && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-2 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {form.formState.errors.email.message}
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
                  {...form.register("password")}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Create a secure password"
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
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              {...fadeInUp}
              whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-center">
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isSubmitting ? "Creating Account..." : "Create Account"}
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
              <span className="text-gray-500 text-sm font-medium">Already have an account?</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <Link
              href="/sign-in"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors font-semibold group"
            >
              Sign In Instead
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
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-blue-50 opacity-30 rounded-3xl pointer-events-none"></div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
