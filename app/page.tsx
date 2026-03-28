import { redirect } from "next/navigation";

// app/page.tsx
export default function Home() {
	redirect("/signin");
}
