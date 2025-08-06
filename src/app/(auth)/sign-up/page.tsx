"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import {
  Loader2,
  ArrowLeft,
  UserPlus,
  Mail,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  Sparkles
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
          <div className="text-center mb-6">

            <h1 className="text-4xl font-bold mb-3 text-primary">
              Create Account
            </h1>
            <p className="text-neutral-300 text-lg">
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
                className="mb-6 p-4 bg-red-400/10 border border-red-200 rounded-xl text-red-700 text-sm flex items-center"
              >
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Field */}
            <motion.div {...fadeInUp}>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-200 mb-3">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" />
                <input
                  id="username"
                  type="text"
                  {...form.register("username")}
                  onChange={(e) => {
                    form.setValue("username", e.target.value);
                    debounced(e.target.value);
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border border-gray-200 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none "
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
                    className="flex items-center mt-3 text-sm text-indigo-600"
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
                    className={`flex items-center mt-3 text-sm ${usernameMessage.includes("unique") ? "text-green-600" : "text-red-600"
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
                    className="flex items-center mt-3 text-sm text-red-600"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {form.formState.errors.username.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Email Field */}
            <motion.div {...fadeInUp}>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" />
                <input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border border-gray-200 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none "
                  placeholder="Enter your email address"
                />
              </div>
              {form.formState.errors.email && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-3 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {form.formState.errors.email.message}
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
                  {...form.register("password")}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border border-gray-200 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none "
                  placeholder="Create a secure password"
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
              className="btn btn-primary w-full py-4 text-lg font-semibold hover:-skew-3"
              {...fadeInUp}
              whileHover={!isSubmitting ? { scale: 1.02, y: -2, skewX: '-5deg' } : {}}
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
            className="mt-8 text-center"
            {...fadeInUp}
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-neutral-300 text-sm font-medium">Already have an account?</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <Link
              href="/sign-in"
              className="inline-flex items-center text-primary hover:text-primary/50 transition-colors font-semibold text-lg group"
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
        </motion.div>

      </motion.div>
    </Container>
  );
};

export default SignUpPage;
