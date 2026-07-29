import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Footloose Alley Studio Manager",
    short_name: "Footloose Alley",
    description: "Secure dance and fitness studio operations system.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#fff8f6",
    theme_color: "#b4233a",
    orientation: "portrait-primary",
    categories: ["business", "fitness", "productivity"],
    icons: [
      {
        src: "/footloose-alley-logo.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/footloose-alley-logo.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
