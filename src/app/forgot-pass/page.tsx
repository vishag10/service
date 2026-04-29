'use client';

import React, { useEffect, useRef, useState } from "react";
import { Formik, Field, Form } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { LuLockKeyhole } from "react-icons/lu";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { forgetPassword , verifyOtp, updatePassword } from "@/services/auth/auth";
import * as Yup from 'yup';

interface PhoneSubmitValues {
  phone: string;
  countryCode: string;
}

interface PasswordSubmitValues {
  newPassword: string;
  confirmPassword: string;
}

interface CountryData {
  dialCode: string;
}

interface StepProps {
  handlePhoneSubmit?: (values: PhoneSubmitValues) => void;
  handlePasswordSubmit?: (values: PasswordSubmitValues) => void;
  handleOtpSubmit?: (otp: string) => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
  otpText?: string;
  start?: boolean;
  setStart?: (start: boolean) => void;
  setStep?: (step: number) => void;
}

const forgotPassValidation = Yup.object({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required')
});

const ForgotPass = () => {
  const [step, setStep] = useState(1);
  const sectionRef = useRef(null);
  const router = useRouter();
  const [otpText, setOtpText] = useState("");
  const [sectionVisible, setSectionVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true);
        } else {
          setSectionVisible(false);
        }
      },
      { threshold: 0.0 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handlePhoneSubmit = async (values: { phone: string; countryCode: string }) => {
    try {
      setIsLoading(true);

      const result = await forgetPassword(values);
      
      if (result) {
        toast.success(`${result.message}`, {
          style: {
            background: "rgba(0, 255, 0, 0.15)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#4ade80",
            padding: "16px 24px",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            fontWeight: "500",
          },
          iconTheme: {
            primary: "white",
            secondary: "rgba(74, 222, 128, 0.7)",
          },
        });
        setOtpText(result.message);
        localStorage.setItem("Phone", values.phone);
        localStorage.setItem("CountryCode", values.countryCode);
        setIsLoading(false);
        setStep(2);
        setIsActive(true);
      }
    } catch (error: unknown) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage, {
        style: {
          background: "rgba(255, 0, 0, 0.15)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "red",
          padding: "16px 24px",
          borderRadius: "16px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          fontWeight: "20px",
        },
        iconTheme: {
          primary: "white",
          secondary: "rgba(255, 0, 0, 0.7)",
        },
      });
    }
  };

  const handlePasswordSubmit = async (values: { newPassword: string }) => {
    setIsLoading(true);

    const { newPassword } = values;
    const phone = localStorage.getItem("Phone");
    const countryCode = localStorage.getItem("CountryCode");
    const verifiedOTP = localStorage.getItem("verifiedOTP");

    try {
      const payload = {
        password: newPassword,
        phone: phone!,
        countryCode: countryCode!,
        OTP: verifiedOTP!
      };
      const result = await updatePassword(payload);
      if (result && result.success) {
        toast.success("Password changed successfully!");
        setStep(4);
        localStorage.removeItem("Phone");
        localStorage.removeItem("CountryCode");
        localStorage.removeItem("verifiedOTP");
        setIsLoading(false);
      } else {
        toast.error("Something went wrong!");
        setStep(5);
        localStorage.removeItem("Phone");
        localStorage.removeItem("CountryCode");
        localStorage.removeItem("verifiedOTP");
        setIsLoading(false);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      localStorage.removeItem("Phone");
      localStorage.removeItem("CountryCode");
      localStorage.removeItem("verifiedOTP");
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (values: string) => {
    try {
      const phone = localStorage.getItem("Phone");
      const countryCode = localStorage.getItem("CountryCode");
      const payload = { phone: phone!, countryCode: countryCode!, OTP: values };
      const checkOtp = await verifyOtp(payload);
      if (checkOtp.success) {
        localStorage.setItem("verifiedOTP", values);
        
        setStep(3);
        toast.success(`${checkOtp.message}`, {
          style: {
            background: "rgba(0, 255, 0, 0.15)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#4ade80",
            padding: "16px 24px",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            fontWeight: "500",
          },
          iconTheme: {
            primary: "white",
            secondary: "rgba(74, 222, 128, 0.7)",
          },
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during OTP submission';
      toast.error(
        errorMessage,
        {
          style: {
            background: "rgba(255, 0, 0, 0.15)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "red",
            padding: "16px 24px",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            fontWeight: "bold",
          },
          iconTheme: {
            primary: "white",
            secondary: "rgba(255, 0, 0, 0.7)",
          },
        }
      );
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 gap-0">
      <div
        className="relative hidden lg:block p-10 overflow-hidden"
        style={{ background: "#3D155F" }}
      >
        <div className="w-full h-full flex justify-center items-center ">
          <img
            loading="lazy"
            src="/assets/auth/6 (2).webp"
            alt="3D Network Illustration"
            className="w-[60%] h-[60%] "
          />
        </div>
      </div>

      <div className="flex h-screen items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-7">
          {step === 1 && (
            <Step1
              handlePhoneSubmit={handlePhoneSubmit}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}
          {step === 2 && (
            <Step2
              handleOtpSubmit={handleOtpSubmit}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              otpText={otpText}
              start={isActive}
              setStart={setIsActive}
            />
          )}
          {step === 3 && (
            <Step3
              handlePasswordSubmit={handlePasswordSubmit}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}
          {step === 4 && <SuccessStep setStep={setStep} />}
          {step === 5 && <FailureStep setStep={setStep} />}
        </div>
      </div>
    </div>
  );
};

const Step1 = ({ handlePhoneSubmit, setIsLoading, isLoading }: StepProps) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    handlePhoneSubmit?.({ phone: phone.slice(countryCode.length), countryCode });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex py-3 gap-3">
        <img src="/logo/logo.webp" className="w-10" alt="Seclob Logo" />
        <p className="font-bold text-4xl text-#7722FF">
          Seclob
        </p>
      </div>
      <h2 className="text-xl font-semibold text-black">Forgot Password</h2>
      <p className="text-gray-700">
        Need a password reset? Just input your phone number.
      </p>
      <div>
        <label className="text-sm text-gray-800">
          Phone Number{" "}
          {error && (
            <span className="text-red-500"> - {error}</span>
          )}
        </label>
        <PhoneInput
          country={'in'}
          value={phone}
          onChange={(value, country: CountryData) => {
            setPhone(value);
            setCountryCode(country.dialCode);
          }}
          inputStyle={{
            width: '100%',
            height: '48px',
            backgroundColor: '#f2f2f2',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            paddingLeft: '48px'
          }}
          containerStyle={{
            width: '100%'
          }}
          buttonStyle={{
            backgroundColor: '#f2f2f2',
            border: 'none',
            borderRadius: '6px 0 0 6px'
          }}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-md text-white py-3 px-4"
        style={{
          background: "#7722FF",
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
              ></path>
            </svg>
            Loading...
          </span>
        ) : (
          "Send SMS"
        )}
      </button>
    </form>
  );
};

const Step2 = ({ handleOtpSubmit, otpText, setStart, start }: StepProps) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!start) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [start]);

  useEffect(() => {
    if (timeLeft === 0 && start) {
      setStart?.(false);
    }
  }, [timeLeft, start, setStart]);

  const handleResend = async () => {
    setIsResending(true);
    const phone = localStorage.getItem("Phone");
    const countryCode = localStorage.getItem("CountryCode");
    const send = await forgetPassword({ phone: phone!, countryCode: countryCode! });
    if (send.success) {
      setTimeLeft(180);
      setStart?.(true);
      toast.success(`OTP Resended`, {
        style: {
          background: "rgba(0, 255, 0, 0.15)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#4ade80",
          padding: "16px 24px",
          borderRadius: "16px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "white",
          secondary: "rgba(74, 222, 128, 0.7)",
        },
      });
    } else {
      toast.error("Please Try Again", {
        style: {
          background: "rgba(255, 0, 0, 0.15)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "red",
          padding: "16px 24px",
          borderRadius: "16px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          fontWeight: "20px",
        },
        iconTheme: {
          primary: "white",
          secondary: "rgba(255, 0, 0, 0.7)",
        },
      });
    }
    setIsResending(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
    }
  };

  return (
    <div className="h-full w-full  bg-white ">
      <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="w-fit">
          <div className="text-center space-y-2 mb-8">
            <h1 className="md:text-2xl font-semibold text-gray-800">
              Enter verification code
            </h1>
            <p className="text-gray-600 md:text-base text-sm">{otpText}</p>
          </div>

          <div className="mb-4 text-center  w-full flex justify-between items-centertext-sm font-semibold text-red-500">
            <p>{formatTime(timeLeft)}</p>

            <button
              onClick={handleResend}
              className="text-#7722FF font-semibold flex items-center"
              disabled={
                (formatTime(timeLeft) !== null && formatTime(timeLeft) > "0:00") || isResending
              }
            >
              {isResending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Resend Code"
              )}
            </button>
          </div>

          <div className="flex md:gap-4 gap-2 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete="nope"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                name={`otp-field-${Math.random()}`}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={(e) => e.target.setAttribute('autocomplete', 'off')}
                className="md:w-12 w-10 h-10 md:h-12 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-#7722FF focus:border-transparent"
              />
            ))}
          </div>

          <button
            onClick={() => handleOtpSubmit?.(otp.join(""))}
            className="w-full md:py-3 py-2 bg-[#7722FF] text-white font-semibold rounded-lg transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const Step3 = ({ handlePasswordSubmit, isLoading }: StepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPassword((prevState) => !prevState);
  };

  return (
    <div className="mx-auto max-w-screen-xl">
      <Formik
        initialValues={{ newPassword: "", confirmPassword: "" }}
        validationSchema={forgotPassValidation}
        onSubmit={(values) => handlePasswordSubmit?.(values)}
      >
        {({ errors, touched }) => (
          <Form className="space-y-4">
            <div className="flex  gap-3">
              <img src="/logo/logo.webp" className="w-10" alt="Seclob Logo" />
              <p className="font-bold text-4xl text-#7722FF">
                Seclob
              </p>
            </div>
            <h2 className="text-2xl font-semibold text-black">Reset Password</h2>
            <p className="text-gray-800">Enter your new password below.</p>
            <div>
              <label className="text-sm text-gray-800" htmlFor="password">
                New Password{" "}
                {errors.newPassword && touched.newPassword && (
                  <span className="text-red-500"> - {errors.newPassword}</span>
                )}
              </label>

              <div className="relative">
                <div className="relative w-full">
                  <LuLockKeyhole className="absolute left-3 text-xl top-1/2 transform -translate-y-1/2 text-black text-extrabold" />

                  <Field
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full rounded-md bg-[#f2f2f2] pl-10 text-black border-none px-3 py-3 focus:outline-none focus:ring-[0.5px] focus:ring-[var(--second-primary-blue)] focus:border-[var(--second-primary-blue)] placeholder-gray-700 placeholder:text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 cursor-pointer right-3 flex items-center text-gray-800 "
                  >
                    {showPassword ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-800" htmlFor="terms">
                Confirm Password{" "}
                {errors.confirmPassword && touched.confirmPassword && (
                  <span className="text-red-500">
                    {" "}
                    - {errors.confirmPassword}
                  </span>
                )}
              </label>

              <div className="relative">
                <div className="relative w-full">
                  <LuLockKeyhole className="absolute left-3 text-xl top-1/2 transform -translate-y-1/2 text-black text-extrabold" />

                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type={confirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full rounded-md pl-10 bg-[#f2f2f2] border-none text-black px-3 py-3 focus:outline-none focus:ring-[0.5px] focus:ring-[var(--second-primary-blue)] focus:border-[var(--second-primary-blue)] placeholder-gray-700 placeholder:text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute cursor-pointer inset-y-0 right-3 flex items-center text-gray-800 "
                  >
                    {confirmPassword ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-md text-white py-3 px-4"
              style={{
                background: "#7722FF",
                opacity: isLoading ? 0.5 : 1,
                pointerEvents: isLoading ? "none" : "auto",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const SuccessStep = ({ setStep }: StepProps) => {
  const router = useRouter();
  const handleNavigateToSignUp = () => {
    setStep?.(1);
    router.push("/login");
  };
  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <img
            loading="lazy"
            src="/assets/auth/verify.webp"
            alt="Success"
            className="w-16 h-16"
          />
        </div>
        <h2 className="text-xl font-bold text-black">
          Password Updated Successfully
        </h2>
        <p className="text-gray-800">
          Your password has been changed. Please use your new password to log in.
        </p>
        <button
          onClick={handleNavigateToSignUp}
          className="w-full cursor-pointer rounded-md text-white py-3 px-4"
          style={{ background: "#7722FF" }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

const FailureStep = ({ setStep }: StepProps) => {
  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <img
            loading="lazy"
            src="/images/signup/failuer.webp"
            alt="Failure"
            className="w-16 h-16"
          />
        </div>
        <h2 className="text-xl font-bold text-black">Password Changing Failed</h2>
        <p className="text-gray-800">
          There&apos;s a temporary problem with the service. Please try again later.
        </p>
        <button
          onClick={() => setStep?.(1)}
          className="w-full cursor-pointer rounded-md text-white  bg-re py-2 px-4"
          style={{ background: "var(--gradient-style)" }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ForgotPass;