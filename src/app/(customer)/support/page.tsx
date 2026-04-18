import type { Metadata } from "next";
import { SupportPageContent } from "./support-form";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return <SupportPageContent />;
}
