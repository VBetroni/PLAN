import { redirect } from "next/navigation";

// "Hoy" is the home screen.
export default function Home() {
  redirect("/hoy");
}
