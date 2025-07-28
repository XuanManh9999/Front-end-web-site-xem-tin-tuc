import axios from "axios";

const CLOUD_NAME = "dpbo17rbt";
const UPLOAD_PRESET = "upload_front_end_code_zen";
const API_KEY = "923369223654775";
const API_SECRET = "7szIKlRno-q8XTeuFIy2YIeLuZ4"; // ⚠️ KHÔNG DÙNG TRONG PRODUCTION

interface CourseFormData {
    title: string;
    description: string;
    level: string;
    price?: number;
    priceCurrent?: number;
    categoryId: number;
    skillDescription: string;
    technologies: string;
    thumbnailUrl?: string;
    previewUrl?: string;
}

interface Section {
    id?: number;
    title: string;
    orderIndex: number;
    lessons: Lesson[];
}

// Upload 1 file lên Cloudinary
export async function uploadToCloudinary(file: File) {
    if (!file) return null;

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(url, formData);

    if (response.status !== 200) throw new Error("Upload failed");

    return response.data; // trả về: { public_id, secure_url, ... }
}
