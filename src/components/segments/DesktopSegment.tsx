import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CiSearch } from "react-icons/ci";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  getCategories,
  getSubCategories,
  onSearch,
} from "@/services/commonapi/commonApi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

interface Category {
  id: string;
  name: string;
  image?: string;
  unique_id?: string;
}

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

function DesktopSegment() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null,
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(12);
  const sliderRef = useRef<Slider>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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

  const fetchCategories = async (search: string = "") => {
    setLoading(true);
    try {
      const response = await getCategories(search);
      const categoriesArray = response?.data?.categories || [];
      setCategories(categoriesArray);
      return categoriesArray;
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
      setCategories([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const cats = await fetchCategories(searchTerm);
      if (cats && cats.length > 0) {
        setSelectedCategoryId(cats[0].id);
        setCurrentPage(1);
        await handleGetSubCategories(cats[0].id, "", 1);
      }
    };
    loadData();
  }, [searchTerm]);

  const handleSearchButtonClick = async () => {
    setSearchTerm(searchInput);
    setShowDropdown(false);
    const params = {
      search: searchInput,
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
    setCurrentPage(1);
    handleGetSubCategories(categoryId, "", 1);
    setShowDropdown(false);

    // Scroll to selected category in slider
    setTimeout(() => {
      const categoryIndex = categories.findIndex(
        (cat) => cat.id === categoryId,
      );
      if (categoryIndex !== -1 && sliderRef.current) {
        sliderRef.current.slickGoTo(categoryIndex);
      }
    }, 100);
  };

  const handleSubcategoryClick = (subcategory: SearchSubcategory) => {
    const city = localStorage.getItem("city") || "";
    const url = `${city}/${subcategory.name.replace(/\s+/g, "-").toUpperCase()}/${subcategory.unique_id}`;
    window.location.href = url;
    setShowDropdown(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchButtonClick();
    }
  };

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: false,
    swipeToSlide: true,
    touchMove: true,
    draggable: true,
    lazyLoad: "ondemand" as const,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const handleGetSubCategories = async (
    categoryId: string,
    search: string,
    page: number = currentPage,
  ) => {
    try {
      const response = await getSubCategories(
        search,
        page,
        12,
        categoryId || "",
      );
      const subcats = response?.data?.subCategories || [];
      const totalPages = response?.data?.totalPages || 1;
      setSubCategories(subcats);
      setTotalPages(totalPages);
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
      setSubCategories([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
          Our Premier Service Categories
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Discover excellence in every service — designed for reliability,
          quality, and satisfaction.
        </p>
      </div>

      {/* Search Bar */}
      <div
        ref={searchRef}
        className="lg:w-[50%] md:w-[60%] flex mx-auto mb-6 sm:mb-8 relative"
      >
        <div className="relative flex-1">
          <CiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[var(--primary-color)] text-base" />
          <input
            type="text"
            className="w-full bg-[#f2f2f2] pl-10 pr-4 py-3 text-[var(--primary-color)] text-xs placeholder:text-[var(--primary-color)] rounded-lg focus:outline-none h-12"
            value={searchInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Search anything..."
            onFocus={() => searchInput.trim() && setShowDropdown(true)}
          />

          {/* Search Dropdown */}
          {showDropdown && searchResults && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {/* Categories */}
              {searchResults.category?.categories &&
                searchResults.category.categories.length > 0 && (
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Categories
                    </h3>
                    {searchResults.category.categories.map(
                      (category: SearchCategory) => (
                        <div
                          key={category.id}
                          className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                          onClick={() => handleCategoryClick(category.id)}
                        >
                          <Image
                            src={category.image || "/assets/logo/seg.png"}
                            alt={category.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-cover rounded mr-3"
                          />
                          <span className="text-sm text-gray-800">
                            {category.name}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}

              {/* Subcategories */}
              {searchResults.subcategory?.subCategories &&
                searchResults.subcategory.subCategories.length > 0 && (
                  <div className="p-3 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Services
                    </h3>
                    {searchResults.subcategory.subCategories.map(
                      (subcategory: SearchSubcategory) => (
                        <div
                          key={subcategory.id}
                          className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                          onClick={() => handleSubcategoryClick(subcategory)}
                        >
                          <Image
                            src={subcategory.image || "/assets/logo/seg.png"}
                            alt={subcategory.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-cover rounded mr-3"
                          />
                          <div>
                            <span className="text-sm text-gray-800 block">
                              {subcategory.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {subcategory.category?.name}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

              {!searchResults.category?.categories?.length &&
                !searchResults.subcategory?.subCategories?.length && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No results found
                  </div>
                )}
            </div>
          )}
        </div>

        <button
          className="px-10 text-sm rounded-lg text-white ml-2 bg-[#5818BF] hover:from-purple-600 hover:to-purple-700 transition-colors h-12"
          onClick={handleSearchButtonClick}
        >
          Search
        </button>
      </div>

      {/* Categories Slider */}
      <div className="mb-8 relative">
        {loading ? (
          <div className="pl-8">
            <div className="flex gap-4 overflow-hidden">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center animate-pulse"
                    style={{ width: "180px", height: "180px" }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{ width: "180px", height: "140px" }}
                    >
                      <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="mt-2" style={{ height: "40px" }}>
                      <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Touch Scroll Icons */}
            {categories.length > 5 && (
              <>
                <button
                  onClick={() => sliderRef.current?.slickPrev()}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => sliderRef.current?.slickNext()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </>
            )}

            <div className="category-slider pl-8">
              {Array.isArray(categories) && categories.length > 0 ? (
                <Slider ref={sliderRef} {...sliderSettings}>
                  {categories.map((category, index) => (
                    <motion.div
                      key={category?.id || index}
                      className="flex justify-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setCurrentPage(1);
                        handleGetSubCategories(category.id, "", 1);
                      }}
                    >
                      <div
                        className="flex flex-col items-center cursor-pointer"
                        style={{ width: "180px", height: "180px" }}
                      >
                        {/* Category Image */}
                        <div
                          className="flex items-center justify-center"
                          style={{ width: "180px", height: "140px" }}
                        >
                          <Image
                            src={category?.image || "/assets/logo/seg.png"}
                            alt={category?.name || "Category"}
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>

                        {/* Category Name */}
                        <div className="mt-2" style={{ height: "40px" }}>
                          <span
                            className={`text-sm font-medium text-center block truncate ${
                              selectedCategoryId === category.id
                                ? "text-purple-600"
                                : "text-gray-700"
                            }`}
                            style={{
                              color:
                                selectedCategoryId === category.id
                                  ? "#9333ea"
                                  : "#374151",
                              width: "180px",
                            }}
                          >
                            {category?.name || "Unnamed Category"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </Slider>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No categories found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* subcategory Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm flex items-center gap-4 p-4 h-24 animate-pulse"
              >
                <div className="bg-gray-200 rounded-xl shrink-0 w-16 h-16"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
              </div>
            ))
        ) : subcategories.length > 0 ? (
          subcategories.map((subcat, index) => (
            <Link
              key={subcat.id}
              href={`${localStorage.getItem("city")}/${subcat.name.replace(/\s+/g, "-").toUpperCase()}/${subcat.unique_id}`}
            >
              <motion.div
                className="bg-white rounded-xl shadow-sm flex items-center gap-4 p-4 h-24 hover:shadow-md transition-shadow cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="bg-gray-100 rounded-xl flex items-center justify-center shrink-0 w-16 h-16">
                  <Image
                    src={subcat.image || "/assets/logo/seg.png"}
                    alt={subcat.name}
                    width={64}
                    height={64}
                    className="w-full h-full rounded-xl object-contain"
                  />
                </div>
                <div className="text-sm font-medium text-gray-800 leading-tight flex-1">
                  {subcat.name}
                </div>
              </motion.div>
            </Link>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 col-span-full">
            No subcategories found
          </div>
        )}
      </div>

      {/* Pagination */}
      {subcategories.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 gap-4">
          <button
            onClick={async () => {
              if (currentPage > 1) {
                const newPage = currentPage - 1;
                setCurrentPage(newPage);
                await handleGetSubCategories(
                  selectedCategoryId || "",
                  "",
                  newPage,
                );
              }
            }}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-5 h-5 text-black hover:text-gray-700" />
          </button>

          <div className="bg-[#F5F5F5] px-4 py-2 rounded">
            <span className="font-bold text-[#00C46C]">
              {currentPage.toString().padStart(2, "0")}
            </span>
            <span className="text-black">
              {" "}
              / {totalPages.toString().padStart(2, "0")}
            </span>
          </div>

          <button
            onClick={async () => {
              if (currentPage < totalPages) {
                const newPage = currentPage + 1;
                setCurrentPage(newPage);
                await handleGetSubCategories(
                  selectedCategoryId || "",
                  "",
                  newPage,
                );
              }
            }}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-5 h-5 text-black hover:text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
}

export default DesktopSegment;
