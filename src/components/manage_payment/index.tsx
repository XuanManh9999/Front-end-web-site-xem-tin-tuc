import React, { useEffect, useState } from "react";
import { Input, Select, message, Card, Tag } from "antd";
import { getPaymentHistory } from "../../services/payment";
import { FiDownload } from "react-icons/fi";
import { HiOutlineFilter } from "react-icons/hi";
import { BsSearch, BsPerson, BsPersonBadge } from "react-icons/bs";
import { MdPayment, MdCalendarMonth } from "react-icons/md";
import * as XLSX from 'xlsx';
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import ComponentCard from "../common/ComponentCard";
import ReusableTable from "../common/ReusableTable";
import Pagination from "../pagination";
import { useSearchParams } from "react-router";
import Label from "../form/Label";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;

interface PaymentTransaction {
    id: string;
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

interface ApiResponse {
    status: number;
    message: string;
    data: PaymentTransaction[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
}

const ManagePayment: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [offset, setOffset] = useState(Number(searchParams.get("offset")) || 0);
    const [quantity, setQuantity] = useState(Number(searchParams.get("quantity")) || 10);
    const [searchOrderId, setSearchOrderId] = useState(searchParams.get("orderId") || "");
    const [searchInstructorName, setSearchInstructorName] = useState(searchParams.get("instructorName") || "");
    const [searchUsername, setSearchUsername] = useState(searchParams.get("username") || "");
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedDay, setSelectedDay] = useState<number | undefined>();
    const [successStatus, setSuccessStatus] = useState<boolean | undefined>();
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const columns: {
        key: keyof PaymentTransaction;
        label: string;
        render?: (value: any) => React.ReactNode;
    }[] = [
        { key: "id", label: "Mã đơn hàng" },
        { 
            key: "amount", 
            label: "Số tiền",
            render: (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
        },
        { key: "orderInfo", label: "Thông tin đơn hàng" },
        { key: "payType", label: "Phương thức thanh toán" },
        { 
            key: "success", 
            label: "Trạng thái",
            render: (success: boolean) => (
                <Tag color={success ? "success" : "error"}>
                    {success ? "Thành công" : "Thất bại"}
                </Tag>
            )
        },
        { key: "courseTitle", label: "Khóa học" },
        { 
            key: "coursePrice", 
            label: "Giá khóa học",
            render: (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
            },
        { key: "userName", label: "Tên người dùng" },
        { key: "instructorName", label: "Giảng viên" },
        { 
            key: "paymentDate", 
            label: "Ngày thanh toán",
            render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A"
        }
    ];

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await getPaymentHistory({
                success: successStatus,
                year: selectedYear,
                month: selectedMonth,
                day: selectedDay,
                page: offset,
                size: quantity,
                orderId: searchOrderId || undefined,
                instructorName: searchInstructorName || undefined,
                username: searchUsername || undefined
            });

            
            if (response.status === 200) {
                const paymentsWithId = response.data.map(payment => ({
                    ...payment,
                    id: payment.orderId
                }));
                setPayments(paymentsWithId);
                setTotalPages(response.totalPages);
                setCurrentPage(response.currentPage);
                setTotalItems(response.totalItems);
                setError(undefined);
            } else {
                setError(response.message || "Có lỗi xảy ra khi tải dữ liệu");
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
            setError("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [offset, quantity, successStatus, selectedYear, selectedMonth, selectedDay, searchOrderId, searchInstructorName, searchUsername]);

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            payments.map(payment => ({
                "Mã đơn hàng": payment.orderId,
                "Số tiền": new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount),
                "Thông tin đơn hàng": payment.orderInfo,
                "Phương thức thanh toán": payment.payType,
                "Trạng thái": payment.success ? "Thành công" : "Thất bại",
                "Khóa học": payment.courseTitle,
                "Giá khóa học": new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.coursePrice),
                "Giảng viên": payment.instructorName,
                "Ngày thanh toán": payment.paymentDate ? dayjs(payment.paymentDate).format("DD/MM/YYYY HH:mm") : "N/A"
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History");
        XLSX.writeFile(workbook, "payment_history.xlsx");
    };

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => currentYear - i);
    };

    const generateMonthOptions = () => {
        return Array.from({ length: 12 }, (_, i) => i + 1);
    };

    const generateDayOptions = () => {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    return (
        <div className="">
            <PageMeta
                title="Quản lý thanh toán"
                description="Quản lý lịch sử thanh toán"
            />
            <PageBreadcrumb pageTitle="Quản lý thanh toán" />
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50"
                >
                    <FiDownload size={20} />
                    Xuất báo cáo
                </button>
            </div>
            <ComponentCard title="Danh sách thanh toán">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 mb-6">
                    <div>
                        <Label htmlFor="order-id-search">Tìm kiếm theo mã đơn hàng</Label>
                        <div className="relative">
                            <Input
                                id="order-id-search"
                                placeholder="Nhập mã đơn hàng..."
                                allowClear
                                value={searchOrderId}
                                onChange={(e) => {
                                    setSearchOrderId(e.target.value);
                                    if (!e.target.value) {
                                        setOffset(0);
                                        setSearchParams(prev => {
                                            const newParams = new URLSearchParams(prev);
                                            newParams.delete('orderId');
                                            return newParams;
                                        });
                                    }
                                }}
                                onPressEnter={(e) => {
                                    const value = (e.target as HTMLInputElement).value;
                                    setSearchOrderId(value);
                                    setOffset(0);
                                    setSearchParams(prev => {
                                        const newParams = new URLSearchParams(prev);
                                        if (value) {
                                            newParams.set('orderId', value);
                                        } else {
                                            newParams.delete('orderId');
                                        }
                                        return newParams;
                                    });
                                }}
                                className="w-full h-[41px] pr-10"
                                prefix={<BsSearch className="text-gray-400" />}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="instructor-name-search">Tìm kiếm theo giảng viên</Label>
                        <div className="relative">
                            <Input
                                id="instructor-name-search"
                                placeholder="Nhập tên giảng viên..."
                                allowClear
                                value={searchInstructorName}
                                onChange={(e) => {
                                    setSearchInstructorName(e.target.value);
                                    if (!e.target.value) {
                                        setOffset(0);
                                        setSearchParams(prev => {
                                            const newParams = new URLSearchParams(prev);
                                            newParams.delete('instructorName');
                                            return newParams;
                                        });
                                    }
                                }}
                                onPressEnter={(e) => {
                                    const value = (e.target as HTMLInputElement).value;
                                    setSearchInstructorName(value);
                                    setOffset(0);
                                    setSearchParams(prev => {
                                        const newParams = new URLSearchParams(prev);
                                        if (value) {
                                            newParams.set('instructorName', value);
                                        } else {
                                            newParams.delete('instructorName');
                                        }
                                        return newParams;
                                    });
                                }}
                                className="w-full h-[41px] pr-10"
                                prefix={<BsPersonBadge className="text-gray-400" />}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="username-search">Tìm kiếm theo người dùng</Label>
                        <div className="relative">
                            <Input
                                id="username-search"
                                placeholder="Nhập tên người dùng..."
                                allowClear
                                value={searchUsername}
                                onChange={(e) => {
                                    setSearchUsername(e.target.value);
                                    if (!e.target.value) {
                                        setOffset(0);
                                        setSearchParams(prev => {
                                            const newParams = new URLSearchParams(prev);
                                            newParams.delete('username');
                                            return newParams;
                                        });
                                    }
                                }}
                                onPressEnter={(e) => {
                                    const value = (e.target as HTMLInputElement).value;
                                    setSearchUsername(value);
                                    setOffset(0);
                                    setSearchParams(prev => {
                                        const newParams = new URLSearchParams(prev);
                                        if (value) {
                                            newParams.set('username', value);
                                        } else {
                                            newParams.delete('username');
                                        }
                                        return newParams;
                                    });
                                }}
                                className="w-full h-[41px] pr-10"
                                prefix={<BsPerson className="text-gray-400" />}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="year-select">Năm</Label>
                        <Select
                            id="year-select"
                            className="w-full h-[41px]"
                            value={selectedYear}
                            onChange={(value) => {
                                setSelectedYear(value);
                                setOffset(0);
                            }}
                            suffixIcon={<MdCalendarMonth className="text-gray-400" />}
                        >
                            {generateYearOptions().map((year) => (
                                <Option key={year} value={year}>
                                    {year}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="month-select">Tháng</Label>
                        <Select
                            id="month-select"
                            className="w-full h-[41px]"
                            value={selectedMonth}
                            onChange={(value) => {
                                setSelectedMonth(value);
                                setOffset(0);
                            }}
                            suffixIcon={<MdCalendarMonth className="text-gray-400" />}
                        >
                            {generateMonthOptions().map((month) => (
                                <Option key={month} value={month}>
                                    {month}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="day-select">Ngày</Label>
                        <Select
                            id="day-select"
                            className="w-full h-[41px]"
                            value={selectedDay}
                            onChange={(value) => {
                                setSelectedDay(value);
                                setOffset(0);
                            }}
                            allowClear
                            suffixIcon={<MdCalendarMonth className="text-gray-400" />}
                        >
                            {generateDayOptions().map((day) => (
                                <Option key={day} value={day}>
                                    {day}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="status-select">Trạng thái</Label>
                        <Select
                            id="status-select"
                            className="w-full h-[41px]"
                            value={successStatus}
                            onChange={(value) => {
                                setSuccessStatus(value);
                                setOffset(0);
                            }}
                            allowClear
                            suffixIcon={<MdPayment className="text-gray-400" />}
                        >
                            <Option value={true}>Thành công</Option>
                            <Option value={false}>Thất bại</Option>
                        </Select>
                    </div>
                </div>

                <ReusableTable
                    error={error}
                    title="Danh sách thanh toán"
                    data={payments}
                    columns={columns}
                    isLoading={loading}
                />

                <Pagination
                    limit={quantity}
                    offset={offset}
                    totalPages={totalPages}
                    onPageChange={(limit, newOffset) => {
                        setQuantity(limit);
                        setOffset(newOffset);
                        setSearchParams({
                            offset: String(newOffset),
                            quantity: String(limit),
                            ...(searchOrderId && { orderId: searchOrderId }),
                            ...(searchInstructorName && { instructorName: searchInstructorName }),
                            ...(searchUsername && { username: searchUsername }),
                            ...(selectedYear && { year: String(selectedYear) }),
                            ...(selectedMonth && { month: String(selectedMonth) }),
                            ...(selectedDay && { day: String(selectedDay) }),
                            ...(successStatus !== undefined && { status: String(successStatus) })
                        });
                    }}
                    onLimitChange={(newLimit) => {
                        setQuantity(newLimit);
                        setOffset(0);
                        setSearchParams({
                            offset: "0",
                            quantity: String(newLimit),
                            ...(searchOrderId && { orderId: searchOrderId }),
                            ...(searchInstructorName && { instructorName: searchInstructorName }),
                            ...(searchUsername && { username: searchUsername }),
                            ...(selectedYear && { year: String(selectedYear) }),
                            ...(selectedMonth && { month: String(selectedMonth) }),
                            ...(selectedDay && { day: String(selectedDay) }),
                            ...(successStatus !== undefined && { status: String(successStatus) })
                        });
                    }}
                />
            </ComponentCard>
        </div>
    );
};

export default ManagePayment;