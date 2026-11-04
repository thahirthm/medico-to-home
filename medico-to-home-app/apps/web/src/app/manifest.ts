import type { MetadataRoute } from "next";

// Name and icon used when the site is added to a phone's home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Medico To Home",
    short_name: "Medico To Home",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
