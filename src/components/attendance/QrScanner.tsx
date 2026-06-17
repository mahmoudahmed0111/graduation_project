import { useEffect, useRef, useId } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  /** Called with the decoded text once a QR code is read. */
  onResult: (text: string) => void;
  /** Called when the camera can't be started (e.g. permission denied). */
  onError?: (message: string) => void;
  active: boolean;
}

/** Thin wrapper around html5-qrcode that starts/stops the rear camera based on
 *  `active`. Stops itself on the first successful read so the parent can act. */
export function QrScanner({ onResult, onError, active }: QrScannerProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const elementId = `qr-reader-${rawId}`;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  onResultRef.current = onResult;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!active || startedRef.current) return;
      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            onResultRef.current(decodedText);
          },
          () => {
            /* per-frame decode failures are normal; ignore */
          }
        );
        startedRef.current = true;
      } catch (err) {
        if (!cancelled) {
          onErrorRef.current?.(err instanceof Error ? err.message : 'Unable to access the camera.');
        }
      }
    }

    async function stop() {
      const scanner = scannerRef.current;
      if (scanner && startedRef.current) {
        try {
          await scanner.stop();
          await scanner.clear();
        } catch {
          /* ignore stop errors */
        }
      }
      startedRef.current = false;
      scannerRef.current = null;
    }

    if (active) void start();
    else void stop();

    return () => {
      cancelled = true;
      void stop();
    };
  }, [active, elementId]);

  return <div id={elementId} className="overflow-hidden rounded-2xl [&_video]:rounded-2xl" />;
}
