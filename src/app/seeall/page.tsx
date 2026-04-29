"use client";
import { ArrowLeft, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import { CiSearch, CiShop } from "react-icons/ci";
import {
  getCategories,
  getSubCategories,
  onSearch,
} from "@/services/commonapi/commonApi";
import Link from "next/link";
import SeeAllFooter from "@/components/mobile/SeeAllFooter";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

interface Category {
  id: string;
  name: string;
  image?: string;
  unique_id?: string;
}

function SeeAllContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [active, setActive] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<{
    subcategory?: {
      subCategories?: Category[];
    };
  } | null>(null);
  const [currentCity, setCurrentCity] = useState<string>("");

  const fetchCategories = async (search: string = "") => {
    try {
      const response = await getCategories(search);
      const categoriesArray = response?.data?.categories || [];
      setCategories(categoriesArray);
      if (categoriesArray.length > 0 && !active) {
        setActive(categoriesArray[0].id);
      }
      return categoriesArray;
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
      setCategories([]);
      return [];
    }
  };

  const handleGetSubCategories = async (
    categoryId: string,
    search: string = "",
  ) => {
    try {
      const response = await getSubCategories(
        search,
        1,
        1000,
        categoryId || "",
      );
      const subcats = response?.data?.subCategories || [];
      setSubCategories(subcats);
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
      setSubCategories([]);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setActive(categoryId);
    setSearchResults(null);
    setSearchInput("");
    handleGetSubCategories(categoryId, "");
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const response = await onSearch({ search: query, page: 1, limit: 100 });
      setSearchResults(response.data);
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    handleSearch(value);
    if (value.trim()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const updateCurrentCity = () => {
      const savedLocationsData = localStorage.getItem("savedLocations");
      if (savedLocationsData) {
        const locations = JSON.parse(savedLocationsData);
        if (locations.length > 0) {
          setCurrentCity(locations[0].city);
        }
      }
    };

    updateCurrentCity();

    const handleStorageChange = () => {
      updateCurrentCity();
    };

    window.addEventListener("storage", handleStorageChange);

    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearchInput(decodeURIComponent(searchQuery));
      handleSearch(decodeURIComponent(searchQuery));
    }

    const loadData = async () => {
      const cats = await fetchCategories();
      if (cats && cats.length > 0) {
        await handleGetSubCategories(cats[0].id, "");
      }
    };
    loadData();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [searchParams]);

  return (
    <div className="w-full pb-8">
      <div className="w-full bg-white px-4 py-4 flex justify-between items-center gap-3 text-center ">
        <p className="font-medium text-[16px] leading-[18px] tracking-[-0.36px] text-center">
          Clear All
        </p>
        <button onClick={() => router.back()} className="">
          <XCircle className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="w-full px-4 pb-24">
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex items-center h-[55px]  gap-2 px-4 py-2 rounded-[100px] border transition
              ${
                active === cat.id
                  ? "border-purple-500 bg-purple-50 text-purple-600"
                  : "border-gray-200 bg-white text-gray-500"
              }`}
            >
              <CiShop className="w-8 h-8" />
              <span className="whitespace-nowrap text-sm">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Projected Box with Search */}
        <div className="shadow-sm rounded-lg  p-4 border border-gray-100">
          <div className="bg-white rounded-lg  p-4 mb-4">
            <h3 className="text-gray-800 font-medium mb-3">What?</h3>
            <div className="flex items-center w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
              <CiSearch className="text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search the service..."
                value={searchInput}
                onChange={handleSearchInputChange}
                className="ml-2 w-full outline-none text-gray-600 placeholder-gray-400 text-sm bg-transparent"
              />
            </div>
          </div>
          {searchResults ? (
            <div>
              <h3 className="text-gray-800 font-medium mb-4">Search Results</h3>
              {(searchResults?.subcategory?.subCategories?.length ?? 0) > 0 ? (
                <div className="space-y-3   ">
                  {searchResults?.subcategory?.subCategories?.map(
                    (subcat: Category) => (
                      <Link
                        key={subcat.id}
                        href={`${currentCity}/${subcat.name.replace(/\s+/g, "-").toUpperCase()}/${subcat.unique_id}`}
                      >
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm">
                          <img
                            src={subcat.image || "/assets/logo/seg.png"}
                            alt={subcat.name}
                            className="w-10 h-10 object-contain rounded-lg"
                          />
                          <span className="text-gray-700 text-sm font-medium">
                            {subcat.name}
                          </span>
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No results found for &quot;{searchInput}&quot;
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-gray-800 font-medium mb-4">
                Suggested Destinations
              </h3>
              <div className="space-y-3  ">
                {subcategories.map((subcat) => (
                  <Link
                    key={subcat.id}
                    href={`${currentCity}/${subcat.name.replace(/\s+/g, "-").toUpperCase()}/${subcat.unique_id}`}
                  >
                    <div className="flex items-center gap-3 p-3 mt-2 bg-white rounded-lg border border-gray-100 hover:shadow-sm">
                      <img
                        src={subcat.image || "/assets/logo/seg.png"}
                        alt={subcat.name}
                        className="w-10 h-10 object-contain rounded-lg"
                      />
                      <span className="text-gray-700 text-sm font-medium">
                        {subcat.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <SeeAllFooter />
      </div>
    </div>
  );
}

function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <SeeAllContent />
    </Suspense>
  );
}

export default Page;
