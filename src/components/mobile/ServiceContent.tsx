import React, { useState, useEffect } from "react";
import { MdLocationOn, MdStar } from "react-icons/md";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import MobileReview from "../reviews/MobileReview";
import MostPopularServices from "./MostPopularServices";
import Servicedeatilbanner from "./Servicedeatilbanner";
import Faq from "./Faq";
import {
  getPackages,
  getUserCurrentPackage,
  serviceDeatil,
} from "@/services/commonapi/commonApi";
import MobileBookingFlow from "./MobileBookingFlow";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

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
  priority: number;
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

function FreePlanTag({
  price,
  month,
  priority,
}: {
  price: number;
  month: string;
  priority: number;
}) {
  const getTagColor = () => {
    switch (priority) {
      case 1:
        return "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200/50 hover:shadow-yellow-200/60";
      case 2:
        return "bg-green-600 hover:bg-green-700 shadow-green-200/50 hover:shadow-green-200/60";
      case 3:
        return "bg-green-600 hover:bg-green-700 shadow-green-200/50 hover:shadow-green-200/60";
      default:
        return "bg-green-600 hover:bg-green-700 shadow-green-200/50 hover:shadow-green-200/60";
    }
  };

  return (
    <div className="inline-block">
      <button
        className={`
          relative
          ${getTagColor()}
          text-white 
          font-medium 
          text-xs
          py-1 
          px-3 
          pl-4
          rounded-r-lg 
          shadow-md 
          transition-all 
          duration-200 
          hover:shadow-lg 
          active:scale-95
          overflow-hidden
        `}
        style={{
          clipPath: "polygon(8px 0%, 100% 0%, 100% 100%, 8px 100%, 0% 50%)",
        }}
      >
        ₹ {price} / {month}
      </button>
    </div>
  );
}

interface AppProps {
  id: string;
  onBookingStateChange?: (isActive: boolean) => void;
}
function ServiceContent({ id, onBookingStateChange }: AppProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [currentplan, setCurrentplan] = useState<string | null>(null);
  const [service, setService] = useState<ServiceType | null>(null);
  const router = useRouter();

  const params = useParams();
  const uniqueId = params.subcategoryId;

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

  const truncateText = (text: string[], maxWords: number = 9) => {
    const joinedText = text.join(" ");
    const words = joinedText.split(" ");
    if (words.length <= maxWords) return joinedText;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  const getGradientBg = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-[linear-gradient(89.88deg,#FFE141_0.1%,#FFFFFF_10.59%)]";
      case 2:
        return "bg-[linear-gradient(89.9deg,#00B4EF_0.09%,#FFFFFF_11.91%)]";
      case 3:
        return "bg-[linear-gradient(89.88deg,#FF5C02_0.1%,#FFFFFF_10.59%)]";
      default:
        return "bg-[linear-gradient(89.9deg,#00B4EF_0.09%,#FFFFFF_11.91%)]";
    }
  };

  const getBorderColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "border-[#FFE141]";
      case 2:
        return "border-[#00B4EF]";
      case 3:
        return "border-[#FF5C02]";
      default:
        return "border-[#00B4EF]";
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await getPackages();
        if (res?.success && res?.data?.packages) {
          setPackages(res.data.packages);
        }
      } catch (error) {
        showToast({
          type: "error",
          title: "Error",
          message: getErrorMessage(error),
        });
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    const fetchCurrentPackages = async () => {
      try {
        const res = await getUserCurrentPackage();
        if (res?.success) {
          setCurrentplan(res.data.id);
          setSelectedPlan(res.data.id);
        }
      } catch (error) {
        showToast({
          type: "error",
          title: "Error",
          message: getErrorMessage(error),
        });
      }
    };
    fetchCurrentPackages();
  }, []);
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
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-white  h-[75px] flex items-center z-50">
        <button
          onClick={() => {
            setShowDropdown(!showDropdown);
            onBookingStateChange?.(!showDropdown);
          }}
          className="w-[90%] mx-auto h-[42px] text-white bg-[#7722FF] rounded-xl font-medium text-sm leading-[22px]"
        >
          Next
        </button>
      </div>

      {showSchedule && (
        <div className="fixed inset-0 z-50 bg-white">
          <MobileBookingFlow
            selectedPlan={selectedPlan!}
            subCategoryId={id}
            onBack={() => {
              setShowSchedule(false);
              onBookingStateChange?.(false);
            }}
          />
        </div>
      )}

      {showDropdown && !showSchedule && (
        <>
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm"
            onClick={() => {
              setShowDropdown(false);
              onBookingStateChange?.(false);
            }}
          />
          <div className="fixed bottom-0 left-0 w-full z-50 animate-slide-up">
            <div className="bg-white shadow-lg rounded-tl-3xl rounded-tr-3xl">
              <div className="p-3 pt-6 max-h-[70vh] overflow-y-auto overflow-x-hidden">
                <p className="text-[16px] leading-[24px] font-medium text-left tracking-[0px] pb-1">
                  Select plan
                </p>

                {packages.length > 0 ? (
                  packages.map((pkg) => (
                    <div key={pkg.id}>
                      <div
                        onClick={() => {
                          setSelectedPlan(pkg.id);
                          const selectedPackage = packages.find(
                            (p) => p.id === pkg.id,
                          );
                          if (selectedPackage) {
                            localStorage.setItem(
                              "PlanPriority",
                              selectedPackage.priority.toString(),
                            );
                          }
                        }}
                        className={`w-full mt-4 h-[120px] ${getGradientBg(pkg.priority)} rounded-lg relative flex items-center cursor-pointer transition-all duration-300
                        ${selectedPlan === pkg.id ? "shadow-lg transform scale-[1.02]" : "hover:shadow-md"} `}
                      >
                        {/* Inner white card with border */}
                        <div
                          className={`w-[92%] h-full border-2 ${getBorderColor(pkg.priority)} rounded-lg absolute right-0 bg-white flex items-center px-6 transition-all duration-300 ${selectedPlan === pkg.id ? "border-opacity-100" : "border-opacity-60"}`}
                        >
                          <div className="flex w-full justify-between items-center">
                            {/* Left Content */}
                            <div>
                              <h3 className="text-[18px] font-semibold text-gray-900">
                                {pkg.tittle}
                              </h3>
                              <p className="text-gray-500 text-sm leading-5 ">
                                {truncateText(pkg.features)}
                              </p>
                            </div>

                            {/* Right Badge */}
                            <div className="text-white text-xs font-medium absolute top-4 right-4">
                              <FreePlanTag
                                price={pkg.offerPrice.inr}
                                month={pkg.durationType}
                                priority={pkg.priority}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tick Icon (on gradient left) */}
                        {selectedPlan === pkg.id && (
                          <div className="absolute left-1 top-2 ">
                            <CheckCircle2 className="w-6 h-6 text-purple-800" />
                          </div>
                        )}
                        {/* Purchased Tag (if this is current plan) */}
                        {currentplan === pkg.id && (
                          <div className="absolute bottom-2 right-4 text-xs font-semibold text-green-600">
                            Purchased
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Loading plans...</p>
                )}
              </div>
              <div className="bg-white w-full flex justify-center items-center p-3">
                <button
                  disabled={!selectedPlan}
                  onClick={() => {
                    if (selectedPlan) {
                      const selectedPackage = packages.find(
                        (pkg) => pkg.id === selectedPlan,
                      );
                      if (selectedPackage) {
                        localStorage.setItem(
                          "PlanPriority",
                          selectedPackage.priority.toString(),
                        );
                      }
                      setShowSchedule(true);
                      onBookingStateChange?.(true);
                    }
                  }}
                  className={`w-[90%] h-[42px] text-white rounded-xl font-medium text-sm transition-all duration-300 ${selectedPlan ? "bg-[#7722FF] hover:bg-[#6611EE]" : "bg-gray-300 cursor-not-allowed"}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ServiceContent;
