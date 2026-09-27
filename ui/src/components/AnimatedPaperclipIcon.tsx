import type { SVGProps } from "react";
import { PAPERCLAW_MARK_PATHS } from "@kesarcloud/shared/brand";
import { cn } from "../lib/utils";

export function AnimatedPaperclipIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("paperclip-thinking-icon", className)}
      aria-hidden="true"
      {...props}
    >
      <g className="paperclip-thinking-icon-path" fill="currentColor">
        {PAPERCLAW_MARK_PATHS.map((path) => <path key={path} d={path} />)}
      </g>
    </svg>
  );
}

/** Full-page loading state with the current Paperclaw mark. */
export function PaperclipLoading({ className }: { className?: string }) {
  return (
    <div role="status" className={cn("flex min-h-dvh w-full items-center justify-center", className)}>
      <AnimatedPaperclipIcon className="h-24 w-24 text-muted-foreground" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
