"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown, ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight,
  BedDouble, Box, Check, Expand, Layers3,
  Maximize2, Minus, MousePointer2, Pause, Play, Plus, RotateCcw,
  RotateCw, SlidersHorizontal, Sofa, Sparkles, Sun, X,
} from "lucide-react";
import { ROOM_IDS, ROOM_PLAN, VIEWS, type ViewId } from "@/lib/villa";
import type { SceneCommand } from "./villa-scene";

const VillaScene = dynamic(() => import("./villa-scene"), { ssr: false });

export default function ProjectExplorer() {
  const [active, setActive] = useState<ViewId>("exterior");
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [quality, setQuality] = useState<"balanced" | "high">("balanced");
  const [settings, setSettings] = useState(false);
  const [help, setHelp] = useState(false);
  const [command, setCommand] = useState<SceneCommand | null>(null);
  const [full, setFull] = useState(false);
  const viewer = useRef<HTMLDivElement>(null);
  const view = VIEWS[active];
  const onReady = useCallback(() => setReady(true), []);
  const onProgress = useCallback((value: number) => setProgress(value), []);
  const onInteraction = useCallback(() => setAutoRotate(false), []);
  const onError = useCallback((message: string) => { setError(message); setReady(false); }, []);
  const send = useCallback((type: SceneCommand["type"]) => setCommand({ type, id: Date.now() }), []);

  const selectView = (id: ViewId) => {
    setActive(id); setAutoRotate(false); setStarted(true); setHelp(false);
    window.history.replaceState(null, "", `#${id}`);
    viewer.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  useEffect(() => {
    const syncHash = () => {
      const id = window.location.hash.slice(1);
      if (id && id in VIEWS) { setActive(id as ViewId); setStarted(true); setAutoRotate(false); }
    };
    const timer = window.setTimeout(syncHash, 0);
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => { window.clearTimeout(timer); window.removeEventListener("hashchange", syncHash); window.removeEventListener("popstate", syncHash); };
  }, []);
  useEffect(() => {
    const onFull = () => setFull(document.fullscreenElement === viewer.current);
    document.addEventListener("fullscreenchange", onFull);
    return () => document.removeEventListener("fullscreenchange", onFull);
  }, []);
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (viewer.current?.requestFullscreen) await viewer.current.requestFullscreen();
      else setFull((v) => !v);
    } catch { setFull((v) => !v); }
  };
  const reload = () => { setReady(false); setError(""); setProgress(0); setAttempt((v) => v + 1); setStarted(true); };
  const moveRoom = (direction: number) => {
    const index = ROOM_IDS.indexOf(active);
    selectView(ROOM_IDS[(Math.max(index, 0) + direction + ROOM_IDS.length) % ROOM_IDS.length]);
  };

  return (
    <>
      <div className="project-heading flex flex-col justify-between gap-7 md:flex-row md:items-end">
        <div>
          <div className="eyebrow mb-5 flex items-center gap-3"><span className="tiny-line" /> A closer look at what we create</div>
          <h1>Project examples<span className="heading-dot">.</span></h1>
        </div>
        <p className="heading-description">Architecture is better experienced.<br />Step inside, look around, make yourself at home.</p>
      </div>

      <section id="villa" aria-label="Villa Bellavista project" className="project-shell">
        <div className="project-titlebar flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="project-index">01 /</span>
            <div><h2>Villa Bellavista</h2><p>Northern Italy <span aria-hidden="true">/</span> Residential concept</p></div>
          </div>
          <span className="project-tag"><span /> Interactive experience</span>
        </div>
        <div className="experience-grid">
          <div className={`viewer-wrap ${full ? "viewer-fullscreen" : ""}`} ref={viewer}>
            <div className="viewer-topbar">
              <div className="floor-switch" role="group" aria-label="Choose a floor view">
                {([['exterior', 'Exterior'], ['ground', 'Ground floor'], ['upper', 'First floor']] as const).map(([id, label]) =>
                  <button key={id} aria-pressed={active === id} className={active === id ? "is-active" : ""} onClick={() => selectView(id)}>{label}</button>
                )}
              </div>
              <div className="viewer-top-actions">
                <button className="icon-button light-button" aria-label="Viewer settings" aria-expanded={settings} onClick={() => { setSettings(!settings); setHelp(false); }}><SlidersHorizontal size={17} /></button>
                <button className="icon-button light-button" aria-label={full ? "Exit fullscreen" : "Enter fullscreen"} onClick={fullscreen}>{full ? <X size={18} /> : <Expand size={18} />}</button>
              </div>
            </div>
            {settings && <div className="settings-panel">
              <div className="flex items-center justify-between"><strong>Display quality</strong><button className="small-close" aria-label="Close settings" onClick={() => setSettings(false)}><X size={16} /></button></div>
              <p>Balanced is lighter on your device.</p>
              <div className="flex gap-2" role="group" aria-label="Display quality">
                {(['balanced', 'high'] as const).map((q) => <button key={q} aria-pressed={quality === q} onClick={() => setQuality(q)}>{quality === q && <Check size={13} />}{q}</button>)}
              </div>
            </div>}
            <div className="scene-stage" aria-busy={started && !ready && !error}>
              {(!ready || !started || error) && <Image className="villa-poster" src="/images/villa-hero.webp" alt="White and grey two-storey Villa Bellavista with a pool, glass balcony, landscaped terrace and two-car garage" fill priority sizes="(max-width: 900px) 100vw, 75vw" />}
              {started && !error && <VillaScene key={attempt} view={view} autoRotate={autoRotate} quality={quality} command={command} onReady={onReady} onProgress={onProgress} onError={onError} onInteraction={onInteraction} />}
              {!started && <div className="poster-invitation">
                <button className="explore-button" onClick={() => setStarted(true)}><Box size={20} strokeWidth={1.5} /><span>Explore in 3D</span><ArrowUpRight size={18} /></button>
                <span>Rotate the villa. Discover every space.</span>
              </div>}
              {started && !ready && !error && <div className="loading-overlay" role="status" aria-live="polite">
                <div className="loader-orbit"><Box size={26} strokeWidth={1.3} /></div>
                <span>Opening the villa</span><div className="progress-track"><div style={{ width: `${Math.max(progress, 8)}%` }} /></div>
                <small>{progress < 95 ? `${progress}% loaded` : "Preparing materials…"}</small>
              </div>}
              {error && <div className="error-overlay" role="alert"><Box size={26} /><h3>A little pause in the tour.</h3><p>{error}</p><button className="dark-button" onClick={reload}><RotateCcw size={15} /> Try again</button></div>}
            </div>
            <div className="viewer-caption"><span className={ready ? "live-dot" : ""} />{ready ? (view.clip ? "CUTAWAY VIEW" : "LIVE 3D VIEW") : "ARCHITECTURAL PREVIEW"}<span className="caption-separator">/</span><Sun size={13} /> DAYLIGHT</div>
            {ready && active !== "exterior" && <button className="back-to-exterior" onClick={() => selectView("exterior")}><ArrowLeft size={14} /> Back outside</button>}
            <div className="viewer-bottom-bar">
              <button className="viewer-help" aria-label="How to explore the villa" onClick={() => { setHelp(!help); setSettings(false); }} aria-expanded={help}><MousePointer2 size={14} /><span>{ready ? "How to explore" : "Interactive 3D tour"}</span></button>
              <div className="viewer-toolbar" role="group" aria-label="Model camera controls">
                <button disabled={!ready} className="icon-button" aria-label="Rotate left" onClick={() => send("left")}><RotateCcw size={17} /></button>
                <button disabled={!ready} className="icon-button" aria-label="Rotate right" onClick={() => send("right")}><RotateCw size={17} /></button>
                <span className="toolbar-divider" />
                <button disabled={!ready} className="icon-button" aria-label="Zoom out" onClick={() => send("zoom-out")}><Minus size={17} /></button>
                <button disabled={!ready} className="icon-button" aria-label="Zoom in" onClick={() => send("zoom-in")}><Plus size={17} /></button>
                <span className="toolbar-divider" />
                <button disabled={!ready} className="icon-button" aria-label="Reset camera view" onClick={() => send("reset")}><Maximize2 size={17} /></button>
              </div>
            </div>
            {help && <div className="help-panel"><strong>Around the villa</strong><p>Drag to orbit · Scroll or pinch to zoom · Right-drag to pan.</p><p>Use the camera buttons for keyboard-friendly controls, or choose a room to step inside.</p><button onClick={() => setHelp(false)}>Got it <Check size={14} /></button></div>}
          </div>

          <aside className="room-panel" aria-label="Explore villa rooms">
            <div className="panel-heading"><span className="eyebrow">Your private tour</span><h3>A place for<br /><em>every moment.</em></h3><p>Pick a space. We’ll take you there.</p></div>
            <div className="room-list" role="group" aria-label="Choose a room">
              {ROOM_IDS.map((id, index) => <button key={id} className={`room-button ${active === id ? "selected" : ""}`} onClick={() => selectView(id)} aria-pressed={active === id}>
                <span className="room-number">{String(index + 1).padStart(2, '0')}</span><span>{VIEWS[id].label}</span><ArrowUpRight size={16} strokeWidth={1.5} />
              </button>)}
            </div>
            <div className="panel-footer"><Layers3 size={16} strokeWidth={1.5} /><span>Two levels. One considered design.</span></div>
          </aside>
        </div>

        <div className="experience-infobar">
          <div className="flex items-center gap-3"><span className="info-orbit"><Box size={17} strokeWidth={1.5} /></span><p>More than a view.<span> An invitation to look closer.</span></p></div>
          <button disabled={!ready || active !== "exterior"} aria-pressed={autoRotate} onClick={() => setAutoRotate(!autoRotate)}>{autoRotate ? <Pause size={14} /> : <Play size={14} />}<span>{autoRotate ? "Pause rotation" : "Auto-rotate"}</span></button>
        </div>
      </section>

      <section className="space-details grid gap-10 lg:grid-cols-[1.05fr_1fr]" aria-label="Selected space details">
        <div className="selected-space" aria-live="polite" aria-atomic="true">
          <span className="eyebrow">{view.eyebrow}</span>
          <h2>{view.label}<ArrowDownLeft size={31} strokeWidth={1} aria-hidden="true" /></h2>
          <p>{view.description}</p>
          <div className="detail-actions"><button onClick={() => moveRoom(-1)} aria-label="Previous room"><ArrowLeft size={17} /></button><button onClick={() => moveRoom(1)} aria-label="Next room"><ArrowRight size={17} /></button><span>Explore at your own pace</span></div>
        </div>
        <FloorPlan active={active} onSelect={selectView} />
      </section>

      <section id="materials" className="materials-section">
        <div className="section-heading flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow">Quiet, by design</span><h2>A palette that lets life in.</h2></div><span className="section-index">THE MATERIAL STORY / 02</span></div>
        <div className="material-grid grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {[{ name: "Mineral plaster", detail: "Soft white · Exterior walls", cls: "plaster", num: "01" }, { name: "Grey limestone", detail: "Honed texture · Stonework", cls: "stone", num: "02" }, { name: "Graphite panels", detail: "Fine grain · Facade & entry", cls: "graphite", num: "03" }, { name: "Clear glazing", detail: "Light & reflection · Openings", cls: "glass", num: "04" }].map((m) => <div className="material-item" key={m.cls}><div className={`material-swatch ${m.cls}`}><span>{m.num}</span></div><h3>{m.name}</h3><p>{m.detail}</p></div>)}
        </div>
      </section>

      <section id="project-notes" className="project-notes grid gap-7 md:grid-cols-[1fr_1.6fr]">
        <span className="eyebrow flex items-start gap-3"><Sparkles size={16} /> Made to be explored</span>
        <div><h2>Thoughtful architecture.<br /><em>From the outside in.</em></h2><p>Villa Bellavista is a residential design concept inspired by contemporary northern Italian architecture. Its white and grey exterior is balanced by warm interiors, generous glazing and outdoor spaces made for slower days.</p><div className="project-facts flex flex-wrap gap-8"><span><BedDouble size={18} /> 2 furnished bedrooms</span><span><Layers3 size={18} /> 2 levels</span><span><Sofa size={18} /> Open-plan living</span></div></div>
      </section>
      <div className="bottom-note"><span>Like what you see? Every great space begins with an idea.</span><a href="#villa">Take another look <ArrowUpRight size={17} /></a></div>
    </>
  );
}

function FloorPlan({ active, onSelect }: { active: ViewId; onSelect: (id: ViewId) => void }) {
  const upper = VIEWS[active].floor === "upper";
  return <div className="floorplan-card">
    <div className="floorplan-title"><span className="eyebrow">Find your bearings</span><span>{upper ? "FIRST FLOOR" : "GROUND FLOOR"}<ArrowDown size={12} /></span></div>
    <div className="floorplan-layout">
      <svg viewBox="0 0 400 190" aria-hidden="true" className="floorplan-drawing">
        <path d="M12 12H282V162H12Z" className="plan-outline" /><path d="M282 36H388V162H282" className="plan-outline" />
        <path d="M12 100H282 M196 12V162 M282 36V162" className="plan-wall" />
        <path d="M25 162H183 M30 12H180" className="plan-window" />
        {upper ? <><path d="M105 12V162" className="plan-wall" /><rect x="40" y="45" width="45" height="62" rx="2" className="plan-furniture" /><rect x="127" y="45" width="45" height="62" rx="2" className="plan-furniture" /></> : <><rect x="32" y="114" width="90" height="23" rx="3" className="plan-furniture" /><rect x="56" y="145" width="40" height="12" rx="1" className="plan-furniture" /><rect x="42" y="37" width="62" height="27" rx="2" className="plan-furniture" /><rect x="130" y="36" width="50" height="19" rx="1" className="plan-furniture" /></>}
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M214 ${37 + i * 9}H261`} className="plan-stair" />)}
        <rect x="304" y="65" width="28" height="59" rx="7" className="plan-furniture" /><rect x="346" y="65" width="28" height="59" rx="7" className="plan-furniture" />
        <path d="M301 162H335 M344 162H378" className="plan-window" />
        <text x="305" y="184">N</text><path d="M314 181V169M311 173L314 169L317 173" className="plan-stair" />
      </svg>
      {(upper ? [{ id: "bedroom" as const, x: 26, y: 51 }] : ROOM_PLAN).map((p) => <button key={p.id} style={{ left: `${p.x}%`, top: `${p.y}%` }} className={`plan-point ${active === p.id ? "active" : ""}`} aria-label={`Explore ${VIEWS[p.id].label} on the floor plan`} title={VIEWS[p.id].label} onClick={() => onSelect(p.id)}><span /></button>)}
    </div>
    <p className="floorplan-footnote"><span /> Select a marker to enter a room <small>Illustrative plan</small></p>
  </div>;
}
