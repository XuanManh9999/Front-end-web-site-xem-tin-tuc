import configApi from "../configs/ConfigAxios";
import { AxiosError } from "axios";

interface CategoryPost {
  name: string;
  description: string;
}


export const getCategoryPostManage = async (limit: number, offset: number, keyword: string) => {
  try {
    let response;
    if(keyword){
      response = await configApi.get(`/category/all-manage?limit=${limit}&offset=${offset}&keyword=${keyword}`);
    }else{
      response = await configApi.get(`/category/all-manage?limit=${limit}&offset=${offset}`);
    }
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};



export const getCategoryPosts = async () => {
  try {
    const response = await configApi.get("category/all-manage");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};


export const getCategoryPostById = async (id: number) => {
  try {
    const response = await configApi.get(`/category/${id}`);  
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};


export const createCategoryPost = async (category: CategoryPost) => {
  try {
    const response = await configApi.post("/category", category);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError; 
    return axiosError.response?.data;
  }
};


export const updateCategoryPost = async (id: number, category: CategoryPost) => {
  try {
    const response = await configApi.put(`/category/${id}`, category);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};


export const deleteCategoryPost = async (id: number) => {
  try {
    const response = await configApi.delete(`/category/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError; 
    return axiosError.response?.data;
  }
};





