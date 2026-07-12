"use client";

import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { DotMap } from "./dot-map";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="relative hidden h-[600px] w-1/2 border-r border-border bg-secondary md:block">
          <DotMap />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mb-6 flex size-12 items-center justify-center rounded-full bg-primary shadow-sm"
            >
              <Truck className="size-6 text-primary-foreground" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mb-2 text-center text-2xl font-semibold text-foreground"
            >
              TransitOps
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="max-w-xs text-center text-sm text-muted-foreground"
            >
              Fleet operations, dispatch, and maintenance in one place.
            </motion.p>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="mb-1 text-2xl font-semibold text-foreground">{title}</h1>
            <p className="mb-8 text-muted-foreground">{subtitle}</p>
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
