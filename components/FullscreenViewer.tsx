"use client";

import { useEffect, useRef, useState } from "react";
import { X, RotateCcw } from "lucide-react";

interface Props {
  imageUrl: string;
  title?: string;
  onClose: () => void;
}

export default function FullscreenViewer({ imageUrl, title, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // UI
  const [showUI, setShowUI] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const resetHideTimer = () => {
    setShowUI(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowUI(false), 1800);
  };

  // transform state stored in refs for perf
  const zoomRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;
  const clamp = (v: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v));

  // pointers
  const pointers = useRef<Map<number, PointerEvent>>(new Map());
  const lastTouchDist = useRef<number | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const lastMoveTime = useRef<number | null>(null);

  // inertia
  const velocity = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  // helpers
  const applyTransform = (snap = false) => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const z = zoomRef.current;
    const pos = posRef.current;

    const rect = container.getBoundingClientRect();

    // If image natural size is 0 (not loaded) fallback to bounding box
    const naturalW = Math.max(1, img.naturalWidth || rect.width);
    const naturalH = Math.max(1, img.naturalHeight || rect.height);

    const imgW = naturalW * z;
    const imgH = naturalH * z;

    // calculate max offsets so image can't be dragged beyond edges
    const maxX = Math.max(0, (imgW - rect.width) / 2);
    const maxY = Math.max(0, (imgH - rect.height) / 2);

    if (snap) {
      pos.x = Math.min(maxX, Math.max(-maxX, pos.x));
      pos.y = Math.min(maxY, Math.max(-maxY, pos.y));
    }

    // smooth transition only on snap to avoid jank during pointer move
    img.style.transition = snap ? "transform 160ms ease-out" : "none";
    img.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${z})`;
  };

  const cancelInertia = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    velocity.current = { x: 0, y: 0 };
  };

  const startInertia = () => {
    cancelInertia();
    const friction = 0.92;

    const step = () => {
      velocity.current.x *= friction;
      velocity.current.y *= friction;

      posRef.current.x += velocity.current.x;
      posRef.current.y += velocity.current.y;

      if (Math.abs(velocity.current.x) < 0.05 && Math.abs(velocity.current.y) < 0.05) {
        velocity.current = { x: 0, y: 0 };
        applyTransform(true);
        raf.current = null;
        return;
      }

      applyTransform();
      raf.current = requestAnimationFrame(step);
    };

    raf.current = requestAnimationFrame(step);
  };

  // Zoom keeping point (cx, cy) fixed on screen
  const zoomAt = (newZoom: number, cx: number, cy: number) => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const oldZoom = zoomRef.current;
    newZoom = clamp(newZoom);
    if (newZoom === oldZoom) return;

    const rect = container.getBoundingClientRect();

    // compute touch point relative to image (image-space) using current pos/zoom
    // relX = (screenX - containerLeft - pos.x) / oldZoom
    const relX = (cx - rect.left - posRef.current.x) / oldZoom;
    const relY = (cy - rect.top - posRef.current.y) / oldZoom;

    zoomRef.current = newZoom;

    // set new pos so that rel point stays at same screen coordinate
    posRef.current.x = cx - rect.left - relX * newZoom;
    posRef.current.y = cy - rect.top - relY * newZoom;

    applyTransform(true);
  };

  // Reset view
  const resetView = () => {
    cancelInertia();
    zoomRef.current = 1;
    posRef.current = { x: 0, y: 0 };
    applyTransform(true);
    resetHideTimer();
  };

  // initialize when image changes
  useEffect(() => {
    zoomRef.current = 1;
    posRef.current = { x: 0, y: 0 };
    applyTransform(true);
    return () => {
      cancelInertia();
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  /* ---------- native event listeners on container (single place) ---------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* Pointer handlers (native) */
    const onPointerDown = (ev: PointerEvent) => {
      // track pointer
      pointers.current.set(ev.pointerId, ev);
      cancelInertia(); // stop inertia when user touches

      // single pointer => start drag
      if (pointers.current.size === 1) {
        lastPos.current = { x: ev.clientX, y: ev.clientY };
        lastMoveTime.current = performance.now();
      } else if (pointers.current.size === 2) {
        // pinch start
        const [a, b] = [...pointers.current.values()];
        lastTouchDist.current = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      }
      resetHideTimer();
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!pointers.current.has(ev.pointerId)) return;
      pointers.current.set(ev.pointerId, ev);

      // pinch
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        const last = lastTouchDist.current ?? dist;
        if (last === 0) {
          lastTouchDist.current = dist;
          return;
        }
        const factor = dist / last;
        const midX = (a.clientX + b.clientX) / 2;
        const midY = (a.clientY + b.clientY) / 2;
        zoomAt(zoomRef.current * factor, midX, midY);
        lastTouchDist.current = dist;
        resetHideTimer();
        return;
      }

      // drag single pointer
      if (pointers.current.size === 1 && lastPos.current) {
        const dx = ev.clientX - lastPos.current.x;
        const dy = ev.clientY - lastPos.current.y;

        posRef.current.x += dx;
        posRef.current.y += dy;
        applyTransform();

        // compute velocity for inertia
        const now = performance.now();
        const dt = Math.max(1, now - (lastMoveTime.current ?? now));
        velocity.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 };

        lastMoveTime.current = now;
        lastPos.current = { x: ev.clientX, y: ev.clientY };
        resetHideTimer();
      }
    };

    const onPointerUpOrCancel = (ev: PointerEvent) => {
      pointers.current.delete(ev.pointerId);
      lastTouchDist.current = null;
      lastPos.current = null;

      // start inertia if velocity suggests
      if (Math.abs(velocity.current.x) > 0.5 || Math.abs(velocity.current.y) > 0.5) {
        startInertia();
      } else {
        // snap to bounds
        applyTransform(true);
      }
      resetHideTimer();
    };

    /* wheel handler (non-passive) */
    const onWheel = (ev: WheelEvent) => {
      // prevent page scroll when wheel happens on overlay
      ev.preventDefault();
      resetHideTimer();
      cancelInertia();

      const factor = Math.exp(-ev.deltaY * 0.0012);
      zoomAt(zoomRef.current * factor, ev.clientX, ev.clientY);
    };

    /* touchmove: prevent default page scroll while panning/zooming inside viewer */
    const onTouchMove = (ev: TouchEvent) => {
      // if user is interacting and image is zoomed or they are panning, prevent document scroll
      if ((ev.touches && ev.touches.length === 1 && zoomRef.current > 1) || pointers.current.size > 0) {
        ev.preventDefault();
      }
    };

    /* dblclick to zoom */
    const onDblClick = (ev: MouseEvent) => {
      // toggle zoom centered at click
      const next = zoomRef.current > 1.6 ? 1 : 2.4;
      zoomAt(next, ev.clientX, ev.clientY);
    };

    // attach listeners as non-passive where we call preventDefault
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUpOrCancel);
    container.addEventListener("pointercancel", onPointerUpOrCancel);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("dblclick", onDblClick);

    // ensure pointer events enabled (for touch-action compatibility)
    container.style.touchAction = "none";

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUpOrCancel);
      container.removeEventListener("pointercancel", onPointerUpOrCancel);
      container.removeEventListener("wheel", onWheel as any);
      container.removeEventListener("touchmove", onTouchMove as any);
      container.removeEventListener("dblclick", onDblClick);
      // cleanup any RAF
      cancelInertia();
    };
    // we intentionally do not include functions in deps to avoid re-attaching
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current]);

  // small accessibility: close on ESC
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        resetView();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ensure we size/center image when it loads
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const onLoad = () => {
      // center image
      zoomRef.current = 1;
      posRef.current = { x: 0, y: 0 };
      applyTransform(true);
    };
    img.addEventListener("load", onLoad);
    return () => img.removeEventListener("load", onLoad);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* UI */}
      {showUI && (
        <div className="absolute top-4 right-4 flex gap-3 z-[10000]">
          <button
            onClick={resetView}
            aria-label="Reset view"
            className="bg-slate-800/70 hover:bg-slate-700 p-2 rounded-full text-white"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={() => {
              resetView();
              onClose();
            }}
            aria-label="Close"
            className="bg-slate-800/70 hover:bg-slate-700 p-2 rounded-full text-white"
            title="Tutup"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Container for native listeners */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-4"
        style={{ touchAction: "none" }}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt={title ?? "Image"}
          draggable={false}
          style={{
            maxWidth: "90%",
            maxHeight: "90%",
            transform: "translate(0px, 0px) scale(1)",
            transition: "none",
            willChange: "transform",
            touchAction: "none",
          }}
        />
      </div>
    </div>
  );
}
