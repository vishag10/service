"use client";
import React, { useEffect, useState } from "react";
import { getUserAddress, getUserDeatils } from "@/services/commonapi/commonApi";
import { FaHome, FaBriefcase, FaPlusCircle, FaPlus } from "react-icons/fa";
import { IoClose, IoLocationSharp } from "react-icons/io5";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

interface Address {
  _id: string;
  name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  HouseNo: string;
  RoadName: string;
  type: number;
  isDefault: boolean;
}

interface AddressData {
  name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  HouseNo: string;
  RoadName: string;
  type: number;
}

interface Props {
  onOk: (address: AddressData) => void;
}

function DesktopAddressStep({ onOk }: Props) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [userSubtext, setUserSubtext] = useState("");
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [addrRes, userRes] = await Promise.all([
          getUserAddress(),
          getUserDeatils(),
        ]);
        if (addrRes?.success && addrRes.data?.length) {
          setAddresses(addrRes.data);
          const def =
            addrRes.data.find((a: Address) => a.isDefault) || addrRes.data[0];
          setSelectedId(def._id);
          setUserSubtext(`${def.HouseNo}, ${def.RoadName}...`);
        }
        if (userRes?.success) {
          setUserName(userRes.data?.name || userRes.data?.firstName || "User");
        }
      } catch (e) {
        showToast({
          type: "error",
          title: "Error",
          message: getErrorMessage(e),
        });
      }
    };
    fetchData();
  }, []);

  const selected = addresses.find((a) => a._id === selectedId);

  // Get unique address types from fetched data
  const availableTypes = [...new Set(addresses.map((a) => a.type))];

  const getTypeIcon = (type: number) => {
    switch (type) {
      case 1:
        return <FaHome className="text-[20px] md:text-[30px]" />;
      case 2:
        return <FaBriefcase className="text-[20px] md:text-[30px]" />;
      default:
        return <FaHome className="text-[20px] md:text-[30px]" />;
    }
  };

  const getTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return "Home";
      case 2:
        return "Office";
      default:
        return `Type ${type}`;
    }
  };

  const handleOk = () => {
    if (!selected) return;
    onOk({
      name: selected.name,
      phone: selected.phone,
      country: selected.country,
      state: selected.state,
      city: selected.city,
      zip: selected.zip,
      HouseNo: selected.HouseNo,
      RoadName: selected.RoadName,
      type: selected.type,
    });
  };

  const typeLabel = activeType !== null ? getTypeLabel(activeType) : "Home";

  const handleTypeSelect = (type: number) => {
    const newType = activeType === type ? null : type;
    setActiveType(newType);
    if (newType !== null) {
      const filtered = addresses.filter((a) => a.type === newType);
      if (filtered.length > 0) {
        setSelectedId(filtered[0]._id);
        setUserSubtext(`${filtered[0].HouseNo}, ${filtered[0].RoadName}...`);
      }
      setShowList(true);
    } else {
      setShowList(false);
    }
  };

  return (
    <div className="w-full md:w-[90vw] md:max-w-[800px] bg-[#1AA45B] rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl">
      {/* Green header section */}
      <div className="w-[90%] md:w-[85%] lg:w-[80%] mx-auto mt-6 md:mt-10 lg:mt-16 mb-2 relative">
        {/* Close button - circle outline */}
        <button className="absolute top-4 right-4 w-[24px] h-[24px] rounded-full border-2 border-white bg-transparent" />

        {/* User info */}
        <div className="flex items-center gap-2.5 md:gap-3.5">
          <div className="flex items-center justify-center">
            <IoLocationSharp className="text-white text-[32px] md:text-[46px]" />
          </div>
          <div>
            <p className="font-bold text-white text-[15px] md:text-[18px] leading-tight">
              {userName}
            </p>
            <p className="text-white/75 text-xs md:text-sm mt-0.5">
              {userSubtext || "Select an address"}
            </p>
          </div>
        </div>
      </div>

      {/* White bottom card */}
      <div className="bg-white w-[90%] md:w-[85%] lg:w-[80%] mx-auto rounded-xl px-4 lg:px-6 pt-5 lg:pt-7 pb-4 lg:pb-6 mb-6">
        {/* Type icons row */}
        <div className="flex items-start justify-center mb-5 md:mb-7">
          {availableTypes.map((type, idx) => (
            <button
              key={type}
              onClick={() => handleTypeSelect(type)}
              className={`flex-1 flex flex-col items-center cursor-pointer gap-1.5 md:gap-2.5 px-2 md:px-3 ${
                idx < availableTypes.length - 1
                  ? "border-r border-gray-200"
                  : ""
              }`}
            >
              <div
                className={`w-[48px] h-[48px] md:w-[60px] md:h-[60px] lg:w-[76px] lg:h-[76px] rounded-full bg-gray-100 flex items-center justify-center transition ${
                  activeType === type ? "text-[#782FF8]" : "text-gray-900"
                }`}
              >
                {getTypeIcon(type)}
              </div>
              <span
                className={`text-xs md:text-sm font-medium transition ${
                  activeType === type ? "text-[#782FF8]" : "text-gray-900"
                }`}
              >
                {getTypeLabel(type)}
              </span>
            </button>
          ))}

          {/* Add New */}
          <button className="flex-1 flex flex-col items-center gap-1.5 md:gap-2.5 px-2 md:px-3">
            <div className="w-[48px] h-[48px] md:w-[60px] md:h-[60px] lg:w-[76px] lg:h-[76px] rounded-full bg-gray-100 flex items-center justify-center">
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gray-900 flex items-center justify-center">
                <FaPlus className="text-white text-[16px] md:text-[25px]" />
              </div>
            </div>
            <span className="text-xs md:text-sm font-medium text-gray-900">Add New</span>
          </button>
        </div>

        {/* Button - shows Next when type selected, otherwise Add Address */}
        {activeType !== null ? (
          <button
            onClick={handleOk}
            disabled={!selectedId}
            className={`w-full py-3 md:py-4 rounded-xl text-[14px] md:text-[15px] font-semibold cursor-pointer transition ${
              selectedId
                ? "bg-[#782FF8] hover:bg-[#6611EE] text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setShowList(!showList)}
            className="w-full py-3 md:py-4 bg-[#782FF8] hover:bg-[#6611EE] text-white rounded-xl text-[14px] md:text-[15px] font-semibold transition"
          >
            Add {typeLabel} Address
          </button>
        )}
      </div>
    </div>
  );
}

export default DesktopAddressStep;
