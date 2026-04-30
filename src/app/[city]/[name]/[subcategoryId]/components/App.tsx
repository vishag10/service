"use client";
import { ArrowLeft } from 'lucide-react'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Slider from "react-slick";
import Image from 'next/image';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ServiceContent from '@/components/mobile/ServiceContent';

const images = [
    "/assets/banner/slider.png",
    "/assets/banner/slider.png",
    "/assets/banner/slider.png",
    "/assets/banner/slider.png",
];

interface AppProps {
  id: string;
}

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

function App({ id }: AppProps) {
    const router = useRouter()
    const [current, setCurrent] = useState(0);
    const [isBookingActive, setIsBookingActive] = useState(false);
    const [showServiceView, setShowServiceView] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<CurrentPackageType | null>(null);

    const isPremium = currentPackage?.priority === 1;
    const planLabel = isPremium ? "Premium" : "Normal";

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        afterChange: (index: number) => setCurrent(index),
    };

    return (
        <div>
            {/* Fixed Header - Highest z-index */}
            {!isBookingActive && (
                <div className='fixed top-0 left-0 right-0 z-30 w-full'>
                    <div className="w-full bg-white shadow-sm px-4 py-4 flex items-center gap-3 text-center ">
                        <button onClick={() => {
                            if (showServiceView) {
                                setShowServiceView(false);
                                setCurrentPackage(null);
                            } else {
                                router.back();
                            }
                        }} className="p-2 -ml-2">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <p className='font-medium text-[16px] leading-[18px] tracking-[-0.36px] text-center'>Service book</p>
                    </div>
                </div>
            )}

            {/* Plan-based banner OR Fixed Slider */}
            {showServiceView && currentPackage ? (
                <div className="fixed top-[66px]  left-0 right-0 z-10 w-full h-[180px]">
                    <div
                        className="w-full px-4 py-6 relative overflow-hidden h-full"
                        style={{
                            backgroundImage: isPremium
                                ? `linear-gradient(to right, rgba(253,224,71,0.8), rgba(254,249,195,0.8)), url('/assets/service/norbg.png')`
                                : `linear-gradient(to right, rgba(74,222,128,0.8), rgba(220,252,231,0.8)), url('/assets/service/norbg.png')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            minHeight: "140px",
                        }}
                    >
                        <div className="flex justify- items-start flex-col h-full">
                            <span
                                className={`inline-block px-4 py-1.5 text-[12px] rounded-full font-semibold mb-2 ${
                                    isPremium
                                        ? "bg-yellow-400 text-yellow-900 border border-yellow-400"
                                        : "bg-white text-[#1AA45B] border border-[#1AA45B]"
                                }`}
                            >
                                {planLabel} Service
                            </span>
                            <h1 className="font-bold text-[16px] leading-[1.3] text-gray-900 italic">
                                Premium Experts, Trusted by
                                <br />
                                Thousands
                            </h1>
                        </div>
                        <div
                            className="absolute right-0 top-1/2 w-[150px] h-[150px]"
                            style={{ transform: "translateY(-50%)" }}
                        >
                            <Image
                                src={isPremium ? "/assets/service/king.png" : "/assets/service/rocket.png"}
                                alt={`${planLabel} Service`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="fixed top-[66px] left-0 right-0 z-10 w-full h-[337px] overflow-hidden rounded-lg shadow shrink-0">
                    <Slider {...settings}>
                        {images.map((src, i) => (
                            <div key={i}>
                                <Image
                                    src={src}
                                    alt={`Slide ${i + 1}`}
                                    width={375}
                                    height={337}
                                    className="w-full h-[337px] object-cover rounded-lg"
                                />
                            </div>
                        ))}
                    </Slider>

                    {/* Top-right counter */}
                    <div className="absolute top-2 right-2 bg-[#782FF8] text-white text-[12px] font-medium px-2 py-1 rounded-md">
                        {current + 1}/{images.length}
                    </div>

                    {/* Bottom progress bar */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[30%] h-1 bg-gray-200 rounded-full">
                        <div
                            className="h-1 bg-[#782FF8] rounded-full transition-all duration-500"
                            style={{ width: `${((current + 1) / images.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Content that scrolls over slider */}
            <div className={`relative z-20 ${showServiceView && currentPackage ? 'mt-[230px]' : 'mt-[363px]'}`}>
                <ServiceContent
                    id={id}
                    onBookingStateChange={setIsBookingActive}
                    onServiceViewChange={(show, pkg) => {
                        setShowServiceView(show);
                        setCurrentPackage(pkg);
                    }}
                />
            </div>
        </div>
    )
}

export default App
