import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "pomo-dashboard-app",
	description:
		"A simple pomodoro dashboard app built with Next.js and TypeScript.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body>{children}</body>
		</html>
	);
}
