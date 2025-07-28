import { useState, useEffect } from "react";
import { Button, Input, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import ReusableTable from "../common/ReusableTable";
import { getCategoryTag, createCategoryTag, updateCategoryTag, deleteCategoryTag } from "../../services/category_tag";
import { CategoryCourse } from "../../types/categoryCourse";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import ComponentCard from "../common/ComponentCard";
import { IoIosAdd } from "react-icons/io";
import Label from "../form/Label";
import FormModal from "../common/FormModal";
import Pagination from "../pagination";

const ManageCategoryTag = () => {
  const [data, setData] = useState<CategoryCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [formFields, setFormFields] = useState<any[]>([]);
  const [formFieldsAdd, setFormFieldsAdd] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchData = async (off = offset, lim = limit, keyword = search) => {
    try {
      setLoading(true);
      const response = await getCategoryTag(lim, off, keyword);
      if (response?.status === 200) {
        setData(response.data);
        setTotalPages(response.totalPages || 1);
        setError(undefined);
      } else {
        setError(response?.message || "Có lỗi xảy ra khi tải dữ liệu");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [offset, limit]);

  const handleSearch = () => {
    setOffset(0);
    fetchData(0, limit, search);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleEdit = (record: CategoryCourse) => {
    setFormFields([
      {
        name: "id",
        label: "ID",
        type: "text",
        initialValue: record.id,
        disabled: true,
      },
      {
        name: "name",
        label: "Tên chủ đề",
        type: "text",
        placeholder: "Nhập tên chủ đề",
        initialValue: record.name,
        rules: [
          { required: true, message: "Vui lòng nhập tên chủ đề!" },
          { min: 2, message: "Tên chủ đề phải có ít nhất 2 ký tự!" },
        ],
      },
      {
        name: "description",
        label: "Mô tả",
        type: "textarea",
        placeholder: "Nhập mô tả",
        initialValue: record.description,
      },
    ]);
    setOpenModal(true);
  };

  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true);
      const response = await deleteCategoryTag(Number(id));
      if (response?.status === 200) {
        message.success("Xóa chủ đề tag thành công");
        fetchData();
      } else {
        message.error(response?.message || "Xóa chủ đề tag thất bại");
      }
    } catch (error) {
      message.error("Xóa chủ đề tag thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdate = async (formData: any) => {
    try {
      setLoading(true);
      const response = await updateCategoryTag(formData.id, formData);
      if (response?.status === 200) {
        message.success("Cập nhật chủ đề tag thành công");
        fetchData();
      } else {
        message.error(response?.message || "Cập nhật chủ đề tag thất bại");
      }
    } catch (error) {
      message.error("Cập nhật chủ đề tag thất bại");
    } finally {
      setLoading(false);
      setOpenModal(false);
    }
  };

  const handleAdd = async (formData: any) => {
    try {
      setLoading(true);
      const response = await createCategoryTag(formData);
      if (response?.status === 201 || response?.status === 200) {
        message.success("Thêm chủ đề tag thành công");
        fetchData();
      } else {
        message.error(response?.message || "Thêm chủ đề tag thất bại");
      }
    } catch (error) {
      message.error("Thêm chủ đề tag thất bại");
    } finally {
      setLoading(false);
      setOpenModalAdd(false);
    }
  };

  const handleShowModalAdd = () => {
    setFormFieldsAdd([
      {
        name: "name",
        label: "Tên chủ đề",
        type: "text",
        placeholder: "Nhập tên chủ đề",
        rules: [
          { required: true, message: "Vui lòng nhập tên chủ đề!" },
          { min: 2, message: "Tên chủ đề phải có ít nhất 2 ký tự!" },
        ],
      },
      {
        name: "description",
        label: "Mô tả",
        type: "textarea",
        placeholder: "Nhập mô tả",
      },
    ]);
    setOpenModalAdd(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    } catch (error) {
      return '';
    }
  };

  const columns = [
    { key: "id" as keyof CategoryCourse, label: "ID" },
    { key: "name" as keyof CategoryCourse, label: "Tên chủ đề" },
    { key: "description" as keyof CategoryCourse, label: "Mô tả" },
    {
      key: "createAt" as keyof CategoryCourse,
      label: "Ngày tạo",
      render: (text: string) => formatDate(text)
    },
    {
      key: "updateAt" as keyof CategoryCourse,
      label: "Ngày cập nhật",
      render: (text: string) => formatDate(text)
    },
  ];

  return (
    <>
      <div className="">
        <PageMeta
          title="Quản lý chủ đề tag"
          description="Quản lý chủ đề tag"
        />
        <PageBreadcrumb pageTitle="Quản lý chủ đề tag" />
        <div className="flex justify-end mb-4">
          <button
            onClick={handleShowModalAdd}
            className="flex items-center dark:bg-black dark:text-white gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50">
            <IoIosAdd size={24} />
            Thêm
          </button>
        </div>
        <ComponentCard>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <Label htmlFor="search">Tìm kiếm theo tên chủ đề</Label>
              <Input
                type="text"
                id="search"
                placeholder="Nhập vào tên chủ đề..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <ReusableTable
            error={error}
            title="Danh sách chủ đề tag"
            data={data}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={loading}
          />
          <div className="flex justify-end mt-4">
            <Pagination
              limit={limit}
              offset={offset}
              totalPages={totalPages}
              onPageChange={(newLimit, newOffset) => {
                setLimit(newLimit);
                setOffset(newOffset);
              }}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setOffset(0);
              }}
            />
          </div>
        </ComponentCard>
      </div>
      <FormModal
        title="Cập nhật thông tin chủ đề"
        isOpen={openModal}
        isLoading={loading}
        onSubmit={handleSubmitUpdate}
        onCancel={() => setOpenModal(false)}
        formFields={formFields}
      />
      <FormModal
        title="Thêm chủ đề mới"
        isOpen={openModalAdd}
        isLoading={loading}
        onSubmit={handleAdd}
        onCancel={() => setOpenModalAdd(false)}
        formFields={formFieldsAdd}
      />
    </>
  );
};

export default ManageCategoryTag;


