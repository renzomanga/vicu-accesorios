import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // El bottom nav mobile ocupa todo el ancho de abajo; lo subimos para que no tape "Inicio".
    position: "top-right",
  },
};

export default nextConfig;
