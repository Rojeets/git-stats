import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Git Productivity Heatmap",
  description:
    "Visualize your GitHub and GitLab contribution activity in a beautiful heatmap.",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <main className={inter.className}>{children}</main>
    </ThemeProvider>
  );
}
