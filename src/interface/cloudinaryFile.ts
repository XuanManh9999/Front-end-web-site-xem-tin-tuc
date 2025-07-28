export interface cloudinaryFile {
  asset_id: string; // ID của tài nguyên
  public_id: string; // ID công khai của file
  format: string; // Định dạng file (jpg, png, mp4, ...)
  resource_type: string; // Loại tài nguyên (image, video, ...)
  secure_url: string; // URL an toàn của file đã upload
  url: string; // URL không an toàn của file
  width?: number; // Chiều rộng (nếu là ảnh)
  height?: number; // Chiều cao (nếu là ảnh)
  original_filename: string; // Tên file gốc
  bytes: number; // Kích thước file tính bằng bytes
  created_at: string; // Thời gian tạo file
  type: string; // Loại (upload, private, ...)
}
