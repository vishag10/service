import React, { useState, useEffect } from "react";
import {
  IoArrowBack,
  IoLocationSharp,
  IoArrowForward,
  IoCloseCircle,
} from "react-icons/io5";
import { BiSearch } from "react-icons/bi";
import { FaLocationDot } from "react-icons/fa6";
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
  city?: string;
}

interface AddressComponent {
  long_name: string;
  types: string[];
}

interface MobileLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation?: string;
  onLocationSelect?: (location: LocationData) => void;
}

function MobileLocationModal({
  isOpen,
  onClose,
  selectedLocation,
  onLocationSelect,
}: MobileLocationModalProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [savedLocations] = useState<LocationData[]>([]);
  const [selectedCity, setSelectedCity] = useState("");

  const handleUseCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
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
              onClose();
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
    onClose();
    setSearchValue("");
    setSearchResults([]);
  };

  const handleSavedLocationClick = (location: LocationData) => {
    handleSelectLocation(location);
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

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-[9999] flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center relative z-10">
        <button onClick={onClose} className="mr-4">
          <IoArrowBack className="text-xl text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Search Location</h1>
      </div>

      {/* Search Input */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="relative">
          <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search for any city worldwide"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border-0 outline-none focus:ring-2 focus:ring-purple-400 transition-all"
            autoFocus
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Use Current Location */}
        <div
          onClick={handleUseCurrentLocation}
          className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <IoLocationSharp className="text-purple-600 text-lg" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {loadingLocation
                  ? "Detecting location..."
                  : "Use current location"}
              </div>
            </div>
          </div>
          <IoArrowForward className="text-gray-400" />
        </div>

        {searchValue && searchResults.length > 0 ? (
          <div>
            {searchResults.map((item: LocationData, index: number) => (
              <div
                key={index}
                onClick={() => handleSelectLocation(item)}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${
                  selectedCity === item.name ? "bg-purple-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <FaLocationDot className="text-purple-400 text-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {item.state && item.country
                        ? `${item.state}, ${item.country}`
                        : item.state || item.country || item.address}
                    </div>
                  </div>
                </div>
                <IoArrowForward className="text-gray-400" />
              </div>
            ))}
          </div>
        ) : !searchValue ? (
          <div>
            {savedLocations.length > 0 && (
              <div>
                <div className="px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50">
                  Recent Locations
                </div>
                {savedLocations.map((location: LocationData, index: number) => (
                  <div
                    key={index}
                    onClick={() => handleSavedLocationClick(location)}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${
                      selectedCity === location.city ? "bg-purple-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FaLocationDot className="text-purple-400 text-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {location.city}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {location.state && location.country
                            ? `${location.state}, ${location.country}`
                            : location.state ||
                              location.country ||
                              location.address}
                        </div>
                      </div>
                    </div>
                    <IoArrowForward className="text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : searchValue.length < 3 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaLocationDot className="text-gray-300 text-3xl mb-3" />
            <div className="text-gray-500 text-center">
              <div className="font-medium">
                Type at least 3 characters to search
              </div>
            </div>
          </div>
        ) : isWaiting || searchLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-gray-500">Searching...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <FaLocationDot className="text-gray-300 text-3xl mb-3" />
            <div className="text-gray-500 text-center">
              <div className="font-medium">No results found</div>
              <div className="text-sm">
                Try searching for a different location
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex flex-col">
          <div className="bg-white flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <h3 className="text-lg font-semibold">Select Location on Map</h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoCloseCircle className="text-2xl" />
              </button>
            </div>
            <div className="flex-1">
              <iframe
                src="data:text/html;charset=utf-8,%3C!DOCTYPE html%3E%3Chtml%3E%3Chead%3E%3Cmeta charset='utf-8'%3E%3Cmeta name='viewport' content='width=device-width, initial-scale=1'%3E%3Ctitle%3ELocation Selector%3C/title%3E%3Clink rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'/%3E%3Cstyle%3Ebody{margin:0;padding:0;font-family:Arial,sans-serif}%23map{height:100vh;width:100%25}.info-box{position:absolute;top:10px;left:10px;background:white;padding:10px;border-radius:5px;box-shadow:0 2px 10px rgba(0,0,0,0.1);z-index:1000;max-width:250px;font-size:14px}.btn{background:%234CAF50;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;margin-top:8px;font-size:14px}.btn:hover{background:%2345a049}%3C/style%3E%3C/head%3E%3Cbody%3E%3Cdiv class='info-box'%3E%3Cdiv%3ETap on the map to select your location%3C/div%3E%3Cdiv id='selected-location'%3E%3C/div%3E%3Cbutton id='confirm-btn' class='btn' style='display:none'%3EConfirm Location%3C/button%3E%3C/div%3E%3Cdiv id='map'%3E%3C/div%3E%3Cscript src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'%3E%3C/script%3E%3Cscript%3Evar map=L.map('map').setView([20.5937,78.9629],5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'%C2%A9 OpenStreetMap contributors'}).addTo(map);var marker;var selectedLocation;map.on('click',function(e){if(marker){map.removeLayer(marker)}marker=L.marker(e.latlng).addTo(map);selectedLocation=e.latlng;fetch('https://nominatim.openstreetmap.org/reverse?format=json%26lat='+e.latlng.lat+'%26lon='+e.latlng.lng).then(response=%3Eresponse.json()).then(data=%3E{var address=data.display_name||'Selected Location';document.getElementById('selected-location').innerHTML='%3Cstrong%3E'+address+'%3C/strong%3E';document.getElementById('confirm-btn').style.display='block'}).catch(()=%3E{document.getElementById('selected-location').innerHTML='%3Cstrong%3ESelected Location%3C/strong%3E';document.getElementById('confirm-btn').style.display='block'})});document.getElementById('confirm-btn').addEventListener('click',function(){if(selectedLocation){window.parent.postMessage({type:'locationSelected',lat:selectedLocation.lat,lng:selectedLocation.lng},'*')}});if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(position){map.setView([position.coords.latitude,position.coords.longitude],13)})}%3C/script%3E%3C/body%3E%3C/html%3E"
                className="w-full h-full border-0"
                title="Location Selector Map"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileLocationModal;
