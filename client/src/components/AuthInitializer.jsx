import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authApi } from "@/services/auth.api";
import { clearAuth, setAuthLoading, setAuthUser } from "@/store/slices/authSlice";

const AuthInitializer = () => {
  const dispatch = useDispatch();

  const { data, isSuccess, isError, isFetched } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    retry: false,
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

        const isOnboardingCompleted = await authApi.getOnboardingStatus(apiUser.role);

        dispatch(
          setAuthUser({
            ...apiUser,
            id: apiUser.id || apiUser._id,
            isOnboardingCompleted,
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
      localStorage.removeItem("accessToken");
      dispatch(clearAuth());
    }
  }, [dispatch, isError]);

  useEffect(() => {
    if (isFetched) {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch, isFetched]);

  return null;
};

export default AuthInitializer;
