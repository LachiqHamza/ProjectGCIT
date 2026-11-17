import { ArrowUpRight, ChevronRight } from "lucide-react";
import ProjectExplorer from "@/components/project-explorer";

export default function ProjectExamplesPage() {
  return <>
    <a className="skip-link" href="#main">Skip to project</a>
    <header className="site-header">
      <a href="/project-examples" className="brand" aria-label="GCIT Architecture home"><span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span><span>GCIT<span className="brand-subtitle">ARCHITECTURE & SPACE</span></span></a>
      <nav aria-label="Main navigation"><a href="#villa" aria-current="page">Project examples<span /></a><a href="#materials">Materials</a><a href="#project-notes">Our approach</a></nav>
      <a className="header-cta" href="#villa">Explore a project<ArrowUpRight size={16} /></a>
    </header>
    <main id="main" className="page-container">
      <div className="breadcrumb"><span>GCIT</span><ChevronRight size={12} /><span>Our work</span><ChevronRight size={12} /><span>Project examples</span></div>
      <ProjectExplorer />
    </main>
    <footer className="site-footer page-container"><a href="/project-examples" className="footer-brand">GCIT<span>Architecture, experienced.</span></a><span>Villa Bellavista · A residential concept</span><a href="#main">Back to top ↑</a></footer>
  </>;
}
