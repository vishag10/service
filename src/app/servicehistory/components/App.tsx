import React, { useEffect, useState } from "react";
import { FiPhone, FiMessageCircle } from "react-icons/fi";
import { FaVideo } from "react-icons/fa";
import { getBookingHistory } from "@/services/commonapi/commonApi";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

interface Booking {
  _id: string;
  bookingStatus: string;
  subCategoryId: {
    name: string;
  };
  createdAt: string;
  city: string;
  bookingDate: string;
  bookingTime: string;
}

function App() {
  const [activeTab, setActiveTab] = useState("pending");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const getallBookings = async () => {
    try {
      const res = await getBookingHistory();
      if (res.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getallBookings();
  }, []);

  const filteredBookings = bookings.filter(
    (booking) => booking.bookingStatus === activeTab,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center ">
        <button className="mr-3" onClick={() => window.history.back()}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 py-2 border-b border-gray-200">
        <div className="flex space-x-6">
          {["pending", "confirmed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium border-b-2 capitalize ${
                activeTab === tab
                  ? "text-purple-600 border-purple-600"
                  : "text-gray-500 border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Bookings</h2>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No records available
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg p-4 mb-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {booking.subCategoryId?.name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {booking.subCategoryId?.name || "Service"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Booking ID: #{booking._id.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    booking.bookingStatus === "pending"
                      ? "bg-orange-100 text-orange-600"
                      : booking.bookingStatus === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {booking.bookingStatus}
                </span>
              </div>

              {/* Action Buttons */}
              {booking.bookingStatus === "pending" && (
                <div className="flex gap-2 mb-3">
                  <button className="flex-1 bg-yellow-100 text-yellow-700 py-2 px-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                    <FiMessageCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">message</span>
                  </button>
                  <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                    <FaVideo className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">video</span>
                  </button>
                  <button className="flex-1 bg-green-100 text-green-700 py-2 px-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                    <FiPhone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">call</span>
                  </button>
                </div>
              )}

              {/* Booking Details */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {booking.city}
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {booking.bookingTime}
                </div>
              </div>

              {/* Action Button */}
              <button
                className={`w-full py-2 rounded-lg font-medium ${
                  booking.bookingStatus === "pending"
                    ? "bg-[#782FF8] text-white"
                    : booking.bookingStatus === "confirmed"
                      ? "bg-[#782FF8] text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {booking.bookingStatus === "pending"
                  ? "Track Work"
                  : booking.bookingStatus === "confirmed"
                    ? "Review"
                    : "Re-Book Service"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
