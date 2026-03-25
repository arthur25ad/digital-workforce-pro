import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

export default function Reveal({
  children,
  delay = 0,
  distance = 24,
  ...props
}: HTMLMotionProps<"div"> & {
  delay?: number;
  distance?: number;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
