// app/blog/_component/BackButton.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Button variant="ghost" asChild className="mb-8 -ml-2">
        <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </Button>
    </motion.div>
  );
}