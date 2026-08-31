import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// react-markdown (without rehype-raw) never renders raw HTML from the
// source text — markdown syntax is parsed into React elements directly,
// not injected via dangerouslySetInnerHTML — so this is safe against XSS
// by default. remark-gfm only adds parsing for tables/strikethrough/task
// lists/autolinks, it doesn't change that.
//
// Every element below is restyled to fit inside the existing chat bubble
// (tight spacing instead of default browser margins, colors pulled from
// the same CSS variables the rest of the app uses) without touching any
// existing CSS or the bubble container itself.
const components = {
  p: ({ children }) => <p style={{ margin: "0 0 8px", lineHeight: 1.55 }}>{children}</p>,
  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  del: ({ children }) => <del>{children}</del>,
  h1: ({ children }) => (
    <h1 style={{ fontSize: "1.25em", fontWeight: 700, margin: "10px 0 6px", fontFamily: "var(--font-display)" }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: "1.15em", fontWeight: 700, margin: "10px 0 6px", fontFamily: "var(--font-display)" }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: "1.05em", fontWeight: 700, margin: "8px 0 4px", fontFamily: "var(--font-display)" }}>{children}</h3>
  ),
  h4: ({ children }) => <h4 style={{ fontSize: "1em", fontWeight: 700, margin: "8px 0 4px" }}>{children}</h4>,
  ul: ({ children }) => <ul style={{ margin: "0 0 8px", paddingLeft: 20 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: "0 0 8px", paddingLeft: 20 }}>{children}</ol>,
  li: ({ children }) => <li style={{ margin: "2px 0" }}>{children}</li>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: "0 0 8px",
        padding: "2px 12px",
        borderLeft: "3px solid var(--color-border)",
        color: "var(--color-text-muted)",
      }}
    >
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.9em",
          background: "rgba(30, 27, 58, 0.06)",
          borderRadius: 4,
          padding: "1px 5px",
        }}
      >
        {children}
      </code>
    ) : (
      <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.85em" }}>{children}</code>
    ),
  pre: ({ children }) => (
    <pre
      style={{
        margin: "0 0 8px",
        padding: 12,
        borderRadius: "var(--radius-sm)",
        background: "rgba(30, 27, 58, 0.06)",
        overflowX: "auto",
        whiteSpace: "pre",
      }}
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: "auto", marginBottom: 8 }}>
      <table style={{ borderCollapse: "collapse", fontSize: "0.92em", width: "100%" }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{ border: "1px solid var(--color-border)", padding: "4px 8px", textAlign: "left", fontWeight: 700 }}>
      {children}
    </th>
  ),
  td: ({ children }) => <td style={{ border: "1px solid var(--color-border)", padding: "4px 8px" }}>{children}</td>,
  hr: () => <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "8px 0" }} />,
};

const MarkdownMessage = ({ content }) => (
  <div style={{ whiteSpace: "normal" }}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  </div>
);

export default MarkdownMessage;
