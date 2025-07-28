import { configApi } from "../configs/ConfigAxios";
import { AxiosError } from "axios";

export interface CourseSearchParams {
  keyword?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  size: number;
}

export const getCourses = async (params: CourseSearchParams) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.keyword) queryParams.append("keyword", params.keyword);
    if (params.level) queryParams.append("level", params.level);
    if (params.category) queryParams.append("category", params.category);
    if (params.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());
    queryParams.append("page", params.page.toString());
    queryParams.append("size", params.size.toString());

    const response = await configApi.get(
      `/api/v1/course/search?${queryParams.toString()}`
    );
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getCourseById = async (id: number) => {
  try {
    const response = await configApi.get(`/api/v1/course/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data;
  }
};

export const updateCourse = async (id: number, data: Partial<CreateCourseData>) => {
  try {
    const response = await configApi.put(`/api/v1/course/${id}`, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data;
  }
};

export interface CreateCourseData {
  title: string;
  description: string;
  thumbnailUrl: string;
  level: string;
  price?: number;
  priceCurrent?: number;
  categoryId: number;
  previewUrl: string;
  skillDescription: string;
  technologies: string;
  instructorId: number;
  sections: any[];
}

export const createCourse = async (data: CreateCourseData) => {
  try {
    const response = await configApi.post('/api/v1/course', data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data;
  }
};

export const deleteCourse = async (id: number) => {
  try {
    const response = await configApi.delete(`/api/v1/course/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data;
  }
};
