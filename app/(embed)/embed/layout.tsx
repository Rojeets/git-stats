import "./globals.css";

export const metadata = {
  title: "Git Productivity Heatmap – Embed",
  description: "Embeddable Git contribution heatmap widget.",
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
