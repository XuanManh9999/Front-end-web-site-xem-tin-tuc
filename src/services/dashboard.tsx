import { configApi } from "../configs/ConfigAxios";
import { AxiosError } from "axios";

export const getDashboard = async () => {
    try {
      const response = await configApi.get(`/dashboard/home`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data;
    }
  };