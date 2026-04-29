import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  getPackages,
  getUserCurrentPackage,
} from "@/services/commonapi/commonApi";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme: { color: string };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

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
interface PlansProps {
  onNext: (selectedPlan: string) => void;
}

function Plans({ onNext }: PlansProps) {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentplan, setCurrentplan] = useState<string | null>(null);
  const [currentPlanPriority, setCurrentPlanPriority] = useState<number | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  const truncateText = (text: string[], maxWords: number = 16) => {
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

  const isSelectablePackage = (packagePriority: number) => {
    if (!currentPlanPriority) return true;
    if (currentPlanPriority === 1) return packagePriority === 1;
    if (currentPlanPriority === 2) return packagePriority <= 2;
    return true;
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        setIsRazorpayLoaded(true);
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (packageId: string) => {
    setIsProcessing(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      setIsProcessing(false);
      return;
    }

    if (typeof window !== "undefined" && window.Razorpay) {
      try {
        const token = localStorage.getItem("token") || "";

        const response = await fetch(
          "https://apigateway.seclob.com/v1/seclobServiceCustomer/package/purchase",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ packageId, currency: "INR" }),
          },
        );

        const data = await response.json();
        const order = data.data.order;

        const options = {
          key: "rzp_test_7IQrfwQtlLyVb0",
          amount: order.amount,
          currency: order.currency,
          name: "SecLob Service",
          description: "Plan Purchase",
          order_id: order.id,
          handler: async function (response: RazorpayResponse) {
            const {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            } = response;

            const verifyRes = await fetch(
              "https://apigateway.seclob.com/v1/seclobServiceCustomer/package/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                  "razorpay-signature": razorpay_signature,
                },
                body: JSON.stringify({
                  razorpay_order_id,
                  razorpay_payment_id,
                }),
              },
            );

            const result = await verifyRes.json();
            if (verifyRes.ok) {
              const selectedPackage = packages.find(
                (pkg) => pkg.id === packageId,
              );
              if (selectedPackage) {
                localStorage.setItem(
                  "PlanPriority",
                  selectedPackage.priority.toString(),
                );
              }
              onNext(packageId);
            } else {
              alert("Payment verification failed: " + result.message);
            }
            setIsProcessing(false);
          },
          theme: { color: "#7722FF" },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        showToast({
          type: "error",
          title: "Error",
          message: getErrorMessage(error),
        });
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(false);
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
          setCurrentplan(res.data?.id);
          setCurrentPlanPriority(res.data?.priority);
          setSelectedPlan(res.data?.id);
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
    <>
      <h1 className="font-medium text-[16px] leading-[26px] tracking-[0.01px] pt-2">
        Select Plan
      </h1>
      {packages.length > 0 ? (
        packages.map((pkg) => (
          <div key={pkg.id}>
            <div
              onClick={() => {
                if (isSelectablePackage(pkg.priority)) {
                  setSelectedPlan(pkg.id);
                }
              }}
              className={`w-full mt-4 h-[120px] ${getGradientBg(pkg.priority)} rounded-lg relative flex items-center transition-all duration-300
                            ${!isSelectablePackage(pkg.priority) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                            ${selectedPlan === pkg.id ? "shadow-lg transform scale-[1.02]" : isSelectablePackage(pkg.priority) ? "hover:shadow-md" : ""} `}
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
                    <p className="text-gray-500 text-sm leading-5">
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
                <div className="absolute left-2 top-2 ">
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
      <button
        onClick={() => {
          if (selectedPlan && !isProcessing) {
            if (selectedPlan === currentplan) {
              const selectedPackage = packages.find(
                (pkg) => pkg.id === selectedPlan,
              );
              if (selectedPackage) {
                localStorage.setItem(
                  "PlanPriority",
                  selectedPackage.priority.toString(),
                );
              }
              onNext(selectedPlan);
            } else {
              handlePayment(selectedPlan);
            }
          }
        }}
        disabled={!selectedPlan || isProcessing}
        className={`w-[100%] mt-8 h-[42px] p-2 text-white rounded-xl font-medium text-sm transition-all duration-300 ${
          selectedPlan && !isProcessing
            ? "bg-[#7722FF] hover:bg-[#6611EE]"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {isProcessing
          ? "Processing..."
          : selectedPlan === currentplan
            ? "Next"
            : "Purchase & Next"}
      </button>
    </>
  );
}

export default Plans;
