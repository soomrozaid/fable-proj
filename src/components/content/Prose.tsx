/* react-markdown hands every component an mdast `node` prop; we destructure it
   out so it never lands on a DOM element. That destructure is intentional and
   repeated, so the unused-var rule is disabled for this mapping file only. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { Components } from "react-markdown";

/**
 * Server-rendered markdown. Runs at build time (static generation), so it adds
 * no client JS. Element styling matches the engraved-lithograph design system.
 */
const components: Components = {
  h2: ({ node, ...props }) => (
    <h2 className="engraved mt-12 text-2xl font-semibold text-ink" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="mt-8 text-lg font-semibold text-ink" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mt-4 leading-relaxed text-ink-soft" {...props} />
  ),
  a: ({ node, href = "", ...props }) =>
    href.startsWith("/") ? (
      <Link
        href={href}
        className="text-verdigris-deep underline underline-offset-2 hover:text-verdigris"
        {...props}
      />
    ) : (
      <a
        href={href}
        rel="noopener nofollow"
        target="_blank"
        className="text-verdigris-deep underline underline-offset-2 hover:text-verdigris"
        {...props}
      />
    ),
  ul: ({ node, ...props }) => (
    <ul
      className="mt-4 list-disc space-y-1.5 pl-5 text-ink-soft marker:text-ink-faint"
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <ol
      className="mt-4 list-decimal space-y-1.5 pl-5 text-ink-soft marker:text-ink-faint"
      {...props}
    />
  ),
  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-ink" {...props} />
  ),
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="my-6 border-l-2 border-verdigris pl-5 font-display text-lg leading-relaxed text-ink italic"
      {...props}
    />
  ),
  hr: () => <hr className="hairline my-10 border-0" />,
  table: ({ node, ...props }) => (
    <div className="mt-6 overflow-x-auto">
      <table
        className="w-full min-w-130 border-collapse text-sm"
        {...props}
      />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th
      className="border-b-2 border-ink py-2.5 pr-4 text-left font-medium text-ink"
      {...props}
    />
  ),
  td: ({ node, ...props }) => (
    <td
      className="border-b border-line py-2.5 pr-4 align-top text-ink-soft"
      {...props}
    />
  ),
  code: ({ node, ...props }) => (
    <code
      className="rounded bg-paper-deep px-1.5 py-0.5 font-mono text-[0.85em] text-ink"
      {...props}
    />
  ),
};

export function Prose({ children }: { children: string }) {
  return (
    <div className="text-[1.05rem]">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </Markdown>
    </div>
  );
}
