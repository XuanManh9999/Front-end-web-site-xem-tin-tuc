import configApi from "../configs/ConfigAxios";
import { AxiosError } from "axios";

// Enum cho TypeArticles
export enum TypeArticles {
  ARTICLE = "ARTICLE",
  VIDEO = "VIDEO", 
  PODCAST = "PODCAST",
  IMAGE = "IMAGE",
  SLIDE = "SLIDE"
}

// Interface cho Author
export interface Author {
  id: number;
  username: string;
  phoneNumber?: string | null;
  email?: string | null;
  background?: string | null;
  avatar?: string | null;
  active?: string | null;
  createdAt?: string;
  updatedAt?: string;
  roles?: any;
  articles?: any;
  authProviderResponseDTO?: any;
}

// Interface cho Category
export interface Category {
  id: number;
  name: string;
  slug?: string | null;
  parentId?: number | null;
  createAt?: string | null;
  updateAt?: string | null;
}

// Interface cho Tag
export interface Tag {
  id: number;
  name: string;
  description?: string;
  createAt?: string;
  updateAt?: string;
}

// Interface cho Post
export interface Post {
  id: number;
  title: string;
  content: string;
  thumbnail?: string | null;
  active: "HOAT_DONG" | "CHUA_HOAT_DONG";
  slug: string;
  slugCategory?: string | null;
  view: number;
  type?: TypeArticles | null;
  quantityLike: number;
  quantityBookmark: number;
  author: Author;
  category: Category;
  tags: Tag[];
  createAt: string;
  like: boolean;
  bookmark: boolean;
}

// Interface cho ArticlesRequest
export interface ArticlesRequest {
  title?: string;
  slug?: string;
  content?: string;
  type?: TypeArticles;
  authorId?: number;
  categoryId?: number;
  tagIds?: number[];
}

// Interface cho response
export interface ArticlesResponse {
  status: number;
  message: string;
  data: Post[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

// Interface cho single post response
export interface SinglePostResponse {
  status: number;
  message: string;
  data: Post;
}

// Tăng view cho bài viết
export const increaseView = async (id: number) => {
  try {
    const response = await configApi.post(`/articles/${id}/view`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

// Lấy tất cả bài viết với phân trang và filter
export const getPosts = async (
  limit: number = 10,
  offset: number = 0,
  sortBy: string = "view",
  order: string = "desc",
  title: string = ""
) => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    if (sortBy) {
      params.append("sortBy", sortBy);
    }
    if (order) {
      params.append("order", order);
    }
    if (title) {
      params.append("title", title);
    }

    const response = await configApi.get(`/articles/all?${params.toString()}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

// Lấy bài viết theo ID
export const getPostById = async (id: number) => {
  try {
    const response = await configApi.get(`/articles/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

// Lấy bài viết theo slug
export const getPostBySlug = async (slug: string) => {
  try {
    const response = await configApi.get(`/articles/slug/${slug}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

// Lấy bài viết theo category ID
export const getPostsByCategory = async (categoryId: number) => {
  try {
    const response = await configApi.get(`/articles/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

// Tạo bài viết mới
export const createPost = async (formData: FormData) => {
  try {
    const response = await configApi.post(`/articles`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

// Cập nhật bài viết
export const updatePost = async (id: number, formData: FormData) => {
  try {
    const response = await configApi.put(`/articles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

// Xóa bài viết
export const deletePost = async (id: number) => {
  try {
    const response = await configApi.delete(`/articles/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

// Helper function để tạo FormData cho create/update
export const createPostFormData = (data: ArticlesRequest, thumbnail?: File): FormData => {
  const formData = new FormData();
  
  if (data.title) formData.append('title', data.title);
  if (data.slug) formData.append('slug', data.slug);
  if (data.content) formData.append('content', data.content);
  if (data.type) formData.append('type', data.type);
  if (data.authorId) formData.append('authorId', data.authorId.toString());
  if (data.categoryId) formData.append('categoryId', data.categoryId.toString());
  if (data.tagIds && data.tagIds.length > 0) {
    data.tagIds.forEach(tagId => {
      formData.append('tagIds', tagId.toString());
    });
  }
  if (thumbnail) formData.append('thumbnail', thumbnail);
  
  return formData;
};
