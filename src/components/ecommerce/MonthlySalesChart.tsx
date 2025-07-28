import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { BsThreeDots } from "react-icons/bs";
import { useState, useEffect } from "react";
import { getReportRevenue, getMonthlyCourseSales } from "../../services/report";
import { Modal, Table, Spin, Button, Form, Input, InputNumber, Row, Col, Space, Statistic } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from 'xlsx';

interface RevenueData {
  month: number;
  revenue: number;
}

interface CourseDetail {
  courseId: string;
  courseTitle: string;
  instructorName: string;
  username: string;
  price: number;
  quantitySold: number;
  totalRevenue: number;
  createAt: string;
}

export default function MonthlySalesChart() {
  const [isOpen, setIsOpen] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetail[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(10);
  const [detailTotal, setDetailTotal] = useState(0);
  const [filterForm, setFilterForm] = useState({
    courseTitle: '',
    instructorId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minQuantitySold: undefined,
    minRevenue: undefined,
    maxRevenue: undefined,
  });
  const [filters, setFilters] = useState(filterForm);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getReportRevenue(selectedYear);
        if (response.status === 200) {
          setRevenueData(response.data);
        } else {
          setError(response.message || "Có lỗi xảy ra khi tải dữ liệu");
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
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
      courseTitle: '',
      instructorId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minQuantitySold: undefined,
      minRevenue: undefined,
      maxRevenue: undefined,
    });
    setIsModalOpen(true);
    fetchCourseDetails(selectedYear, month, 1, detailPageSize);
  };

  const columns = [
    {
      title: 'ID khóa học',
      dataIndex: 'courseId',
      key: 'courseId',
    },
    {
      title: 'Khóa học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    {
      title: 'Giảng viên',
      dataIndex: 'instructorName',
      key: 'instructorName',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'quantitySold',
      key: 'quantitySold',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue: number) => formatCurrency(revenue),
    },
    {
      title: 'Ngày bán',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const options: ApexOptions = {
    colors: ["#465fff"],
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
        text: undefined,
      },
      labels: {
        formatter: (value) => {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value);
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
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(val);
        }
      },
    },
  };

  const series = [
    {
      name: "Doanh thu",
      data: revenueData.map(item => item.revenue),
    },
  ];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const exportMonthlyReport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet tổng quan
    const overviewData = revenueData.map(item => ({
      'Tháng': item.month,
      'Doanh thu (VND)': formatCurrency(item.revenue)
    }));
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng quan");

    // Sheet chi tiết (nếu có)
    if (courseDetails.length > 0) {
      const detailData = courseDetails.map(course => ({
        'Mã khóa học': course.courseId,
        'Tên khóa học': course.courseTitle,
        'Giảng viên': course.instructorName,
        'Giá (VND)': formatCurrency(course.price),
        'Số lượng bán': course.quantitySold,
        'Doanh thu (VND)': formatCurrency(course.totalRevenue),
        'Ngày bán': new Date(course.createAt).toLocaleDateString('vi-VN')
      }));
      const wsDetail = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(wb, wsDetail, "Chi tiết");
    }

    const fileName = `Bao_cao_doanh_thu_${selectedYear}${selectedMonth ? `_thang_${selectedMonth}` : ''}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const fetchCourseDetails = async (
    year: number,
    month: number,
    page = 1,
    pageSize = 10,
    filterObj = filters
  ) => {
    setDetailsLoading(true);
    try {
      const response = await getMonthlyCourseSales(year, month, {
        page: page - 1,
        size: pageSize,
        ...filterObj,
      });
      if (response && response.courses) {
        setCourseDetails(response.courses);
        setDetailTotal(response.totalElements || 0);
      }
    } catch (error) {
      // handle error
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    setDetailPage(pagination.current);
    setDetailPageSize(pagination.pageSize);
    fetchCourseDetails(selectedYear, selectedMonth!, pagination.current, pagination.pageSize, filters);
  };

  const handleFilterInputChange = (changed: any) => {
    setFilterForm(prev => ({ ...prev, ...changed }));
  };

  const handleSearch = () => {
    setFilters(filterForm);
    setDetailPage(1);
    fetchCourseDetails(selectedYear, selectedMonth!, 1, detailPageSize, filterForm);
  };

  const handleReset = () => {
    const reset = {
      courseTitle: '',
      instructorId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minQuantitySold: undefined,
      minRevenue: undefined,
      maxRevenue: undefined,
    };
    setFilterForm(reset);
    setFilters(reset);
    setDetailPage(1);
    fetchCourseDetails(selectedYear, selectedMonth!, 1, detailPageSize, reset);
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
            Thống kê doanh thu theo từng tháng
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
            Chi tiết doanh thu tháng {selectedMonth}/{selectedYear}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={1100}
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
              {formatCurrency(courseDetails.reduce((sum, course) => sum + course.totalRevenue, 0))} <span style={{ fontWeight: 400, fontSize: 16, color: "#666" }}>Tổng doanh thu</span>
            </div>
            <Form
              layout="inline"
              style={{ marginBottom: 16, rowGap: 12, columnGap: 16, flexWrap: 'wrap' }}
              className="custom-filter-form"
            >
              <Form.Item label="Tên khóa học" style={{ marginBottom: 12, minWidth: 180 }}>
                <Input
                  placeholder="Tìm theo tên khóa học"
                  value={filterForm.courseTitle}
                  onChange={e => handleFilterInputChange({ courseTitle: e.target.value })}
                  allowClear
                />
              </Form.Item>
              <Form.Item label="Giá từ" style={{ marginBottom: 12 }}>
                <InputNumber
                  min={0}
                  placeholder="VNĐ"
                  value={filterForm.minPrice}
                  onChange={val => handleFilterInputChange({ minPrice: val })}
                  style={{ width: 110 }}
                />
              </Form.Item>
              <Form.Item label="Giá đến" style={{ marginBottom: 12 }}>
                <InputNumber
                  min={0}
                  placeholder="VNĐ"
                  value={filterForm.maxPrice}
                  onChange={val => handleFilterInputChange({ maxPrice: val })}
                  style={{ width: 110 }}
                />
              </Form.Item>
              <Form.Item label="SL bán tối thiểu" style={{ marginBottom: 12 }}>
                <InputNumber
                  min={0}
                  placeholder="Số lượng"
                  value={filterForm.minQuantitySold}
                  onChange={val => handleFilterInputChange({ minQuantitySold: val })}
                  style={{ width: 110 }}
                />
              </Form.Item>
              <Form.Item label="Doanh thu tối thiểu" style={{ marginBottom: 12 }}>
                <InputNumber
                  min={0}
                  placeholder="VNĐ"
                  value={filterForm.minRevenue}
                  onChange={val => handleFilterInputChange({ minRevenue: val })}
                  style={{ width: 130 }}
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
                  onClick={exportMonthlyReport}
                >
                  Xuất báo cáo
                </Button>
              </Col>
            </Row>
            <Table
              columns={columns}
              dataSource={courseDetails}
              rowKey="courseId"
              loading={detailsLoading}
              bordered
              size="middle"
              scroll={{ x: 900 }}
              pagination={{
                current: detailPage,
                pageSize: detailPageSize,
                total: detailTotal,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} khóa học`
              }}
              onChange={handleTableChange}
            />
          </>
        )}
      </Modal>
    </>
  );
}