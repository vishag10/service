import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['seclobsuperapplication.s3.ap-south-1.amazonaws.com', 'seclobmultiapp.s3.ap-south-1.amazonaws.com'],
  },
};

export default nextConfig;
