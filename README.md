# CodeZen Admin Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- Add other relevant badges here: Build Status, Coverage, etc. -->
<!-- Example: [![Build Status](https://travis-ci.org/your-username/your-repo.svg?branch=main)](https://travis-ci.org/your-username/your-repo) -->

Giao diện quản trị trung tâm dành cho nền tảng học trực tuyến CodeZen, được xây dựng với **React, TypeScript, Vite, và Tailwind CSS**. Cung cấp bộ công cụ mạnh mẽ để quản lý hiệu quả người dùng, khóa học, nội dung và các hoạt động khác của nền tảng.

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Bắt đầu](#bắt-đầu)
  - [Điều kiện tiên quyết](#1-điều-kiện-tiên-quyết)
  - [Cài đặt](#2-cài-đặt)
  - [Cấu hình](#3-cấu-hình-biến-môi-trường)
  - [Chạy ứng dụng](#4-chạy-ứng-dụng)
- [Các Script Lệnh](#các-script-lệnh-chính)
- [Triển khai](#triển-khai-deployment)
- [Đóng góp](#đóng-góp-contributing)
- [Giấy phép](#giấy-phép)
- [Liên hệ & Hỗ trợ](#liên-hệ--hỗ-trợ)

## Giới thiệu

**CodeZen Admin Dashboard** là giải pháp toàn diện để quản lý nền tảng học trực tuyến CodeZen. Mục tiêu chính là cung cấp một giao diện trực quan và hiệu quả cho quản trị viên và người điều hành nội dung thực hiện các tác vụ như:

- Quản lý người dùng (học viên, giảng viên, quản trị viên).
- Quản lý vòng đời khóa học (tạo, sửa, xóa, xuất bản).
- Quản lý nội dung bài học và tài liệu.
- Theo dõi tiến độ học tập và tương tác.
- Xem báo cáo và phân tích dữ liệu.
- Cấu hình hệ thống.

## Tính năng

- **Giao diện Hiện đại & Responsive:** Xây dựng với Tailwind CSS, tối ưu cho mọi thiết bị.
- **Quản lý Toàn diện:** Các module chức năng chuyên biệt.
- **Trực quan hóa Dữ liệu:** Tích hợp biểu đồ với ApexCharts.
- **Type Safety:** Phát triển với TypeScript tăng độ tin cậy.
- **Hiệu suất Cao:** Vite cho trải nghiệm phát triển và build nhanh chóng.
- **Tùy chỉnh Dễ dàng:** Kiến trúc component linh hoạt.
- **Dark Mode:** Hỗ trợ giao diện tối.

## Công nghệ sử dụng

- **Framework:** React 18+
- **Ngôn ngữ:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Biểu đồ:** ApexCharts
- **HTTP Client:** Axios
- **Linting:** ESLint

## Cấu trúc thư mục

```text
├── public/              # nhưng nội dung công khai
├── src/                 # Mã nguồn ứng dụng
│   ├── assets/          # Hình ảnh, fonts,...
│   ├── components/      # UI components tái sử dụng
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React Hooks
│   ├── layouts/         # Bố cục trang (Sidebar, Header,...)
│   ├── pages/           # Components cho từng trang/route
│   ├── routes/          # Cấu hình React Router
│   ├── services/        # Logic gọi API (Axios instances, endpoints)
│   ├── store/           # State management (Redux, Zustand,...)
│   ├── types/           # Định nghĩa kiểu TypeScript
│   ├── utils/           # Hàm tiện ích
│   └── main.tsx         # Entry point của ứng dụng
├── .env                 # (Không commit) Biến môi trường local
├── .env.example         # File mẫu biến môi trường (Commit vào Git)
├── .eslintrc.cjs        # Cấu hình ESLint
├── .gitignore           # Files/folders bị Git bỏ qua
├── index.html           # Template HTML chính cho Vite
├── package.json         # Metadata dự án và dependencies
├── postcss.config.js    # Cấu hình PostCSS
├── tailwind.config.js   # Cấu hình Tailwind CSS
├── tsconfig.json        # Cấu hình TypeScript chung
├── tsconfig.node.json   # Cấu hình TS cho môi trường Node (Vite)
└── vite.config.ts       # Cấu hình Vite
```

## Bắt đầu

Thực hiện các bước sau để cài đặt và chạy dự án trên máy cục bộ của bạn.

### 1. Điều kiện tiên quyết

Đảm bảo hệ thống của bạn đã cài đặt:

- **Node.js:** `v18.x` trở lên (Khuyến nghị `v20.x`+). Kiểm tra: `node -v`
  - _(Khuyến nghị)_ Sử dụng [nvm](https://github.com/nvm-sh/nvm) hoặc [nvm-windows](https://github.com/coreybutler/nvm-windows) để quản lý phiên bản Node.
- **npm:** `v9.x`+ (hoặc phiên bản tương thích đi kèm Node.js). Kiểm tra: `npm -v`
- **hoặc yarn:** `v1.22.x`+. Kiểm tra: `yarn -v`
- **Git:** Kiểm tra: `git --version`

### 2. Cài đặt

1.  **Clone Repository:**

    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd Front-end-admin
    ```

    _(Thay thế `<YOUR_REPOSITORY_URL>` bằng URL Git thực tế của bạn)_

2.  **Cài đặt Dependencies:**

    ```bash
    # Sử dụng npm
    npm install
    # Hoặc nếu gặp lỗi peer dependency với React 18:
    # npm install --legacy-peer-deps

    # Hoặc sử dụng yarn
    # yarn install
    ```

### 3. Cấu hình Biến Môi trường

Ứng dụng cần các biến môi trường để kết nối với backend và các dịch vụ khác.

1.  **Tạo file `.env`:** Sao chép từ file mẫu:

    ```bash
    cp .env.example .env
    ```

    _(Quan trọng: Đảm bảo bạn đã có file `.env.example` trong repository liệt kê tất cả các biến cần thiết)_

2.  **Cập nhật `.env`:** Mở file `.env` và điền các giá trị thực tế.
    ```dotenv
    # Ví dụ
    VITE_API_BASE_URL=http://your-api-backend.com/api
    VITE_ANALYTICS_KEY=your_analytics_key
    ```
    - Biến môi trường phía client trong Vite **phải** bắt đầu bằng `VITE_`.
    - File `.env` chứa thông tin nhạy cảm và **không được commit** vào Git (đảm bảo `.env` nằm trong `.gitignore`).

### 4. Chạy ứng dụng

Khởi động server phát triển:

```bash
npm run dev
# hoặc
# yarn dev
```

Mở trình duyệt và truy cập `http://localhost:5173` (hoặc cổng được Vite chỉ định).

## Các Script Lệnh Chính

- `dev`: Chạy ứng dụng ở chế độ development với Hot Reloading.
- `build`: Build ứng dụng cho môi trường production (output vào thư mục `dist`).
- `preview`: Xem trước bản build production trên server cục bộ.
- `lint`: Kiểm tra lỗi và style code bằng ESLint.

_(Xem thêm các script khác trong `package.json`)_

## Triển khai (Deployment)

Thư mục `dist` sau khi chạy `npm run build` chứa các file tĩnh. Bạn có thể triển khai nó lên các nền tảng hosting tĩnh như:

- Vercel
- Netlify
- AWS S3/CloudFront
- GitHub Pages
- Server riêng (Nginx, Apache,...)

_Lưu ý:_ Đối với SPA, cần cấu hình server để xử lý client-side routing (chuyển hướng mọi request không khớp file về `index.html`). Tham khảo tài liệu của nhà cung cấp hosting.

## Đóng góp (Contributing)

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng đọc file `CONTRIBUTING.md` (nếu có) để biết chi tiết về quy trình báo lỗi, đề xuất tính năng và gửi Pull Request.

_(Gợi ý: Tạo file `CONTRIBUTING.md` để hướng dẫn chi tiết hơn)_

## Giấy phép

Dự án này được cấp phép theo **Giấy phép MIT**. Xem chi tiết tại file [LICENSE.md](./LICENSE.md).

## Liên hệ & Hỗ trợ

- Nếu gặp sự cố hoặc có câu hỏi, vui lòng tạo **Issue** trên GitHub: `(https://github.com/XuanManh9999/Front-End-Admin-Graduation_Project_EAUT)`
- Để liên hệ trực tiếp, vui lòng gửi email đến: `nguyenxuanmanh2992003@gmail.com` _(Tùy chọn)_

---

Cảm ơn bạn đã sử dụng CodeZen Admin Dashboard! ⭐
