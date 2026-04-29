"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Cookies from "js-cookie"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function AuthContent() {
    const searchParams = useSearchParams()
    const refreshToken = searchParams.get('refreshtoken')||localStorage.getItem('refreshtoken')
    // const refreshToken = 'c1c5549afadf481637bc4f2c41d4a1294b5d148e413378f78ed1690f8ae112446959b95347a11534'
    const country = searchParams.get('country')
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const city = searchParams.get('city')
    // const city = 'kozhikode'
    const regionName = searchParams.get('regionName')

    useEffect(() => {
        // Store location data
        if (typeof window !== 'undefined') {
            if (country) localStorage.setItem('country', country)
            if (lat) localStorage.setItem('lat', lat)
            if (lon) localStorage.setItem('lon', lon)
            if (city) localStorage.setItem('city', city)
            if (regionName) localStorage.setItem('regionName', regionName)
        }
        const handleAuth = async () => {
            if (!refreshToken) return

            try {
                const response = await fetch('https://apigateway.seclob.com/v1/user-no/auth/token-refresh-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refreshToken: refreshToken
                    })
                })

                const data = await response.json()

                if (data.success) {
                    // Store all data in localStorage and cookies
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('accessToken', data.accessToken)
                        localStorage.setItem('token', data.accessToken)
                        localStorage.setItem('refreshtoken', data.refreshToken)
                        localStorage.setItem('unique_id', data.unique_id)
                        localStorage.setItem('email', data.email)
                        localStorage.setItem('phone', data.phone)
                        localStorage.setItem('userId', data.userId)
                        localStorage.setItem('name', data.name)
                        
                        // Set cookies for AxiosConfig
                        Cookies.set('token', data.accessToken, { path: '/' })
                        Cookies.set('refreshtoken', data.refreshToken, { path: '/' })
                        
                        // Navigate to home on success
                        window.location.href = '/'
                    }
                } else {
                    // Navigate to seclob.com on failure
                    if (typeof window !== 'undefined') {
                        window.location.href = 'https://www.seclob.com/login'
                    }
                }
            } catch (error) {
                if (typeof window !== 'undefined') {
                    window.location.href = 'https://www.seclob.com/login'
                }
            }
        }

        handleAuth()
    }, [refreshToken, country, lat, lon, city, regionName])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                {/* <p className="mt-4">Authenticating...</p> */}
            </div>
        </div>
    )
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    {/* <p className="mt-4">Loading...</p> */}
                </div>
            </div>
        }>
            <AuthContent />
        </Suspense>
    )
}