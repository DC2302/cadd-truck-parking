import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

async function exists(rel: string): Promise<boolean> {
  try {
    await fs.access(path.join(process.cwd(), "public", rel));
    return true;
  } catch {
    return false;
  }
}

async function getGalleryPhotos(): Promise<string[]> {
  try {
    const dir = path.join(process.cwd(), "public", "photos");
    const files = await fs.readdir(dir);
    return files
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort()
      .map((f) => `/photos/${f}`);
  } catch {
    return [];
  }
}

export default async function Home() {
  const photos = await getGalleryPhotos();
  const heroPhoto = photos.find((p) => /hero/i.test(p)) ?? null;
  const galleryPhotos = photos.filter((p) => !/hero/i.test(p));

  // Looping hero video slot — drop hero-loop.mp4 (or .webm) into public/media/
  const heroVideo = (await exists("media/hero-loop.mp4"))
    ? "/media/hero-loop.mp4"
    : (await exists("media/hero-loop.webm"))
      ? "/media/hero-loop.webm"
      : null;

  const showTruck = (await exists("brand/show-truck.jpg"))
    ? "/brand/show-truck.jpg"
    : null;
  const mascot = (await exists("brand/mascot.png"))
    ? "/brand/mascot.png"
    : null;

  return (
    <HomeContent
      heroPhoto={heroPhoto}
      heroVideo={heroVideo}
      galleryPhotos={galleryPhotos}
      showTruck={showTruck}
      mascot={mascot}
    />
  );
}
