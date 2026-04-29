import DeaktopDeatils from "@/components/chanelpartnerdeatils/DeaktopDeatils";
import {
  getAllProviders,
  getAllProvidersDeatils,
} from "@/services/commonapi/commonApi";
import { getErrorMessage } from "@/services/ErrorHandle";
import { showToast } from "@/utils/toast";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";

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

function Desktop() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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


  if (!bookingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-[calc(100vh-4rem)] flex flex-col items-center p-4">
      <div className="w-full max-w-[760px] flex flex-col h-full">
        <div className="flex-shrink-0">
          <div
            className="w-full h-[200px] bg-red-200 bg-cover bg-center rounded-2xl p-8"
            style={{ backgroundImage: "url('/assets/service/premium.png')" }}
          >
            <h1 className="text-[16px] leading-[26px] tracking-[0.01px] text-black">
              Premium Service
            </h1>
            <h1 className="font-medium text-[28px] leading-[40px] tracking-[0px] pt-2">
              Your Daily Service Partner
            </h1>
            <h1 className="font-normal text-[18px] leading-[28px] tracking-[0px] pt-2">
              From cleaning to repairs find the right expert near you.
            </h1>
          </div>
          <h1 className="font-medium text-[18px] leading-[28px] tracking-[0px] capitalize mb-4 pt-2">
            Service Provider list
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="w-full h-[210px] bg-white rounded-2xl shadow-lg p-4 relative border border-gray-100 flex flex-col justify-center flex-shrink-0"
            >
              {/* Header with Profile */}
              <div className="flex items-start gap-3 mb-4">
                <img
                  src="https://i.pravatar.cc/50?img=12"
                  alt="Vimal tk"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {provider.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <FaStar className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        4.5
                      </span>
                      <span className="text-xs text-gray-500">
                        5478 reviews
                      </span>
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
              </div>

              {/* Job Description */}
              <div className="flex items-start gap-2 mb-4">
                <FaFileAlt className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Job Description:{" "}
                  </span>
                  <span className="text-sm text-gray-600">
                    Job Description: blueprints and building specifications to
                    determine the layout ........{" "}
                  </span>
                </div>
              </div>

              {/* Pricing Pills */}
              <div className="flex flex-wrap gap-2 mb-4 relative">
                <div className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                  <span className="text-sm text-orange-600 font-medium">
                    Basic pay:{provider?.daily?.amountINR}{" "}
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                  <span className="text-sm text-green-600 font-medium">
                    Add on pay: {provider?.addon?.amountINR}
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full">
                  <span className="text-sm text-yellow-600 font-medium">
                    Hourly pay: {provider?.hourly?.amountINR}
                  </span>
                </div>
                <div className="absolute right-0 flex gap-2">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    More Details
                  </button>

                  <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Book now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isModalOpen && (
        <DeaktopDeatils
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={{}}
        />
      )}
    </div>
  );
}

export default Desktop;
