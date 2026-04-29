'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { BsFillEyeSlashFill, BsFillEyeFill } from 'react-icons/bs'
import { RiUser3Line } from 'react-icons/ri'
import { LuLockKeyhole, LuMail } from 'react-icons/lu'
import { SiApple, SiGoogle } from 'react-icons/si'
import { ImCheckmark } from 'react-icons/im'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { Formik, Field, Form } from 'formik'
import * as Yup from 'yup'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import { parsePhoneNumber } from 'libphonenumber-js/min'
import 'react-phone-number-input/style.css'
import { sendOtp, registerUser, loginWith3rdUser } from '@/services/auth/auth'

const validatePhoneNumber = (phone: string | undefined) => {
  if (!phone) return 'Phone number is required'
  if (phone.length < 10) return 'Invalid number'
  try {
    if (!isValidPhoneNumber(phone)) return 'Invalid number'
  } catch {
    return 'Invalid number'
  }
  return ''
}

const SignUpValidations = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .test('phone-valid', 'Invalid number', function (value) {
      const error = validatePhoneNumber(value)
      return error === '' ? true : this.createError({ message: error })
    }),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  terms: Yup.boolean().oneOf([true], 'You must agree to the terms and conditions')
})

function SignupPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [showOtpSec, setShowOtpSection] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(180)
  const [isActive, setIsActive] = useState(false)
  const [uploadingData, setUploadingData] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    referral: string;
    terms: boolean;
  } | null>(null)
  const [otpText, setOtpText] = useState('')
  const [referralid, setreferralid] = useState('')
  const [isOtpLoading, setIsOtpLoading] = useState(false)
  const [isResendLoading, setIsResendLoading] = useState(false)
  const [screenWidth, setScreenWidth] = useState(0)


  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const params = searchParams
    setreferralid(params.get('referral_id') || '')
  }, [searchParams])

  useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isActive])

  const handleSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    referral: string;
    terms: boolean;
  }) => {
    try {
      setIsLoading(true)
      const phoneNumber = parsePhoneNumber(values.phone)
      const countryCode = phoneNumber?.countryCallingCode
      const nationalNumber = phoneNumber?.nationalNumber

      const send = await sendOtp({
        email: values.email,
        countryCode,
        phone: nationalNumber,
      })

      if (send.success) {
        toast.success(`${send.message}`)
        setShowOtpSection(true)
        setTimeLeft(180)
        setIsActive(true)
        setUploadingData(values)
        setOtpText(send.message)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleResendOtp = async () => {
    try {
      setIsResendLoading(true)
      if (!uploadingData) {
        toast.error('No user data found. Please try signing up again.')
        return
      }

      const phoneNumber = parsePhoneNumber(uploadingData.phone)
      const countryCode = phoneNumber?.countryCallingCode
      const nationalNumber = phoneNumber?.nationalNumber

      const send = await sendOtp({
        email: uploadingData.email,
        countryCode,
        phone: nationalNumber,
      })

      if (send.success) {
        toast.success('OTP resent successfully!')
        setTimeLeft(180)
        setIsActive(true)
        setOtp(['', '', '', '', '', ''])
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP'
      toast.error(errorMessage)
    } finally {
      setIsResendLoading(false)
    }
  }

  const handleOtpSubmit = async () => {
    try {
      setIsOtpLoading(true)

      if (!otp || otp.length === 0) {
        toast.error('OTP cannot be empty.')
        return
      }

      const otpCode = otp.join('')

      if (!uploadingData?.phone) {
        toast.error('Phone number is missing.')
        return
      }

      const phoneNumber = parsePhoneNumber(uploadingData.phone)
      if (!phoneNumber) {
        toast.error('Invalid phone number.')
        return
      }

      const countryCode = phoneNumber.countryCallingCode
      const nationalNumber = phoneNumber.nationalNumber

      const payload = {
        name: uploadingData.name || '',
        email: uploadingData.email || '',
        password: uploadingData.password || '',
        phone: nationalNumber,
        countryCode,
        country: 'India',
        OTP: otpCode,
        id: referralid
      }

      const result = await registerUser(payload)

      if (result?.success) {
        localStorage.setItem('refreshtoken', result?.refreshToken)
        toast.success(`${result.message}`)
        router.push('/auths')
      } else {
        throw new Error(result?.message || 'Registration failed')
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration'
      toast.error(errorMessage)
    } finally {
      setIsOtpLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
  }



  const handleGoogleSignUp = async (data: { credential?: string }) => {
    try {
      setIsLoading(true)
      const result = await loginWith3rdUser(data)

      if (result?.payload?.success) {
        localStorage.setItem('refreshtoken', result?.payload?.refreshToken)
        toast.success(result?.payload?.message || 'Loged!', {
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
        })
        router.push('/auths')
      } else {
        toast.error(result?.payload || 'Login failed')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="min-h-screen w-full flex xl:items-center md:justify-center bg-white lg:bg-transparent">
        <div className="md:grid grid-cols-1 lg:grid-cols-2 gap-0 bg-[var(--primary-color)] relative">
          <div className="relative bg-[#3D155F] hidden lg:block p-10 overflow-hidden">
            <div className="flex">
              <div className="h-full w-full cursor-pointer focus:outline-none flex gap-4 items-center">
                <img
                  loading="lazy"
                  src="/logo/logo.webp"
                  className="h-10 w-10"
                  alt="Seclob Logo"
                />
                <p className="text-2xl font-bold text-white">Seclob</p>
              </div>
            </div>

            <div className="w-full h-full flex justify-center items-center">
              <img
                loading="lazy"
                src="/assets/auth/10.webp"
                alt="3D Network Illustration"
                className="w-[60%] h-[60%]"
              />
            </div>
          </div>

          <div className="flex h-full items-center justify-center bg-white p-4 md:p-8 relative overflow-hidden">
            {/* OTP Section */}
            <div
              className={`absolute top-0 right-0 h-full w-full bg-white transition-all duration-500 ease-in-out ${showOtpSec ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
              <div className="w-full h-full flex flex-col justify-center items-center">
                <div className="w-fit">
                  <div className="text-center space-y-2 mb-8">
                    <h1 className="md:text-2xl font-bold text-gray-800">
                      Enter verification code
                    </h1>
                    <p className="text-gray-600 md:text-base text-sm">{otpText}</p>
                  </div>

                  <div className="mb-4 text-center w-full flex justify-between items-center text-sm font-semibold text-red-500">
                    <p>{formatTime(timeLeft)}</p>
                    <button
                      onClick={handleResendOtp}
                      className="text-[var(--primary-color)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      disabled={timeLeft > 0 || isResendLoading}
                    >
                      {isResendLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                  </div>

                  <div className="flex md:gap-4 gap-2 mb-8">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="md:w-12 w-10 h-10 md:h-12 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleOtpSubmit}
                    disabled={isOtpLoading}
                    className="w-full md:py-2 py-2 bg-[#3D155F] text-white font-semibold rounded-lg transition-colors disabled:opacity-70"
                  >
                    {isOtpLoading ? 'Verifying...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>

            {/* Signup Form */}
            <div
              className={`w-full flex flex-col justify-center max-w-lg space-y-4 transition-all duration-500 ease-in-out ${showOtpSec ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
            >
              <div className="md:flex md:flex-col space-y-5">
                <div className="lg:hidden space-y-3">
                  <div className="h-full w-full cursor-pointer focus:outline-none flex gap-4 items-center">
                    <img
                      loading="lazy"
                      src="/logo/logo.webp"
                      className="h-10 w-10"
                      alt="Seclob Logo"
                    />
                    <p className="text-4xl font-bold text-[#3D155F]">Seclob</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl hidden md:block font-semibold text-black">Sign up</h2>
                  <div className="md:hidden block">
                    <h3 className="text-2xl font-semibold">Welcome to seclob</h3>
                    <p className="w-[90%] text-gray-500 text-[12px]">
                      Lorem ipsum dolor, sit hhjjkhjkjjkhkjhkjhjhjk jkkhhaofficia explicabooluptatibus voluptate doloremque
                    </p>
                  </div>
                </div>
              </div>

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  phone: '',
                  password: '',
                  confirmPassword: '',
                  referral: referralid,
                  terms: false,
                }}
                validationSchema={SignUpValidations}
                onSubmit={async (values, { setSubmitting, setFieldError }) => {
                  try {
                    await SignUpValidations.validate(values, { abortEarly: false })
                  } catch (error: unknown) {
                    if (error && typeof error === 'object' && 'inner' in error) {
                      const validationError = error as { inner?: Array<{ path: string; message: string }> }
                      validationError.inner?.forEach((err) => {
                        setFieldError(err.path, err.message)
                      })
                      const firstError = validationError.inner?.[0]?.message
                      if (firstError) toast.error(firstError)
                      setSubmitting(false)
                      return
                    }
                  }

                  const phoneError = validatePhoneNumber(values.phone)
                  if (phoneError) {
                    setFieldError('phone', phoneError)
                    toast.error(phoneError)
                    setSubmitting(false)
                    return
                  }

                  await handleSubmit(values)
                  setSubmitting(false)
                }}
              >
                {({ errors, touched, values, setFieldValue, setFieldError, isSubmitting }) => (
                  <Form className="md:space-y-2 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-700 md:flex hidden">Name</label>
                      {errors.name && touched.name && (
                        <span className="text-red-500 text-xs"> - {errors.name}</span>
                      )}
                      <div className="relative w-full">
                        <RiUser3Line className="absolute text-base left-3 top-1/2 transform -translate-y-1/2 text-black text-extrabold" />
                        <Field
                          name="name"
                          placeholder="Enter your name"
                          className="w-full pl-10 rounded-md bg-[#f2f2f2] text-black border-none px-3 py-2 focus:outline-none focus:ring-[0.5px] focus:ring-[var(--second-primary-blue)] focus:border-[var(--second-primary-blue)] placeholder-gray-700 placeholder:text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-700 md:flex hidden">Email</label>
                      {errors.email && touched.email && (
                        <span className="text-red-500 text-xs"> - {errors.email}</span>
                      )}
                      <div className="relative w-full">
                        <LuMail className="absolute left-3 text-base top-1/2 transform -translate-y-1/2 text-black text-extrabold" />
                        <Field
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          className="w-full rounded-md pl-10 bg-[#f2f2f2] text-black border-none px-3 py-2 focus:outline-none focus:ring-[0.5px] focus:ring-[var(--second-primary-blue)] focus:border-[var(--second-primary-blue)] placeholder-gray-700 placeholder:text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-700 md:flex hidden">Phone Number</label>
                      {errors.phone && touched.phone && (
                        <span className="text-red-500 text-xs"> - {errors.phone}</span>
                      )}
                      <div className="relative">
                        <PhoneInput
                          international
                          defaultCountry="IN"
                          value={values.phone}
                          onChange={(value) => {
                            setFieldValue('phone', value)
                            if (errors.phone && value) {
                              const phoneError = validatePhoneNumber(value)
                              if (phoneError === '') {
                                setFieldError('phone', undefined)
                              } else if (value && value.length >= 10) {
                                setFieldError('phone', phoneError)
                              }
                            }
                          }}
                          placeholder="Enter your phone number"
                          className="w-full pl-3 rounded-md text-black border-none bg-[#f2f2f2] focus:outline-none focus:ring-[0.5px] focus:ring-[var(--second-primary-blue)] focus:border-[var(--second-primary-blue)] placeholder-gray-700 placeholder:text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-700 md:flex hidden">Password</label>
                      {errors.password && touched.password && (
                        <span className="text-red-500 text-xs"> - {errors.password}</span>
                      )}
                      <div className="relative w-full">
                        <LuLockKeyhole className="absolute left-3 top-1/2 transform text-base -translate-y-1/2 text-black text-extrabold" />
                        <Field
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="w-full pl-10 rounded-md bg-[#f2f2f2] text-black border-none px-3 py-2 focus:outline-none focus:ring-[0.5px] focus:ring-[var(--second-primary-blue)] focus:border-[var(--second-primary-blue)] placeholder-gray-700 placeholder:text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-3 cursor-pointer flex items-center text-black"
                        >
                          {showPassword ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 relative">
                      <label className="text-xs text-gray-700 md:flex hidden">Confirm Password</label>
                      {errors.confirmPassword && touched.confirmPassword && (
                        <span className="text-red-500 text-xs"> - {errors.confirmPassword}</span>
                      )}
                      <div className="relative w-full">
                        <LuLockKeyhole className="absolute left-3 top-1/2 transform text-base -translate-y-1/2 text-black text-extrabold" />
                        <Field
                          name="confirmPassword"
                          type={confirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          className="w-full pl-10 rounded-md bg-[#f2f2f2] border-none text-black px-3 py-2 focus:outline-none focus:ring-[0.5px] focus:ring-[var(--second-primary-blue)] focus:border-[var(--second-primary-blue)] placeholder-gray-700 placeholder:text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setConfirmPassword(!confirmPassword)}
                          className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-black"
                        >
                          {confirmPassword ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
                        </button>
                      </div>
                    </div>

                    {referralid && (
                      <div className="space-y-2">
                        <label className="text-xs text-gray-700 md:flex hidden">Referral Id</label>
                        <div className="relative w-full">
                          <RiUser3Line className="absolute text-base left-3 top-1/2 transform -translate-y-1/2 text-black text-extrabold" />
                          <Field
                            name="referral"
                            value={referralid}
                            className="w-full pl-10 rounded-md bg-[#f2f2f2] text-black border-none px-3 py-2 focus:outline-none focus:ring-[0.5px] focus:ring-[var(--second-primary-blue)] focus:border-[var(--second-primary-blue)] placeholder-gray-700 placeholder:text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs text-gray-700 md:flex hidden">
                        Terms and Conditions
                        {errors.terms && touched.terms && (
                          <span className="text-red-500"> - {errors.terms}</span>
                        )}
                      </label>
                      <div
                        onClick={() => {
                          setIsChecked(!isChecked)
                          setFieldValue('terms', !isChecked)
                        }}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            backgroundColor: isChecked ? '#7722FF' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {isChecked && (
                            <span className="text-white text-xs">
                              <ImCheckmark />
                            </span>
                          )}
                        </div>
                        <label className="text-xs text-[#85868B] cursor-pointer">
                          By signing in, you agree to our{' '}
                          <Link href="/privacy-policy">
                            <span className="text-[var(--primary-color)] underline text-xs">
                              Privacy Policy{' '}
                            </span>
                          </Link>
                          and{' '}
                          <Link href="/terms-conditions">
                            <span className="text-[var(--primary-color)] underline text-xs">
                              Terms and Conditions
                            </span>
                          </Link>{' '}
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full text-sm relative transition-colors rounded-md text-white py-2 px-4"
                      style={{
                        background: '#3D155F',
                        opacity: (isLoading || isSubmitting || !values.name || !values.email || !values.phone || !values.password || !values.confirmPassword || !values.terms) ? 0.7 : 1,
                      }}
                      disabled={isLoading || isSubmitting || !values.name || !values.email || !values.phone || !values.password || !values.confirmPassword || !values.terms}
                    >
                      {(isLoading || isSubmitting) ? 'Processing...' : 'Sign Up'}
                    </button>

                    <div className="w-full mt-auto">
                      <div className="hidden sm:flex items-center w-full">
                        <hr className="flex-grow border-t border-gray-300" />
                        <span className="px-3 text-black font-semibold text-xs">OR</span>
                        <hr className="flex-grow border-t border-gray-300" />
                      </div>

                      <div className="flex items-center justify-center w-full sm:hidden">
                        <span className="px-3 text-gray-400 text-xs font-semibold">
                          Or Create With
                        </span>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>

              <div className="w-full flex justify-center md:gap-4 gap-3 px-2">
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
                  <div className="w-full flex justify-center md:gap-4 gap-3 mt-4 px-2">
                    <GoogleLogin
                      type={screenWidth < 786 ? 'icon' : 'standard'}
                      width={screenWidth < 786 ? undefined : 200}
                      onSuccess={(credentialResponse) => {
                        if (credentialResponse?.credential) {
                          const decodedToken = jwtDecode(credentialResponse.credential) as { sub?: string; email?: string }
                          const userDetails = {
                            password: decodedToken?.sub,
                            email: decodedToken?.email,
                            app: 'google',
                            credential: credentialResponse.credential
                          }
                          handleGoogleSignUp(userDetails)
                        }
                      }}
                    />

                    <button className="flex py-[19px] border justify-center cursor-pointer items-center w-10 md:h-10 h-8 md:w-1/3 gap-3 text-lg border-gray-300 rounded-md">
                      <span className="md:text-xl text-2xl">
                        <SiApple />
                      </span>
                      <span className="hidden md:inline text-sm font-semibold text-gray-700">Apple</span>
                    </button>
                  </div>
                </GoogleOAuthProvider>

                
              </div>

              <div className="flex justify-center pt-3">
                <p className="text-black text-xs">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-[var(--primary-color)] text-sm font-bold"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  )
}