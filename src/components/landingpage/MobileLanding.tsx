import React, { useState, useEffect, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import Image from "next/image";
import MobileHeader from "../header/MobileHeader";
import MobileSegment from "../segments/MobileSegment";
import Mobilebanner from "../banner/Mobilebanner";
import MostBooked from "../mobile/MostBooked";
import Popular from "../mobile/Popular";
import Services from "../mobile/Services";
import Refer from "../mobile/Refer";
import Mobilefooter from "../footer/Mobilefooter";
import { onSearch } from "@/services/commonapi/commonApi";
import OffersDeals from "../mobile/OffersDeals";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

interface SearchCategory {
  id: string;
  name: string;
  image?: string;
}

interface SearchSubcategory {
  id: string;
  name: string;
  image?: string;
  unique_id: string;
  category?: { name: string };
}

interface SearchResults {
  category?: { categories: SearchCategory[] };
  subcategory?: { subCategories: SearchSubcategory[] };
}

const MobileLanding = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null,
  );
  const [openIndex, setOpenIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const searchRef = useRef<HTMLDivElement>(null);
  const faqs = [
    {
      question: "What are some of the services offered by Seclob?",
      answer:
        "Seclob has varied home maintenance services that have been verified.",
    },
    {
      question: "Do the service professionals have been verified?",
      answer:
        "All the Seclob staffs are, yes, verified and trained professionals.",
    },
    {
      question: "How can I book a service?",
      answer:
        "reservation is easy through the Seclob mobile application or web site.",
    },
    {
      question: "Does it have a satisfaction guarantee?",
      answer:
        "Yes, Seclob does quality work and satisfies customers every time.",
    },
    {
      question: "Is it possible to book a service when it is convenient?",
      answer: "Of course, you can select date and time that fits you.",
    },
    {
      question: "Do we have the services there?",
      answer:
        "Seclob has services in various branches, check balances on the internet.",
    },
  ];
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim()) {
      handleSearch(value);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSearch = async (query: string) => {
    const params = {
      search: query,
      page: 1,
      limit: 12,
    };
    try {
      const res = await onSearch(params);
      setSearchResults(res.data);
      setShowDropdown(true);
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setShowDropdown(false);
  };

  const handleSubcategoryClick = (subcategory: SearchSubcategory) => {
    const city = localStorage.getItem("city") || "";
    const url = `${city}/${subcategory.name
      .replace(/\s+/g, "-")
      .toUpperCase()}/${subcategory.unique_id}`;
    window.location.href = url;
    setShowDropdown(false);
  };
  const handleSearchClick = () => {
    const searchQuery = encodeURIComponent(searchInput);
    window.location.href = `/seeall?search=${searchQuery}`;
  };

  return (
    <div className="bg-white">
      <MobileHeader />
      {/* search */}
      <div className="relative   mx-auto max-w-md mt-4">
        <div
          className="flex items-center mx-auto border rounded-[100px] px-2 py-1 border-[#D2D2D2] bg-white w-[90%] h-[55px]"
          onClick={handleSearchClick}
        >
          <input
            type="text"
            placeholder="Search"
            value={searchInput}
            onChange={handleInputChange}
            className="ml-2 w-full h-[30px] outline-none text-gray-600 placeholder-gray-400 text-sm cursor-pointer"
            readOnly
          />
          <div
            className="w-10 h-10 bg-[#7940FF] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 m-1"
            onClick={handleSearchClick}
          >
            <CiSearch className="text-white text-xl" />
          </div>
        </div>
      </div>
      <MobileSegment selectedCategoryId={selectedCategoryId} />
      <Mobilebanner />
      <MostBooked />
      <Popular />
      <OffersDeals />
      <Services />
      <div className="w-[90%] mx-auto pb-[87px]">
        <Refer />
      </div>
      {/*faq section*/}
      <div className="w-full   px-2">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-left px-4 mb-6">
            <h2 className="text-[18px] font-bold text-gray-900 mb-4">FAQ</h2>
            <p className="text-gray-500 text-[14px">
              Experience effortless home services, delivered by reliable,
              verified experts.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[16px] font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 ml-4">
                    <div
                      className={`w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center transition-transform ${
                        openIndex === index ? "rotate-45" : ""
                      }`}
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6">
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-600 text-[14px] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Mobilefooter />
    </div>
  );
};
export default MobileLanding;
