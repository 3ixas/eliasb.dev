import type { Metadata } from "next";
import { ResumePage } from "@/components/site/resume";
import { resumeCopy } from "@/content/resume";
import { pageTitle, siteName } from "@/content/site";

const title = pageTitle(resumeCopy.title);

export const metadata: Metadata = {
  title: resumeCopy.title,
  description: resumeCopy.description,
  alternates: { canonical: "/resume" },
  openGraph: { type: "website", siteName, url: "/resume", title, description: resumeCopy.description },
  twitter: { card: "summary", title, description: resumeCopy.description },
};

export default function Resume() {
  return <ResumePage />;
}
