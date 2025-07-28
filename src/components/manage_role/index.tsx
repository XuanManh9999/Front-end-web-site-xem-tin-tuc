import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import ComponentCard from "../common/ComponentCard";
import ReusableTable from "../common/ReusableTable";
import { useCallback, useEffect, useState } from "react";
import { IoIosAdd } from "react-icons/io";
import { Input, message } from "antd";
import Label from "../form/Label";
import { IRole } from "../../interface/role";
import { addRole, deleteRole, getRoles, updateRole } from "../../services/role";
import FormModal from "../common/FormModal";

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const columns: { key: any; label: string; render?: (text: string) => string }[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Tên vai trò" },
  { key: "descRole", label: "Mô tả" },
  { 
    key: "createdAt", 
    label: "Ngày tạo",
    render: (text: string) => formatDate(text)
  },
  { 
    key: "updatedAt", 
    label: "Ngày cập nhật",
    render: (text: string) => formatDate(text)
  },
];

export default function ManageRole() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorData, setErrorData] = useState("");
  const [roles, setRoles] = useState<IRole[]>([]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRoles();
      if (response?.length === 0) {
        setError("Không có dữ liệu");
      } else {
        setError("");
      }
      setRoles(response ?? []);
    } catch (error) {
      const axiosError = error as Error;
      setError(axiosError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      fetchRoles()
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          setErrorData(error.message);
          setLoading(false);
        });
    }, 1000);
  }, []);

  // Đảm bảo roles luôn có id là string | number, không undefined
  const safeRoles = roles.filter(role => role.id !== undefined).map(role => ({
    ...role,
    id: String(role.id),
  }));

  return (
    <>
      <div className="">
        <PageMeta
          title="Quản lý vai trò"
          description="Quản lý vai trò"
        />
        <PageBreadcrumb pageTitle="Quản lý vai trò" />
        <ComponentCard>
          <ReusableTable
            error={errorData}
            title="Danh sách vai trò"
            data={safeRoles}
            columns={columns}
            isLoading={loading}
          />
        </ComponentCard>
      </div>
    </>
  );
}