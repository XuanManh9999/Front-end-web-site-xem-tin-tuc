import axios, { AxiosError } from "axios";
import { Auth } from "../interface/auth";

export const apiLogin = async (dataLogin: Auth) => {
  try {
    const response = await axios.post(
      "https://codezen.io.vn/auth/access",
      dataLogin
    );
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError?.response?.data;
  }
};
