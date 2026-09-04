"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const SESSION_KEY = "home-intro-played";
const EASE = [0.2, 0, 0, 1] as const;
const STAGGER_S = 0.04;
/** 400ms total for three items: 320ms each plus two 40ms staggers. */
const ITEM_S = 0.32;

const InstantContext = createContext(false);

const groupVariants: Variants = { hidden: {}, show: {} };
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

function hasPlayed(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Homepage entrance. Children (RevealItem) fade in and rise 8px with a 40ms
 * stagger, once per browser session. The server always renders the hidden
 * initial state, so the HTML is identical either way; on repeat visits the
 * client completes the animation with zero duration instead of skipping it,
 * which keeps hydration clean. Reduced motion also collapses to zero.
 */
export function RevealGroup({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [played] = useState(() => typeof window !== "undefined" && hasPlayed());
  const instant = played || reduceMotion === true;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Storage unavailable: the animation simply plays each visit.
    }
  }, []);

  return (
    <InstantContext.Provider value={instant}>
      <motion.div
        variants={groupVariants}
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: instant ? 0 : STAGGER_S }}
      >
        {children}
      </motion.div>
    </InstantContext.Provider>
  );
}

export function RevealItem({ children }: { children: ReactNode }) {
  const instant = useContext(InstantContext);
  return (
    <motion.div
      variants={itemVariants}
      transition={instant ? { duration: 0 } : { duration: ITEM_S, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
