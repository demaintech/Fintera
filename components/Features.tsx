"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Boxes,
  Database,
  FilePieChart,
  ShieldAlert,
} from "lucide-react";

const featureList = [
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description: "Track water quality, temperature, and oxygen levels 24/7 from any device.",
  },
  {
    icon: Database,
    title: "Data-Driven Feeding",
    description: "Optimize feeding schedules and reduce waste with our intelligent recommendation engine.",
  },
  {
    icon: BarChart3,
    title: "Growth Analytics",
    description: "Visualize fish growth patterns and forecast yields with powerful, easy-to-read charts.",
  },
  {
    icon: ShieldAlert,
    title: "Health Management",
    description: "Log treatments and get early warnings for potential disease outbreaks to protect your stock.",
  },
  {
    icon: Boxes,
    title: "Inventory Control",
    description: "Manage feed, equipment, and other resources to ensure you never run out of critical supplies.",
  },
  {
    icon: FilePieChart,
    title: "Automated Reporting",
    description: "Generate comprehensive reports for compliance, analysis, and business planning with a single click.",
  },
];

const Features = () => {
  return (
    <section id="features" className="w-full py-16 md:py-24 bg-background/80">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            An All-in-One Platform for Aquaculture
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Fintera is packed with powerful features designed to streamline your operations and boost your farm's productivity.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
              className="p-6 rounded-lg bg-background border border-border/60 shadow-sm text-center transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;