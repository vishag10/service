'use client'
import { partnerSearch } from '@/services/commonapi/commonApi'
import Image from 'next/image'
import React, { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { showToast } from '@/utils/toast'
import { getErrorMessage } from '@/services/ErrorHandle'

function Partnersearch() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      const response = await partnerSearch(formData);
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Success!',
          message: response.message
        });
        setFormData({ name: '', email: '', phone: '', address: '' });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error!',
        message: getErrorMessage(error)
      });
    }
  }
  return (
     <div className="w-full min-h-[730px] lg:h-[730px] bg-[#782FF8] bg-[url('/assets/partner/bgpartner.png')] bg-cover bg-center bg-blend-overlay relative">
      <div className="flex flex-col lg:flex-row items-center justify-between px-4 sm:px-8 lg:px-20 h-full py-8 lg:py-0">
        {/* Left Content */}
        <div className="flex-1 max-w-lg z-10 flex flex-col justify-between h-full lg:py-10 mb-8 lg:mb-0 relative">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight text-center lg:text-left">
              Join Our Delivery Team &<br />
              Start Earning Today
            </h1>
            
            <p className="text-base lg:text-lg text-white/90 mb-6 lg:mb-10 leading-relaxed text-center lg:text-left">
              Drive growth and scale your business by helping customers build and
              automate anything with Make.
            </p>
          </div>

          {/* People Illustration */}
          <div className="w-full h-96 hidden lg:block absolute bottom-0 left-0">
            <Image 
              src="/assets/partner/people.png" 
              alt="Two people shaking hands"
              width={400}
              height={384}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 w-full max-w-lg lg:w-[450px] shadow-2xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Enter Your Details to Get Started
          </h2>
          
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <PhoneInput
                country={'in'}
                value={formData.phone}
                onChange={(phone) => setFormData({ ...formData, phone })}
                inputStyle={{
                  width: '100%',
                  height: '48px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  paddingLeft: '48px'
                }}
                containerStyle={{
                  width: '100%'
                }}
                buttonStyle={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px 0 0 8px',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your address"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg mt-6"
            >
              Get in touch
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Partnersearch