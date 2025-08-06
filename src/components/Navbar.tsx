"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence, useTransform, useScroll } from 'framer-motion';

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navVariants = {
    initial: { y: -100, opacity: 0, scale: 0.95, },
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as const,
        staggerChildren: 0.1
      }
    }
  };

  const linkVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  const logoVariants = {
    hover: {
      rotate: 360,
      scale: 1.1,
      transition: { duration: 0.6 }
    }
  };

  const width = useTransform(scrollY, [0, 200], ['100%', '80%']);
  const height = useTransform(scrollY, [0, 200], ['4rem', '4rem']); // optional: shrink height too
  const borderRadius = useTransform(scrollY, [0, 200], ['0rem', '2rem']);

  return (
    <>

      <motion.nav
        className={`fixed bg-primary/5 bg-clip-padding backdrop-filter backdrop-blur-[2px] mx-auto overflow left-0 right-0 z-[99] border-b border-white/30`}
        style={{ width, height, borderRadius,
          top: useTransform(scrollY, [0, 200], ['0px', '20px'])
         }}
          variants={navVariants}
        initial="initial"
        animate="animate"
      >

        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
          animate={{
            paddingLeft: isScrolled ? '24px' : '16px',
            paddingRight: isScrolled ? '24px' : '16px',
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="flex justify-between"
            animate={{
              height: isScrolled ? '56px' : '64px',
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Logo */}
            <motion.div
              className="flex items-center"
              variants={linkVariants}
              initial="initial"
              animate="animate"
            >
              <Link href="/" className="flex-shrink-0 flex items-center group">
                <motion.div
                  className="relative"
                  variants={logoVariants}
                  whileHover="hover"
                  animate={{
                    scale: isScrolled ? 0.9 : 1,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-40"
                    animate={{
                      opacity: isScrolled ? 0.3 : 0.2,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.img
                    className="relative z-10 filter drop-shadow-sm"
                    src="/globe.svg"
                    alt="URL List"
                    animate={{
                      width: isScrolled ? '28px' : '32px',
                      height: isScrolled ? '28px' : '32px',
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </motion.div>
                <motion.span
                  className="ml-3 font-bold bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                  animate={{
                    fontSize: isScrolled ? '18px' : '20px',
                    marginLeft: isScrolled ? '8px' : '12px',
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  URL List
                </motion.span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              className="hidden md:flex items-center space-x-2"
              animate={{
                gap: isScrolled ? '4px' : '8px',
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {status === 'authenticated' ? (
                <>
                  <motion.div variants={linkVariants} whileHover="hover">
                    <Link
                      href="/dashboard"
                      className="relative px-4 py-2 text-gray-200 hover:text-gray-900 font-medium rounded-lg transition-all duration-200 group"
                    >
                      <span className="relative z-10">Dashboard</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg opacity-0 group-hover:opacity-100"
                        layoutId="nav-hover"
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>

                  <motion.button
                    onClick={() => signOut({ callbackUrl: '/sign-in' })}
                    className="relative px-4 py-2 text-gray-100 hover:text-gray-900 font-medium rounded-lg transition-all duration-200 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">Sign Out</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>

                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/sign-up"
                      className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    >
                      <span className="relative z-10">Get Started</span>
                      <motion.div
                        className="absolute rounded-lg inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 "
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-900 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? -60 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>


        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden z-[98] fixed top-full left-0 right-0 bg-base-200 backdrop-blur-lg border-b border-gray-200 shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: 0 }}
            >
              <div className="px-4 py-4 space-y-2">
              {status === 'authenticated' ? (
                <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link href="/dashboard" className="block px-4 py-2 text-gray-200 hover:text-gray-300 hover:bg-gray-50 rounded-lg font-medium">
                  Dashboard
                  </Link>
                </motion.div>
                </>
              ) : (
                <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link href="/sign-in" className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium">
                  Sign In
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link href="/sign-up" className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg text-center">
                  Sign Up
                  </Link>
                </motion.div>
                </>
              )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.nav>
    </>
  );
};

export default Navbar;