import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders markdown (guide bodies, blog content, chat) with Tailwind-styled elements.
// remark-gfm adds tables, strikethrough, task lists, and autolinks.
const components: Components = {
  h1: (props) => <h1 className="mt-8 mb-4 font-heading text-2xl font-semibold" {...props} />,
  h2: (props) => <h2 className="mt-8 mb-3 font-heading text-xl font-semibold" {...props} />,
  h3: (props) => <h3 className="mt-6 mb-2 font-heading text-lg font-medium" {...props} />,
  p: (props) => <p className="mb-4 leading-relaxed text-foreground/90" {...props} />,
  ul: (props) => <ul className="mb-4 list-disc space-y-1 pl-6 text-foreground/90" {...props} />,
  ol: (props) => <ol className="mb-4 list-decimal space-y-1 pl-6 text-foreground/90" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  a: (props) => (
    <a
      className="text-primary underline underline-offset-4"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  code: (props) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props} />
  ),
  pre: (props) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="mb-4 border-l-2 pl-4 text-muted-foreground italic" {...props} />
  ),
  hr: () => <hr className="my-8 border-border" />,
  del: (props) => <del className="text-muted-foreground" {...props} />,
  table: (props) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="border-b" {...props} />,
  th: (props) => <th className="px-3 py-2 text-left font-semibold" {...props} />,
  td: (props) => <td className="border-b px-3 py-2 text-foreground/90" {...props} />,
};

export function Markdown({ content }: { content: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>;
}
