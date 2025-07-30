import { AxiosError } from "axios";
import configApi from "../configs/ConfigAxios";
import { PaginationApi } from "../interface/pagination";

export const getUsers = async (pagination: PaginationApi) => {
  try {
    const response = await configApi.get(
      `/user/all?limit=${pagination.limit}&offset=${pagination.offset}`
    );
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await configApi.get("/user/current");
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const addUser = async (data: any) => {
  try {
    const response = await configApi.post("/user", data);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const updateUser = async (data: any, userId: number) => {
  try {
    const response = await configApi.put(`user/${userId}`, data);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getRoles = async () => {
  try {
    const response = await configApi.get(`role/all`);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getUserByName = async (name: string, limit: number = 5, offset: number = 0  ) => {
  try {
    const response = await configApi.get(`user/search?keyword=${name}&limit=${limit}&offset=${offset}`);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const deleteUserById = async (id: number | string) => {
  try {
    const response = await configApi.delete(`/user/${id}`);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getDashboard = async () => {
  try {
    const response = await configApi.get(`/dashboard`);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};
