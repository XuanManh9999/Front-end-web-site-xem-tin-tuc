import axios, { AxiosError } from "axios";
import { Auth } from "../interface/auth";

export const apiLogin = async (dataLogin: Auth) => {
  try {
    const response = await axios.post(
      "http://localhost:8080/auth/access",
      dataLogin
    );
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError?.response?.data;
  }
};
