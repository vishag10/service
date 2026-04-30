import React, { useEffect, useState } from "react";
import config from "@/services/socketio/config";
import socketService from "@/services/socketio/SocketService";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAcceptedRequest } from "@/redux/acceptedRequestSlice";
import { PiWarningFill } from "react-icons/pi";

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

interface AppProps {
  id: string;
}

function App({ id }: AppProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const totalTime = 180;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] =
    React.useState("Disconnected");
  const [acceptedRequests, setAcceptedRequests] = React.useState<
    AcceptedRequest[]
  >([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const smoothTimer = setInterval(() => {
      setSmoothProgress((prev) => {
        const target = ((totalTime - Math.max(0, timeLeft)) / totalTime) * 100;
        return prev + (target - prev) * 0.1;
      });
    }, 50);
    return () => clearInterval(smoothTimer);
  }, [timeLeft, totalTime]);

  const radius = 115;
  const circumference = 2 * Math.PI * radius;
  const progress = (smoothProgress / 100) * circumference;

  let thinStrokeColor = "#8b5cf6";
  let thickStrokeColor = "#ede9fe";
  let gradientColor = "rgba(139, 92, 246, 0.4)";

  if (timeLeft <= 10) {
    thinStrokeColor = "#ef4444";
    thickStrokeColor = "#fee2e2";
    gradientColor = "rgba(239, 68, 68, 0.4)";
  } else if (timeLeft <= 40) {
    thinStrokeColor = "#eab308";
    thickStrokeColor = "#fef08a";
    gradientColor = "rgba(234, 179, 8, 0.4)";
  }

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  useEffect(() => {
    const socket = socketService.connect(config.SOCKET_URL);

    socket.on("connect", () => {
      setConnectionStatus("Connected");
      const customerId = localStorage.getItem("userId");
      socket.emit("joinCustomerRoom", customerId);
    });

    socket.on("disconnect", () => {
      setConnectionStatus("Disconnected");
    });

    socket.on("requestAccepted", (data: AcceptedRequest) => {
      dispatch(setAcceptedRequest(data));
      setAcceptedRequests((prev) => [...prev, data]);
      const notification = {
        type: "Request Accepted",
        providerId: data.providerId,
        requestId: data.requestId,
        timestamp: new Date(data.timestamp),
      };
      setNotifications((prev) => [notification, ...prev]);
      router.push("/foundservicer");
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-white relative overflow-hidden flex flex-col font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
      `}</style>

      {/* Background Gradient */}
      <div
        className="absolute top-0 left-0 w-full h-[500px] transition-all duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(100% 100% at 50% 0%, ${gradientColor} 0%, transparent 100%)`,
          opacity: 0.5,
        }}
      />

      <div className="flex-1 flex flex-col items-center pt-28 px-6 relative z-10 w-full max-w-md mx-auto">
        {/* Timer Circle Area */}
        <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-4">
          {/* SVG Progress Rings */}
          <svg
            width="300"
            height="300"
            className="absolute inset-0 drop-shadow-sm"
            style={{ transform: "rotate(150deg)" }}
          >
            {/* Thick background track */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={thickStrokeColor}
              strokeWidth="20"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
            {/* Thin progress track */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={thinStrokeColor}
              strokeWidth="3.5"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Inner White Card */}
          <div className="w-[190px] h-[190px] bg-white rounded-full shadow-[0_8px_35px_rgba(0,0,0,0.08)] flex items-center justify-center z-10 relative">
            <div
              className={`flex items-baseline justify-center ${timeLeft === 0 ? "text-[#ef4444]" : "text-[#111827]"}`}
            >
              <span className="text-[2.4rem] font-outfit font-black tracking-tighter leading-none">
                {minutes}:{seconds}
              </span>
              <span className="text-[1.1rem] font-outfit font-bold ml-1.5 tracking-tight">
                mins
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Status Text & Actions */}
        {timeLeft > 0 ? (
          <div className="text-center flex flex-col items-center animate-fade-in mt-2">
            <h2 className="text-[1.15rem] font-outfit font-bold text-gray-900 mb-2 tracking-wide">
              Waiting for Your Service Partner
            </h2>
            <p className="text-[0.95rem] font-outfit font-medium text-gray-400">
              We've notified your partner. Hang tight!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full animate-fade-in ">
            <div className="w-14 h-14 pb-2 rounded-full bg-red-500 flex items-center justify-center">
              <PiWarningFill className="text-white" size={32} />
            </div>
            <p className="text-center text-[0.95rem] font-outfit text-gray-800 font-medium leading-relaxed pb-2 max-w-[300px]">
              We couldn't confirm this partner's arrival. Please try another
              service partner within 10 km distance.
            </p>

            <div className="flex w-full space-x-4 mt-auto">
              <button className="flex-1 py-2.5 bg-white border-[1.5px] border-[#ef4444] text-[#ef4444] rounded-2xl font-outfit font-bold text-[1rem] hover:bg-red-50 transition-all active:scale-95">
                Cancel
              </button>
              <button className="flex-1 py-2.5 bg-[#8b5cf6] text-white rounded-2xl font-outfit font-bold text-[1rem] shadow-lg shadow-purple-500/25 hover:bg-[#7c3aed] transition-all active:scale-95">
                Next 10km
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
