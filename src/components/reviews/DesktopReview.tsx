"use client";
import React, { useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) =>
        star <= rating ? (
          <AiFillStar key={star} className="text-yellow-400 w-5 h-5" />
        ) : (
          <AiOutlineStar key={star} className="text-yellow-400 w-5 h-5" />
        ),
      )}
    </div>
  );
}
function DesktopReview() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  return (
    <div>
      <div className="">
        <h2 className="font-medium text-[24px] leading-[40px] tracking-[0px] mb-4">
          Reviews
        </h2>

        {/* Review 1 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 pb-2">
            <img
              src="/assets/logo/profile.jpg"
              alt="profile"
              className="w-18 h-18 rounded-full"
            />
            <div>
              <p className="font-normal text-[17px] leading-[28px] tracking-[0px]">
                Sophia Bennett
              </p>
              <p className="text-gray-500 font-normal text-[14px] leading-[22px] tracking-[0px]">
                2 weeks ago
              </p>
            </div>
          </div>
          <ReviewStars rating={5} />
          <p className="font-normal text-[16px] leading-[28px] tracking-[0px] mt-2">
            Absolutely thrilled with the service! My apartment has never looked
            better. The team was punctual, professional, and incredibly
            thorough. Highly recommend!
          </p>
        </div>
        {/* Review 1 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 pb-2">
            <img
              src="/assets/logo/profile.jpg"
              alt="profile"
              className="w-18 h-18 rounded-full"
            />
            <div>
              <p className="font-normal text-[17px] leading-[28px] tracking-[0px]">
                Sophia Bennett
              </p>
              <p className="text-gray-500 font-normal text-[14px] leading-[22px] tracking-[0px]">
                2 weeks ago
              </p>
            </div>
          </div>
          <ReviewStars rating={5} />
          <p className="font-normal text-[16px] leading-[28px] tracking-[0px] mt-2">
            Absolutely thrilled with the service! My apartment has never looked
            better. The team was punctual, professional, and incredibly
            thorough. Highly recommend!
          </p>
        </div>
        {/* Review 1 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 pb-2">
            <img
              src="/assets/logo/profile.jpg"
              alt="profile"
              className="w-18 h-18 rounded-full"
            />
            <div>
              <p className="font-normal text-[17px] leading-[28px] tracking-[0px]">
                Sophia Bennett
              </p>
              <p className="text-gray-500 font-normal text-[14px] leading-[22px] tracking-[0px]">
                2 weeks ago
              </p>
            </div>
          </div>
          <ReviewStars rating={5} />
          <p className="font-normal text-[16px] leading-[28px] tracking-[0px] mt-2">
            Absolutely thrilled with the service! My apartment has never looked
            better. The team was punctual, professional, and incredibly
            thorough. Highly recommend!
          </p>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-6 gap-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-md text-sm font-medium border ${
                currentPage === page
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        {currentPage < totalPages && (
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-4 h-10 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white flex items-center gap-1"
          >
            Next <span>&#8250;</span>
          </button>
        )}
      </div>

      
    </div>
  );
}

export default DesktopReview;
