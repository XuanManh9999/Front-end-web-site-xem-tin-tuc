import configApi from "../configs/ConfigAxios";
import { AxiosError } from "axios";

interface CategoryCourse {
  name: string;
  description: string;
}

export const getCategoryTag = async (limit: number, page: number, keyword: string) => {
  try {
    let response;
    if(keyword){
      response = await configApi.get(`/tag/all?limit=${limit}&page=${page}&keyword=${keyword}`);
    }else{
      response = await configApi.get(`/tag/all?limit=${limit}&page=${page}`);
    }
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};


export const getCategoryTagById = async (id: number) => {
  try {
    const response = await configApi.get(`/tag/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const createCategoryTag = async (category: CategoryCourse) => {
  try {
    const response = await configApi.post("/tag", category);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const updateCategoryTag = async (id: number, category: CategoryCourse) => {
  try {
    const response = await configApi.put(`/tag/${id}`, category);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};


export const deleteCategoryTag = async (id: number) => {
  try {
    const response = await configApi.delete(`/tag/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};









