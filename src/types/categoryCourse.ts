export interface CategoryCourse {
    id: number;
    name: string;
    description: string | null;
    active: "HOAT_DONG" | "CHUA_HOAT_DONG";
    createAt: string;
    updateAt: string;
}

export interface CategoryCourseResponse {
    data: CategoryCourse[];
    pagination: {
        currentPage: number;
        pageSize: number;
        total: number;
    };
}

export interface CategoryCourseParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
} 