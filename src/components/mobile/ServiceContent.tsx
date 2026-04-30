import React, { useState, useEffect } from "react";
import { MdLocationOn, MdStar } from "react-icons/md";
import { useRouter, useParams } from "next/navigation";
import { FaCrown } from "react-icons/fa";
import Image from "next/image";
import MobileReview from "../reviews/MobileReview";
import MostPopularServices from "./MostPopularServices";
import Servicedeatilbanner from "./Servicedeatilbanner";
import Faq from "./Faq";
import {
  getUserCurrentPackage,
  serviceDeatil,
} from "@/services/commonapi/commonApi";
import DesktopBookingModal from "@/components/bookingmodal/DesktopBookingModal";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

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

interface AppProps {
  id: string;
  onBookingStateChange?: (isActive: boolean) => void;
  onServiceViewChange?: (show: boolean, pkg: CurrentPackageType | null) => void;
}

function ServiceContent({ id, onBookingStateChange, onServiceViewChange }: AppProps) {
  const [service, setService] = useState<ServiceType | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [currentPackage, setCurrentPackage] = useState<CurrentPackageType | null>(null);
  const [showServiceView, setShowServiceView] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);
  const router = useRouter();

  const params = useParams();
  const uniqueId = params.subcategoryId;

  const isPremium = currentPackage?.priority === 1;
  const planLabel = isPremium ? "Premium" : "Normal";

  const handleGetDetails = async () => {
    try {
      if (typeof uniqueId === "string") {
        const res = await serviceDeatil(uniqueId);
        if (res?.success) {
          setService(res);
        }
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
    }
  };

  useEffect(() => {
    handleGetDetails();
  }, [uniqueId]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showBookingModal || showPremiumModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showBookingModal, showPremiumModal]);

  // Auto-close premium modal after 10s with countdown
  useEffect(() => {
    if (!showPremiumModal) return;
    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showPremiumModal]);

  // When countdown hits 0 while modal is open, auto-continue with normal plan
  useEffect(() => {
    if (showPremiumModal && countdown === 0) {
      handleStartWithNormalPlan();
    }
  }, [countdown, showPremiumModal]);

  const handleBookNowClick = async () => {
    setIsLoadingPackage(true);
    try {
      const res = await getUserCurrentPackage();
      if (res?.success) {
        setCurrentPackage(res.data);
        localStorage.setItem("PlanPriority", res.data.priority.toString());
        if (res.data.priority === 3) {
          // Not premium - show premium upsell modal
          setShowPremiumModal(true);
        } else {
          // Premium - go directly to service view
          setShowServiceView(true);
          onServiceViewChange?.(true, res.data);
        }
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsLoadingPackage(false);
    }
  };

  // When premium modal closes (either button), show service view
  const handleStartWithNormalPlan = () => {
    setShowPremiumModal(false);
    setShowServiceView(true);
    onServiceViewChange?.(true, currentPackage);
  };

  const handleSubscribeNow = () => {
    setShowPremiumModal(false);
    setShowBookingModal(true);
    onBookingStateChange?.(true);
  };

  return (
    <div>
      <div className="flex-1 px-4 py-6 bg-white rounded-t-3xl">
        <h2 className="font-[500] text-[16px] leading-[26px] tracking-[0.01px]">
          {service?.data?.subCategories?.[0]?.name || "GreenThumb Gardens"}
        </h2>
        <div className="flex pt-2 items-center ">
          <MdLocationOn className="text-black-500 w-5 h-5" />
          <p className="text-sm text-gray-500">Thiruvananthapuram </p>
          <MdStar className="text-yellow-500 w-5 h-5 ml-6" />
          <p className="text-sm text-yellow-500 mt-1"> 4.5 Rating</p>
        </div>
        <h3 className="mt-4 font-medium text-[16px] leading-[26px] tracking-[0.01px]">
          About us
        </h3>
        <p className="font-normal text-[14px] leading-[22px] tracking-[0px] mt-2">
          {service?.data?.subCategories?.[0]?.description}
        </p>

        <hr className="my-4 border-gray-200 " />
        <MobileReview />
        <hr className="my-4 border-gray-200 " />
        <MostPopularServices />
        <hr className="my-4 border-gray-200 " />
        <Servicedeatilbanner />
        <hr className=" border-gray-200 " />
        <Faq />
        {/* Extra padding for fixed bottom buttons */}
        <div className="h-[90px]" />
      </div>

      {/* Fixed bottom buttons */}
      {!showBookingModal && (
        <div className="fixed bottom-0 left-0 w-full bg-white h-auto z-50 pb-4 pt-2 px-4">
          {!showServiceView ? (
            <button
              onClick={handleBookNowClick}
              disabled={isLoadingPackage}
              className={`w-full h-[42px] text-white rounded-xl font-medium text-sm leading-[22px] ${
                isLoadingPackage ? "bg-gray-300 cursor-not-allowed" : "bg-[#7722FF]"
              }`}
            >
              {isLoadingPackage ? "Loading..." : "Next"}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowBookingModal(true);
                  onBookingStateChange?.(true);
                }}
                className="w-full h-[42px] bg-gray-900 text-white rounded-xl font-medium text-sm"
              >
                Start Bidding
              </button>
              <button
                onClick={() => {
                  setShowBookingModal(true);
                  onBookingStateChange?.(true);
                }}
                className={`w-full h-[42px] rounded-xl font-medium text-sm ${
                  isPremium
                    ? "bg-yellow-400 text-yellow-900"
                    : "bg-[#782FF8] text-white"
                }`}
              >
                Start with {planLabel} plan 
              </button>
            </div>
          )}
        </div>
      )}

      {/* Premium Upsell Modal - exact match from desktop/screenshot */}
      {showPremiumModal && (
        <div
          className="fixed inset-0 bg-white/50 backdrop-blur-sm flex justify-center items-center z-[60]"
          onClick={() => setShowPremiumModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative rounded-3xl w-[90%] max-w-[400px] mx-4 text-center overflow-hidden shadow-2xl"
            style={{
              backgroundImage: `url('/assets/service/bgpr.png'), linear-gradient(276.6deg, #FFFFFF 1.66%, #FFE141 119.39%)`,
              backgroundBlendMode: "overlay",
            }}
          >
            {/* Countdown */}
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{countdown}</span>
            </div>

            {/* Premium Badge Icon */}
            <div className="flex justify-center pt-8 pb-2">
              <Image src="/assets/service/king.png" alt="Premium" width={100} height={100} />
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
                style={{ fontSize: 42, lineHeight: 1, letterSpacing: "-2px" }}
              >
                <span style={{ fontSize: 20, verticalAlign: "super", fontWeight: 800 }}>
                  ₹
                </span>
                250.00
              </span>
            </div>
            <p className="text-[#918200] font-medium mb-4" style={{ fontSize: 14 }}>
              /Month
            </p>

            {/* Tagline */}
            <p className="font-poppins font-medium text-[16px] leading-[170%] text-center text-[#121212] mb-6">
              Premium Experts, Trusted by Thousands
            </p>

            {/* Subscribe Now Button */}
            <div className="px-5 mb-4">
              <button
                onClick={handleSubscribeNow}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm cursor-pointer flex items-center justify-center gap-2"
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

          {/* Start with normal plan - fixed at bottom outside the card */}
          <div className="fixed bottom-0 left-0 w-full px-4 pb-6">
            <button
              onClick={handleStartWithNormalPlan}
              className="w-full py-4 rounded-xl font-semibold text-white text-sm cursor-pointer"
              style={{ background: "#111", border: "none" }}
            >
              Start with normal plan
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal - bottom sheet style for mobile */}
      {showBookingModal && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={() => {
            setShowBookingModal(false);
            onBookingStateChange?.(false);
          }}
        >
          <div
            className="w-full max-h-[85vh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <DesktopBookingModal
              subCategoryId={id}
              selectedPlanId={currentPackage?.id || ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceContent;
