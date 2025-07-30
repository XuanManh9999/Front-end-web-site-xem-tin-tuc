import configApi from "../configs/ConfigAxios";
import { AxiosError } from "axios";

export interface CourseSalesDetail {
  courseId: string;
  courseTitle: string;
  instructorName: string;
  price: number;
  quantitySold: number;
  totalRevenue: number;
  salesDate: string;
}

export interface MonthlyCourseSales {
  month: number;
  totalRevenue: number;
  courses: CourseSalesDetail[];
}

export const getReportRevenue = async (year: number = new Date().getFullYear()) => {
  try {
    const response = await configApi.get(`/api/v1/report/statistics/monthly-revenue?year=${year}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};
export interface MonthlyCourseSalesOptions {
  page?: number;
  size?: number;
  instructorId?: number;
  minPrice?: number;
  maxPrice?: number;
  courseTitle?: string;
  categoryId?: number;
  minQuantitySold?: number;
  minRevenue?: number;
  maxRevenue?: number;
}

export const getMonthlyCourseSales = async (
  year: number,
  month: number,
  options: MonthlyCourseSalesOptions = {}
) => {
  try {
    const {
      page = 0,
      size = 10,
      instructorId,
      minPrice,
      maxPrice,
      courseTitle,
      categoryId,
      minQuantitySold,
      minRevenue,
      maxRevenue,
    } = options;

    const response = await configApi.get(
      `/api/v1/report/statistics/monthly-course-sales`,
      {
        params: {
          year,
          month,
          page,
          size,
          instructorId,
          minPrice,
          maxPrice,
          courseTitle,
          categoryId,
          minQuantitySold,
          minRevenue,
          maxRevenue,
        },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getQuantityDashboard = async () => {
  try {
    const response = await configApi.get("/api/v1/report/dashboard");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

