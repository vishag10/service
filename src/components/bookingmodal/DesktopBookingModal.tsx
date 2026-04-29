import React, { useState } from 'react'
import DesktopAddressStep from './DesktopAddressStep';
import DesktopScheduleStep from './DesktopScheduleStep';

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

interface DesktopBookingModalProps {
  subCategoryId?: string;
  selectedPlanId?: string;
}

function DesktopBookingModal({ subCategoryId = '', selectedPlanId = '' }: DesktopBookingModalProps) {
  const [step, setStep] = useState<'address' | 'schedule'>('address');
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);

  const handleAddressOk = (address: AddressData) => {
    setSelectedAddress(address);
    setStep('schedule');
  };

  const handleBack = () => {
    setStep('address');
  };

  if (step === 'address') {
    return <DesktopAddressStep onOk={handleAddressOk} />;
  }

  return (
    <DesktopScheduleStep
      selectedPlan={selectedPlanId}
      subCategoryId={subCategoryId}
      selectedAddress={selectedAddress!}
      onBack={handleBack}
    />
  );
}

export default DesktopBookingModal
