import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Slider from "react-slick";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { MdLocationOn, MdStar } from "react-icons/md";
import DesktopReview from "@/components/reviews/DesktopReview";
import MostPopular from "@/components/desktop/MostPopular";
import Faq from "@/components/desktop/Faq";
import ScheduleService from "@/components/desktop/ScheduleService";

import {
  getPackages,
  serviceDeatil,
  getUserCurrentPackage,
} from "@/services/commonapi/commonApi";
import { useParams } from "next/navigation";
import DesktopBookingModal from "@/components/bookingmodal/DesktopBookingModal";
import { FaCrown } from "react-icons/fa";

type CurrentPackageType = {
  id: string;
  tittle: string;
  priority: number;
  type: string;
  features: string[];
  amount: { inr: number; usd: number };
  offerPrice: { inr: number; usd: number };
  gst: { inr: number; usd: number };
  percentage: { inr: number; usd: number };
  durationType: string;
};

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
    src: "/assets/banner/banner.png",
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
  const [showServiceView, setShowServiceView] = useState(false);
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);
  const [currentPackage, setCurrentPackage] =
    useState<CurrentPackageType | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [service, setService] = useState<ServiceType | null>(null);
  const [rating, setRating] = useState(3);
  const [hoverRating, setHoverRating] = useState(0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [review, setReview] = useState("");
  const [countdown, setCountdown] = useState(10);

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
        if (res?.success) {
          setService(res);
        }
      }
    } catch (error) {
    }
  };

  const handleBookServiceClick = async () => {
    setIsLoadingPackage(true);
    setShowServiceView(true);
    try {
      const res = await getUserCurrentPackage();
      if (res?.success) {
        setCurrentPackage(res.data);
        localStorage.setItem('PlanPriority', res.data.priority.toString());
      }
    } catch (error) {
    } finally {
      setIsLoadingPackage(false);
    }
  };

  useEffect(() => {
    handleGetDetails();
  }, [uniqueId]);


  // Show premium upsell modal after 10s if current plan is Normal (priority 3)
  useEffect(() => {
    if (showServiceView && currentPackage && currentPackage.priority === 3) {
      const showTimer = setTimeout(() => {
        setShowPremiumModal(true);
      }, 0);
      return () => clearTimeout(showTimer);
    }
  }, [showServiceView, currentPackage]);

  // Auto-close premium modal after 10s with countdown
  useEffect(() => {
    if (showPremiumModal) {
      setCountdown(10);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowPremiumModal(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showPremiumModal]);

  const isPremium = currentPackage?.priority === 1;
  const planLabel = isPremium ? "Premium" : "Normal";

  return (
    <>
      {showBookingModal && (
        <div
          className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setShowBookingModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DesktopBookingModal subCategoryId={id} selectedPlanId={currentPackage?.id || ''} />
          </div>
          <button
            onClick={() => setShowBookingModal(false)}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Premium Upsell Modal - shown after 10s for Normal plan users */}
      {showPremiumModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setShowPremiumModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative rounded-3xl w-[90%] max-w-[600px] mx-4 text-center overflow-hidden shadow-2xl"
            style={{
              backgroundImage: `url('/assets/service/bgpr.png'), linear-gradient(276.6deg, #FFFFFF 1.66%, #FFE141 119.39%)`,
              backgroundBlendMode: 'overlay',
            }}
          >
            {/* Countdown */}
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{countdown}</span>
            </div>

            {/* Premium Badge Icon */}
            <div className="flex justify-center pt-10 pb-2">
              <Image src="/assets/service/king.png" alt="Premium" width={120} height={120} />
            </div>

            {/* Pill Label */}
            <div className="flex justify-center mt-2 mb-4">
              <span
                className="px-6 py-2 text-sm font-semibold text-[#918200] bg-white rounded-full border border-[#918200]"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
              >
                Premium Service
              </span>
            </div>

            {/* Price */}
            <div className="mb-1 pt-4">
              <span
                className="font-black text-gray-900"
                style={{ fontSize: 52, lineHeight: 1, letterSpacing: "-2px" }}
              >
                <span
                  style={{
                    fontSize: 24,
                    verticalAlign: "super",
                    fontWeight: 800,
                  }}
                >
                  ₹
                </span>
                250.00
              </span>
            </div>
            <p
              className="text-[#918200] font-medium mb-4"
              style={{ fontSize: 15 }}
            >
              /Month
            </p>

            {/* Tagline */}
            <p
              className="font-poppins font-medium text-[20px] leading-[170%] text-center text-[#121212] mb-8"
            >
              Premium Experts, Trusted by Thousands
            </p>

            {/* Buttons */}
            <div className="flex gap-3 px-6 pb-8">
              <button
                onClick={() => setShowPremiumModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-white text-sm cursor-pointer"
                style={{ background: "#111", border: "none" }}
              >
                Start With Normal Plan
              </button>
              <button
                onClick={() => {
                  setShowPremiumModal(false);
                  setShowBookingModal(true);
                }}
                className="flex-1 py-3 rounded-xl font-semibold text-white text-sm cursor-pointer flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(90deg, #a855f7, #f59e0b)",
                  border: "none",
                }}
              >
                <FaCrown style={{ fontSize: 14, color: "#FFD700" }} />
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full mt-2">
        <div className="w-[95%] lg:w-[90%] xl:w-[80%] mx-auto pt-12">
          {/* Conditionally show banner OR video/images */}
          {showServiceView && isLoadingPackage ? (
            <div className="mb-6 animate-pulse">
              <div
                className="w-full rounded-2xl bg-gray-200"
                style={{ minHeight: "300px" }}
              >
                <div className="p-8">
                  <div className="h-8 w-40 bg-gray-300 rounded-full mb-4" />
                  <div className="h-12 w-[70%] bg-gray-300 rounded-lg mb-3" />
                  <div className="h-12 w-[50%] bg-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                <div className="h-8 w-[200px] bg-gray-200 rounded-lg" />
                <div className="flex gap-3 flex-wrap">
                  <div className="w-[250px] xl:w-[350px] h-[50px] bg-gray-200 rounded-sm" />
                  <div className="w-[250px] xl:w-[350px] h-[50px] bg-gray-200 rounded-sm" />
                </div>
              </div>
            </div>
          ) : showServiceView && currentPackage ? (
            <div
              className="w-full rounded-2xl p-8 pb-10 relative overflow-hidden mb-6"
              style={{
                backgroundImage: isPremium
                  ? `linear-gradient(to right, rgba(253,224,71,0.8), rgba(254,249,195,0.8)), url('/assets/service/norbg.png')`
                  : `linear-gradient(to right, rgba(74,222,128,0.8), rgba(220,252,231,0.8)), url('/assets/service/norbg.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "300px",
              }}
            >
              <div className="flex justify-center items-start flex-col h-full">
                <span
                  className={`inline-block px-6 py-2 text-[16px]  rounded-full font-semibold mb-3 ${
                    isPremium
                      ? "bg-yellow-400 text-yellow-900 border border-yellow-400"
                      : "bg-white text-[#1AA45B] border border-[#1AA45B]"
                  }`}
                >
                  {planLabel} Service
                </span>
                <h1 className="font-bold text-[28px] lg:text-[36px] xl:text-[45px] leading-[1.3] text-gray-900 italic">
                  Premium Experts, Trusted by
                  <br />
                  Thousands
                </h1>
              </div>
              {/* Image pinned to right */}
              <div
                className="absolute right-4 lg:right-8 top-1/2 w-[150px] h-[150px] lg:w-[220px] lg:h-[220px] xl:w-[300px] xl:h-[300px]"
                style={{ transform: "translateY(-50%)" }}
              >
                <Image
                  src={
                    isPremium
                      ? "/assets/service/king.png"
                      : "/assets/service/rocket.png"
                  }
                  alt={`${planLabel} Service`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-medium text-[25px] leading-[40px] tracking-[0px] ">
                {service?.data?.subCategories?.[0]?.name ||
                  "GreenThumb Gardens"}
              </h2>
              <div className="flex  items-center pb-2 ">
                <MdLocationOn className="text-black-500 w-5 h-5" />
                <p className="text-[20px] text-gray-500">Thiruvananthapuram </p>
                <MdStar className="text-yellow-500 w-5 h-5 ml-6" />
                <p className="text-[20px] text-yellow-500 mt-1"> 4.5 Rating</p>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-lg overflow-hidden" style={{ height: '456px' }}>
                {/* Video Frame */}
                <div className="relative h-full">
                  <video
                    src={
                      service?.data?.subCategories?.[0]?.detailsVideo?.filePath
                    }
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
            </>
          )}

          {/* Service name + action buttons row when in service view */}
          {showServiceView && (
            <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
              <h2 className="font-medium text-[20px] lg:text-[25px] leading-[40px] tracking-[0px]">
                {service?.data?.subCategories?.[0]?.name ||
                  "GreenThumb Gardens"}
              </h2>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="flex-1 min-w-[180px] xl:w-[350px] h-[50px] bg-gray-900 text-white rounded-sm font-medium text-[14px] xl:text-[16px] hover:bg-gray-800 transition cursor-pointer"
                >
                  Start Bidding
                </button>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className={`flex-1 min-w-[180px] xl:w-[350px] h-[50px] rounded-sm font-medium text-[14px] xl:text-[16px] transition cursor-pointer ${
                    isPremium
                      ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
                      : "bg-[#782FF8] text-white hover:bg-[#8240f3]"
                  }`}
                >
                  Start With {planLabel} Plan
                </button>
              </div>
            </div>
          )}

          <div className="w-full flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[65%] xl:w-[75%]">
              <div className="mt-4 flex items-center gap-2">
                <h3 className="font-medium text-[24px] leading-[40px] tracking-[0px]">
                  About us
                </h3>
                {showServiceView && (
                  <div className="flex items-center gap-1">
                    <MdStar className="text-yellow-500 w-5 h-5" />
                    <p className="text-[16px] text-gray-500">4.0</p>
                    <p className="text-[14px] text-gray-400">(4,599 Reviews)</p>
                  </div>
                )}
              </div>
              <p className="font-normal text-[16px] leading-[28px] tracking-[0px] mt-2 pb-8 text-justify">
                {service?.data?.subCategories?.[0]?.description}
              </p>
              <DesktopReview />
              {/* Buttons below reviews */}
              {!showServiceView ? (
                <button
                  className="w-full mt-6 py-3 rounded-lg border-2 border-purple-600 text-purple-600 font-medium text-base hover:bg-purple-50 transition cursor-pointer"
                  onClick={handleBookServiceClick}
                >
                  Book Service
                </button>
              ) : (
                <div className="flex gap-4 mt-6 flex-wrap">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="flex-1 min-w-[180px] h-[50px] bg-gray-900 text-white rounded-sm font-medium text-[14px] xl:text-[16px] hover:bg-gray-800 transition cursor-pointer"
                  >
                    Start Bidding
                  </button>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className={`flex-1 min-w-[180px] h-[50px] rounded-sm font-medium text-[14px] xl:text-[16px] transition cursor-pointer ${
                      isPremium
                        ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
                        : "bg-[#782FF8] text-white hover:bg-[#8240f3]"
                    }`}
                  >
                    Start With {planLabel} Plan
                  </button>
                </div>
              )}
            </div>
            <div className="w-full lg:w-[35%] xl:w-[25%] pt-6 lg:pt-12 mx-auto">
              {/* Book Service Button */}
              {!showServiceView && (
                <div className="w-full flex justify-end mb-4">
                  <button
                    className="w-full max-w-[350px] h-[42px] bg-[#7722FF] text-white rounded-[8px] font-medium text-sm transition-all duration-300 hover:bg-[#6611EE] cursor-pointer"
                    onClick={handleBookServiceClick}
                  >
                    Book Service
                  </button>
                </div>
              )}

              <div className="w-full mx-auto flex flex-col items-end gap-5 ">
                {/* Send Us Message Card */}
                <div className="w-full max-w-[350px] bg-[#EBF5F4] rounded-2xl p-5 ">
                  <h2 className="text-[16px] font-semibold text-gray-800 mb-4 ">
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
                  <button className="w-full h-[42px] bg-white text-[#7722FF] border-[1.5px] border-[#7722FF] rounded-[10px] text-sm font-medium transition-all duration-300 hover:bg-[#7722FF] hover:text-white cursor-pointer ">
                    Send Message
                  </button>
                </div>

                {/* Review Card */}
                <div className="w-full max-w-[350px] bg-[#EBF5F4] rounded-2xl p-5">
                  <h2 className="text-[16px] font-bold text-gray-800 mb-1">
                    {service?.data?.subCategories?.[0]?.name}
                  </h2>
                  <p className="text-[13px] text-gray-500 mb-4">
                    How was your experience with Jhons service?
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
                  <button className="w-full h-[42px] bg-white text-[#7722FF] border-[1.5px] border-[#7722FF] rounded-[10px] text-sm font-medium transition-all duration-300 hover:bg-[#7722FF] hover:text-white mt-3 cursor-pointer">
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
