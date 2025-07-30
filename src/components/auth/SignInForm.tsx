import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Cookies from "js-cookie";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import { apiLogin } from "../../services/auth";
import { message, Spin } from "antd";
import { getCurrentUser } from "../../services/user";
import { Auth } from "../../interface/auth";

export default function SignInForm() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dataLogin, setDataLogin] = useState<Auth>({
    username: "",
    password: "",
  });

  const handleOnChangeDataLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDataLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoginAdmin = async () => {
    if (!dataLogin.username || !dataLogin.password) {
      message.warning("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }

    setLoading(true);
    try {
      const { status, refreshToken, accessToken } = await apiLogin(dataLogin);
      
      if (status === 200) {
        Cookies.set("accessTokenAdmin", accessToken, { expires: 1 / 24 });
        Cookies.set("refreshTokenAdmin", refreshToken, { expires: 1 });
        const { data, status: statusCurr } = await getCurrentUser();

        if (statusCurr === 200 && (data?.roles[0]?.name === "ROLE_ADMIN" ||  data?.roles[0]?.name === "ROLE_MANAGE")) {
          message.success("Đăng nhập thành công");
          localStorage.setItem("user", JSON.stringify(data));
          localStorage.setItem("isLogin", "true");
          setTimeout(() => {
            nav("/");
          }, 1000);
        } else {
          message.error("Bạn không có quyền truy cập vào trang này");
          Cookies.remove("accessTokenAdmin");
          Cookies.remove("refreshTokenAdmin");
        }
      } else {
        message.error("Tài khoản hoặc mật khẩu không chính xác");
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi, vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLoginAdmin();
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div>
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
              Đăng nhập
            </h3>
            <div className="space-y-6">
              <div>
                <Label>
                  Tên đăng nhập <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="username"
                  value={dataLogin.username}
                  onChange={handleOnChangeDataLogin}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập vào tên đăng nhập"
                  disabled={loading}
                />
              </div>
              <div>
                <Label>
                  Mật khẩu <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="password"
                    value={dataLogin.password}
                    onChange={handleOnChangeDataLogin}
                    onKeyDown={handleKeyDown}
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập vào mật khẩu"
                    disabled={loading}
                  />
                  <span
                    onClick={() => !loading && setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>
              <div>
                <Button 
                  className="w-full" 
                  size="sm" 
                  onClick={handleLoginAdmin}
                  disabled={loading}
                >
                  {loading ? (
                    <Spin size="small" className="mr-2" />
                  ) : null}
                  Đăng nhập
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
