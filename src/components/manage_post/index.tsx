import React, { useEffect, useState, useRef } from "react";
import { Input, Select, message, Modal, Popconfirm, Card, Tag, Button, Upload } from "antd";
import { getPosts, getPostById, createPost, updatePost, deletePost, TypeArticles, Post, ArticlesRequest } from "../../services/post";
import { getCategoryPosts } from "../../services/category_post";
import { getCategoryTag } from "../../services/category_tag";
import { IoIosAdd } from "react-icons/io";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaEye, FaEdit } from "react-icons/fa";
import { MdOutlineApproval } from "react-icons/md";
import { HiOutlineFilter } from "react-icons/hi";
import { FiDownload } from "react-icons/fi";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from 'xlsx';
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import ComponentCard from "../common/ComponentCard";
import ReusableTable from "../common/ReusableTable";
import Pagination from "../pagination";
import { useSearchParams } from "react-router";
import Label from "../form/Label";
import dayjs from "dayjs";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Cấu hình toolbar cho ReactQuill
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  }
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video', 'code-block',
  'color', 'background', 'script',
  'align', 'direction', 'clean'
];
import './PostForm.css';

const { Search } = Input;
const { Option } = Select;

interface CategoryPost {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
  description?: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: Post[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

interface TableColumn {
  key: keyof Post;
  label: string;
  render?: (value: any) => React.ReactNode;
}

const ManagePost: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<CategoryPost[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorData, setErrorData] = useState("");
  const [offset, setOffset] = useState(Number(searchParams.get("offset")) || 0);
  const [quantity, setQuantity] = useState(Number(searchParams.get("quantity")) || 20);
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'add' | null>(null);
  const [sortBy, setSortBy] = useState("view");
  const [order, setOrder] = useState("desc");
  const [formData, setFormData] = useState<ArticlesRequest>({});
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const quillRef = useRef<any>(null);
  const [quillLoaded, setQuillLoaded] = useState(false);

  const handleViewDetails = (post: Post) => {
    setSelectedPost(post);
    setModalType('view');
  };

  const handleEdit = async (post: Post) => {
    try {
      setLoading(true);
      const response = await getPostById(post.id);
      if (response?.status === 200) {
        const postData = response.data;
        setFormData({
          title: postData.title,
          slug: postData.slug,
          categoryId: postData.category.id,
          type: postData.type,
          authorId: postData.author.id,
          tagIds: postData.tags.map((tag: Tag) => tag.id)
        });
        setContent(postData.content);
        setSelectedTags(postData.tags.map((tag: Tag) => tag.id));
        setSelectedPost(postData);
        setModalType('edit');
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      message.error("Có lỗi xảy ra khi lấy thông tin bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      const formDataToSend = createPostFormData(formData, thumbnail);
      const response = await createPost(formDataToSend);
      
      if (response?.status === 201) {
        message.success("Thêm bài viết thành công");
        setModalType(null);
        resetForm();
        fetchPosts();
      } else {
        message.error(response?.message || "Có lỗi xảy ra khi thêm bài viết");
      }
    } catch (error) {
      console.error("Error adding post:", error);
      message.error("Có lỗi xảy ra khi thêm bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPost) return;
    
    try {
      setLoading(true);
      const formDataToSend = createPostFormData(formData, thumbnail);
      const response = await updatePost(selectedPost.id, formDataToSend);
      
      if (response?.status === 200) {
        message.success("Cập nhật bài viết thành công");
        setModalType(null);
        resetForm();
        fetchPosts();
      } else {
        message.error(response?.message || "Có lỗi xảy ra khi cập nhật bài viết");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      message.error("Có lỗi xảy ra khi cập nhật bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await deletePost(Number(id));
      if (response?.status === 200) {
        message.success("Xóa bài viết thành công");
        fetchPosts();
      } else {
        message.error(response?.message || "Có lỗi xảy ra khi xóa bài viết");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      message.error("Có lỗi xảy ra khi xóa bài viết");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setContent("");
    setThumbnail(null);
    setSelectedTags([]);
  };

  // Debug function to check if ReactQuill is working
  useEffect(() => {
    if (quillRef.current) {
      console.log('ReactQuill is loaded successfully');
      setQuillLoaded(true);
    }
  }, []);

  // Đảm bảo chỉ có 1 modal mở tại một thời điểm
  useEffect(() => {
    const openModals = [modalType].filter(Boolean);
    if (openModals.length > 1) {
      console.warn('Multiple modals are open, closing others...');
      console.log('Modal states:', { modalType });
      // Chỉ giữ modal cuối cùng được mở
      if (modalType === 'add') {
        setModalType(null);
      } else if (modalType === 'edit') {
        setModalType(null);
      } else if (modalType === 'view') {
        setModalType(null);
      }
    }
  }, [modalType]);

  // Reset form when modal closes
  useEffect(() => {
    if (modalType === null) {
      resetForm();
    }
  }, [modalType]);

  const createPostFormData = (data: ArticlesRequest, thumbnail?: File | null): FormData => {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.slug) formData.append('slug', data.slug);
    if (content) formData.append('content', content);
    if (data.type) formData.append('type', data.type);
    if (data.authorId) formData.append('authorId', data.authorId.toString());
    if (data.categoryId) formData.append('categoryId', data.categoryId.toString());
    if (selectedTags.length > 0) {
      selectedTags.forEach(tagId => {
        formData.append('tagIds', tagId.toString());
      });
    }
    if (thumbnail) formData.append('thumbnail', thumbnail);
    
    return formData;
  };

  const handleExportExcel = () => {
    try {
      if (!posts || posts.length === 0) {
        message.warning("Không có dữ liệu để xuất báo cáo");
        return;
      }

      // Chuẩn bị dữ liệu cho Excel
      const excelData = posts.map(post => ({
        'ID': post.id,
        'Tiêu đề': post.title,
        'Danh mục': post.category.name,
        'Tác giả': post.author?.username || 'N/A',
        'Lượt xem': post.view,
        'Lượt thích': post.quantityLike,
        'Lưu': post.quantityBookmark,
        'Ngày tạo': dayjs(post.createAt).format("DD/MM/YYYY HH:mm")
      }));

      // Tạo worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Tạo workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Báo cáo bài viết");

      // Xuất file Excel
      XLSX.writeFile(wb, `BaoCaoBaiViet_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`);
      
      message.success(`Xuất báo cáo thành công với ${posts.length} bài viết`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      message.error("Có lỗi xảy ra khi xuất báo cáo");
    }
  };

  const columns: TableColumn[] = [
    { key: "id", label: "ID" },
    { key: "title", label: "Tiêu đề" },
    { key: "category", label: "Danh mục", render: (category: any) => category?.name || 'N/A' },
    { 
      key: "author", 
      label: "Tác giả",
      render: (author: any) => author?.username || 'N/A'
    },
    { key: "view", label: "Lượt xem" },
      { key: "quantityLike", label: "Lượt thích" },
    { key: "quantityBookmark", label: "Lưu" },
    { 
      key: "createAt", 
      label: "Ngày tạo",
      render: (createAt: string) => dayjs(createAt).format("DD/MM/YYYY HH:mm")
    }
  ];

  const actions = [
    {
      icon: <FaEye className="text-blue-500" />,
      onClick: handleViewDetails,
      className: "bg-blue-100 hover:bg-blue-200",
    },
    {
      icon: <FaEdit className="text-orange-500" />,
      onClick: handleEdit,
      className: "bg-orange-100 hover:bg-orange-200",
    },
  ];
  
  useEffect(() => {
    if (!searchParams.get("limit") || !searchParams.get("offset")) {
      setSearchParams((prev: any) => {
        const newParams = new URLSearchParams(prev);
        if (!newParams.get("limit")) newParams.set("limit", "20");
        if (!newParams.get("offset")) newParams.set("offset", "0");
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts(quantity, offset, sortBy, order, searchTitle);
      const apiResponse = response as ApiResponse;
      setPosts(apiResponse.data || []);
      setTotalPages(apiResponse.totalPages);
      setCurrentPage(apiResponse.currentPage);
      setTotalItems(apiResponse.totalItems);

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("limit", quantity.toString());
        newParams.set("offset", offset.toString());
        if (searchTitle) newParams.set("search", searchTitle);
        if (selectedCategory !== undefined) newParams.set("category", selectedCategory.toString());
        if (sortBy) newParams.set("sortBy", sortBy);
        if (order) newParams.set("order", order);
        return newParams;
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Có lỗi xảy ra khi tải danh sách bài viết");
      setErrorData("Có lỗi xảy ra khi tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategoryPosts();
      setCategories(Array.isArray(response?.data) ? response?.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Có lỗi xảy ra khi tải danh mục");
    }
  };

  const fetchTags = async () => {
    try {
      const response = await getCategoryTag(100, 0, ""); // Lấy tất cả tags
      setTags(Array.isArray(response?.data) ? response?.data : []);
    } catch (error) {
      console.error("Error fetching tags:", error);
      message.error("Có lỗi xảy ra khi tải tags");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [offset, quantity, searchTitle, selectedCategory, sortBy, order]);

  return (
    <div className="">
      <PageMeta
        title="Quản lý bài viết"
        description="Quản lý bài viết"
      />
      <PageBreadcrumb pageTitle="Quản lý bài viết" />
      
      <div className="flex justify-between mb-4">
        <button
          onClick={() => {
            resetForm();
            setModalType('add');
          }}
          className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50"
        >
          <IoIosAdd size={20} />
          Thêm bài viết
        </button>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50"
        >
          <FiDownload size={20} />
          Xuất báo cáo
        </button>
      </div>

      <ComponentCard title="Danh sách bài viết">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-6 mb-6">
          <div className="lg:col-span-2">
            <Label htmlFor="title-search">Tìm kiếm theo tiêu đề</Label>
            <div className="relative">
              <Input
                id="title-search"
                placeholder="Nhập tiêu đề bài viết..."
                allowClear
                onPressEnter={(e) => {
                  setSearchTitle((e.target as HTMLInputElement).value);
                  setOffset(0);
                }}
                className="w-full h-[41px] pr-10"
                prefix={<HiOutlineFilter className="text-gray-400" />}
              />
            </div>
          </div>
          {/* <div>
            <Label htmlFor="category-select">Chọn danh mục</Label>
            <Select
              id="category-select"
              className="w-full h-[41px]"
              placeholder="Chọn danh mục"
              allowClear
              onChange={(value) => {
                setSelectedCategory(value);
                setOffset(0);
              }}
            >
              <Option value={undefined}>Tất cả</Option>
              {Array.isArray(categories) && categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </div> */}
          <div>
            <Label htmlFor="sort-select">Sắp xếp theo</Label>
            <Select
              id="sort-select"
              className="w-full h-[41px]"
              value={sortBy}
              onChange={(value) => {
                setSortBy(value);
                setOffset(0);
              }}
            >
              <Option value="view">Lượt xem</Option>
              <Option value="createAt">Mới nhất</Option>
            </Select>
          </div>
          <div>
            <Label htmlFor="order-select">Thứ tự</Label>
            <Select
              id="order-select"
              className="w-full h-[41px]"
              value={order}
              onChange={(value) => {
                setOrder(value);
                setOffset(0);
              }}
            >
              <Option value="desc">Giảm dần</Option>
              <Option value="asc">Tăng dần</Option>
            </Select>
          </div>
        </div>

        <ReusableTable
          error={errorData}
          title="Danh sách bài viết"
          data={posts}
          columns={columns}
          actions={actions}
          isLoading={loading}
          onDelete={(id) => handleDelete(String(id))}
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
              ...(searchTitle && { search: searchTitle }),
              ...(selectedCategory !== undefined && { category: String(selectedCategory) }),
              ...(sortBy && { sortBy }),
              ...(order && { order })
            });
          }}
          onLimitChange={(newLimit) => {
            setQuantity(newLimit);
            setOffset(0);
            setSearchParams({
              offset: "0",
              quantity: String(newLimit),
              ...(searchTitle && { search: searchTitle }),
              ...(selectedCategory !== undefined && { category: String(selectedCategory) }),
              ...(sortBy && { sortBy }),
              ...(order && { order })
            });
          }}
        />
      </ComponentCard>

      {/* Modal xem chi tiết */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg">
            <FaEye className="text-blue-500" />
            <span>Chi tiết bài viết</span>
          </div>
        }
        open={modalType === 'view'}
        onCancel={() => setModalType(null)}
        footer={null}
        width={900}
        className="post-preview-modal"
      >
        {selectedPost && (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              {selectedPost.thumbnail && (
                <div className="relative w-40 h-40 flex-shrink-0">
                  <img
                    src={selectedPost.thumbnail}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover rounded-xl shadow-md"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-3 text-gray-800">{selectedPost.title}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">Tác giả:</span>
                    <span className="text-gray-800">{selectedPost.author?.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">Danh mục:</span>
                    <span className="text-gray-800">{selectedPost.category?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">Ngày tạo:</span>
                    <span className="text-gray-800">{dayjs(selectedPost.createAt).format("DD/MM/YYYY HH:mm")}</span>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-gray-50 border-0 shadow-sm">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center p-4">
                  <p className="text-sm text-gray-600 mb-2">Lượt xem</p>
                  <p className="text-3xl font-bold text-blue-600">{selectedPost.view}</p>
                </div>
              </Card>
              <Card className="bg-green-50 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center p-4">
                  <p className="text-sm text-gray-600 mb-2">Lượt thích</p>
                  <p className="text-3xl font-bold text-green-600">{selectedPost.quantityLike}</p>
                </div>
              </Card>
              <Card className="bg-yellow-50 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center p-4">
                  <p className="text-sm text-gray-600 mb-2">Lưu</p>
                  <p className="text-3xl font-bold text-yellow-600">{selectedPost.quantityBookmark}</p>
                </div>
              </Card>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalType(null)}
                className="px-6 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal thêm bài viết */}
      <Modal
        title="Thêm bài viết mới"
        open={modalType === 'add'}
        onCancel={() => {
          setModalType(null);
          resetForm();
        }}
        onOk={handleAdd}
        width={800}
        confirmLoading={loading}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Nhập tiêu đề bài viết"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="Nhập slug"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Danh mục</Label>
              <Select
                id="category"
                className="w-full"
                placeholder="Chọn danh mục"
                value={formData.categoryId}
                onChange={(value) => setFormData({...formData, categoryId: value})}
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Loại bài viết</Label>
              <Select
                id="type"
                className="w-full"
                placeholder="Chọn loại bài viết"
                value={formData.type}
                onChange={(value) => setFormData({...formData, type: value})}
              >
                <Option value={TypeArticles.ARTICLE} selected>Bài viết</Option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Select
              id="tags"
              mode="multiple"
              className="w-full"
              placeholder="Chọn tags"
              value={selectedTags}
              onChange={setSelectedTags}
            >
              {tags.map((tag) => (
                <Option key={tag.id} value={tag.id}>
                  {tag.name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <Upload
              beforeUpload={(file) => {
                setThumbnail(file);
                return false;
              }}
              onRemove={() => setThumbnail(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </div>

          <div>
            <Label htmlFor="content">Nội dung</Label>
            <div className="border rounded-lg bg-white" style={{ minHeight: '400px' }}>
              <div className="quill-wrapper">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder="Nhập nội dung bài viết... Bạn có thể sử dụng các công cụ trên thanh toolbar để định dạng văn bản, thêm hình ảnh, video, code và nhiều tính năng khác!"
                  style={{ 
                    height: '350px'
                  }}
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">💡</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Hướng dẫn sử dụng trình soạn thảo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
                    <div className="space-y-1">
                      <p className="font-medium">📝 Định dạng văn bản:</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li>In đậm, in nghiêng, gạch chân, gạch ngang</li>
                        <li>Thay đổi màu chữ và nền</li>
                        <li>Tạo tiêu đề (H1, H2, H3...)</li>
                        <li>Thay đổi font chữ và kích thước</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">🖼️ Thêm nội dung:</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li>Hình ảnh từ URL hoặc upload</li>
                        <li>Video từ YouTube, Vimeo...</li>
                        <li>Link và blockquote</li>
                        <li>Code inline và code block</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">📋 Cấu trúc:</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li>Danh sách có thứ tự/không thứ tự</li>
                        <li>Thụt lề văn bản</li>
                        <li>Căn chỉnh văn bản (trái, giữa, phải, đều)</li>
                        <li>Chỉ số trên/dưới</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">💻 Tính năng nâng cao:</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li>Copy/paste với định dạng</li>
                        <li>Xóa định dạng</li>
                        <li>Hỗ trợ RTL (viết từ phải sang trái)</li>
                        <li>Responsive trên mobile</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal sửa bài viết */}
      <Modal
        title="Sửa bài viết"
        open={modalType === 'edit'}
        onCancel={() => {
          setModalType(null);
          resetForm();
        }}
        onOk={handleUpdate}
        width={800}
        confirmLoading={loading}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title-edit">Tiêu đề</Label>
              <Input
                id="title-edit"
                value={formData.title || ""}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Nhập tiêu đề bài viết"
              />
            </div>
            <div>
              <Label htmlFor="slug-edit">Slug</Label>
              <Input
                id="slug-edit"
                value={formData.slug || ""}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="Nhập slug"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category-edit">Danh mục</Label>
              <Select
                id="category-edit"
                className="w-full"
                placeholder="Chọn danh mục"
                value={formData.categoryId}
                onChange={(value) => setFormData({...formData, categoryId: value})}
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="type-edit">Loại bài viết</Label>
              <Select
                id="type-edit"
                className="w-full"
                placeholder="Chọn loại bài viết"
                value={formData.type}
                onChange={(value) => setFormData({...formData, type: value})}
              >
                <Option value={TypeArticles.ARTICLE} selected>Bài viết</Option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags-edit">Tags</Label>
            <Select
              id="tags-edit"
              mode="multiple"
              className="w-full"
              placeholder="Chọn tags"
              value={selectedTags}
              onChange={setSelectedTags}
            >
              {tags.map((tag) => (
                <Option key={tag.id} value={tag.id}>
                  {tag.name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="thumbnail-edit">Thumbnail</Label>
            <Upload
              beforeUpload={(file) => {
                setThumbnail(file);
                return false;
              }}
              onRemove={() => setThumbnail(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </div>

          <div>
            <Label htmlFor="content-edit">Nội dung</Label>
            <div className="border rounded-lg bg-white" style={{ minHeight: '400px' }}>
              <div className="quill-wrapper">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder="Nhập nội dung bài viết... Bạn có thể sử dụng các công cụ trên thanh toolbar để định dạng văn bản, thêm hình ảnh, video, code và nhiều tính năng khác!"
                  style={{ 
                    height: '350px'
                  }}
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">💡</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Hướng dẫn sử dụng trình soạn thảo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
                    <div className="space-y-1">
                      <p className="font-medium">📝 Định dạng văn bản:</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li>In đậm, in nghiêng, gạch chân, gạch ngang</li>
                        <li>Thay đổi màu chữ và nền</li>
                        <li>Tạo tiêu đề (H1, H2, H3...)</li>
                        <li>Thay đổi font chữ và kích thước</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">🖼️ Thêm nội dung:</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li>Hình ảnh từ URL hoặc upload</li>
                        <li>Video từ YouTube, Vimeo...</li>
                        <li>Link và blockquote</li>
                        <li>Code inline và code block</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">📋 Cấu trúc:</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li>Danh sách có thứ tự/không thứ tự</li>
                        <li>Thụt lề văn bản</li>
                        <li>Căn chỉnh văn bản (trái, giữa, phải, đều)</li>
                        <li>Chỉ số trên/dưới</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">💻 Tính năng nâng cao:</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li>Copy/paste với định dạng</li>
                        <li>Xóa định dạng</li>
                        <li>Hỗ trợ RTL (viết từ phải sang trái)</li>
                        <li>Responsive trên mobile</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManagePost;
