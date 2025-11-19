"use client";

import { useEffect, useRef, useState } from "react";
import { X, RotateCcw } from "lucide-react";

interface Props {
  imageUrl: string;
  title: string;
  onClose: () => void;
}

export default function FullscreenViewer({ imageUrl, title, onClose }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [showUI, setShowUI] = useState(true);
  const hideTimer = useRef<number | null>(null);

  // transform
  const zoomRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;
  const clamp = (v: number, a = MIN_ZOOM, b = MAX_ZOOM) => Math.max(a, Math.min(b, v));

  // pointer / gestures
  const isDraggingRef = useRef(false);
  const pointersRef = useRef<Map<number, PointerEvent>>(new Map());
  const lastTouchDistRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // inertia
  const velocityRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // hide UI
  const resetHideTimer = () => {
    setShowUI(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowUI(false), 2000);
  };

  // apply transform
  const applyTransform = (snap: boolean = false) => {
    const el = imgRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const z = zoomRef.current;
    const pos = posRef.current;

    const rect = container.getBoundingClientRect();
    const imgW = el.naturalWidth * z;
    const imgH = el.naturalHeight * z;

    const maxX = Math.max(0, (imgW - rect.width) / 2);
    const maxY = Math.max(0, (imgH - rect.height) / 2);

    if (snap) {
      pos.x = Math.min(maxX, Math.max(-maxX, pos.x));
      pos.y = Math.min(maxY, Math.max(-maxY, pos.y));
    }

    el.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${z})`;
    el.style.transition = isDraggingRef.current ? "none" : "transform 160ms ease-out";
  };

  const cancelInertia = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    velocityRef.current = { x: 0, y: 0 };
  };

  const startInertia = () => {
    cancelInertia();
    const friction = 0.92;

    const step = () => {
      velocityRef.current.x *= friction;
      velocityRef.current.y *= friction;

      posRef.current.x += velocityRef.current.x;
      posRef.current.y += velocityRef.current.y;

      if (
        Math.abs(velocityRef.current.x) < 0.05 &&
        Math.abs(velocityRef.current.y) < 0.05
      ) {
        velocityRef.current = { x: 0, y: 0 };
        applyTransform(true);
        rafRef.current = null;
        return;
      }

      applyTransform();
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  };

  // gesture helpers
  const midpoint = (a: PointerEvent, b: PointerEvent) => ({
    x: (a.clientX + b.clientX) / 2,
    y: (a.clientY + b.clientY) / 2,
  });

  const clientToImgCoords = (x: number, y: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: (x - rect.left - posRef.current.x) / zoomRef.current,
      y: (y - rect.top - posRef.current.y) / zoomRef.current,
    };
  };

  const zoomAt = (newZoom: number, cx: number, cy: number) => {
    const container = containerRef.current;
    if (!container) return;

    newZoom = clamp(newZoom);
    const before = clientToImgCoords(cx, cy);

    zoomRef.current = newZoom;
    const rect = container.getBoundingClientRect();

    posRef.current.x = cx - before.x * newZoom - rect.left;
    posRef.current.y = cy - before.y * newZoom - rect.top;

    applyTransform();
  };

  /* wheel zoom */
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cancelInertia();
    resetHideTimer();

    const delta = -e.deltaY;
    const factor = Math.exp(delta * 0.0015);
    zoomAt(zoomRef.current * factor, e.clientX, e.clientY);
    setTimeout(() => applyTransform(true), 0);
  };

  /* pointer handlers */
  const onPointerDown = (e: React.PointerEvent) => {
    resetHideTimer();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    pointersRef.current.set(e.pointerId, e.nativeEvent as PointerEvent);
    cancelInertia();

    if (pointersRef.current.size === 1) {
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      lastMoveTimeRef.current = performance.now();
    } else if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      lastTouchDistRef.current = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, e.nativeEvent as PointerEvent);

    if (pointersRef.current.size === 2) {
      resetHideTimer();
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      const last = lastTouchDistRef.current ?? dist;

      const factor = dist / last;
      const mid = midpoint(a, b);
      zoomAt(zoomRef.current * factor, mid.x, mid.y);
      lastTouchDistRef.current = dist;

      setTimeout(() => applyTransform(true), 0);
      return;
    }

    if (!isDraggingRef.current) return;

    const now = performance.now();
    const lp = lastPosRef.current;
    if (!lp) return;

    const dx = e.clientX - lp.x;
    const dy = e.clientY - lp.y;

    posRef.current.x += dx;
    posRef.current.y += dy;

    applyTransform();

    const dt = Math.max(1, now - (lastMoveTimeRef.current ?? now));
    velocityRef.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 };

    lastMoveTimeRef.current = now;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    resetHideTimer();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    isDraggingRef.current = false;
    lastTouchDistRef.current = null;

    if (
      Math.abs(velocityRef.current.x) > 0.5 ||
      Math.abs(velocityRef.current.y) > 0.5
    ) {
      startInertia();
    } else {
      cancelInertia();
      setTimeout(() => applyTransform(true), 0);
    }
  };

  /* double click */
  const onDoubleClick = (e: React.MouseEvent) => {
    const targetZoom = zoomRef.current > 1.4 ? 1 : 2.5;
    zoomAt(targetZoom, e.clientX, e.clientY);
  };

  const resetView = () => {
    cancelInertia();
    zoomRef.current = 1;
    posRef.current = { x: 0, y: 0 };
    applyTransform();
    resetHideTimer();
  };

  useEffect(() => {
    // fresh reset on mount
    zoomRef.current = 1;
    posRef.current = { x: 0, y: 0 };
    applyTransform();

    return () => {
      cancelInertia();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [imageUrl]);

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* UI Buttons */}
      {showUI && (
        <div className="absolute top-4 right-4 flex gap-3 z-[60] transition-opacity">
          <button
            onClick={resetView}
            className="bg-slate-800/70 hover:bg-slate-700 p-2 rounded-full text-white"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={() => {
              resetView();
              onClose();
            }}
            className="bg-slate-800/70 hover:bg-slate-700 p-2 rounded-full text-white"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Image */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-4"
        style={{ touchAction: "none" }}
        onDoubleClick={onDoubleClick}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt={title}
          draggable={false}
          style={{
            maxWidth: "90%",
            maxHeight: "90%",
            transform: "translate(0px, 0px) scale(1)",
            transition: "transform 160ms ease-out",
            willChange: "transform",
            touchAction: "none",
          }}
        />
      </div>
    </div>
  );
}
