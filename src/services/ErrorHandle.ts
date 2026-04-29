export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
    return axiosError.response?.data?.message || axiosError.response?.data?.error || '';
  }
  if (error instanceof Error) return error.message;
  return 'Unexpected error occurred';
};