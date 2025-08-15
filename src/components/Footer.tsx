"use client"
import React from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'

const Footer = ({ showBuild = false }: { showBuild: boolean }) => {
    return (<>
        <motion.footer
            className="py-3 px-4 border-t dark:border-gray-800 mt-auto z-[50]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mx-auto flex flex-col md:flex-row justify-around items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    Created by{" "}
                    <Link
                        href="https://sukhjitsingh.me/"
                        className="font-medium text-black dark:text-white hover:underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Sukhjit Singh
                    </Link>
                </motion.div>
                {
                    showBuild && (

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            Create your own collection of links{" "}
                            <Link
                                href="/build"
                                className="font-medium text-black dark:text-white hover:underline transition-colors"
                            >
                                here
                            </Link>
                        </motion.div>
                    )
                }
            </div>
        </motion.footer>
    </>
    )
}

export default Footer