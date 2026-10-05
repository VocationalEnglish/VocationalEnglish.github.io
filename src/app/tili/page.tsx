import type { Metadata } from "next";
import { AccountView } from "@/components/account-view";

export const metadata: Metadata = {
  title: "Tili",
  description: "Luo käyttäjätili, jotta ammattikoulun englannin edistyminen tallentuu tähän selaimeen.",
};

export default function AccountPage() {
  return <AccountView />;
}
