import AxiosConfig from "../AxiosConfig";

interface RefreshTokenRequest {
    refreshToken: string;
}

export const getUser = async (values: RefreshTokenRequest) =>{
    try {
        const { data } = await AxiosConfig.post("/v1/user-no/auth/token-refresh-token", values);
    return data;
    } catch (error: unknown) {
    const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        : 'Registration failed';
    throw new Error(errorMessage ?? 'Registration failed');
        
    }
}

export const loginUser = async (values: { email?: string; phone?: string; password: string }) => {
  try {
    const { data } = await AxiosConfig.post("v1/user-no/auth/login", values);
    if (data?.refreshToken) {
      localStorage?.setItem("refreshtoken", data?.refreshToken);
    }
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error && 'response' in error 
      ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
      : 'Login failed';
    throw new Error(errorMessage ?? 'Login failed');
  }
};

export const loginWith3rdUser = async (values: { credential?: string }) => {
  try {
    const { data } = await AxiosConfig.post("/v1/user-no/auth/google", values);
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error && 'response' in error 
      ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
      : 'Login failed';
    throw new Error(errorMessage ?? 'Login failed');
  }
};


export const sendOtp = async (values: { email: string; countryCode?: string; phone?: string }) => {
  try {
    const { data } = await AxiosConfig.post("v1/user-no/auth/send-otp", values);
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error && 'response' in error
      ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      : 'Failed to send OTP';
    throw new Error(errorMessage ?? 'Failed to send OTP');
  }
};

export const resendOtp = async (values: { email: string; countryCode?: string; phone?: string }) => {
  try {
    const { data } = await AxiosConfig.post("v1/user-no/auth/send-otp", values);
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error && 'response' in error
      ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      : 'Failed to send OTP';
    throw new Error(errorMessage ?? 'Failed to send OTP');
  }
};

interface RegisterUserValues {
  name: string;
  email: string;
  password: string;
  phone?: string;
  countryCode?: string;
  country?: string;
  OTP: string;
  id?: string;
}

export const registerUser = async (values: RegisterUserValues) => {
  const id = values.id ?? '';

  // Exclude id from request body
  const { id: _, ...bodyWithoutId } = values;

  try {
    const { data } = await AxiosConfig.post(
      `v1/user-no/auth/register?id=${id}`,
      bodyWithoutId
    );
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error && 'response' in error
      ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      : 'Registration failed';
    throw new Error(errorMessage ?? 'Registration failed');
  }
};

export const forgetPassword = async (payload: { phone: string; countryCode: string }) => {
  try {
    const { data } = await AxiosConfig.post("v1/user-no/auth/forget-password", {
      phone: payload.phone,
      countryCode: payload.countryCode
    });
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error && 'response' in error
      ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      : 'Failed to send reset SMS';
    throw new Error(errorMessage ?? 'Failed to send reset SMS');
  }
};

export const verifyOtp = async (values: { phone?: string; countryCode?: string; email?: string; OTP: string }) => {
  try {
    const { data } = await AxiosConfig.post(
      "v1/user-no/auth/verify-otp",
      values
    );
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error && 'response' in error
      ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      : 'OTP verification failed';
    throw new Error(errorMessage ?? 'OTP verification failed');
  }
};

export const updatePassword = async (values: { password: string; phone?: string; countryCode?: string; email?: string; OTP: string }) => {
  try {
    const { data } = await AxiosConfig.post(
      "v1/user-no/auth/change-password",
      values
    );
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error && 'response' in error
      ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      : 'Failed to update password';
    throw new Error(errorMessage ?? 'Failed to update password');
  }
};