import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AddressCard from "../mobile/AddressCard";
import DatePickerCard from "../mobile/DatePickerCard";
import TimePicker from "../mobile/TimePicker";
import IssueDescribe from "../mobile/IssueDescribe";
import SocketService from "@/services/socketio/SocketService";
import config from "@/services/socketio/config";
import { requestProvider } from "@/services/commonapi/commonApi";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

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
  onBack?: () => void;
}

function ScheduleService({
  selectedPlan,
  subCategoryId,
  onBack,
}: ScheduleServiceProps) {
  const router = useRouter();
  const planId = selectedPlan;

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

  const handleRequestProvider = async () => {
    if (!isFormValid) return;

    const data = {
      planId,
      subCategoryId,
      bookingDate,
      bookingTime,
      description,
    };
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
    }
  };

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = SocketService.connect(config.SOCKET_URL);

    socket.on("connect", () => {
      setConnectionStatus("Connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("Disconnected");
    });

    // Listen for request acceptance
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
    <div className="bg-white w-full h-full flex flex-col">
      <div className="flex items-center gap-3 p-3 border-b border-gray-100">
        <button
          onClick={() => (onBack ? onBack() : router.back())}
          className="p-2 -ml-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <p className="font-medium text-[16px] leading-[18px] tracking-[-0.36px]">
          Schedule service
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4 pb-20">
          <AddressCard />
          <DatePickerCard onDateChange={setBookingDate} />
          <TimePicker onTimeChange={setBookingTime} />
          <IssueDescribe onDescriptionChange={setDescription} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 p-3">
        <button
          onClick={handleRequestProvider}
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
    </div>
  );
}

export default ScheduleService;
