import { redirect } from "next/navigation";

// The application now lives in the Medico onboarding flow.
export default function Page() {
  redirect("/medico");
}
