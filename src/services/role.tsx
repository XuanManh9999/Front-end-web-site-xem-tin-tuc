import { configApi } from "../configs/ConfigAxios";
import { AxiosError } from "axios";
import { IRole } from "../interface/role";

export const getRoles = async () => {
  try {
    const response = await configApi.get("/role/all");
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getRoleById = async (roleID: number) => {
  try {
    const response = await configApi.get(`/api/v1/roles/${roleID}`);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const addRole = async (data: IRole) => {
  try {
    const response = await configApi.post("/api/v1/roles", data);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const updateRole = async (roleID: number, data: IRole) => {
  try {
    const response = await configApi.put(`/api/v1/roles/${roleID}`, data);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const deleteRole = async (roleID: number) => {
  try {
    const response = await configApi.delete(`/api/v1/roles/${roleID}`);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};