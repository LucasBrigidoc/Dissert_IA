import { cn } from "@/lib/utils";

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export function LiquidGlassCard({ children, className, dark = false }: LiquidGlassCardProps) {
  return (
    <div 
      className={cn(
        "rounded-2xl px-6 py-3",
        dark ? "liquid-glass-dark" : "liquid-glass",
        className
      )}
    >
      {children}
    </div>
  );
}
