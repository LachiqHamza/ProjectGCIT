"use client";

import { ArrowUpRight, ChevronRight } from "lucide-react";
import ProjectExplorer from "./project-explorer";
import { LanguageSwitch, useLanguage } from "./language-provider";

export default function ProjectPage() {
  const { t } = useLanguage();
  return <>
    <a className="skip-link" href="#main">{t.skip}</a>
    <header className="site-header">
      <a href="/project-examples" className="brand" aria-label={t.home}><span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span><span>GCIT<span className="brand-subtitle">{t.brand}</span></span></a>
      <nav aria-label={t.navigation}><a href="#villa" aria-current="page">{t.title}<span /></a><a href="#materials">{t.materials}</a><a href="#project-notes">{t.approach}</a></nav>
      <div className="header-actions"><LanguageSwitch /><a className="header-cta" href="#villa">{t.exploreProject}<ArrowUpRight size={16} aria-hidden="true" /></a></div>
    </header>
    <main id="main" className="page-container">
      <div className="breadcrumb"><span>GCIT</span><ChevronRight size={12} aria-hidden="true" /><span>{t.ourWork}</span><ChevronRight size={12} aria-hidden="true" /><span>{t.title}</span></div>
      <ProjectExplorer />
    </main>
    <footer className="site-footer page-container"><a href="/project-examples" className="footer-brand">GCIT<span>{t.footer}</span></a><span>{t.footerConcept}</span><a href="#main">{t.backTop} ↑</a></footer>
  </>;
}
