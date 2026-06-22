import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MessageContentProps {
  content: string;
  className?: string;
}

/**
 * Renders an assistant message as GitHub-flavored markdown (tables, code,
 * lists, links) styled to the navy+gold design system. Hardened: links open in
 * a new tab with `noreferrer`, and the renderer never executes raw HTML.
 */
export function MessageContent({ content, className }: MessageContentProps) {
  return (
    <div
      className={cn(
        'text-sm leading-relaxed break-words',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-2 whitespace-pre-wrap">{children}</p>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700 dark:text-accent-300"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-2 list-disc space-y-1 ps-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 list-decimal space-y-1 ps-5">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="mb-2 mt-3 text-base font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 mt-3 text-base font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-1.5 mt-2.5 text-sm font-bold">{children}</h3>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-s-4 border-primary-200 ps-3 italic text-gray-600 dark:border-dark-border dark:text-slate-400">
              {children}
            </blockquote>
          ),
          code: ({ className: cls, children }) => {
            const isBlock = /language-/.test(cls ?? '');
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-gray-100 thin-scrollbar dark:bg-black/50">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[0.8em] text-primary-800 dark:bg-dark-surface-2 dark:text-accent-300">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="my-2">{children}</pre>,
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto thin-scrollbar">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-start font-semibold dark:border-dark-border dark:bg-dark-surface-2">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 px-2.5 py-1.5 dark:border-dark-border">
              {children}
            </td>
          ),
          hr: () => <hr className="my-3 border-gray-200 dark:border-dark-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
