"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const Hero = () => {
  const handleLearnMore = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full h-[calc(100vh-56px)] flex items-center justify-center text-center text-white overflow-hidden">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/signup.jpg"
          alt="A school of fish underwater"
          layout="fill"
          objectFit="cover"
          quality={80}
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto px-4"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-4">
          Modernize Your Aquaculture Management
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Fintera provides the tools you need to monitor, manage, and grow your fish farming operations with ease and precision.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 h-12 w-full sm:w-auto rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Get Started <ArrowRight className="h-5 w-5" />
          </Link>
          <button
            onClick={handleLearnMore}
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-md border border-input bg-transparent px-8 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Learn More
          </button>
        </div>
        <div className="flex justify-center items-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-400 flex-wrap">
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> No credit card required</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> 14-day free trial</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Cancel anytime</span>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;