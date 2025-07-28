import { useState, useEffect } from "react";
import { Input, message } from "antd";
import ReusableTable from "../common/ReusableTable";
import { getCategoryPostManage, getCategoryPostById, createCategoryPost, updateCategoryPost, deleteCategoryPost } from "../../services/category_post";
import { CategoryPost } from "../../types/categoryPost";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import ComponentCard from "../common/ComponentCard";
import { IoIosAdd } from "react-icons/io";
import Label from "../form/Label";
import FormModal from "../common/FormModal";
import Pagination from "../pagination";
import { useSearchParams } from "react-router";

// Component hiển thị thông tin cấu trúc phân cấp
const HierarchyInfo = ({ parent, children }: { parent: CategoryPost | null, children: CategoryPost[] }) => {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Cấu trúc phân cấp:</span>
      </div>
      
      {/* Hiển thị parent */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Chủ đề cha:</span>
        {parent ? (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {parent.name} (ID: {parent.id})
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            Không có chủ đề cha
          </span>
        )}
      </div>
      
      {/* Hiển thị children */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Chủ đề con:</span>
        {children && children.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {children.map((child, index) => (
              <span key={child.id} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {child.name} (ID: {child.id})
              </span>
            ))}
          </div>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            Không có chủ đề con
          </span>
        )}
      </div>
    </div>
  );
};

const ManageCategoryPost = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<CategoryPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [formFields, setFormFields] = useState<any[]>([]);
  const [formFieldsAdd, setFormFieldsAdd] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [categoryOptions, setCategoryOptions] = useState<{label: string, value: number}[]>([]);
  const [hierarchyInfo, setHierarchyInfo] = useState<{parent: CategoryPost | null, children: CategoryPost[]} | null>(null);
  
  // Phân trang với query params
  const [offset, setOffset] = useState(Number(searchParams.get("offset")) || 0);
  const [quantity, setQuantity] = useState(Number(searchParams.get("limit")) || 10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Set default value của quantity và offset nếu không có
  useEffect(() => {
    if (!searchParams.get("limit") || !searchParams.get("offset")) {
      setSearchParams((prev: any) => {
        const newParams = new URLSearchParams(prev);
        if (!newParams.get("limit")) newParams.set("limit", "10");
        if (!newParams.get("offset")) newParams.set("offset", "0");
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  const fetchData = async (page: number = 1, keyword: string = "", customLimit?: number) => {
    try {
      setLoading(true);
      // Sử dụng customLimit nếu có, không thì dùng quantity
      const limitToUse = customLimit || quantity;
      const response = await getCategoryPostManage(limitToUse, page - 1, keyword);
      if (response?.status === 200) {
        setData(response.data);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalItems);
        setOffset(page - 1);
        setError(undefined);
        
        // Cập nhật query params
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("limit", limitToUse.toString());
          newParams.set("offset", (page - 1).toString());
          if (keyword) {
            newParams.set("keyword", keyword);
          } else {
            newParams.delete("keyword");
          }
          return newParams;
        });
      } else {
        setError(response?.message || "Có lỗi xảy ra khi tải dữ liệu");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách chủ đề cho select option (trừ chính nó và các con của nó khi sửa)
  const fetchCategoryOptions = async (excludeId?: number) => {
    const response = await getCategoryPostManage(100, 0, ""); // Lấy tất cả để làm options
    if (response?.status === 200) {
      let flatList: any[] = [];
      
      // Hàm đệ quy để flatten tree và loại bỏ chính nó và các con
      const flatten = (arr: any[], parentId?: number) => {
        arr.forEach(item => {
          // Loại bỏ chính nó và các con của nó
          if (excludeId && (item.id === excludeId || parentId === excludeId)) {
            return; // Bỏ qua item này và các con của nó
          }
          
          flatList.push({ label: item.name, value: item.id });
          
          // Đệ quy cho các con
          if (item.children && item.children.length > 0) {
            flatten(item.children, item.id);
          }
        });
      };
      
      flatten(response.data);
      setCategoryOptions(flatList);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    fetchData(1, search);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (limit: number, newOffset: number) => {
    setQuantity(limit);
    setOffset(newOffset);
    // Gọi API ngay lập tức với limit mới
    fetchData(newOffset + 1, search, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setQuantity(newLimit);
    setOffset(0);
    // Gọi API ngay lập tức với limit mới
    fetchData(1, search, newLimit);
  };

  const handleEdit = async (record: CategoryPost) => {
    try {
      setLoading(true);
      // Lấy dữ liệu chi tiết từ API getCategoryPostById
      const response = await getCategoryPostById(record.id);
      
      if (response?.status === 200) {
        const categoryDetail = response.data;
        
        // Lưu thông tin hierarchy để hiển thị
        setHierarchyInfo({
          parent: categoryDetail.parent,
          children: categoryDetail.children || []
        });
        
        // Lấy danh sách options cho parent (loại bỏ chính nó và các con của nó)
        await fetchCategoryOptions(record.id);
        
        setFormFields([
          {
            name: "id",
            label: "ID",
            type: "text",
            initialValue: categoryDetail.id,
            disabled: true,
          },
          {
            name: "name",
            label: "Tên chủ đề",
            type: "text",
            placeholder: "Nhập tên chủ đề",
            initialValue: categoryDetail.name,
            rules: [
              { required: true, message: "Vui lòng nhập tên chủ đề!" },
              { min: 2, message: "Tên chủ đề phải có ít nhất 2 ký tự!" },
            ],
          },
          {
            name: "slug",
            label: "Slug",
            type: "text",
            placeholder: "Nhập slug",
            initialValue: categoryDetail.slug || "",
            rules: [
              { required: true, message: "Vui lòng nhập slug!" },
            ],
          },
          {
            name: "description",
            label: "Mô tả",
            type: "textarea",
            placeholder: "Nhập mô tả",
            initialValue: categoryDetail.description || "",
          },
          {
            name: "parentId",
            label: "Chủ đề cha",
            type: "select",
            placeholder: "Chọn chủ đề cha (có thể bỏ trống)",
            options: categoryOptions,
            initialValue: categoryDetail.parentId || null,
          },
        ]);
        setOpenModal(true);
      } else {
        message.error(response?.message || "Không thể lấy thông tin chi tiết chủ đề");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi lấy thông tin chi tiết chủ đề");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true);
      const response = await deleteCategoryPost(Number(id));
      if (response?.status === 200) {
        message.success("Xóa chủ đề bài viết thành công");
        fetchData(offset + 1, search);
      } else {
        message.error(response?.message || "Xóa chủ đề bài viết thất bại");
      }
    } catch (error) {
      message.error("Xóa chủ đề bài viết thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdate = async (formData: any) => {
    if (formData.parentId === "" || formData.parentId === undefined) {
      formData.parentId = null;
    }
    try {
      setLoading(true);
      const response = await updateCategoryPost(formData.id, formData);
      if (response?.status === 200) {
        message.success("Cập nhật chủ đề bài viết thành công");
        fetchData(offset + 1, search);
      } else {
        message.error(response?.message || "Cập nhật chủ đề bài viết thất bại");
      }
    } catch (error) {
      message.error("Cập nhật chủ đề bài viết thất bại");
    } finally {
      setLoading(false);
      setOpenModal(false);
      setHierarchyInfo(null);
    }
  };

  const handleAdd = async (formData: any) => {
    if (formData.parentId === "" || formData.parentId === undefined) {
      formData.parentId = null;
    }
    try {
      setLoading(true);
      const response = await createCategoryPost(formData);
      if (response?.status === 200) {
        message.success("Thêm chủ đề bài viết thành công");
        fetchData(offset + 1, search);
      } else {
        message.error(response?.message || "Thêm chủ đề bài viết thất bại");
      }
    } catch (error) {
      message.error("Thêm chủ đề bài viết thất bại");
    } finally {
      setLoading(false);
      setOpenModalAdd(false);
    }
  };

  const handleShowModalAdd = () => {
    fetchCategoryOptions();
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
        name: "slug",
        label: "Slug",
        type: "text",
        placeholder: "Nhập slug",
        rules: [
          { required: true, message: "Vui lòng nhập slug!" },
        ],
      },
      {
        name: "parentId",
        label: "Chủ đề cha",
        type: "select",
        placeholder: "Chọn chủ đề cha (có thể bỏ trống)",
        options: categoryOptions,
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
    { key: "id" as keyof CategoryPost, label: "ID" },
    { key: "name" as keyof CategoryPost, label: "Tên chủ đề" },
    { key: "slug" as keyof CategoryPost, label: "Slug" },
    { key: "description" as keyof CategoryPost, label: "Mô tả" },
    { 
      key: "createAt" as keyof CategoryPost, 
      label: "Ngày tạo",
      render: (text: string) => formatDate(text)
    },
    { 
      key: "updateAt" as keyof CategoryPost, 
      label: "Ngày cập nhật",
      render: (text: string) => formatDate(text)
    },
  ];

  return (
    <>
      <div className="">
        <PageMeta
          title="Quản lý chủ đề bài viết"
          description="Quản lý chủ đề bài viết"
        />
        <PageBreadcrumb pageTitle="Quản lý chủ đề bài viết" />
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
            title="Danh sách chủ đề bài viết"
            data={data}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={loading}
          />
          
          <Pagination
            limit={quantity}
            offset={offset}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </ComponentCard>
      </div>
      
      {/* Modal Edit với thông tin hierarchy */}
      <FormModal
        title="Cập nhật thông tin chủ đề"
        isOpen={openModal}
        isLoading={loading}
        onSubmit={handleSubmitUpdate}
        onCancel={() => {
          setOpenModal(false);
          setHierarchyInfo(null);
        }}
        formFields={formFields}
        extraContent={
          hierarchyInfo && (
            <div className="mt-4">
              <HierarchyInfo 
                parent={hierarchyInfo.parent} 
                children={hierarchyInfo.children} 
              />
            </div>
          )
        }
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

export default ManageCategoryPost;
