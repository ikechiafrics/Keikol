import { useQuery } from "@tanstack/react-query";
import { getDownloadURL, ref } from "firebase/storage";

import { storage } from "@/lib/firebase";

export interface ArtworkFile {
  path: string;
  url: string;
  name: string;
}

async function fetchArtworkUrls(paths: string[]): Promise<ArtworkFile[]> {
  return Promise.all(
    paths.map(async (path) => ({
      path,
      url: await getDownloadURL(ref(storage, path)),
      name: path.split("/").pop() ?? path,
    })),
  );
}

export function useArtworkUrls(paths: string[]) {
  return useQuery({
    queryKey: ["artwork-urls", paths],
    queryFn: () => fetchArtworkUrls(paths),
    enabled: paths.length > 0,
  });
}
