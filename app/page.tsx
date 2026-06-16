import { redirect } from "next/navigation";

// El middleware redirige "/" según la sesión; esto es solo un respaldo.
export default function Home() {
  redirect("/dashboard");
}
