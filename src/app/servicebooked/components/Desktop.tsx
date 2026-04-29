import DesktopBookingModal from '@/components/bookingmodal/DesktopBookingModal'
import { getBookingDetails } from '@/services/commonapi/commonApi'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface BookingStatus {
  bookingId?: string;
  booking?: {
    bookingDate?: string;
    bookingTime?: string;
    city?: string;
  };
}

function Desktop() {
  const [bookingstatus, setBookingStatus] = useState<BookingStatus | null>(null)
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('id')
  const handleGetDetails = async () => {
    try {
      if (!bookingId) return;
      const res = await getBookingDetails(bookingId);
      if (res?.success) {
        setBookingStatus(res?.data)
      }

    } catch (error) {

    }
  }
  useEffect(() => {
    handleGetDetails()
  }, [])
  return (
    <div className='w-full bg-white h-screen '>
      <div className="w-full fixed top-0 left-0 h-[550px] bg-[linear-gradient(180deg,#1FC16B_0%,#ffffff_100%)] opacity-40 z-10"></div>
      <div className="  flex justify-center items-center min-h-screen bg-gray-50">
        <div className=" p-6 w-[60%] text-center z-100 ">
          {/* Tick Icon */}
          <div className="flex justify-center mb-4">
            <img
              src="/assets/service/success.png"
              alt="c:\Users\visha\Downloads\success.png"
              className="w-16 h-16 animate-[tickBounce_0.6s_ease-out_forwards]"
            />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-800">
            Thank you for booking a Service Partner
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Thank you for booking a Service Partner
          </p>

          {/* Details Card */}
          <div className="mt-6 w-[70%] mx-auto bg-white shadow-lg border border-gray-200 rounded-lg  text-left  ">
            <div className="flex justify-between p-4 text-sm">
              <span className="text-black text-[14px] font-medium leading-[20px] tracking-[0.1px] ">Service name</span>
              <span className="font-normal leading-[20px] tracking-[0.1px] text-black">Ac service</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between p-4 text-sm">
              <span className="text-black text-[14px] font-medium leading-[20px] tracking-[0.1px] ">Booking ID</span>
              <span className="font-normal leading-[20px] tracking-[0.1px] text-black">{bookingstatus?.bookingId}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between p-4 text-sm">
              <span className="text-black text-[14px] font-medium leading-[20px] tracking-[0.1px] ">Arrival Date & Time</span>
              <span className="font-normal leading-[20px] tracking-[0.1px] text-black">
                {bookingstatus?.booking?.bookingDate ? new Date(bookingstatus.booking.bookingDate).toLocaleDateString('en-GB') : 'N/A'}, {bookingstatus?.booking?.bookingTime || 'N/A'}
              </span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between p-4 text-sm">
              <span className="text-black text-[14px] font-medium leading-[20px] tracking-[0.1px] ">Location</span>
              <span className="font-normal leading-[20px] tracking-[0.1px] text-black">{bookingstatus?.booking?.city}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between p-4 text-sm">
              <span className="text-black text-[14px] font-medium leading-[20px] tracking-[0.1px] ">Payment</span>
              <span className="font-normal leading-[20px] tracking-[0.1px] text-black">$3000/hr</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Desktop