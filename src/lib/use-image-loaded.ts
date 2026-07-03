import { useCallback, useState } from "react";

// Tracks whether an <img> has finished loading, so callers can show a
// skeleton placeholder until then. Checks `img.complete` in the ref callback
// too, since `onLoad` never fires if the image was already cached/loaded by
// the time React attaches the listener.
export function useImageLoaded() {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete) setLoaded(true);
  }, []);
  return { loaded, onLoad: () => setLoaded(true), imgRef };
}
