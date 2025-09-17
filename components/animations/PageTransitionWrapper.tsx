"use client";

import { motion } from "framer-motion";

export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "linear", delay: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
