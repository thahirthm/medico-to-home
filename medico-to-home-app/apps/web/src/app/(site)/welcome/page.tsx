import { PatientRegistration } from "@/components/auth/PatientRegistration";

export const metadata = { title: "Set up your account", robots: { index: false } };

export default function Page() {
  return <PatientRegistration />;
}
