import { useEffect, useState } from "react";
import { getProductImageUrl } from "@/lib/storage";

export function useProductImageUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProductImageUrl(path).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [path]);

  return url;
}
