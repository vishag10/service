import { getUserAddress } from "@/services/commonapi/commonApi";
import { getErrorMessage } from "@/services/ErrorHandle";
import { showToast } from "@/utils/toast";
import React, { useEffect, useState } from "react";
import { FaHome, FaBuilding } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";

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

interface AddressCardProps {
  onAddressSelect?: (address: Omit<Address, "_id" | "isDefault">) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ onAddressSelect }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const handlegetAddress = async () => {
    try {
      const res = await getUserAddress();
      if (res.success) {
        setAddresses(res.data);
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
    handlegetAddress();
  }, []);

  return (
    <div className="w-[90%] mx-auto max-h-96 overflow-y-auto space-y-4">
      {addresses.map((address) => (
        <div
          key={address._id}
          onClick={() => {
            setSelectedAddressId(address._id);
            onAddressSelect?.({
              name: address.name,
              phone: address.phone,
              country: address.country,
              state: address.state,
              city: address.city,
              zip: address.zip,
              HouseNo: address.HouseNo,
              RoadName: address.RoadName,
              type: address.type,
            });
          }}
          className={`border rounded-2xl p-4 shadow-sm bg-white flex flex-col gap-2 relative cursor-pointer transition-all duration-200 ${
            selectedAddressId === address._id
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-purple-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-medium text-gray-800">{address.name}</h2>
              <span className="flex items-center gap-1 text-purple-600 text-xs border border-purple-400 px-2 py-0.5 rounded-full">
                {address.type === 1 ? (
                  <FaHome size={12} />
                ) : (
                  <FaBuilding size={12} />
                )}
                {address.type === 1 ? "Home" : "Building"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedAddressId === address._id && (
                <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              <button className="text-purple-500 hover:text-purple-700 transition">
                <FiEdit2 size={18} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">{address.phone}</p>
          <p className="text-sm text-gray-500">
            {address.HouseNo}, {address.RoadName}, {address.city},{" "}
            {address.state}, {address.country} - {address.zip}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AddressCard;
