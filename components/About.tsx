 "use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Target, TrendingUp, ShieldCheck } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="w-full py-16 md:py-24 bg-background">
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
            Pioneering a Smarter Wave in Aquaculture
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            At Fintera, we're dedicated to empowering fish farmers with technology that simplifies complexity and drives sustainable growth.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-5 gap-12 items-center">
          {/* Left Column: Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, amount: 0.5 }}
            className="md:col-span-2"
          >
            <Image
              src="/assets/images/hero.jpg"
              alt="A person holding a healthy fish"
              width={500}
              height={600}
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
              priority
              className="w-full h-auto rounded-lg shadow-lg object-cover aspect-[4/5]"
            />
          </motion.div>

          {/* Right Column: Text content with values */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true, amount: 0.5 }}
            className="md:col-span-3"
          >
            <h3 className="text-2xl font-semibold mb-4">Our Core Principles</h3>
            <p className="text-foreground/80 mb-8">
              We believe in a future where technology and nature work in harmony for better yields and a healthier planet. Our platform is built on three key pillars:
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Precision & Efficiency</h4>
                  <p className="text-foreground/70 mt-1">Provide intuitive, data-driven tools that help aquaculture businesses optimize resources and maximize profitability.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Sustainable Growth</h4>
                  <p className="text-foreground/70 mt-1">Promote environmentally friendly practices by reducing waste and ensuring the long-term health of aquatic ecosystems.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Reliability & Support</h4>
                  <p className="text-foreground/70 mt-1">Deliver a robust platform backed by expert support, ensuring our partners can manage their operations with confidence.</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;