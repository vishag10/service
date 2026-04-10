import { MapPinIcon } from "lucide-react";
import React from "react";

type ServiceCardProps = {
  imgSrc: string;
  name: string;
  distance: string;
  rating: number;
  experience: string;
  specialist: string;
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  imgSrc,
  name,
  distance,
  rating,
  experience,
  specialist,
}) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex gap-3">
        <img
          src={imgSrc}
          alt={name}
          className="w-20 h-20 rounded-xl object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[15px]">{name}</h3>
            <span className="text-xs font-medium text-white bg-green-500 px-2 py-0.5 rounded">
              ★ {rating}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 "><MapPinIcon className="w-4 h-4 " /> {distance} away</p>
          <div className="flex gap-6 mt-2">
            <div>
              <p className="text-xs text-purple-600 font-medium">Experience</p>
              <p className="text-xs text-gray-600">{experience}</p>
            </div>
            <div>
              <p className="text-xs text-purple-600 font-medium">Specialist</p>
              <p className="text-xs text-gray-600">{specialist}</p>
            </div>
          </div>
        </div>
      </div>
      <button className="w-full mt-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
        View
      </button>
    </div>
  );
};

const MostPopularServices: React.FC = () => {
  return (
    <div className="max-w-md mx-auto bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[16px] leading-[22px]">
          Popular Plumbing Contractors
          <br />
          In Kozhikode
        </h2>
        <button className="p-2 border border-gray-200 rounded-lg">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="8" cy="6" r="1.5" fill="currentColor" />
            <circle cx="16" cy="12" r="1.5" fill="currentColor" />
            <circle cx="10" cy="18" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <ServiceCard
            key={i}
            imgSrc="/assets/landing/person.jpg"
            name="Jhon Doe"
            distance="2km"
            rating={4.8}
            experience="10 Years"
            specialist="Ac Mechanic"
          />
        ))}
      </div>
      <div className="flex justify-center p-5">
        <button className=" border-[1.5px] border-[#782FF8] w-50.75 h-[50   px] text-[#782FF8] px-4 py-2 rounded-md text-sm font-medium">
          View all
        </button>
      </div>
    </div>
  );
};

export default MostPopularServices;
