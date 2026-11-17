import Link from "next/link";
export default function NotFound() {
  return <main className="not-found"><span className="eyebrow">GCIT / 404</span><h1>A space yet to be built.</h1><p>Let’s take you back to somewhere worth exploring.</p><Link className="dark-button" href="/project-examples">View project examples →</Link></main>;
}
