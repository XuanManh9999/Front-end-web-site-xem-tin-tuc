import configApi from "../configs/ConfigAxios";
import { AxiosError } from "axios";

export const getArticlesByYear = async (year: number) => {
  try {
    const response = await configApi.get(`/report/articles-by-month?year=${year}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};


export const getArticlesByMonth = async (
  year: number,
  month: number,
  day?: number,
  sortBy: string = "view",
  order: string = "desc",
  page: number = 0,
  size: number = 10,
  keyword?: string,
) => {
  try {
    const params = new URLSearchParams({
      year: year.toString(),
      month: month.toString(),
      sortBy,
      order,
      page: page.toString(),
      size: size.toString(),
    });

    // Chỉ thêm day nếu nó có giá trị
    if (day !== undefined) {
      params.append("day", day.toString());
    }
    if (keyword !== undefined && keyword !== "") {
      params.append("keyword", keyword);
    }

    const response = await configApi.get(`/report/articles-detail-month?${params.toString()}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

