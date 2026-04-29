import React, { useState } from 'react'
import AddressCard from '../mobile/AddressCard';
import { useRouter } from 'next/navigation'
import { requestProvider } from '@/services/commonapi/commonApi'
import { showToast } from '@/utils/toast';
import { getErrorMessage } from '@/services/ErrorHandle';

interface AddressStepProps {
  selectedPlan: string;
  subCategoryId: string;
  bookingData: {
    bookingDate: string;
    bookingTime: string;
    description: string;
  };
  onNext: () => void;
  onBack: () => void;
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

function AddressStep({ selectedPlan, subCategoryId, bookingData, onNext, onBack }: AddressStepProps) {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookService = async () => {
    if (!selectedAddress) return;
    
    setIsLoading(true);
    
    const data = {
      planId: selectedPlan,
      subCategoryId,
      bookingDate: bookingData.bookingDate,
      bookingTime: bookingData.bookingTime,
      description: bookingData.description,
      address: selectedAddress
    };
    
    const planPriority = localStorage.getItem('PlanPriority');
    
    if (planPriority === '1') {
      const encodedData = encodeURIComponent(JSON.stringify(data));
      router.push(`/premiumplanbook?data=${encodedData}`);
      setIsLoading(false);
      return;
    }
    if (planPriority === '2') {
      const encodedData = encodeURIComponent(JSON.stringify(data));
      router.push(`/biddingplanbook?data=${encodedData}`);
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await requestProvider(data);
      const id = res.data.bookingId;
      if (res.success) {
        router.push(`/timecountdown/${id}`);
      }
    } catch (error: unknown) {
      showToast({
              type: "error",
              title: "Error",
              message: getErrorMessage(error),
            });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className='font-medium text-[16px] leading-[26px] tracking-[0.01px] pt-2 pb-2'>Add Address</h1>
       
      <div className="flex-1 overflow-y-auto">
        <AddressCard onAddressSelect={setSelectedAddress} />
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="w-[30%] h-[42px] border border-[#7722FF] text-[#7722FF] rounded-xl font-medium text-sm transition-all duration-300 hover:bg-[#7722FF] hover:text-white disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleBookService}
          disabled={!selectedAddress || isLoading}
          className={`w-[70%] h-[42px] text-white rounded-xl font-medium text-sm transition-all duration-300 ${
            selectedAddress && !isLoading ? 'bg-[#7722FF] hover:bg-[#6611EE]' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Booking...' : 'Book Service'}
        </button>
      </div>
    </div>
  )
}

export default AddressStep