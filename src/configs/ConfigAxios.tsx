import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import Cookies from "js-cookie";

// Kiểu hàm reset (nếu bạn cần thêm tham số thì có thể mở rộng)
type ResetFn = () => void | null;

let resetTimerFn: ResetFn = null;

export const setAxiosInactivityHandler = (resetFn: ResetFn) => {
  resetTimerFn = resetFn;
};

const configApi: AxiosInstance = axios.create({
  baseURL: "https://codezen.io.vn/api/v1",
});

let isAlertShown = false;

// Interceptor cho request
configApi.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const token = Cookies.get("accessTokenAdmin");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (resetTimerFn) {
      resetTimerFn();
    }

    return config;
  },
  (err: AxiosError) => Promise.reject(err)
);

// Interceptor cho response
configApi.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as AxiosRequestConfig & { _retry?: boolean };

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshTokenAdmin = Cookies.get("refreshTokenAdmin");
      if (!refreshTokenAdmin) {
        return Promise.reject(err);
      }

      Cookies.remove("accessTokenAdmin");

      try {
        const res = await axios.post(
          "https://codezen.io.vn/auth/refresh",
          {},
          {
            headers: {
              "x-token": refreshTokenAdmin,
            },
          }
        );

        const newaccessToken = res.data?.accessToken;
        if (!newaccessToken ) {
          throw new Error("Không nhận được access token mới");
        }

        Cookies.set("accessTokenAdmin", newaccessToken, {
          sameSite: "None",
          secure: true,
        });

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newaccessToken}`;
        }

        return configApi(originalRequest);
      } catch (refreshErr) {
        if (!isAlertShown) {
          isAlertShown = true;
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
          document.location.href = "/signin";
          Cookies.remove("refreshTokenAdmin");
          Cookies.remove("accessTokenAdmin");
         localStorage.removeItem("user");
         localStorage.removeItem("isLogin");
        }

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default configApi;
