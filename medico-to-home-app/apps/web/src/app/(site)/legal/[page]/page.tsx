import { notFound } from "next/navigation";

// Drafts written from how the app works today. A lawyer must review them before launch.
const PAGES: Record<string, { title: string; sections: [string, string][] }> = {
  terms: {
    title: "Terms of use",
    sections: [
      ["Who we are", "Medico To Home connects families in Kozhikode and Malappuram with independent, verified healthcare professionals who visit at home."],
      ["Your account", "One account covers booking care for yourself and your family. Professionals use the same account and switch to professional mode after our team approves them. Keep access to your email safe: anyone who can read it can sign in."],
      ["Bookings", "A booking is a request to a professional for a visit or a treatment plan. Prices shown at booking are calculated by our server and include a ₹49 platform fee plus 18% GST on that fee."],
      ["Emergencies", "Medico To Home is not an emergency service. In an emergency, call 112."],
      ["Professionals", "Professionals are independent practitioners. We check registration, identity and police clearance before they can accept bookings."],
    ],
  },
  privacy: {
    title: "Privacy policy",
    sections: [
      ["What we keep", "Your name, email, mobile number, city, addresses, family members' health details you choose to add, and reports you upload."],
      ["Where it is stored", "On servers in Mumbai, India. Uploaded reports are kept in private storage and opened only through short-lived links."],
      ["Who can see your records", "Only you. A professional sees a family member's conditions, allergies and medicines only for a booking where you turned record sharing on. Every such view is logged."],
      ["Payments", "Card details never reach our servers."],
      ["Your rights", "You can ask us to export or delete your data at any time from your account or by contacting support."],
    ],
  },
  refunds: {
    title: "Refund & cancellation",
    sections: [
      ["Free cancellation", "You can cancel without charge up to 4 hours before the next visit."],
      ["Treatment plans", "Cancelling a plan cancels the visits that have not happened yet. Completed visits are not refunded."],
      ["If a professional cannot come", "We offer a similar professional or a full refund for that visit."],
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const page = PAGES[(await params).page];
  return { title: page?.title ?? "Not found" };
}

export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const page = PAGES[(await params).page];
  if (!page) notFound();
  return (
    <main className="mx-auto max-w-2xl px-5 pb-24 pt-32">
      <p className="mb-6 rounded-xl bg-warn-soft px-4 py-3 text-sm text-warn">Draft. To be reviewed by a lawyer before public launch.</p>
      <h1 className="text-4xl font-light tracking-tight">{page.title}</h1>
      <div className="mt-8 grid gap-7">
        {page.sections.map(([heading, body]) => (
          <section key={heading}>
            <h2 className="text-lg font-medium">{heading}</h2>
            <p className="mt-1.5 leading-relaxed text-body">{body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
