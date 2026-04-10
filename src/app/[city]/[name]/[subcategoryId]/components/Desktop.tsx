import React, { useEffect, useState } from "react";
import Image from "next/image";
import Slider from "react-slick";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { MdLocationOn, MdStar } from "react-icons/md";
import DesktopReview from "@/components/reviews/DesktopReview";
import MostPopular from "@/components/desktop/MostPopular";
import Faq from "@/components/desktop/Faq";
import ScheduleService from "@/components/desktop/ScheduleService";

import { getPackages, serviceDeatil } from "@/services/commonapi/commonApi";
import { useParams } from "next/navigation";
import DesktopBookingModal from "@/components/bookingmodal/DesktopBookingModal";

type Banner = {
  id: number;
  src: string;
  alt: string;
};

type PackageType = {
  id: string;
  tittle: string;
  description: string;
  durationType: string;
  features: string[];
  amount: { inr: number; usd: number };
  offerPrice: { inr: number; usd: number };
  gst: { inr: number; usd: number };
  percentage: { inr: number; usd: number };
  type: string;
};

type ServiceType = {
  success: boolean;
  data: {
    subCategories: {
      name: string;
      description: string;
      image?: string;
      detailsImage?: {
        filePath: string;
        key: string;
        _id: string;
      }[];
      detailsVideo?: {
        filePath: string;
        key: string;
      };
    }[];
  };
};

const banners: Banner[] = [
  {
    id: 1,
    src: "/assets/banner/banner.png", // replace with your uploaded banner
    alt: "Cashon Postpaid Zomato Banner",
  },
  {
    id: 2,
    src: "/assets/banner/banner.png",
    alt: "Zomato Offer Banner",
  },
  {
    id: 3,
    src: "/assets/banner/banner.png",
    alt: "Cashback Banner",
  },
];

interface DesktopProps {
  id: string;
}

function DeskTop({ id }: DesktopProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [service, setService] = useState<ServiceType | null>(null);
  const [rating, setRating] = useState(3);
  const [hoverRating, setHoverRating] = useState(0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [review, setReview] = useState("");

  const params = useParams();
  const uniqueId = params.subcategoryId;

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  const handleGetDetails = async () => {
    try {
      if (typeof uniqueId === "string") {
        const res = await serviceDeatil(uniqueId);
        console.log("Service Details:", res);
        if (res?.success) {
          setService(res);
        }
      }
    } catch (error) {
      console.error("Error fetching package details:", error);
    }
  };
  useEffect(() => {
    handleGetDetails();
  }, [uniqueId]);

  useEffect(() => {
    if (service) {
      console.log("Service state updated:", service);
      console.log("Service name:", service.data.subCategories[0].name);
    }
  }, [service]);

  return (
    <>
      {showBookingModal && (
        <div
          className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setShowBookingModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DesktopBookingModal subCategoryId={id} />
          </div>
          <button
            onClick={() => setShowBookingModal(false)}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}
      <div className="w-full mt-2">
        <div className="w-[80%]  mx-auto pt-12 ">
          <h2 className="font-medium text-[25px] leading-[40px] tracking-[0px] ">
            {service?.data?.subCategories?.[0]?.name || "GreenThumb Gardens"}
          </h2>
          <div className="flex  items-center pb-2 ">
            <MdLocationOn className="text-black-500 w-5 h-5" />
            <p className="text-[20px] text-gray-500">Thiruvananthapuram </p>
            <MdStar className="text-yellow-500 w-5 h-5 ml-6" />
            <p className="text-[20px] text-yellow-500 mt-1"> 4.5 Rating</p>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-lg overflow-hidden">
            {/* Video Frame */}
            <div className="relative h-full">
              <video
                src={service?.data?.subCategories?.[0]?.detailsVideo?.filePath}
                controls
                className="w-full h-full rounded-lg object-cover"
              />
            </div>

            {/* Right side with images */}
            <div className="grid grid-rows-2 gap-4">
              <div className="relative h-[220px]">
                <Image
                  src={
                    service?.data?.subCategories?.[0]?.detailsImage?.[0]
                      ?.filePath || "/assets/service/s1.png"
                  }
                  alt="Cleaning Service"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="relative h-[220px]">
                <Image
                  src={
                    service?.data?.subCategories?.[0]?.detailsImage?.[1]
                      ?.filePath || "/assets/service/s1.png"
                  }
                  alt="Laundry Service"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>

          <div className="w-full  flex">
            <div className="w-[70%] ">
              <h3 className="mt-4 font-medium text-[24px] leading-[40px] tracking-[0px]">
                About us
              </h3>
              <p className="font-normal text-[16px] leading-[28px] tracking-[0px] mt-2 pb-8 text-justify">
                {service?.data?.subCategories?.[0]?.description}
              </p>
              <DesktopReview />
            </div>
            <div className="w-[30%] pt-12 mx-auto">
              {/* Book Service Button */}
              <div className="w-full flex justify-center items-center">
                <button className="w-[350px] h-[42px] bg-[#7722FF] text-white rounded-[8px] font-medium text-sm transition-all duration-300 hover:bg-[#6611EE]">
                  Book Service
                </button>
              </div>
              
            <div className="w-full mx-auto flex flex-col items-center gap-5 p-5">
               {/* Send Us Message Card */}
              <div className="w-[350px] bg-[#f0f2f5] rounded-2xl p-5 ">
                <h2 className="text-[16px] font-semibold text-gray-800 mb-4">
                  Send Us Message
                </h2>

                {/* Full Name */}
                <div className="relative mb-3">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder=" "
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="peer w-full bg-white border-[1.5px] border-gray-200 rounded-[10px] pt-[18px] pb-[6px] pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-[#7722FF] transition-colors"
                  />
                  <label className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-focus:top-[7px] peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-[#7722FF] peer-focus:font-medium peer-[:not(:placeholder-shown)]:top-[7px] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-[#7722FF] peer-[:not(:placeholder-shown)]:font-medium">
                    Full Name
                  </label>
                </div>

                {/* Email Address */}
                <div className="relative mb-3">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 8l10 6 10-6" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer w-full bg-white border-[1.5px] border-gray-200 rounded-[10px] pt-[18px] pb-[6px] pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-[#7722FF] transition-colors"
                  />
                  <label className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-focus:top-[7px] peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-[#7722FF] peer-focus:font-medium peer-[:not(:placeholder-shown)]:top-[7px] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-[#7722FF] peer-[:not(:placeholder-shown)]:font-medium">
                    Email Address
                  </label>
                </div>

                {/* Mobile Number with Flag */}
                <div className="mb-3">
                  <PhoneInput
                    country="in"
                    value={phone}
                    onChange={(value) => setPhone(value)}
                    placeholder="Mobile Number"
                    inputStyle={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "10px",
                      border: "1.5px solid #e5e7eb",
                      fontSize: "14px",
                      paddingLeft: "48px",
                    }}
                    buttonStyle={{
                      borderRadius: "10px 0 0 10px",
                      border: "1.5px solid #e5e7eb",
                      borderRight: "none",
                      background: "white",
                    }}
                    containerStyle={{ width: "100%" }}
                  />
                </div>

                {/* Message Textarea */}
                <div className="relative mb-3">
                  <div className="absolute left-3 top-[18px] text-gray-400 pointer-events-none">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                  <textarea
                    placeholder=" "
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="peer w-full bg-white border-[1.5px] border-gray-200 rounded-[10px] pt-5 pb-2 pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-[#7722FF] transition-colors resize-none"
                  />
                  <label className="absolute left-9 top-[18px] text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-focus:top-[7px] peer-focus:text-[10px] peer-focus:text-[#7722FF] peer-focus:font-medium peer-[:not(:placeholder-shown)]:top-[7px] peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-[#7722FF] peer-[:not(:placeholder-shown)]:font-medium">
                    Your Message
                  </label>
                </div>

                {/* Send Message Button */}
                <button className="w-full h-[42px] bg-white text-[#7722FF] border-[1.5px] border-[#7722FF] rounded-[10px] text-sm font-medium transition-all duration-300 hover:bg-[#7722FF] hover:text-white">
                  Send Message
                </button>
              </div>

              {/* Review Card */}
              <div className="w-[350px] bg-[#f0f2f5] rounded-2xl p-5">
                <h2 className="text-[16px] font-bold text-gray-800 mb-1">
                  {service?.data?.subCategories?.[0]?.name}
                </h2>
                <p className="text-[13px] text-gray-500 mb-4">
                  How was your experience with Jhons Doe's service?
                </p>

                {/* Star Rating */}
                <p className="text-[12px] text-gray-400 text-center mb-2">
                  Your overall rating of this service.
                </p>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`text-[28px] transition-all duration-150 hover:scale-125 ${
                        star <= (hoverRating || rating)
                          ? "text-[#FFC107]"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {/* Detailed Review */}
                <p className="text-[13px] font-semibold text-gray-800 mb-2">
                  Add detailed review
                </p>
                <textarea
                  placeholder="Enter here..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                  className="w-full bg-white border-[1.5px] border-gray-200 rounded-[10px] p-3 text-[13px] text-gray-800 placeholder-gray-300 outline-none focus:border-[#7722FF] transition-colors resize-none"
                />

                {/* Submit Button */}
                <button className="w-full h-[42px] bg-white text-[#7722FF] border-[1.5px] border-[#7722FF] rounded-[10px] text-sm font-medium transition-all duration-300 hover:bg-[#7722FF] hover:text-white mt-3">
                  Submit Review
                </button>
              </div>
            </div>
            </div>
          </div>

          <hr className="my-4 border-gray-200 " />
          {/* <MostPopular /> */}
          <Faq />
          {/* Banner Slider */}
          <div className="w-full h-[350px]  rounded-xl overflow-hidden mt-8">
            <Slider {...settings}>
              {banners.map((banner) => (
                <div key={banner.id} className="w-full">
                  <Image
                    src={banner.src || "/assets/banner/banner.png"}
                    alt={banner.alt}
                    width={1200}
                    height={350}
                    className="w-full h-[350px] rounded-xl object-cover"
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeskTop;
