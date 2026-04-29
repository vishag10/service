import {
  getCategories,
  getSubCategories,
} from "@/services/commonapi/commonApi";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { CiShop } from "react-icons/ci";
import {
  CategorySkeleton,
  SubcategorySkeleton,
} from "@/components/ui/SkeletonLoader";
import { useLocation } from "@/hooks/useLocation";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

interface Category {
  id: string;
  name: string;
  image?: string;
  unique_id?: string;
}

interface MobileSegmentProps {
  selectedCategoryId?: string | null;
}

function MobileSegment({ selectedCategoryId }: MobileSegmentProps) {
  const { location } = useLocation();
  const [active, setActive] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubCategories] = useState<Category[]>([]);

  const checkLocationAndNavigate = (url: string) => {
    if (!location?.city) {
      const locationTrigger = document.querySelector(
        "[data-location-trigger]",
      ) as HTMLElement;
      if (locationTrigger) {
        locationTrigger.click();
      }
      return false;
    }
    window.location.href = url;
    return true;
  };
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubcatLoading, setIsSubcatLoading] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSubCategories = async (
    categoryId: string,
    search: string = "",
    page: number = 1,
  ) => {
    setIsSubcatLoading(true);
    try {
      const limit = showAll ? 1000 : 12;
      const response = await getSubCategories(
        search,
        page,
        limit,
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
    } finally {
      setIsSubcatLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setActive(categoryId);
    setShowAll(false);
    setCurrentPage(1);
    handleGetSubCategories(categoryId, "", 1);
  };

  const handleSeeAllClick = () => {
    setShowAll(true);
    handleGetSubCategories(active, "", 1);
  };

  useEffect(() => {
    const loadData = async () => {
      const cats = await fetchCategories();
      if (cats && cats.length > 0) {
        const categoryToSelect = selectedCategoryId || cats[0].id;
        setActive(categoryToSelect);
        await handleGetSubCategories(categoryToSelect, "", 1);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategoryId && selectedCategoryId !== active) {
      setActive(selectedCategoryId);
      setShowAll(false);
      setCurrentPage(1);
      handleGetSubCategories(selectedCategoryId, "", 1);

      setTimeout(() => {
        const categoryElement = document.querySelector(
          `[data-category-id="${selectedCategoryId}"]`,
        );
        if (categoryElement && categoryScrollRef.current) {
          categoryElement.scrollIntoView({
            behavior: "smooth",
            inline: "center",
          });
        }
      }, 100);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (active) {
      handleGetSubCategories(active, "", currentPage);
    }
  }, [showAll]);

  return (
    <div className="mt-2 w-full">
      <div className="w-[90%] relative flex mx-auto items-center justify-between py-2">
        <p className="font-medium text-[16px] leading-[26px] tracking-[0.01px]">
          Categories
        </p>
        <Link href="/seeall">
          <p className="font-medium text-[12px] leading-[26px] tracking-[0.01px] text-[#782FF8]">
            See All
          </p>
        </Link>
      </div>
      <div className="w-full p-2">
        {/* Top Scrollable Tabs */}
        {isLoading ? (
          <CategorySkeleton />
        ) : (
          <div
            ref={categoryScrollRef}
            className="flex gap-3 overflow-x-auto no-scrollbar mb-6"
          >
            {categories.map((cat, index) => (
              <button
                key={cat.id}
                data-category-id={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center h-[50px] gap-2 px-4 py-2 rounded-[100px] border  transition
                                ${
                                  active === cat.id
                                    ? "border-purple-500 bg-purple-50 text-purple-600"
                                    : "border-gray-200 bg-white text-gray-500"
                                } ${index === 0 ? "ml-2" : ""}`}
              >
                <CiShop className="w-8 h-8" />
                <span className="whitespace-nowrap text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom Grid */}
        {isLoading || isSubcatLoading ? (
          <SubcategorySkeleton />
        ) : (
          <div className="grid grid-cols-4 gap-3 px-2">
            {subcategories
              .slice(0, showAll ? subcategories.length : 8)
              .map((subcat) => {
                return (
                  <div
                    key={subcat.id}
                    className="flex flex-col items-center justify-start p-3 rounded-lg hover:shadow cursor-pointer min-h-[100px]"
                    onClick={() => {
                      const cityName =
                        location?.city || localStorage.getItem("city");
                      if (!cityName) {
                        const locationTrigger = document.querySelector(
                          "[data-location-trigger]",
                        ) as HTMLElement;
                        if (locationTrigger) {
                          locationTrigger.click();
                        }
                        return;
                      }
                      const href = `/${cityName}/${subcat.name.replace(/\s+/g, "-").toUpperCase()}/${subcat.unique_id}`;
                      window.location.href = href;
                    }}
                  >
                    <Image
                      src={subcat.image || "/assets/logo/seg.png"}
                      alt={subcat.name}
                      width={58}
                      height={58}
                      className="w-[64px] h-[64px] object-contain mb-2 rounded-lg"
                    />
                    <span className="text-gray-500 text-[10px] font-medium text-center leading-tight w-full">
                      {subcat.name}
                    </span>
                  </div>
                );
              })}
          </div>
        )}

        {/* See All Button */}
        {!showAll && subcategories.length > 12 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleSeeAllClick}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              See All ({subcategories.length})
            </button>
          </div>
        )}

        {/* Show Less Button */}
        {showAll && subcategories.length > 12 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowAll(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Show Less
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileSegment;
