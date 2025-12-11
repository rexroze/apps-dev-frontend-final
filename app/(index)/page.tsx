import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to store page as default landing page
  redirect("/store");
}