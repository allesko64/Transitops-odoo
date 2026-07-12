"use client";

import { useEffect, useRef, useState } from "react";

type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};

type Route = {
  start: RoutePoint;
  end: RoutePoint;
};

const ROUTES: Route[] = [
  { start: { x: 100, y: 150, delay: 0 }, end: { x: 200, y: 80, delay: 2 } },
  { start: { x: 200, y: 80, delay: 2 }, end: { x: 260, y: 120, delay: 4 } },
  { start: { x: 50, y: 50, delay: 1 }, end: { x: 150, y: 180, delay: 3 } },
  { start: { x: 280, y: 60, delay: 0.5 }, end: { x: 180, y: 180, delay: 2.5 } },
];

function generateDots(width: number, height: number) {
  const dots: { x: number; y: number; opacity: number }[] = [];
  const gap = 12;

  for (let x = 0; x < width; x += gap) {
    for (let y = 0; y < height; y += gap) {
      const isInMapShape =
        (x < width * 0.25 && x > width * 0.05 && y < height * 0.4 && y > height * 0.1) ||
        (x < width * 0.25 && x > width * 0.15 && y < height * 0.8 && y > height * 0.4) ||
        (x < width * 0.45 && x > width * 0.3 && y < height * 0.35 && y > height * 0.15) ||
        (x < width * 0.5 && x > width * 0.35 && y < height * 0.65 && y > height * 0.35) ||
        (x < width * 0.7 && x > width * 0.45 && y < height * 0.5 && y > height * 0.1) ||
        (x < width * 0.8 && x > width * 0.65 && y < height * 0.8 && y > height * 0.6);

      if (isInMapShape && Math.random() > 0.3) {
        dots.push({ x, y, opacity: Math.random() * 0.4 + 0.15 });
      }
    }
  }
  return dots;
}

export function DotMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas?.parentElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    resizeObserver.observe(canvas.parentElement);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId: number;
    let startTime = Date.now();

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(28, 25, 23, ${dot.opacity})`;
        ctx.fill();
      }

      const currentTime = (Date.now() - startTime) / 1000;

      for (const route of ROUTES) {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) continue;

        const progress = Math.min(elapsed / 3, 1);
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "rgba(28, 25, 23, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(28, 25, 23, 0.7)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#1c1917";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(28, 25, 23, 0.15)";
        ctx.fill();
      }

      if (currentTime > 15) {
        startTime = Date.now();
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
