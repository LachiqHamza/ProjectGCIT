"use client";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
export default function NotFound() {
  const { t } = useLanguage();
  return <main className="not-found"><span className="eyebrow">GCIT / 404</span><h1>{t.notFoundTitle}</h1><p>{t.notFoundDescription}</p><Link className="dark-button" href="/project-examples">{t.notFoundLink} →</Link></main>;
}
