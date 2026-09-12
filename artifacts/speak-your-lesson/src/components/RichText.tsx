/**
 * RichText — renders AI-generated plain-text with structured formatting.
 *
 * The AI is prompted to use:
 *   \n\n   — paragraph / phase separator
 *   • …    — unordered bullet line
 *   1. …   — numbered step line
 *   Label: — sub-section label (word(s) + colon at line start)
 *
 * This component turns those conventions into semantic HTML without
 * accepting any Markdown or HTML from the AI.
 */

interface RichTextProps {
  text: string;
  className?: string;
}

type Line =
  | { kind: "bullet"; text: string }
  | { kind: "numbered"; n: string; text: string }
  | { kind: "labeled"; label: string; text: string }
  | { kind: "plain"; text: string };

function parseLine(raw: string): Line {
  const trimmed = raw.trim();

  // Bullet: starts with "• " or "- " or "* "
  if (/^[•\-\*]\s/.test(trimmed)) {
    return { kind: "bullet", text: trimmed.slice(2).trim() };
  }

  // Numbered: starts with "1. " or "12. " etc.
  const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
  if (numberedMatch) {
    return { kind: "numbered", n: numberedMatch[1], text: numberedMatch[2] };
  }

  // Labeled: starts with one or two Title Case / ALL CAPS words followed by ":"
  // e.g. "Debrief: ...", "Teacher tip: ...", "Option A: ..."
  const labeledMatch = trimmed.match(/^([A-Z][^:]{0,30}):\s+(.+)/);
  if (labeledMatch) {
    return { kind: "labeled", label: labeledMatch[1], text: labeledMatch[2] };
  }

  return { kind: "plain", text: trimmed };
}

interface Block {
  type: "paragraph" | "bullet-list" | "numbered-list";
  items: Line[];
}

function buildBlocks(text: string): Block[] {
  const paragraphs = text.split(/\n\n+/);
  const blocks: Block[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) continue;

    const lines = para.split(/\n/).map(parseLine).filter((l) => l.text.trim());
    if (lines.length === 0) continue;

    const allBullets = lines.every((l) => l.kind === "bullet");
    const allNumbered = lines.every((l) => l.kind === "numbered");

    if (allBullets) {
      blocks.push({ type: "bullet-list", items: lines });
    } else if (allNumbered) {
      blocks.push({ type: "numbered-list", items: lines });
    } else {
      // Mixed paragraph — render each line individually
      blocks.push({ type: "paragraph", items: lines });
    }
  }

  return blocks;
}

function InlineLine({ line }: { line: Line }) {
  if (line.kind === "labeled") {
    return (
      <span>
        <span className="font-semibold text-foreground">{line.label}:</span>{" "}
        {line.text}
      </span>
    );
  }
  return <>{line.text}</>;
}

export function RichText({ text, className = "" }: RichTextProps) {
  if (!text) return null;

  const blocks = buildBlocks(text);

  return (
    <div className={`space-y-3.5 ${className}`}>
      {blocks.map((block, bi) => {
        if (block.type === "bullet-list") {
          return (
            <ul key={bi} className="space-y-2.5">
              {block.items.map((line, li) => (
                <li key={li} className="flex items-start gap-3 text-[15px] leading-7">
                  <span className="mt-[0.65rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--brand-teal-strong)]/55 ring-4 ring-[var(--brand-teal)]/10" />
                  <InlineLine line={line} />
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "numbered-list") {
          return (
            <ol key={bi} className="space-y-2.5">
              {block.items.map((line, li) => (
                <li key={li} className="flex items-start gap-3 text-[15px] leading-7">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-xs font-semibold text-primary ring-1 ring-primary/10">
                    {(line as { kind: "numbered"; n: string; text: string }).n}
                  </span>
                  <InlineLine line={line} />
                </li>
              ))}
            </ol>
          );
        }

        // Paragraph — render lines with appropriate spacing
        return (
          <div key={bi} className="space-y-2.5">
            {block.items.map((line, li) => {
              if (line.kind === "bullet") {
                return (
                  <div key={li} className="flex items-start gap-3 text-[15px] leading-7">
                    <span className="mt-[0.65rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--brand-teal-strong)]/55 ring-4 ring-[var(--brand-teal)]/10" />
                    <span>{line.text}</span>
                  </div>
                );
              }
              if (line.kind === "numbered") {
                return (
                  <div key={li} className="flex items-start gap-3 text-[15px] leading-7">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-xs font-semibold text-primary ring-1 ring-primary/10">
                      {line.n}
                    </span>
                    <span>{line.text}</span>
                  </div>
                );
              }
              return (
                <p key={li} className="text-[15px] leading-7">
                  <InlineLine line={line} />
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
