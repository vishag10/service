import React, { useEffect } from "react";
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
  bookService,
  getPartnerDeatils,
  getUserDeatils,
} from "@/services/commonapi/commonApi";
import DeaktopDeatils from "@/components/chanelpartnerdeatils/DeaktopDeatils";
import { showToast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/services/ErrorHandle";

function Desktop() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [Partner, setPartner] = React.useState<{
    data?: { name?: string };
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const acceptedRequestData = useSelector(
    (state: RootState) => state.acceptedRequest.data,
  );

  const handlebookService = async (
    bookingStatus?: string,
    requestId?: string,
  ) => {
    if (!bookingStatus || !requestId) return;
    try {
      const data = { bookingStatus, requestId };
      const res = await bookService(data);
      if (res.success) {
        showToast({
          type: "success",
          title: "Success",
          message: "Service booked successfully!",
        });
        const bookingid = res?.data?.bookingId;
        router.push(`/servicebooked?id=${bookingid}`);
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
    if (acceptedRequestData?.providerId) {
      getpartnerDetails(acceptedRequestData?.providerId);
    }
  }, [acceptedRequestData]);

  const getpartnerDetails = async (id: string) => {
    try {
      const res = await getPartnerDeatils(id);
      setPartner(res);
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
    }
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
    <div className="w-full bg-white min-h-[calc(100vh-4rem)] flex flex-col items-center p-4">
      <div className="w-full max-w-[760px] flex flex-col h-full">
        <div className="flex-shrink-0">
          <div
            className="w-full h-[200px] bg-red-200 bg-cover bg-center rounded-2xl p-8"
            style={{ backgroundImage: "url('/assets/service/normal.png')" }}
          >
            <h1 className="text-[16px] leading-[26px] tracking-[0.01px] text-white">
              Normal Service
            </h1>
            <h1 className="font-medium text-[28px] leading-[40px] tracking-[0px] pt-2">
              Your Daily Service Partner
            </h1>
            <h1 className="font-normal text-[18px] leading-[28px] tracking-[0px] pt-2">
              From cleaning to repairs find the right expert near you.
            </h1>
          </div>
          <h1 className="font-medium text-[18px] leading-[28px] tracking-[0px] capitalize mb-4 pt-2">
            Normal Service Provider list
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          <div className="w-full h-[210px] bg-white rounded-2xl shadow-lg p-4 relative border border-gray-100 flex flex-col justify-center flex-shrink-0">
            {/* Header with Profile */}
            <div className="flex items-start gap-3 mb-4">
              <img
                src="https://i.pravatar.cc/50?img=12"
                alt="Vimal tk"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {Partner?.data?.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <FaStar className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">
                      {acceptedRequestData?.rating || "4.5"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {acceptedRequestData?.reviews?.toLocaleString() || "5478"}{" "}
                      reviews
                    </span>
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {acceptedRequestData?.location || "kozhikode"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {acceptedRequestData?.experience || "1.5 yrs"}
                      </span>
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
                  {acceptedRequestData?.jobDescription ||
                    "Job Description: blueprints and building specifications to determine the layout ........ "}
                </span>
              </div>
            </div>

            {/* Pricing Pills */}
            <div className="flex flex-wrap gap-2 mb-4 relative">
              <div className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                <span className="text-sm text-orange-600 font-medium">
                  Basic pay: {acceptedRequestData?.basicPay || "1000"}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <span className="text-sm text-green-600 font-medium">
                  Add on pay: {acceptedRequestData?.addOnPay || "200"}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full">
                <span className="text-sm text-yellow-600 font-medium">
                  Hourly pay: {acceptedRequestData?.hourlyPay || "1000"}
                </span>
              </div>
              <div className="absolute right-0 flex gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600  rounded-lg hover:bg-blue-50 transition-colors"
                >
                  More Details
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-blue-50 transition-colors">
                  Reject
                </button>

                <button
                  onClick={() =>
                    handlebookService(
                      acceptedRequestData?.bookingStatus,
                      acceptedRequestData?.requestId,
                    )
                  }
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal should be here */}
      {isModalOpen && (
        <DeaktopDeatils
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={{
            partner: Partner?.data,
            request: acceptedRequestData,
          }}
        />
      )}
    </div>
  );
}

export default Desktop;
