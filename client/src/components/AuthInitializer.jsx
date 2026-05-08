import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authApi } from "@/services/auth.api";
import { clearAuth, setAuthLoading, setAuthUser } from "@/store/slices/authSlice";

const AuthInitializer = () => {
  const dispatch = useDispatch();

  const { data, isSuccess, isError, isFetched, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized - invalid token)
      if (error?.response?.status === 401) {
        return false;
      }
      // Don't retry on 403 (forbidden - other auth issues)
      if (error?.response?.status === 403) {
        return false;
      }
      // Retry on network errors, 5xx, and other transient errors
      // Max 3 retries
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 100ms, 200ms, 400ms
      return Math.min(100 * 2 ** attemptIndex, 1000);
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    dispatch(setAuthLoading(true));
  }, [dispatch]);

  useEffect(() => {
    const syncUser = async () => {
      if (!isSuccess) return;

      try {
        const apiUser = data?.data?.user;
        if (!apiUser) {
          dispatch(clearAuth());
          return;
        }
        dispatch(
          setAuthUser({
            ...apiUser,
            id: apiUser.id || apiUser._id,
            isOnboardingCompleted: Boolean(apiUser.isOnboardingCompleted),
          }),
        );
      } catch (error) {
        localStorage.removeItem("accessToken");
        dispatch(clearAuth());
      }
    };

    syncUser();
  }, [data, dispatch, isSuccess]);

  useEffect(() => {
    if (isError) {
      // Only clear auth on 401 (unauthorized - invalid token)
      // Preserve session on transient errors (network, 5xx, etc.)
      const statusCode = error?.response?.status;
      if (statusCode === 401) {
        localStorage.removeItem("accessToken");
        dispatch(clearAuth());
      }
      // For other errors (network, 5xx, etc.), keep the session active
      // Retry logic will handle recovery
    }
  }, [dispatch, error, isError]);

  useEffect(() => {
    if (isFetched) {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch, isFetched]);

  return null;
};

export default AuthInitializer;
