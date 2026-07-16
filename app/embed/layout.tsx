import "./globals.css";

const themeScript = `
(function() {
  var mq = window.matchMedia('(prefers-color-scheme: light)');
  document.documentElement.setAttribute('data-theme', mq.matches ? 'light' : 'dark');
  mq.addEventListener('change', function(e) {
    document.documentElement.setAttribute('data-theme', e.matches ? 'light' : 'dark');
  });
})();
`;

export const metadata = {
  title: "Git Productivity Heatmap – Embed",
  description: "Embeddable Git contribution heatmap widget.",
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
