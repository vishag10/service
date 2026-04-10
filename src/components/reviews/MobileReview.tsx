import React from 'react'
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

function ReviewStars({ rating }: { rating: number }) {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) =>
                star <= rating ? (
                    <AiFillStar key={star} className="text-yellow-400 w-5 h-5" />
                ) : (
                    <AiOutlineStar key={star} className="text-yellow-400 w-5 h-5" />
                )
            )}
        </div>
    );
}
function MobileReview() {
    return (
        <div>
            <div className="">
                <h2 className="font-medium text-[16px] leading-[26px] tracking-[0.01px] mb-4">Reviews</h2>

                {/* Review 1 */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <img
                            src="/assets/logo/profile.jpg"
                            alt="profile"
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-normal text-[14px] leading-[22px] tracking-[0px]">Sophia Bennett</p>
                            <p className="text-gray-500 font-normal text-[14px] leading-[22px] tracking-[0px]">2 weeks ago</p>
                        </div>
                    </div>
                    <ReviewStars rating={5} />
                    <p className="font-normal text-[14px] leading-[22px] tracking-[0px] mt-2">
                        Absolutely thrilled with the service! My apartment has never looked
                        better. The team was punctual, professional, and incredibly thorough.
                        Highly recommend!
                    </p>
                </div>

                {/* Review 2 */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <img
                            src="/assets/logo/profile.jpg"
                            alt="profile"
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-normal text-[14px] leading-[22px] tracking-[0px]">Sophia Bennett</p>
                            <p className="text-gray-500 font-normal text-[14px] leading-[22px] tracking-[0px]">2 weeks ago</p>
                        </div>
                    </div>
                    <ReviewStars rating={4} />
                    <p className="font-normal text-[14px] leading-[22px] tracking-[0px] mt-2">
                        Good service overall. The cleaning was decent, but there were a few
                        spots missed. The team was friendly and efficient.
                    </p>
                </div>

                {/* Button */}
                <div className="flex justify-center">
                    <button className=" border-[1.5px] border-[#782FF8] w-50.75 h-[50   px] text-[#782FF8] px-4 py-2 rounded-md text-sm font-medium">
                        Add Review
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MobileReview