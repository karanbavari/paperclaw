import type { SVGProps } from "react";
import { PAPERCLAW_BRAND_NAME, PAPERCLAW_MARK_PATHS } from "@kesarcloud/shared/brand";

interface PaperclipLockupProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  decorative?: boolean;
  title?: string;
}

/** Compact Paperclaw mark and live-text wordmark, colored by the host surface. */
export function PaperclipLockup({
  decorative = false,
  title = PAPERCLAW_BRAND_NAME,
  className,
  ...rest
}: PaperclipLockupProps) {
  return (
    <svg
      {...rest}
      className={className}
      viewBox="0 0 168 32"
      fill="currentColor"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      focusable="false"
    >
      <g transform="translate(1 1) scale(.30)">
        {PAPERCLAW_MARK_PATHS.map((path) => <path key={path} d={path} />)}
      </g>
      <text className="paperclaw-lockup-wordmark" x="37" y="23">{PAPERCLAW_BRAND_NAME}</text>
    </svg>
  );
}
