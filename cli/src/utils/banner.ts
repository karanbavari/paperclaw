import pc from "picocolors";

const PAPERCLAW_ART = [
  "  ╱╱╱▶  PAPERCLAW",
] as const;

const TAGLINE = "Your autonomous company, under your control";

export function printPaperclipCliBanner(): void {
  const lines = [
    "",
    ...PAPERCLAW_ART.map((line) => pc.cyan(line)),
    pc.blue("  ───────────────────────────────────────────────────────"),
    pc.bold(pc.white(`  ${TAGLINE}`)),
    "",
  ];

  console.log(lines.join("\n"));
}
