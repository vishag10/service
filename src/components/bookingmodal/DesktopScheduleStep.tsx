'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { requestProvider } from '@/services/commonapi/commonApi'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { AiOutlineCamera, AiOutlineClose } from 'react-icons/ai'
import { FaCalendarAlt, FaClock } from 'react-icons/fa'
import ClockPicker from './ClockPicker'

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
  selectedPlan: string;
  subCategoryId: string;
  selectedAddress: AddressData;
  onBack: () => void;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];


type ActiveView = 'default' | 'calendar' | 'time';

function DesktopScheduleStep({ selectedPlan, subCategoryId, selectedAddress, onBack }: Props) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ActiveView>('default');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookNow, setBookNow] = useState(false);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const firstDayOffset = getDay(startOfMonth(currentMonth));

  const displayDate = selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'DD-MM-YYYY';
  const displayTime = selectedTime || '00:00 AM';
  const isFormValid = selectedDate && selectedTime && description.trim();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (!isFormValid) return;
    setIsLoading(true);

    const data = {
      planId: selectedPlan,
      subCategoryId,
      bookingDate: format(selectedDate!, 'yyyy-MM-dd'),
      bookingTime: selectedTime,
      description,
      address: selectedAddress,
    };

    const planPriority = localStorage.getItem('PlanPriority');
    if (planPriority === '1') {
      router.push(`/premiumplanbook?data=${encodeURIComponent(JSON.stringify(data))}`);
      return;
    }
    if (planPriority === '2') {
      router.push(`/biddingplanbook?data=${encodeURIComponent(JSON.stringify(data))}`);
      return;
    }

    try {
      const res = await requestProvider(data);
      if (res.success && res.data?.bookingId) router.push(`/timecountdown/${res.data.bookingId}`);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[90vw] max-w-[800px] lg:max-w-[900px] xl:max-w-[950px] min-h-[550px] h-auto max-h-[90vh] bg-[#1AA45B] rounded-2xl overflow-y-auto shadow-2xl">
      {/* Green header */}
      <div className="w-[90%] lg:w-[80%] mx-auto mt-8 lg:mt-12 mb-4 flex items-center justify-between pr-2">
        <div className="flex items-center gap-2.5">
          <div className=" flex items-center justify-center">
            <FaCalendarAlt size={45} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-white text-[20px]">Schedule Service</p>
            <p className="text-white/70 text-xs">{displayDate} | {displayTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-medium">Book Now</span>
          <button
            onClick={() => {
              const next = !bookNow;
              setBookNow(next);
              if (next) {
                const now = new Date();
                setSelectedDate(now);
                setCurrentMonth(now);
                setSelectedTime(format(now, 'hh:mm a').toUpperCase());
              }
            }}
            className={`w-5 h-5 rounded-full border-2 transition flex items-center justify-center ${
              bookNow ? 'bg-white border-white' : 'border-white/50'
            }`}
          >
            {bookNow && <div className="w-2.5 h-2.5 bg-[#2E7D32] rounded-full" />}
          </button>
        </div>
      </div>

      {/* White content */}
      <div className="bg-white w-[90%] lg:w-[80%] mx-auto px-4 lg:px-6 py-6 lg:py-8 rounded-xl mb-6">
        
        {activeView === 'default' && (
          <>
            {/* Tab icons */}
            <div className="flex justify-center gap-6 mb-5">
              <button
                onClick={() => setActiveView('calendar')}
                className="flex flex-col items-center gap-2 px-8 py-3 rounded-xl hover:bg-gray-50 transition border border-gray-100 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FaCalendarAlt size={20} className="text-gray-500" />
                </div>
                <span className="text-xs font-medium text-gray-600">Select Date</span>
              </button>

              <div className="w-px bg-gray-200" />

              <button
                onClick={() => setActiveView('time')}
                className="flex flex-col items-center gap-2 px-8 py-3 rounded-xl hover:bg-gray-50 transition border border-gray-100 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FaClock size={20} className="text-gray-500" />
                </div>
                <span className="text-xs font-medium text-gray-600">Select Time</span>
              </button>
            </div>

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-[100px] p-3 border border-gray-200 rounded-xl resize-none text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-3"
              placeholder="Describe the issue..."
            />

            {/* Uploaded files */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="relative">
                    {file.type.startsWith('image/') ? (
                      <>
                        <img src={URL.createObjectURL(file)} alt="" className="w-14 h-14 object-cover rounded-lg border" />
                        <AiOutlineClose
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 cursor-pointer text-xs"
                          onClick={() => removeFile(i)}
                        />
                      </>
                    ) : (
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                        <span className="truncate max-w-16">{file.name}</span>
                        <AiOutlineClose className="cursor-pointer" onClick={() => removeFile(i)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <label className="flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-xl border border-gray-200 transition mb-4">
              <AiOutlineCamera className="text-gray-500" size={18} />
              <span className="text-sm text-gray-600 font-medium">Upload Photos</span>
              <input type="file" className="hidden" multiple onChange={handleFileSelect} />
            </label>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={!isFormValid || isLoading}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition ${
                isFormValid && !isLoading
                  ? 'bg-[#7722FF] hover:bg-[#6611EE] text-white'
                  : 'bg-purple-200 text-white cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Booking...' : 'Confirm'}
            </button>
          </>
        )}

        {/* Calendar view */}
        {activeView === 'calendar' && (
          <>
            {/* Tabs - date active */}
            <div className="flex justify-center gap-6 mb-4">
              <button className="flex flex-col  items-center gap-2 px-8 py-3 rounded-xl bg-purple-50 cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-[#7722FF] flex items-center justify-center">
                  <FaCalendarAlt size={20} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-[#7722FF]">Select Date</span>
              </button>

              <div className="w-px bg-gray-200" />

              <button
                onClick={() => setActiveView('time')}
                className="flex flex-col items-center gap-2 px-8 py-3 rounded-xl hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FaClock size={20} className="text-gray-500" />
                </div>
                <span className="text-xs font-medium text-gray-500">Select Time</span>
              </button>
            </div>

            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[#7722FF]">
                {format(currentMonth, 'MMMM yyyy')} &rsaquo;
              </span>
              <div className="flex gap-1">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft size={16} className="text-gray-400" />
                </button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-3">
              {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
              {days.map((day) => {
                const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isPast = startOfDay(day) < startOfDay(new Date());
                const isSun = getDay(day) === 0;
                const isSat = getDay(day) === 6;
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => !isPast && setSelectedDate(day)}
                    disabled={isPast}
                    className={`w-9 h-9 mx-auto flex items-center justify-center text-sm rounded-full transition ${
                      isPast
                        ? 'text-gray-300 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#7722FF] text-white font-bold'
                        : isToday
                        ? 'bg-purple-100 text-[#7722FF] font-bold'
                        : isSun || isSat
                        ? 'text-red-400 hover:bg-gray-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {/* Cancel / OK */}
            <div className="flex justify-end gap-4 mt-4 mb-3">
              <button onClick={() => setActiveView('default')} className="text-sm text-gray-500 font-medium hover:text-gray-700">
                Cancel
              </button>
              <button
                onClick={() => setActiveView('default')}
                className="text-sm text-[#7722FF] font-semibold hover:text-[#6611EE]"
              >
                OK
              </button>
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={!isFormValid || isLoading}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition ${
                isFormValid && !isLoading
                  ? 'bg-[#7722FF] hover:bg-[#6611EE] text-white'
                  : 'bg-purple-200 text-white cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Booking...' : 'Confirm'}
            </button>
          </>
        )}

        {/* Time view */}
        {activeView === 'time' && (
          <>
            {/* Tabs - time active */}
            <div className="flex justify-center gap-6 mb-4">
              <button
                onClick={() => setActiveView('calendar')}
                className="flex flex-col items-center gap-2 px-8 py-3 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FaCalendarAlt size={20} className="text-gray-500" />
                </div>
                <span className="text-xs font-medium text-gray-500">Select Date</span>
              </button>

              <div className="w-px bg-gray-200" />

              <button className="flex flex-col items-center gap-2 px-8 py-3 rounded-xl bg-purple-50">
                <div className="w-12 h-12 rounded-xl bg-[#7722FF] flex items-center justify-center">
                  <FaClock size={20} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-[#7722FF]">Select Time</span>
              </button>
            </div>

            {/* Analog Clock Picker */}
            <ClockPicker
              value={selectedTime || '07:00 AM'}
              onChange={setSelectedTime}
            />

            {/* Cancel / OK */}
            <div className="flex justify-end gap-4 mt-2 mb-3">
              <button onClick={() => setActiveView('default')} className="text-sm text-gray-500 font-medium hover:text-gray-700">
                Cancel
              </button>
              <button
                onClick={() => setActiveView('default')}
                className="text-sm text-[#7722FF] font-semibold hover:text-[#6611EE]"
              >
                OK
              </button>
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={!isFormValid || isLoading}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition ${
                isFormValid && !isLoading
                  ? 'bg-[#7722FF] hover:bg-[#6611EE] text-white'
                  : 'bg-purple-200 text-white cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Booking...' : 'Confirm'}
            </button>
          </>
        )}
      </div>
    </div>
    
  );
}

export default DesktopScheduleStep
