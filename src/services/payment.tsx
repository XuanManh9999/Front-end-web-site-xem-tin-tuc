import configApi from "../configs/ConfigAxios";
interface PaymentHistoryParams {
    success?: boolean;
    year?: number;
    month?: number;
    day?: number;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    size?: number;
    orderId?: string;
    instructorName?: string;
    username?: string;
}

interface CommonResponse<T> {
    status: number;
    message: string;
    data: T;
    totalPages: number;
    totalPage: number;
    currentPage: number;
    totalItems: number;
}

interface PaymentTransaction {
    orderId: string;
    amount: number;
    orderInfo: string;
    payType: string;
    message: string;
    success: boolean;
    transactionNo: string;
    responseCode: string;
    bankCode: string;
    cardType: string;
    paymentDate: string;
    courseTitle: string;
    coursePrice: number;
    instructorName: string;
    userName: string;
}

export const getPaymentHistory = async ({
    success = true,
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
    day,
    sortDirection = "asc",
    page = 0,
    size = 10,
    orderId,
    instructorName,
    username
}: PaymentHistoryParams): Promise<CommonResponse<PaymentTransaction[]>> => {
    try {
        const response = await configApi.get("/api/v1/payment/statistics", {
            params: {
                success,
                year,
                month,
                day,
                sortDirection,
                page,
                size,
                orderId,
                instructorName,
                username
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
