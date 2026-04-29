import AxiosConfig from "../AxiosConfig";

interface Category {
  id: string;
  name: string;
  image?: string;
}

interface CategoriesResponse {
  data: {
    categories: Category[];
  };
}

interface SubCategoriesResponse {
  data: {
    subCategories: Category[];
    totalPages: number;
  };
}

interface BannersResponse {
  data: {
    data: unknown[];
  };
}

export const getCategories = async (
  search: string
): Promise<CategoriesResponse> => {
  try {
    const { data } = await AxiosConfig.get('/v1/seclobService-no/categories/list', {
      params: {search,page: 1, limit: 1000},
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getBanners = async (): Promise<BannersResponse> => {
  try {
    const { data } = await AxiosConfig.get('/v1/seclobService-no/banners/list');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const getSubCategories = async (search: string, page: number, limit: number, categoryId: string): Promise<SubCategoriesResponse> => {
  try {
    const { data } = await AxiosConfig.get('/v1/seclobService-no/subcategories/list', {
      params: { search, page, limit, categoryId },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

interface PartnerSearchData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const partnerSearch = async (data: PartnerSearchData) => {
  try {
    const response = await AxiosConfig.post('/v1/seclobService-no/get-in-touch/create', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
 
export const getPackages =async()=>{
  try {
    const response = await AxiosConfig.get('/v1/seclobServiceCustomer/package/list');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

interface requestProviderData {
  subCategoryId: string;
  planId: string;
  description: string;
  bookingTime: string;
  bookingDate: string;
  address?: {
    name: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    zip: string;
    HouseNo: string;
    RoadName: string;
    type: number;
  };
}
export const requestProvider = async (data: requestProviderData) => {
  try {
    const formData = new FormData();
    formData.append('bookingDate', data.bookingDate);
    formData.append('bookingTime', data.bookingTime);
    formData.append('description', data.description);
    formData.append('planId', data.planId);
    formData.append('subCategoryId', data.subCategoryId);
    formData.append('identifyService', 'seclobService');
    if (data.address) {
      formData.append('address', JSON.stringify(data.address));
    }


    const response = await AxiosConfig.post(
      '/v2/seclobServiceCustomer/service/req',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};



export const deatiledService =async(search:string)=>{
  try {
    const response = await AxiosConfig.get(`/v1/seclobService-no/subcategories/list?page=1&limit=1&search=${search}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const serviceDeatil =async(uniqueId:string)=>{
  try {
    const response = await AxiosConfig.get(`/v1/seclobService-no/subcategories/list?page=1&limit=1&search=${uniqueId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

interface searchData {
  search: string;
  page: number;
  limit: number;
}
export const onSearch =async(data:searchData)=>{
  try {
    const response = await AxiosConfig.get(`/v1/seclobService-no/categories/serch-all?page=${data.page}&limit=${data.limit}&search=${data.search}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const getCurrentlocation = async (latlng: string) => {
  try {
    const response = await AxiosConfig.get(`/v1/recharge-no/location/current-location?latlng=${latlng}`);
    return response?.data;
  } catch (error) {
    console.error(error);
  }
}

export const getSearchlocation = async (query: string) => {
  try {
    const response = await AxiosConfig.get(`/v1/recharge-no/location/search-location?query=${query}`);
    return response?.data;
  } catch (error) {
    console.error(error);
  }
}

export const getUserDeatils = async () => {
  try {
    const response = await AxiosConfig.get(`/v1/user/user/details`);
    return response?.data;
  } catch (error) {
    console.error(error);
  }
}

export const getUserAddress = async () => {
  try {
    const response = await AxiosConfig.get(`/v1/user/address`);
    return response?.data;
  } catch (error) {
    console.error(error);
  }
}

export const getUserCurrentPackage = async () => {
  try {
    const response = await AxiosConfig.get(`/v1/seclobServiceCustomer/package/current`);
    return response?.data;
  } catch (error) {
    console.error(error);
  }
}


export const getPartnerDeatils = async (id :string) => {
  try {
    const response = await AxiosConfig.get(`/v1/servicepartner/user/details-partner?_id=${id}`);
    return response?.data;
  } catch (error) {
    console.error(error);
  }
}

interface Data {
  subCategoryId: string;
  distance: number;
  packagePriority: number;
}
export const getAllProviders =async(data:Data)=>{
  try {
    const response = await AxiosConfig.post(`/v1/seclobServiceCustomer/service/get-providers`,data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


interface bookservice {
  bookingStatus: string;
  requestId: string;
}

export const bookService = async (data: bookservice) => {
  try {
    const response = await AxiosConfig.post('/v1/seclobServiceCustomer/booking/accept', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

interface userData {
  userIds: string[];
  
}
export const getAllProvidersDeatils =async(data:userData)=>{
  try {
    const response = await AxiosConfig.post(`/v1/servicepartner/user/all-users`,{userIds:data});
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
 
export const getBookingDetails = async (id: string)=>{
    try {
      const response = await AxiosConfig.get(`/v1/seclobServiceCustomer/booking/status/${id}`);
    return response.data;
    } catch (error) {
      
    }
}
export const getBookingHistory = async ()=>{
    try {
      const response = await AxiosConfig.get(`/v1/seclobServiceCustomer/booking/customer`);
    return response.data;
    } catch (error) {
      
    }
}