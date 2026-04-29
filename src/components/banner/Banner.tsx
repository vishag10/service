"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Slider from "react-slick";
import { getBanners } from "@/services/commonapi/commonApi";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

type RawBanner = {
  id?: string;
  _id?: string;
  link?: string;
  filePath?: string;
  fileName?: string;
  status?: string;
  validFrom?: string;
  validTo?: string;
  position?: string;
  countryStates?: { country: string; states?: string[] }[];
};

interface BannerProps {
  position?: "top" | "bottom" | "all";
  country?: string;
  height?: number | string;
  openInNewTab?: boolean;
  placeholderImages?: string[];
}

const Banner: React.FC<BannerProps> = ({
  position = "all",
  country,
  openInNewTab = true,
  placeholderImages = [],
}) => {
  const [banners, setBanners] = useState<RawBanner[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchBanners = async () => {
      try {
        const response = await getBanners();
        // robust: handle axios wrapper (response.data.data) or direct returned array
        const bannerList: RawBanner[] = (response?.data?.data ??
          response?.data ??
          []) as RawBanner[];

        if (!mounted) return;

        const now = new Date();
        const visible = (bannerList ?? []).filter((b) => {
          if (b.status !== "active") return false;
          if (position !== "all" && b.position !== position) return false;

          try {
            const from = b.validFrom ? new Date(b.validFrom) : null;
            const to = b.validTo ? new Date(b.validTo) : null;
            if (from && now < from) return false;
            if (to && now > to) return false;
          } catch {}

          if (
            country &&
            Array.isArray(b.countryStates) &&
            b.countryStates.length
          ) {
            const countries = b.countryStates.map((c) => c.country);
            if (!countries.includes(country)) return false;
          }

          return true;
        });

        setBanners(visible);
      } catch (err) {
        showToast({
          type: "error",
          title: "Error",
          message: getErrorMessage(error),
        });
      } finally {
      }
    };

    fetchBanners();
    return () => {
      mounted = false;
    };
  }, [position, country]);

  const displayed = banners.length
    ? banners
    : placeholderImages.map((src, i) => ({
        id: `ph-${i}`,
        filePath: src,
        link: "#",
      }));

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
  };

  return (
    <div
      className="relative w-full md:rounded-lg pt-8 pb-12 rounded-lg"
      style={{ height: "300px" }}
    >
      <Slider {...sliderSettings}>
        {displayed.map((b, index) => {
          const src = (b as RawBanner).filePath ?? placeholderImages[0];
          const link = (b as RawBanner).link ?? "#";
          const key =
            (b as RawBanner).id ?? (b as RawBanner)._id ?? `banner-${index}`;

          return (
            <div key={key} className="relative" style={{ height: "264px" }}>
              {link && link !== "#" ? (
                <a
                  href={link}
                  target={openInNewTab ? "_blank" : "_self"}
                  rel={openInNewTab ? "noopener noreferrer" : undefined}
                  className="block w-full h-full rounded-lg"
                >
                  <Image
                    src={src || "/assets/banner/banner.png"}
                    alt={`Banner ${index + 1}`}
                    width={800}
                    height={264}
                    className="w-full h-full object-cover cursor-pointer rounded-lg"
                    style={{ height: "264px" }}
                  />
                </a>
              ) : (
                <Image
                  src={src || "/assets/banner/banner.png"}
                  alt={`Banner ${index + 1}`}
                  width={800}
                  height={264}
                  className="w-full h-full object-cover"
                  style={{ height: "264px" }}
                />
              )}
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default Banner;
