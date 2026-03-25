import { ShaderAnimation } from "@/components/ui/shader-lines";

export default function ShaderLinesDemo() {
  return (
    <div className="relative flex h-[650px] w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-border/70 bg-background/60">
      <ShaderAnimation />
      <span className="pointer-events-none z-10 text-center font-display text-6xl font-semibold tracking-[-0.08em] text-white md:text-7xl">
        Shader Lines
      </span>
    </div>
  );
}
