'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Check } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureChange: (signatureDataUrl: string | null) => void;
  width?: number;
  height?: number;
  className?: string;
}

export function SignatureCanvas({
  onSignatureChange,
  width = 400,
  height = 120,
  className = '',
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Set drawing style
    ctx.strokeStyle = '#1B1C20';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw signature line
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.moveTo(20, height - 20);
    ctx.lineTo(width - 20, height - 20);
    ctx.stroke();

    // Reset style for drawing
    ctx.strokeStyle = '#1B1C20';
    ctx.lineWidth = 2;
  }, [width, height]);

  const getCoordinates = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const pos = getCoordinates(e);
      if (!pos) return;

      setIsDrawing(true);
      lastPos.current = pos;
    },
    [getCoordinates]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !lastPos.current) return;

      const pos = getCoordinates(e);
      if (!pos) return;

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      lastPos.current = pos;
      setHasSignature(true);
    },
    [isDrawing, getCoordinates]
  );

  const stopDrawing = useCallback(() => {
    if (isDrawing && hasSignature) {
      const canvas = canvasRef.current;
      if (canvas) {
        onSignatureChange(canvas.toDataURL('image/png'));
      }
    }
    setIsDrawing(false);
    lastPos.current = null;
  }, [isDrawing, hasSignature, onSignatureChange]);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Redraw signature line
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.moveTo(20, height - 20);
    ctx.lineTo(width - 20, height - 20);
    ctx.stroke();

    // Reset style
    ctx.strokeStyle = '#1B1C20';
    ctx.lineWidth = 2;

    setHasSignature(false);
    onSignatureChange(null);
  }, [width, height, onSignatureChange]);

  return (
    <div className={className}>
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          className="touch-none cursor-crosshair"
          style={{ width, height }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Hint text */}
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm">Sign here</span>
          </div>
        )}

        {/* Clear button */}
        {hasSignature && (
          <button
            type="button"
            onClick={clearSignature}
            className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="Clear signature"
          >
            <Eraser className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-1.5 mt-1.5">
        {hasSignature ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-600">Signature captured</span>
          </>
        ) : (
          <span className="text-xs text-gray-500">Use finger or mouse to sign above</span>
        )}
      </div>
    </div>
  );
}
