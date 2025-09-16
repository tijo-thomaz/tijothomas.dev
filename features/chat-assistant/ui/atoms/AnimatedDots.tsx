"use client";

export function AnimatedDots() {
  return (
    <div className="flex gap-1 ml-2">
      <div
        className="w-1.5 h-1.5 rounded-full animate-bounce"
        style={{ backgroundColor: "var(--theme-accent)" }}
      />
      <div
        className="w-1.5 h-1.5 rounded-full animate-bounce"
        style={{
          animationDelay: "0.1s",
          backgroundColor: "var(--theme-accent)",
        }}
      />
      <div
        className="w-1.5 h-1.5 rounded-full animate-bounce"
        style={{
          animationDelay: "0.2s",
          backgroundColor: "var(--theme-accent)",
        }}
      />
    </div>
  );
}
