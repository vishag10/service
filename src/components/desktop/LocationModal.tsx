import React, { useState, useRef, useEffect } from "react";
import { MdLocationOn, MdMyLocation } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { BiSearch } from "react-icons/bi";
import {
  getCurrentlocation,
  getSearchlocation,
} from "@/services/commonapi/commonApi";
import { showToast } from "@/utils/toast";
import { getErrorMessage } from "@/services/ErrorHandle";

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  address: string;
  country?: string;
  place_id?: string;
  state?: string;
}

interface AddressComponent {
  long_name: string;
  types: string[];
}

interface LocationModalProps {
  selectedLocation?: string;
  onLocationSelect?: (location: LocationData) => void;
}

function LocationModal({
  selectedLocation,
  onLocationSelect,
}: LocationModalProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const renderLocationText = () => {
    return selectedLocation || "Select Location";
  };

  const handleUseCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            // Reverse geocoding to get address
            try {
              const response = await getCurrentlocation(
                `${latitude},${longitude}`,
              );
              const result = response.data.results?.[0];
              const address = result?.formatted_address || "Unknown Location";

              let streetname = "My Location";
              let country, neighborhood, subLocality;
              if (result?.address_components) {
                const road = result.address_components.find(
                  (c: AddressComponent) => c.types.includes("route"),
                )?.long_name;

                neighborhood = result.address_components.find(
                  (c: AddressComponent) => c.types.includes("neighborhood"),
                )?.long_name;

                subLocality = result.address_components.find(
                  (c: AddressComponent) =>
                    c.types.includes("sublocality") ||
                    c.types.includes("sublocality_level_1"),
                )?.long_name;

                country = result.address_components.find(
                  (c: AddressComponent) => c.types.includes("country"),
                )?.long_name;

                streetname = [road, neighborhood, subLocality, country]
                  .filter(Boolean)
                  .join(", ");
              }
              const location = {
                name: streetname,
                lat: latitude,
                lng: longitude,
                address,
                country,
              };
              if (country) localStorage.setItem("country", country);
              if (latitude) localStorage.setItem("lat", latitude.toString());
              if (longitude) localStorage.setItem("lon", longitude.toString());
              if (subLocality || neighborhood) {
                localStorage.setItem("city", subLocality || neighborhood || "");
              }
              onLocationSelect?.(location);
              setOpen(false);
            } catch (error) {
              showToast({
                type: "error",
                title: "Error",
                message: getErrorMessage(error),
              });
            }
            setLoadingLocation(false);
          },
          (error) => {
            showToast({
              type: "error",
              title: "Error",
              message: getErrorMessage(error),
            });
            setLoadingLocation(false);
          },
        );
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
      setLoadingLocation(false);
    }
  };

  const handleSelectLocation = (location: LocationData) => {
    if (location.country) localStorage.setItem("country", location.country);
    if (location.lat) localStorage.setItem("lat", location.lat.toString());
    if (location.lng) localStorage.setItem("lon", location.lng.toString());
    if (location.name) localStorage.setItem("city", location.name);
    onLocationSelect?.(location);
    setOpen(false);
    setSearchValue("");
    setSearchResults([]);
  };

  // Search functionality
  useEffect(() => {
    if (searchValue.length >= 3) {
      setIsWaiting(true);

      const timeoutId = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const response = await getSearchlocation(searchValue);
          const formattedResults = response.data.predictions.map(
            (item: {
              structured_formatting: { main_text: string };
              description: string;
              place_id: string;
              terms: { value: string }[];
            }) => ({
              name: item.structured_formatting.main_text,
              address: item.description,
              place_id: item.place_id,
              country: item.terms[item.terms.length - 1]?.value,
            }),
          );
          setSearchResults(formattedResults);
        } catch (error) {
          showToast({
            type: "error",
            title: "Error",
            message: getErrorMessage(error),
          });
          setSearchResults([]);
        }
        setSearchLoading(false);
        setIsWaiting(false);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsWaiting(false);
      setSearchLoading(false);
    }
  }, [searchValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setOpen(!open)}
        data-location-trigger
        className="flex items-center gap-2 py-2 px-3 md:border md:border-gray-200 md:rounded-lg md:shadow-sm text-sm text-black font-medium cursor-pointer hover:bg-white/20 transition"
      >
        <MdLocationOn className="text-lg text-[#3D155F]" />
        <p className="font-semibold text-xs text-[#3D155F] max-w-32 truncate">
          {renderLocationText()}
        </p>
        <IoIosArrowDown
          className={`text-[#3D155F] text-sm transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Search Section */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search for your city…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Current Location Button */}
          <div className="border-b border-gray-100 space-y-2">
            <button
              onClick={handleUseCurrentLocation}
              disabled={loadingLocation}
              className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 text-left"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MdMyLocation className="text-blue-600 text-sm" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">
                  {loadingLocation
                    ? "Detecting location..."
                    : "Use My Current Location"}
                </div>
                <div className="text-xs text-gray-500">
                  Get precise location automatically
                </div>
              </div>
            </button>
          </div>

          {/* Results Section */}
          <div className="max-h-64 overflow-y-auto">
            {searchValue && searchResults.length > 0 ? (
              <div>
                {searchResults.map((item: LocationData, index: number) => (
                  <div
                    key={index}
                    onClick={() => handleSelectLocation(item)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MdLocationOn className="text-gray-600 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-sm">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {item.state && item.country
                          ? `${item.state}, ${item.country}`
                          : item.state || item.country || item.address}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !searchValue ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                search for locations
              </div>
            ) : searchValue.length < 3 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Type at least 3 characters to search
              </div>
            ) : isWaiting || searchLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-500 text-sm">Searching...</span>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationModal;
