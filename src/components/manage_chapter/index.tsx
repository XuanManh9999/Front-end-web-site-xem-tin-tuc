import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import ComponentCard from "../common/ComponentCard";
import ReusableTable from "../common/ReusableTable";
import { useState } from "react";
import Pagination from "../pagination";
import { useSearchParams } from "react-router";
import Label from "../form/Label";
import { Input, Select } from "antd";
const { Option } = Select;
import { IoIosAdd } from "react-icons/io";

const data = [
  {
    id: 101,
    name: "Lập trình Java Web Spring Boot từ A-Z",
    description:
      "Khóa học giúp bạn nắm vững kiến thức Spring Boot, JPA, RESTful API...",
    price: 499000,
    level: "Trung cấp",
    active: "HOAT_DONG",
    createdAt: "2025-04-01T08:00:00.000+00:00",
    updatedAt: "2025-04-06T10:00:00.000+00:00",
    instructor: "admin",
  },
  {
    id: 102,
    name: "ReactJS cơ bản đến nâng cao",
    description:
      "Học ReactJS qua dự án thực tế, từ component đến state management với Redux.",
    price: 599000,
    level: "Trung cấp",
    active: "HOAT_DONG",
    createdAt: "2025-03-28T09:30:00.000+00:00",
    updatedAt: "2025-04-05T16:10:00.000+00:00",
    instructor: "admin",
  },
  {
    id: 103,
    name: "HTML, CSS, JavaScript từ cơ bản đến chuyên sâu",
    description:
      "Nắm vững nền tảng front-end với HTML5, CSS3 và JavaScript ES6+.",
    price: 399000,
    level: "Cơ bản",
    active: "HOAT_DONG",
    createdAt: "2025-03-25T07:45:00.000+00:00",
    updatedAt: "2025-04-01T10:20:00.000+00:00",
    instructor: "admin",
  },
  {
    id: 104,
    name: "Kiến trúc phần mềm & Thiết kế hệ thống cho backend",
    description:
      "Hiểu về microservices, clean architecture, REST vs GraphQL...",
    price: 799000,
    level: "Nâng cao",
    active: "CHO_DUYET",
    createdAt: "2025-04-10T14:22:00.000+00:00",
    updatedAt: "2025-04-11T09:00:00.000+00:00",
    instructor: "admin",
  },
];

const columns: { key: any; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Tên khóa học" },
  { key: "description", label: "Mô tả" },
  { key: "price", label: "Giá (VNĐ)" },
  { key: "level", label: "Trình độ" },
  { key: "active", label: "Trạng thái" },
  { key: "createdAt", label: "Ngày tạo" },
  { key: "updatedAt", label: "Ngày cập nhật" },
  { key: "instructor", label: "Giảng viên" },
];

export default function ManageChapter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [offset, setOffset] = useState(Number(searchParams.get("offset")) || 0);
  const [openModal, setOpenModal] = useState(false);
  const [quantity, setQuantity] = useState(
    Number(searchParams.get("quantity")) || 20
  );
  // const [type, setType] = useState<ITypeNumber | undefined>(undefined);
  // const [types, setTypes] = useState<ITypeNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorData, setErrorData] = useState("");

  const onEdit = (item: any) => {};
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      // Call API delete here
      setOpenModal(false);
    } catch (error) {
      setError("Lỗi khi xóa dữ liệu");
    }
    setLoading(false);
  };

  return (
    <div className="">
      <PageMeta
        title="Quản lý chương học"
        description="Quản lý chương học trong hệ thống"
      />
      <PageBreadcrumb pageTitle="Quản lý chương học" />
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {}}
          className="flex items-center dark:bg-black dark:text-white  gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50">
          <IoIosAdd size={24} />
          Thêm
        </button>
      </div>
      <ComponentCard title="Danh sách các khóa học trong hệ thống">
        <div className=" grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <Label htmlFor="inputTwo">Tìm kiếm theo tên khóa học </Label>
            <Input
              type="text"
              id="inputTwo"
              className="border-gray-300 h-[41px]"
              placeholder="Nhập vào tên khóa học..."
              value={""}
              onChange={(e) => {}}
              onKeyDown={(e) => {}}
            />
          </div>
          {/* Tìm kiếm theo loại khóa học */}
          <div>
            <Label htmlFor="courseType">Tìm kiếm theo chủ đề khóa học</Label>
            <Select
              id="courseType"
              className="w-full h-[41px]"
              placeholder="Chọn loại khóa học"
              value={""}
              onChange={(value) => {
                // xử lý thay đổi giá trị lọc ở đây
              }}
              allowClear>
              <Option value="">Tất cả</Option>
              <Option value="video">Video bài giảng</Option>
              <Option value="document">Tài liệu</Option>
              <Option value="practice">Bài tập tự luyện</Option>
            </Select>
          </div>
        </div>
        <ReusableTable
          error={errorData}
          title="Danh sách số điện thoại"
          data={data}
          columns={columns}
          onEdit={(item) => {
            // setType(item);
            // setOpenModal(!openModal);
          }}
          isLoading={loading}
          onDelete={(id) => handleDelete(String(id))}
        />

        {/* Pagination */}
        <Pagination
          limit={quantity}
          offset={offset}
          totalPages={data?.total_pages ?? 1}
          onPageChange={(limit, newOffset) => {
            setQuantity(limit);
            setOffset(newOffset);
          }}
          onLimitChange={(newLimit) => {
            setQuantity(newLimit);
            setOffset(1);
          }}
        />
      </ComponentCard>
    </div>
  );
}
