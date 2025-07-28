import axios from "axios";
import { cloudinaryFile } from "../interface/cloudinaryFile";

export const uploadFileToCloudinary = async (
  file: File
): Promise<cloudinaryFile> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "upload_front_end_code_zen"); // Thay bằng upload preset của bạn
  formData.append("folder", "CODE_ZEN"); // Chỉ định folder trong Cloudinary

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${"dpbo17rbt"}/upload`, // Thay bằng cloud_name của bạn
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          // Sử dụng optional chaining để tránh lỗi khi progressEvent.total là undefined
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
          ); // Nếu total là undefined, sử dụng giá trị mặc định là 1
          console.log(`Upload progress: ${percent}%`);
        },
      }
    );

    // Trả về dữ liệu Cloudinary đã upload
    return response.data as cloudinaryFile; // Trả về theo kiểu CloudinaryFile
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw new Error("Upload failed");
  }
};

export const uploadMultipleFilesToCloudinary = async (
  files: File[]
): Promise<cloudinaryFile[]> => {
  const formDataList = files.map((file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "upload_front_end_code_zen"); // Thay bằng upload preset của bạn
    formData.append("folder", "CODE_ZEN"); // Chỉ định folder trong Cloudinary
    return formData;
  });

  try {
    const uploadPromises = formDataList.map((formData) =>
      axios.post(
        `https://api.cloudinary.com/v1_1/${"dpbo17rbt"}/upload`, // Thay bằng cloud_name của bạn
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
            );
            console.log(`Upload progress: ${percent}%`);
          },
        }
      )
    );

    // Chờ tất cả các file upload hoàn thành
    const responses = await Promise.all(uploadPromises);

    // Trả về danh sách các dữ liệu từ Cloudinary
    return responses.map((response) => response.data as cloudinaryFile);
  } catch (error) {
    console.error("Error uploading files to Cloudinary:", error);
    throw new Error("Upload failed");
  }
};
