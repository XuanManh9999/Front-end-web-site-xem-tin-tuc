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
  // Bài học cho khóa học id: 101
  {
    id: 1001,
    courseId: 101,
    courseName: "Khóa học Spring Boot cơ bản",
    description: "Giới thiệu về Spring Boot và các tính năng chính.",
    title: "Giới thiệu Spring Boot",
    duration: "15:30",
    type: "video",
  },
  {
    id: 1002,
    courseId: 101,
    title: "Cấu trúc dự án Spring Boot",
    courseName: "Khóa học Spring Boot cơ bản",
    description: "Cách tổ chức cấu trúc dự án Spring Boot.",
    duration: "20:10",
    type: "video",
  },
  {
    id: 1003,
    courseId: 101,
    title: "Thực hành tạo RESTful API",
    courseName: "Khóa học Spring Boot cơ bản",
    description: "Cách tổ chức cấu trúc dự án Spring Boot.",
    duration: "35:45",
    type: "video",
  },

  // Bài học cho khóa học id: 102
  {
    id: 1004,
    courseId: 102,
    title: "Giới thiệu ReactJS",
    courseName: "Khóa học Spring Boot cơ bản",
    description: "Cách tổ chức cấu trúc dự án Spring Boot.",
    duration: "12:00",
    type: "video",
  },
  {
    id: 1005,
    courseId: 102,
    title: "JSX & Component cơ bản",
    courseName: "Khóa học Spring Boot cơ bản",
    description: "Cách tổ chức cấu trúc dự án Spring Boot.",
    duration: "18:45",
    type: "video",
  },
  {
    id: 1006,
    courseId: 102,
    title: "State, Props & Event Handling",

    courseName: "Khóa học Spring Boot cơ bản",
    description: "Cách tổ chức cấu trúc dự án Spring Boot.",
    duration: "22:10",
    type: "video",
  },

  // Bài học cho khóa học id: 103
  {
    id: 1007,
    courseId: 103,
    title: "Cấu trúc HTML5 chuẩn",
    courseName: "Khóa học Spring Boot cơ bản",
    description: "Cách tổ chức cấu trúc dự án Spring Boot.",
    duration: "10:25",
    type: "video",
  },
  {
    id: 1008,
    courseId: 103,
    title: "Flexbox & Grid trong CSS3",
    courseName: "Khóa học Spring Boot cơ bản",
    description: "Cách tổ chức cấu trúc dự án Spring Boot.",
    duration: "17:30",
    type: "video",
  },
  {
    id: 1009,
    courseId: 103,
    title: "DOM & Event trong JavaScript",
    courseName: "Khóa học Spring Boot cơ bản",
    description: "Cách tổ chức cấu trúc dự án Spring Boot.",
    duration: "23:40",
    type: "video",
  },

  // Bài học cho khóa học id: 104
  {
    id: 1010,
    courseId: 104,
    title: "Microservices là gì?",
    courseName: "Khóa học Spring Boot cơ bản",
    description: "Cách tổ chức cấu trúc dự án Spring Boot.",
    duration: "14:00",
    type: "video",
  },
  {
    id: 1011,
    courseId: 104,
    title: "Clean Architecture áp dụng trong backend",
    courseName: "Khóa học Spring Boot cơ bản",
    description: "Cách tổ chức cấu trúc dự án Spring Boot.",
    duration: "26:15",
    type: "video",
  },
  {
    id: 1012,
    courseId: 104,
    title: "So sánh REST và GraphQL",
    courseName: "Khóa học Spring Boot cơ bản",
    description: "Cách tổ chức cấu trúc dự án Spring Boot.",
    duration: "19:50",
    type: "video",
  },
];

const columns: { key: any; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "courseId", label: "ID Khóa học" },
  { key: "description", label: "Mô tả" },
  { key: "duration", label: "Thời gian" },
  { key: "type", label: "Loại khóa học" },
];
const courses = [
  { id: 1, name: "Khóa học Spring Boot cơ bản" },
  { id: 2, name: "Khóa học ReactJS nâng cao" },
  { id: 3, name: "Khóa học JavaScript cho người mới bắt đầu" },
  { id: 4, name: "Khóa học Git & GitHub" },
];
export default function ManageLesson() {
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
        title="Quản lý bài học"
        description="Quản lý bài học trong hệ thống"
      />
      <PageBreadcrumb pageTitle="Quản lý bài học" />
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
            <Label htmlFor="course-select">Tìm kiếm theo tên khóa học</Label>
            <Select
              showSearch
              allowClear
              placeholder="Nhập vào tên khóa học..."
              style={{ width: "100%", height: 41 }}
              optionFilterProp="children"
              onChange={() => {}}
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }>
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.name}
                </Option>
              ))}
            </Select>
          </div>
          {/* Tìm kiếm theo loại khóa học */}
          <div>
            <Label htmlFor="courseType">Chọn chương học</Label>
            <Select
              id="courseType"
              className="w-full h-[41px]"
              placeholder="Chọn loại khóa học"
              value={""}
              onChange={(value) => {
                // xử lý thay đổi giá trị lọc ở đây
              }}
              allowClear>
              <Option value="">----</Option>
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
