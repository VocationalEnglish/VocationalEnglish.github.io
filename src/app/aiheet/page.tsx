import type { Metadata } from "next";
import { TopicsView } from "@/components/topics-view";

export const metadata: Metadata = {
  title: "Aiheet",
};

export default function Page() {
  return <TopicsView />;
}
