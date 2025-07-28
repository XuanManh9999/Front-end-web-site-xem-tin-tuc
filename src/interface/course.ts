// Instructor interface
export interface IInstructor {
  id: number;
  username: string;
  avatarUrl: string;
  jobTitle: string | null;
  description: string | null;
  quantityCourses: number | null;
  quantityStudents: number | null;
}

// Category interface
export interface ICategory {
  id: number;
  name: string;
  description: string;
  created_at: string | null;
  updated_at: string | null;
}

// Course interface
export interface ICourse {
  id: number;
  title: string;
  description: string;
  category: ICategory;
  level: string;
  price: number | null;
  priceCurrent: number | null;
  thumbnailUrl: string;
  previewUrl: string;
  instructor: IInstructor;
  skillDescription: string | null;
  technologies: string | null;
  totalSections: number;
  totalLessons: number;
  createAt: string;
  updateAt: string;
  percentComplete: number;
  time: string | null;
  sections: any;
  isFree?: boolean;
  active?: string;
}

// Response interface
export interface ICourseResponse {
  status: number;
  message: string;
  data: ICourse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

// TODO: Add any missing code
