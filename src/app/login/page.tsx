'use client'

import { IoArrowBack } from 'react-icons/io5'
import { LuUser, LuLockKeyhole } from 'react-icons/lu'
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs'
import { ImCheckmark } from 'react-icons/im'
import { SiApple } from 'react-icons/si'
import { useState, FormEvent, useEffect } from 'react'
import { loginUser, loginWith3rdUser } from '@/services/auth/auth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import Link from 'next/link'


export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isChecked, setIsChecked] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)
    const [screenWidth, setScreenWidth] = useState(0)

    const router = useRouter()

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth)
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const emailOrPhone = formData.get('emailOrPhone') as string
        const password = formData.get('password') as string

        if (!emailOrPhone || !password) {
            toast.error('Please fill in all fields')
            return
        }

        try {
            setIsLoading(true)
            setIsButtonDisabled(true)
            setTimeout(() => setIsButtonDisabled(false), 3000)

            // Determine if input is email or phone
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            const isEmail = emailRegex.test(emailOrPhone)

            const payload = isEmail
                ? { email: emailOrPhone, password }
                : { phone: emailOrPhone, password }

            const result = await loginUser(payload)

            if (result) {
                localStorage.setItem('refreshtoken', result.refreshToken)
                toast.success('Login successful!', {
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
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
                : error instanceof Error ? error.message : 'Login failed';
            toast.error(errorMessage || 'Login failed', {
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
            })
        } finally {
            setIsLoading(false)
        }
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
        <div className="min-h-screen pt-8 w-full flex xl:items-center xl:justify-center bg-white lg:bg-transparent">
            <div className="w-full max-w-screen-xl md:grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* Left Section (Hidden on Mobile) */}
                <div className="relative hidden lg:flex p-10 overflow-hidden bg-[#3D155F] flex-col min-h-screen" style={{ backgroundColor: '#3D155F', minHeight: '100vh' }}>
                    <div className="absolute w-16 h-16 left-8 top-4">
                        <button
                            className="h-full w-full cursor-pointer focus:outline-none flex gap-4 items-center"
                            aria-label="Navigate to Home"
                        >
                            <img
                                loading="lazy"
                                src="/logo/logo.webp"
                                className="h-12 w-12"
                                alt="MP"
                            />
                            <p className="text-2xl font-bold text-white">Seclob</p>
                        </button>
                    </div>

                    <div className="w-full h-full flex justify-center items-center">
                        <img
                            loading="lazy"
                            src="/assets/auth/16.webp"
                            alt="3D Network Illustration"
                            className="w-[60%] h-[60%]"
                        />
                    </div>
                </div>

                {/* Right Section (Login Form) */}
                <div className="flex flex-col h-full md:items-center place-items-center md:justify-center justify-start bg-white p-4 md:p-8">
                    {/* Mobile Top Arrow Button */}
                    <button
                        className="md:hidden absolute top-2 left-2 p-1 text-gray-600 hover:text-gray-800"
                        aria-label="Back to Home"
                    >
                        <IoArrowBack size={24} />
                    </button>

                    <div className="w-full max-w-md md:space-y-7 space-y-3 md:mt-0 mt-8">
                        <div className="space-y-3">
                            <div className="md:hidden">
                                <button
                                    className="h-full w-full cursor-pointer focus:outline-none flex gap-4 items-center"
                                    aria-label="Navigate to Home"
                                >
                                    <img
                                        loading="lazy"
                                        src="/logo/logo.webp"
                                        className="h-10 w-10"
                                        alt="MP"
                                    />
                                    <p className="text-4xl font-bold text-[#3D155F]">Seclob</p>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl md:text-3xl font-semibold text-black">Login</h2>
                                <p className="text-gray-800 font-semibold text-sm md:text-base">
                                    Don&apos;t have an account?{' '}
                                    <Link
                                        href='/signup'
                                        className="cursor-pointer text-sm font-bold"
                                        style={{ color: 'var(--primary-color, #3D155F)' }}
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <form className="md:space-y-4 space-y-6" onSubmit={handleSubmit}>
                            {/* Email or Phone Input */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-900 hidden md:flex" htmlFor="emailOrPhone">
                                    Email or Phone{' '}
                                </label>
                                <div className="relative w-full">
                                    <LuUser className="absolute left-3 text-base top-1/2 transform -translate-y-1/2 text-black text-extrabold" />
                                    <input
                                        id="emailOrPhone"
                                        name="emailOrPhone"
                                        type="text"
                                        placeholder="Enter your email or phone number"
                                        className="w-full rounded-md pl-10 py-3 bg-[#f2f2f2] text-black border-none px-3 md:py-2 focus:outline-none focus:ring-[0.5px] focus:ring-[var(--second-primary-blue)] focus:border-[var(--second-primary-blue)] placeholder-gray-500 placeholder:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-800 hidden md:flex" htmlFor="password">
                                    Password{' '}
                                </label>
                                <div className="relative w-full">
                                    <LuLockKeyhole className="absolute text-base left-3 top-1/2 transform -translate-y-1/2 text-black text-extrabold" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        className="w-full rounded-md pl-10 py-3 bg-[#f2f2f2] text-black border-none px-3 md:py-2 focus:outline-none focus:ring-[0.5px] focus:ring-[var(--second-primary-blue)] focus:border-[var(--second-primary-blue)] placeholder-gray-500 placeholder:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute cursor-pointer inset-y-0 right-3 flex items-center text-black-200"
                                    >
                                        {showPassword ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="space-y-2">
                                <div
                                    onClick={() => setIsChecked(!isChecked)}
                                    className="flex items-center space-x-2"
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
                                            <span style={{ fontSize: '9px' }} className="text-white">
                                                <ImCheckmark />
                                            </span>
                                        )}
                                    </div>
                                    <label htmlFor="terms" className="text-xs space-x-2 text-[#85868B]">
                                        Remember Me
                                    </label>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isLoading || isButtonDisabled}
                                className="w-full rounded-md text-white py-2 text-sm px-4 disabled:opacity-50"
                                style={{
                                    background: 'var(--gradient-style, linear-gradient(135deg, #4802B9, #7722FF))',
                                }}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div className="w-full mt-auto">
                            <div className="hidden sm:flex items-center w-full">
                                <hr className="flex-grow border-t border-gray-300" />
                                <span className="px-3 text-black text-xs font-semibold">OR</span>
                                <hr className="flex-grow border-t border-gray-300" />
                            </div>

                            <div className="flex items-center justify-center w-full sm:hidden">
                                <span className="px-3 text-gray-400 text-xs font-semibold">
                                    Or Log In With
                                </span>
                            </div>

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

                            {/* Forgot Password Link */}
                            <div className="flex justify-center items-center mt-4 mb-8">
                                <p className="text-gray-500 text-xs">
                                    Forgot your password?{' '}
                                    <a
                                        className="text-xs cursor-pointer"
                                        style={{ color: 'var(--second-primary-blue, #3D155F)' }
                                    }
                                    onClick={() => router.push('/forgot-pass')}
                                    >
                                        Reset Password
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}