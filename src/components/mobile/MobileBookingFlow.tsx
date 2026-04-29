import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import DatePickerCard from "./DatePickerCard";
import TimePicker from "./TimePicker";
import IssueDescribe from "./IssueDescribe";
import AddressCard from "./AddressCard";
import { requestProvider } from "@/services/commonapi/commonApi";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

interface MobileBookingFlowProps {
  selectedPlan: string;
  subCategoryId: string;
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

function MobileBookingFlow({
  selectedPlan,
  subCategoryId,
  onBack,
}: MobileBookingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<{
    bookingDate: string;
    bookingTime: string;
    description: string;
  } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleScheduleNext = (data: {
    bookingDate: string;
    bookingTime: string;
    description: string;
  }) => {
    setBookingData(data);
    setCurrentStep(2);
  };

  const handleBookService = async () => {
    if (!selectedAddress || !bookingData) return;

    setIsLoading(true);

    const data = {
      planId: selectedPlan,
      subCategoryId,
      bookingDate: bookingData.bookingDate,
      bookingTime: bookingData.bookingTime,
      description: bookingData.description,
      address: selectedAddress,
    };

    const planPriority = localStorage.getItem("PlanPriority");

    if (planPriority === "1") {
      const encodedData = encodeURIComponent(JSON.stringify(data));
      router.push(`/premiumplanbook?data=${encodedData}`);
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

  const renderStep = () => {
    if (currentStep === 1) {
      return <ScheduleStep onNext={handleScheduleNext} onBack={onBack} />;
    } else {
      return (
        <AddressStep
          onAddressSelect={setSelectedAddress}
          onBack={() => setCurrentStep(1)}
          onBook={handleBookService}
          isLoading={isLoading}
          selectedAddress={selectedAddress}
        />
      );
    }
  };

  return (
    <div className="bg-white w-full h-full flex flex-col">{renderStep()}</div>
  );
}

interface ScheduleStepProps {
  onNext: (data: {
    bookingDate: string;
    bookingTime: string;
    description: string;
  }) => void;
  onBack: () => void;
}

function ScheduleStep({ onNext, onBack }: ScheduleStepProps) {
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [description, setDescription] = useState("");

  const isFormValid = bookingDate && bookingTime && description.trim();

  const handleNext = () => {
    if (!isFormValid) return;
    onNext({ bookingDate, bookingTime, description });
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <p className="font-medium text-[16px] leading-[18px] tracking-[-0.36px]">
          Schedule service
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4 pb-20">
          <DatePickerCard onDateChange={setBookingDate} />
          <TimePicker onTimeChange={setBookingTime} />
          <IssueDescribe onDescriptionChange={setDescription} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 p-3">
        <button
          onClick={handleNext}
          disabled={!isFormValid}
          className={`w-full h-[42px] text-white rounded-xl font-medium text-sm transition-all duration-300 ${
            isFormValid
              ? "bg-[#7722FF] hover:bg-[#6611EE]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </>
  );
}

interface AddressStepProps {
  onAddressSelect: (address: AddressData) => void;
  onBack: () => void;
  onBook: () => void;
  isLoading: boolean;
  selectedAddress: AddressData | null;
}

function AddressStep({
  onAddressSelect,
  onBack,
  onBook,
  isLoading,
  selectedAddress,
}: AddressStepProps) {
  return (
    <>
      <div className="flex items-center gap-3 p-3 border-b border-gray-100 ">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <p className="font-medium text-[16px] leading-[18px] tracking-[-0.36px]">
          Add Address
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4 pb-20">
          <AddressCard onAddressSelect={onAddressSelect} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 p-3">
        <button
          onClick={onBook}
          disabled={!selectedAddress || isLoading}
          className={`w-full h-[42px] text-white rounded-xl font-medium text-sm transition-all duration-300 ${
            selectedAddress && !isLoading
              ? "bg-[#7722FF] hover:bg-[#6611EE]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Booking..." : "Book Service"}
        </button>
      </div>
    </>
  );
}

export default MobileBookingFlow;
