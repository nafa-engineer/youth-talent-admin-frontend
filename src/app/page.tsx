import { redirect } from "next/navigation";
import { ROUTES } from "src/lib/constants";

export default function Home() {
  // Alihkan langsung ke halaman login (untuk kemudian dicek status auth-nya)
  redirect(ROUTES.LOGIN);
}
