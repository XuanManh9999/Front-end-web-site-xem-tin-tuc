export interface CategoryPost {
    id: number;
    name: string;
    slug?: string | null;
    parentId?: number | null;
    description?: string | null;
    active?: "HOAT_DONG" | "CHUA_HOAT_DONG";
    createdAt?: string;
    updatedAt?: string;
    createAt?: string;
    updateAt?: string;
    children?: CategoryPost[];
    parent?: CategoryPost | null;
}

export interface CategoryPostResponse {
    data: CategoryPost[];
    pagination: {
        currentPage: number;
        pageSize: number;
        total: number;
    };
}

export interface CategoryPostParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
} 