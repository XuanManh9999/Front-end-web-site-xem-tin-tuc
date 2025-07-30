import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { BsThreeDots } from "react-icons/bs";
import { useState, useEffect } from "react";
import { getArticlesByYear, getArticlesByMonth } from "../../services/report";
import { Modal, Table, Spin, Button, Form, Input, Row, Col, Space, Statistic, Select } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from 'xlsx';

interface ArticleData {
  month: number;
  count: number;
}

interface ArticleDetail {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  slug: string;
  slugCategory: string;
  view: number;
  quantityLike: number;
  quantityBookmark: number;
  author: {
    id: number;
    username: string;
    avatar: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  createAt: string;
}

export default function ArticleReportChart() {
  const [isOpen, setIsOpen] = useState(false);
  const [articleData, setArticleData] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [articleDetails, setArticleDetails] = useState<ArticleDetail[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(10);
  const [detailTotal, setDetailTotal] = useState(0);
  const [filterForm, setFilterForm] = useState({
    title: '',
    category: '',
    status: '',
    sortBy: 'view',
    sortOrder: 'desc',
    keyword: ''
  });
  const [filters, setFilters] = useState(filterForm);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Options cho select
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' }
  ];

  const sortByOptions = [
    { value: 'view', label: 'Lượt xem' },
    { value: 'createAt', label: 'Ngày tạo' },
    { value: 'title', label: 'Tiêu đề' },
    { value: 'quantityLike', label: 'Lượt thích' }
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Giảm dần' },
    { value: 'asc', label: 'Tăng dần' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getArticlesByYear(selectedYear);
        if (response.status === 200) {
          setArticleData(response.data);
        } else {
          setError(response.message || "Có lỗi xảy ra khi tải dữ liệu");
        }
      } catch (error) {
        console.error("Error fetching article data:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  const handleBarClick = async (event: any, chartContext: any, config: any) => {
    const month = config.dataPointIndex + 1;
    setSelectedMonth(month);
    setDetailPage(1);
    setFilters({
      title: '',
      category: '',
      status: '',
      sortBy: 'view',
      sortOrder: 'desc',
      keyword: ''
    });
    setIsModalOpen(true);
    fetchArticleDetails(selectedYear, month, 1, detailPageSize);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      width: 120,
      render: (author: any) => author?.username || 'N/A',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: any) => category?.name || 'N/A',
    },
    {
      title: 'Lượt xem',
      dataIndex: 'view',
      key: 'view',
      width: 100,
      sorter: (a: any, b: any) => a.view - b.view,
    },
    {
      title: 'Lượt thích',
      dataIndex: 'quantityLike',
      key: 'quantityLike',
      width: 100,
      sorter: (a: any, b: any) => a.quantityLike - b.quantityLike,
    },
    {
      title: 'Lượt bookmark',
      dataIndex: 'quantityBookmark',
      key: 'quantityBookmark',
      width: 120,
      sorter: (a: any, b: any) => a.quantityBookmark - b.quantityBookmark,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a: any, b: any) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
    },
  ];

  const options: ApexOptions = {
    colors: ["#3b82f6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
      events: {
        dataPointSelection: handleBarClick
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: "",
      },
      labels: {
        formatter: (value) => {
          return Math.floor(value).toString();
        }
      }
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => {
          return `${Math.floor(val)} bài viết`;
        }
      },
    },
  };

  const series = [
    {
      name: "Số lượng bài viết",
      data: articleData.map(item => item.count),
    },
  ];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const exportArticleReport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet chi tiết bài viết
    if (articleDetails.length > 0) {
      const detailData = articleDetails.map(article => ({
        'ID': article.id,
        'Tiêu đề': article.title,
        'Tác giả': article.author?.username || 'N/A',
        'Danh mục': article.category?.name || 'N/A',
        'Lượt xem': article.view,
        'Lượt thích': article.quantityLike,
        'Lượt bookmark': article.quantityBookmark,
        'Ngày tạo': new Date(article.createAt).toLocaleDateString('vi-VN'),
        'Tags': article.tags?.map(tag => tag.name).join(', ') || '',
        'Nội dung': article.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
      }));
      const wsDetail = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(wb, wsDetail, "Chi tiết bài viết");
    }

    const fileName = `Bao_cao_noi_dung_bai_viet_${selectedYear}_thang_${selectedMonth}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const fetchArticleDetails = async (
    year: number,
    month: number,
    page = 1,
    pageSize = 10,
    filterObj = filters
  ) => {
    setDetailsLoading(true);
    try {
      const response = await getArticlesByMonth(year, month, undefined, filterObj.sortBy, filterObj.sortOrder, page - 1, pageSize, filterObj.keyword);
      if (response && response.status === 200) {
        setArticleDetails(response.data);
        setDetailTotal(response.totalItems || 0);
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    setDetailPage(pagination.current);
    setDetailPageSize(pagination.pageSize);
    fetchArticleDetails(selectedYear, selectedMonth!, pagination.current, pagination.pageSize, filters);
  };

  const handleFilterInputChange = (changed: any) => {
    setFilterForm(prev => ({ ...prev, ...changed }));
  };

  const handleSearch = () => {
    setFilters(filterForm);
    setDetailPage(1);
    fetchArticleDetails(selectedYear, selectedMonth!, 1, detailPageSize, filterForm);
  };

  const handleReset = () => {
    const reset = {
      title: '',
      category: '',
      status: '',
      sortBy: 'view',
      sortOrder: 'desc',
      keyword: ''
    };
    setFilterForm(reset);
    setFilters(reset);
    setDetailPage(1);
    fetchArticleDetails(selectedYear, selectedMonth!, 1, detailPageSize, reset);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Thống kê số lượng bài viết theo từng tháng
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative inline-block">
              <button className="dropdown-toggle" onClick={toggleDropdown}>
                <BsThreeDots className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
              </button>
              <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="w-40 p-2"
              >
                {years.map((year) => (
                  <DropdownItem
                    key={year}
                    onItemClick={() => {
                      setSelectedYear(year);
                      closeDropdown();
                    }}
                    className={`flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300
                      ${selectedYear === year ? 'bg-gray-200 dark:bg-white/10 font-bold' : ''}`}
                  >
                    Năm {year}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <Chart options={options} series={series} type="bar" height={180} />
          </div>
        </div>
      </div>

      <Modal
        title={
          <span style={{ fontWeight: 600, fontSize: 18 }}>
            Chi tiết bài viết tháng {selectedMonth}/{selectedYear}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={1200}
        footer={null}
        bodyStyle={{ background: "#fafafa", paddingTop: 16 }}
      >
        {detailsLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 700, fontSize: 24, color: "#3f8600", marginBottom: 8 }}>
              {articleDetails.length} <span style={{ fontWeight: 400, fontSize: 16, color: "#666" }}>Tổng số bài viết</span>
            </div>
            <Form
              layout="inline"
              style={{ marginBottom: 16, rowGap: 12, columnGap: 16, flexWrap: 'wrap' }}
              className="custom-filter-form"
            >
          
              <Form.Item label="Sắp xếp theo" style={{ marginBottom: 12, minWidth: 150 }}>
                <Select
                  placeholder="Chọn tiêu chí"
                  value={filterForm.sortBy}
                  onChange={(value) => handleFilterInputChange({ sortBy: value })}
                  options={sortByOptions}
                  style={{ width: 150 }}
                />
              </Form.Item>
              <Form.Item label="Thứ tự" style={{ marginBottom: 12, minWidth: 120 }}>
                <Select
                  placeholder="Thứ tự"
                  value={filterForm.sortOrder}
                  onChange={(value) => handleFilterInputChange({ sortOrder: value })}
                  options={sortOrderOptions}
                  style={{ width: 120 }}
                />
              </Form.Item>
              <Form.Item label="Từ khóa" style={{ marginBottom: 12, minWidth: 180 }}>
                <Input
                  placeholder="Tìm theo từ khóa"
                  value={filterForm.keyword}
                  onChange={e => handleFilterInputChange({ keyword: e.target.value })}
                  allowClear
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 12 }}>
                <Button type="primary" onClick={handleSearch}>
                  Tìm kiếm
                </Button>
              </Form.Item>
              <Form.Item style={{ marginBottom: 12 }}>
                <Button onClick={handleReset}>
                  Làm mới
                </Button>
              </Form.Item>
            </Form>
            <Row justify="end" style={{ marginBottom: 8 }}>
              <Col>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={exportArticleReport}
                >
                  Xuất báo cáo nội dung
                </Button>
              </Col>
            </Row>
            <Table
              columns={columns}
              dataSource={articleDetails}
              rowKey="id"
              loading={detailsLoading}
              bordered
              size="middle"
              scroll={{ x: 1000 }}
              pagination={{
                current: detailPage,
                pageSize: detailPageSize,
                total: detailTotal,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} bài viết`
              }}
              onChange={handleTableChange}
            />
          </>
        )}
      </Modal>
    </>
  );
} 