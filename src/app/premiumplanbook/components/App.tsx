import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { clearAcceptedRequest } from "@/redux/acceptedRequestSlice";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";
import {
  getAllProviders,
  getAllProvidersDeatils,
  getPartnerDeatils,
} from "@/services/commonapi/commonApi";
import MobileDeatils from "@/components/chanelpartnerdeatils/MobileDeatils";
import { useSearchParams } from "next/navigation";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

interface Provider {
  id: string;
  userId: string;
  subCategoryId: string;
  countryStates?: {
    country: string;
    states: string[];
  };
  daily?: { amountINR?: number };
  addon?: { amountINR?: number };
  hourly?: { amountINR?: number };
  status?: string;
  createdAt?: string;
}
interface BookingData {
  planId: string;
  subCategoryId: string;
  bookingDate: string;
  bookingTime: string;
  description: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}
interface ProviderDetails {
  _id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  IDproofVerified?: string;
  packagePriority?: number;
}

type MergedProvider = Provider & ProviderDetails;
function App() {
  const dispatch = useDispatch();
  const [Partner, setPartner] = React.useState<{
    data?: { name?: string };
  } | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);
  const acceptedRequestData = useSelector(
    (state: RootState) => state.acceptedRequest.data,
  );
  const [providers, setProviders] = useState<MergedProvider[]>([]);
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        setBookingData(JSON.parse(decodeURIComponent(data)));
      } catch (error) {
        showToast({
          type: "error",
          title: "Error",
          message: getErrorMessage(error),
        });
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (bookingData) {
      const getallProviders = async () => {
        try {
          const res = await getAllProviders({
            subCategoryId: bookingData.subCategoryId,
            distance: 5,
            packagePriority: 1,
          });
          if (res.success) {
            const providerList: Provider[] = res.data.providers;
            const userIds = res.data.userIds;
            const response = await getAllProvidersDeatils(userIds);
            if (response) {
              const details: ProviderDetails[] = response.data;
              const mergedData: MergedProvider[] = providerList
                .filter((provider) =>
                  details.some((u) => u._id === provider.userId),
                ) // only keep matching ones
                .map((provider) => ({
                  ...provider,
                  ...details.find((u) => u._id === provider.userId)!,
                })) as MergedProvider[];
              setProviders(mergedData);
            }
          }
        } catch (error) {}
      };
      getallProviders();
    }
  }, [bookingData]);

  useEffect(() => {
    if (acceptedRequestData?.providerId) {
      getpartnerDetails(acceptedRequestData?.providerId);
    }
  }, [acceptedRequestData]);

  const getpartnerDetails = async (id: string) => {
    try {
      const res = await getPartnerDeatils(id);

      setPartner(res);
    } catch (error) {}
  };

  useEffect(() => {
    const handlePopState = () => {
      dispatch(clearAcceptedRequest());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [dispatch]);

  return (
    <div className="w-full bg-white min-h-screen flex flex-col items-center  sm:p-4">
      <div className="w-full max-w-[760px] mx-auto">
        <div
          className="w-full h-[180px] sm:h-[200px] bg-red-200 bg-cover bg-center p-4 sm:p-8"
          style={{ backgroundImage: "url('/assets/service/mobpremium.png')" }}
        >
          <h1 className="text-[12px] text-[#DFB400] italic font-bold leading-[20px] sm:leading-[26px] tracking-[0.01px] bg-white border flex w-fit p-1 rounded-3xl ">
            Premium Service
          </h1>
          <h1 className=" mt-4 font-[Calibri] font-bold italic text-[16px] leading-[26px] tracking-[0.01px]">
            Premium Experts, Trusted by{" "}
          </h1>
          <h1 className="font-[Calibri] font-bold italic text-[16px] leading-[26px] tracking-[0.01px]">
            Thousands
          </h1>
        </div>
        <h1 className="font-normal text-[14px] leading-[22px] tracking-[0px] p-2">
          Normal Service Provider list
        </h1>
        <div className="h-[calc(100vh-280px)] sm:h-[calc(100vh-320px)] overflow-y-auto space-y-2 p-2">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="w-full min-h-[180px] sm:h-[210px] bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 relative border border-gray-100 flex flex-col justify-center flex-shrink-0"
            >
              {/* Header with Profile */}
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <img
                  src="https://i.pravatar.cc/50?img=12"
                  alt="Vimal tk"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                      {provider.name}
                    </h2>
                    <FaStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      4.5
                    </span>
                    <span className="text-xs text-gray-500">5478 reviews</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {provider?.countryStates?.states[1]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">1.5 yrs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="flex items-center  gap-2 mb-3 sm:mb-4">
                <FaFileAlt className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Job Description:{" "}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    blueprints and building specifications...
                  </span>
                </div>
              </div>

              {/* Pricing Pills */}
              <div className="space-y-2">
                {/* <div className="flex flex-wrap gap-1 sm:gap-2">
                        <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                          <span className="text-xs sm:text-sm text-orange-600 font-medium">Basic: {acceptedRequestData?.basicPay || '1000'}</span>
                        </div>
                        <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-green-50 border border-green-200 rounded-full">
                          <span className="text-xs sm:text-sm text-green-600 font-medium">Add on: {acceptedRequestData?.addOnPay || '200'}</span>
                        </div>
                        <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-yellow-50 border border-yellow-200 rounded-full">
                          <span className="text-xs sm:text-sm text-yellow-600 font-medium">Hourly: {acceptedRequestData?.hourlyPay || '1000'}</span>
                        </div>
                      </div> */}
                <div className="flex w-full gap-2 justify-between ">
                  <button
                    onClick={() => setShowDetails(true)}
                    className="text-xs font-medium text-blue-600  rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    More Details
                  </button>
                  <button className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-medium bg-[#5818BF] text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Book now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MobileDeatils
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        data={{
          partner: Partner?.data,
          request: acceptedRequestData,
        }}
      />
    </div>
  );
}

export default App;
