import type { Metadata } from "next";
import { FieldsView } from "@/components/fields-view";

export const metadata: Metadata = {
  title: "Alat",
  description: "Ammattialojen englannin harjoitukset: rakennus, hoito, ravintola, logistiikka ja muut alat.",
};

export default function FieldsPage() {
  return <FieldsView />;
}
