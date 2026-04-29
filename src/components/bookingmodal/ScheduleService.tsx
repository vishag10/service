import React, { useEffect } from "react";
import AddressCard from "../mobile/AddressCard";
import DatePickerCard from "../mobile/DatePickerCard";
import TimePicker from "../mobile/TimePicker";
import IssueDescribe from "../mobile/IssueDescribe";
import SocketService from "@/services/socketio/SocketService";
import config from "@/services/socketio/config";

interface AcceptedRequest {
  providerId: string;
  requestId: string;
  timestamp: string;
}

interface Notification {
  type: string;
  providerId: string;
  requestId: string;
  timestamp: Date;
}

interface ScheduleServiceProps {
  selectedPlan: string;
  subCategoryId: string;
  onNext: (data: {
    bookingDate: string;
    bookingTime: string;
    description: string;
  }) => void;
  onBack: () => void;
}

function ScheduleService({
  selectedPlan,
  subCategoryId,
  onNext,
  onBack,
}: ScheduleServiceProps) {
  const [bookingDate, setBookingDate] = React.useState("");
  const [bookingTime, setBookingTime] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [connectionStatus, setConnectionStatus] =
    React.useState("Disconnected");
  const [acceptedRequests, setAcceptedRequests] = React.useState<
    AcceptedRequest[]
  >([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const isFormValid = bookingDate && bookingTime && description.trim();

  const handleNext = () => {
    if (!isFormValid) return;

    const data = {
      bookingDate,
      bookingTime,
      description,
    };

    onNext(data);
  };

  useEffect(() => {
    const socket = SocketService.connect(config.SOCKET_URL);

    socket.on("connect", () => {
      setConnectionStatus("Connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("Disconnected");
    });

    socket.on("requestAccepted", (data: AcceptedRequest) => {
      setAcceptedRequests((prev) => [...prev, data]);
      const notification = {
        type: "Request Accepted",
        providerId: data.providerId,
        requestId: data.requestId,
        timestamp: new Date(data.timestamp),
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      SocketService.disconnect();
    };
  }, []);

  return (
    <>
      <h1 className="font-medium text-[16px] leading-[26px] tracking-[0.01px] pt-2">
        Schedule Service
      </h1>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {/* <AddressCard /> */}
          <DatePickerCard onDateChange={setBookingDate} />
          <TimePicker onTimeChange={setBookingTime} />
          <IssueDescribe onDescriptionChange={setDescription} />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onBack}
          className="w-[30%] h-[42px] border border-[#7722FF] text-[#7722FF] rounded-xl font-medium text-sm transition-all duration-300 hover:bg-[#7722FF] hover:text-white"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isFormValid}
          className={`w-[70%] h-[42px] text-white rounded-xl font-medium text-sm transition-all duration-300 ${
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

export default ScheduleService;
