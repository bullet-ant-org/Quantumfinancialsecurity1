import { useState, useCallback } from 'react';

const useApi = (apiCall) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL;

  const request = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall(apiUrl, token, ...args);
      if (!res.ok) {
        // Attempt to parse error message from backend, otherwise use status text
        let errorMessage = `Request failed with status: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // The response body was not valid JSON, stick with the status message.
        }
        throw new Error(errorMessage);
      }
      const resultData = await res.json();
      setData(resultData);
      return { success: true, data: resultData };
    } catch (err) {
      console.error("API call failed:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiCall, apiUrl, token]);

  return { data, loading, error, request, setData };
};

export default useApi;