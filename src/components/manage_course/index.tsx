import React from "react";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import ComponentCard from "../common/ComponentCard";
import ReusableTable from "../common/ReusableTable";
import { useCallback, useEffect, useState, useRef } from "react";
import Pagination from "../pagination";
import { useSearchParams } from "react-router";
import Label from "../form/Label";
import { Input, Select, Modal, Form, Upload, Button, message, Switch, Radio, Card, Space, Typography, Divider, Tooltip, Skeleton, Progress } from "antd";
import { IoIosAdd } from "react-icons/io";
import { ICourse, ICourseResponse, IInstructor } from "../../interface/course";
import { getCourses, getCourseById } from "../../services/course";
// import { getCategoryCourse } from "../../services/category_tag";
import { uploadToCloudinary } from '../../utils/cloudinary';
import { createCourse, updateCourse, CreateCourseData } from '../../services/course';
import { UploadOutlined, PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, DragOutlined, BookOutlined, VideoCameraOutlined, FileTextOutlined, FormOutlined, CodeOutlined, DollarOutlined, TagOutlined, InfoCircleOutlined, FileImageOutlined, PlayCircleOutlined, ToolOutlined, ReadOutlined, QuestionCircleOutlined, ExperimentOutlined, TagsOutlined, StarOutlined, SettingOutlined, GlobalOutlined, TeamOutlined, RocketOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { NumericFormat } from 'react-number-format';
import { deleteCourse } from '../../services/course';

const { Text, Title } = Typography;
const { Option } = Select;

// Add interfaces and types
interface Material {
  id?: number; // Add ID field
  title: string;
  fileType: string;
  url: string;
  public_id?: string;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  original_filename: string;
  duration?: number; // Thêm trường duration từ Cloudinary response
}

interface LessonContentProps {
  lesson: Lesson;
  sectionIndex: number;
  lessonIndex: number;
  onUpdateLesson: (data: Partial<Lesson>) => void;
  uploadProgress: UploadProgressType;
  setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgressType>>;
}

type UploadProgressType = {
  thumbnail?: number;
  preview?: number;
  lessonVideos: Record<string, number | undefined>; // Change from lessonVideo to lessonVideos object
  materials: Record<string, number | undefined>;
};

interface Lesson {
  id?: number; // Add ID field
  type: 'video' | 'post' | 'quiz' | 'exercise';
  title: string;
  orderIndex: number;
  videoUrl?: string;
  duration?: number; // Thêm trường duration cho bài học video
  content?: string;
  difficulty?: string;
  questions?: LessonQuestion[];
  tasks?: LessonTask[];
  materials?: Material[];
  postId?: number; // Add post ID field
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface LessonQuestion {
  title: string;
  options: string[];
  correctAnswer: string;
  orderIndex: number;
  id?: number; // Change from string to number
}

interface LessonTask {
  id?: number;  // Thay đổi kiểu từ string sang number để phù hợp với API
  title: string;
  inputDesc: string;
  outputDesc: string;
  orderIndex: number;
}

// Add new interface for tracking uploaded files
interface UploadedFile {
  public_id: string;
  type: 'thumbnail' | 'preview' | 'lessonVideo' | 'material';
  materialIndex?: number;
}

// Thêm lại useDebounceCallback hook
const useDebounceCallback = <T,>(callback: (value: T) => void, delay: number) => {
  const timeoutRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((value: T) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      callbackRef.current(value);
    }, delay);
  }, [delay]);
};

// Thêm lại useMultiDebounceCallback để hỗ trợ nhiều tham số
const useMultiDebounceCallback = <T extends any[]>(callback: (...args: T) => void, delay: number) => {
  const timeoutRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: T) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
};

// Cập nhật lại type cho columns
type ColumnDefinition = {
  key: keyof ICourse;
  label: string;
  render?: (value: any) => React.ReactNode;
};

// Thêm lại CurrencyInput component
const CurrencyInput = ({ value, onChange, ...props }: any) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => {
        onChange(values.floatValue);
      }}
      thousandSeparator="."
      decimalSeparator=","
      suffix=" ₫"
      decimalScale={0}
      allowNegative={false}
      customInput={Input}
      {...props}
    />
  );
};

// Thêm lại SectionItem component
const SectionItem = React.memo(({ section, index, onUpdateSection, onDeleteSection, uploadProgress, setUploadProgress }: { 
  section: Section; 
  index: number;
  onUpdateSection: (index: number, data: Partial<Section>) => void;
  onDeleteSection: (index: number) => void;
  uploadProgress: UploadProgressType;
  setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgressType>>;
}) => {
  const [localTitle, setLocalTitle] = useState(section.title);
  const [localLessons, setLocalLessons] = useState(section.lessons);

  const debouncedUpdateSection = useDebounceCallback(
    (newTitle: string) => onUpdateSection(index, { title: newTitle }),
    300
  );

  const debouncedUpdateLesson = useDebounceCallback(
    ({ lessonIndex, data }: { lessonIndex: number; data: Partial<Lesson> }) => {
      const updatedLessons = [...localLessons];
      updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], ...data };
      setLocalLessons(updatedLessons);
      onUpdateSection(index, { lessons: updatedLessons });
    },
    300
  );

  useEffect(() => {
    setLocalTitle(section.title);
    setLocalLessons(section.lessons);
  }, [section.title, section.lessons]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    debouncedUpdateSection(newTitle);
  };

  const handleLessonTitleChange = (lessonIndex: number, newTitle: string) => {
    const updatedLessons = [...localLessons];
    updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], title: newTitle };
    setLocalLessons(updatedLessons);
    debouncedUpdateLesson({ lessonIndex, data: { title: newTitle } });
  };

  const handleAddLesson = (type: Lesson['type']) => {
    const newLesson: Lesson = {
      id: undefined, // Set undefined for new lessons
      type,
      title: '',
      orderIndex: localLessons.length + 1,
      ...(type === 'post' && { content: '', difficulty: 'Easy' }),
      ...(type === 'quiz' && { questions: [] }),
      ...(type === 'exercise' && { tasks: [] })
    };
    
    const updatedLessons = [...localLessons, newLesson];
    setLocalLessons(updatedLessons);
    onUpdateSection(index, { lessons: updatedLessons });
  };

  const handleDeleteLesson = (lessonIndex: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài học này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        const updatedLessons = localLessons.filter((_, idx) => idx !== lessonIndex)
          .map((lesson, idx) => ({ ...lesson, orderIndex: idx + 1 }));
        setLocalLessons(updatedLessons);
        onUpdateSection(index, { lessons: updatedLessons });
      }
    });
  };

  const handleUpdateLesson = useCallback((lessonIndex: number, data: Partial<Lesson>) => {
    const updatedLessons = [...localLessons];
    updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], ...data };
    setLocalLessons(updatedLessons);
    debouncedUpdateLesson({ lessonIndex, data });
  }, [localLessons, debouncedUpdateLesson]);

  return (
    <Draggable draggableId={section.id ? `section-${section.id}` : `section-new-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom: '16px',
            transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none',
            transition: 'none',
            zIndex: snapshot.isDragging ? 1000 : 'auto'
          }}
          className={`border rounded-lg p-4 ${
            snapshot.isDragging ? 'bg-blue-50 shadow-lg' : 'bg-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div 
              {...provided.dragHandleProps}
              className="cursor-move p-2 hover:bg-gray-100 rounded"
            >
              <DragOutlined className="text-gray-400 text-lg" />
            </div>
            <Input
              value={localTitle}
              onChange={handleTitleChange}  
              className="flex-1"
              prefix={<BookOutlined className="text-gray-400" />}
            />
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDeleteSection(index)}
              className="flex-shrink-0"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              onClick={() => handleAddLesson('video')}
              icon={<VideoCameraOutlined />}
            >
              Thêm video
            </Button>
            <Button 
              onClick={() => handleAddLesson('post')}
              icon={<FileTextOutlined />}
            >
              Thêm bài viết
            </Button>
            <Button 
              onClick={() => handleAddLesson('quiz')}
              icon={<QuestionCircleOutlined />}
            >
              Thêm quiz
            </Button>
            <Button 
              onClick={() => handleAddLesson('exercise')}
              icon={<CodeOutlined />}
            >
              Thêm bài tập
            </Button>
          </div>

          <Droppable droppableId={`section-lessons-${index}`} type="LESSON">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-2 lesson-content"
              >
                {localLessons.map((lesson, lessonIndex) => (
                  <Draggable
                    key={`lesson-${index}-${lessonIndex}`}
                    draggableId={`lesson-${index}-${lessonIndex}`}
                    index={lessonIndex}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          marginBottom: '8px'
                        }}
                        className={`border rounded p-4 ${
                          snapshot.isDragging ? 'bg-blue-50 shadow-md' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            {...provided.dragHandleProps}
                            className="cursor-move p-2 hover:bg-gray-100 rounded"
                          >
                            <DragOutlined className="text-gray-400" />
                          </div>
                          <Input
                            value={lesson.title}
                            onChange={(e) => handleLessonTitleChange(lessonIndex, e.target.value)}
                            className="flex-1"
                            placeholder="Nhập tiêu đề bài học"
                            prefix={
                              lesson.type === 'video' ? <VideoCameraOutlined /> :
                              lesson.type === 'post' ? <FileTextOutlined /> :
                              lesson.type === 'quiz' ? <QuestionCircleOutlined /> :
                              <CodeOutlined />
                            }
                          />
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteLesson(lessonIndex)}
                            className="flex-shrink-0"
                          />
                        </div>

                        <LessonContent
                          lesson={lesson}
                          sectionIndex={index}
                          lessonIndex={lessonIndex}
                          onUpdateLesson={(data) => handleUpdateLesson(lessonIndex, data)}
                          uploadProgress={uploadProgress}
                          setUploadProgress={setUploadProgress}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
});

// Thêm lại LessonContent component và interface
const LessonContent = ({ 
  lesson, 
  sectionIndex, 
  lessonIndex, 
  onUpdateLesson,
  uploadProgress,
  setUploadProgress 
}: LessonContentProps) => {
  const [localContent, setLocalContent] = useState(lesson.content || '');
  const [localDifficulty, setLocalDifficulty] = useState(lesson.difficulty || 'Easy');
  const [materials, setMaterials] = useState<Material[]>(lesson.materials || []);
  const quillRef = useRef<ReactQuill>(null);

  // Helper function để tạo key cho material progress
  const getMaterialProgressKey = (materialIndex: number) => `${sectionIndex}-${lessonIndex}-${materialIndex}`;

  // Đơn giản hóa hàm upload video
  const handleVideoUpload = async (file: UploadFile) => {
    if (file?.status === 'removed') {
      onUpdateLesson({ videoUrl: '', duration: undefined });
      return;
    }

    if (!file?.type?.startsWith('video/')) {
      message.error('Chỉ chấp nhận file video!');
      return;
    }

    // Kiểm tra kích thước file
    if (file.size && file.size > MAX_VIDEO_SIZE) {
      message.error(`Kích thước video quá lớn! Tối đa ${formatFileSize(MAX_VIDEO_SIZE)} (khoảng 4 tiếng)`);
      return;
    }

    const progressKey = `${sectionIndex}-${lessonIndex}`;

    try {
      setUploadProgress(prev => ({ 
        ...prev, 
        lessonVideos: { ...prev.lessonVideos, [progressKey]: 0 } 
      }));
      
      const res = await uploadToCloudinary(file as unknown as File) as CloudinaryResponse;
      
      // Cập nhật cả videoUrl và duration
      onUpdateLesson({ 
        videoUrl: res.secure_url,
        duration: res.duration // Lấy thời lượng từ Cloudinary response
      });
      
      setUploadProgress(prev => ({ 
        ...prev, 
        lessonVideos: { ...prev.lessonVideos, [progressKey]: 100 } 
      }));
      message.success('Upload video bài học thành công!');
    } catch (error) {
      console.error('Upload video bài học thất bại:', error);
      message.error('Upload video bài học thất bại!');
      setUploadProgress(prev => ({ 
        ...prev, 
        lessonVideos: { ...prev.lessonVideos, [progressKey]: undefined } 
      }));
    }
  };

  // Đơn giản hóa hàm upload tài liệu
  const handleMaterialUpload = async (file: UploadFile, materialIndex: number) => {
    if (file?.status === 'removed') {
      const updatedMaterials = [...materials];
      updatedMaterials[materialIndex] = {
        ...updatedMaterials[materialIndex],
        url: '',
        public_id: ''
      };
      setMaterials(updatedMaterials);
      onUpdateLesson({ materials: updatedMaterials });
      return;
    }

    const materialType = materials[materialIndex]?.fileType;
    const acceptedTypes: Record<string, string[]> = {
      pdf: ['application/pdf'],
      doc: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      zip: ['application/zip', 'application/x-zip-compressed'],
      image: ['image/'],
      video: ['video/']
    };

    const fileMimeType = file?.type || '';
    const allowedTypes = materialType ? acceptedTypes[materialType] : [];
    
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/')) {
        return fileMimeType.startsWith(type);
      }
      return fileMimeType === type;
    });

    if (!isValidType) {
      message.error(`Chỉ chấp nhận file ${materialType}!`);
      return;
    }

    // Kiểm tra kích thước file dựa vào loại file
    if (file.size) {
      if (materialType === 'video' && file.size > MAX_VIDEO_SIZE) {
        message.error(`Kích thước video quá lớn! Tối đa ${formatFileSize(MAX_VIDEO_SIZE)} (khoảng 4 tiếng)`);
        return;
      } else if (materialType === 'image' && file.size > MAX_IMAGE_SIZE) {
        message.error(`Kích thước ảnh quá lớn! Tối đa ${formatFileSize(MAX_IMAGE_SIZE)}`);
        return;
      } else if (file.size > MAX_DOCUMENT_SIZE) {
        message.error(`Kích thước tài liệu quá lớn! Tối đa ${formatFileSize(MAX_DOCUMENT_SIZE)}`);
        return;
      }
    }

    try {
      const progressKey = getMaterialProgressKey(materialIndex);
      setUploadProgress(prev => ({ ...prev, materials: { ...prev.materials, [progressKey]: 0 } }));

      const res = await uploadToCloudinary(file as unknown as File) as CloudinaryResponse;
      
      const updatedMaterials = [...materials];
      updatedMaterials[materialIndex] = {
        ...updatedMaterials[materialIndex],
        url: res.secure_url,
        public_id: res.public_id
      };

      setMaterials(updatedMaterials);
      onUpdateLesson({ materials: updatedMaterials });
      
      setUploadProgress(prev => ({ ...prev, materials: { ...prev.materials, [progressKey]: 100 } }));
      message.success('Upload tài liệu thành công!');
    } catch (error) {
      console.error('Upload tài liệu thất bại:', error);
      message.error('Upload tài liệu thất bại!');
      setUploadProgress(prev => ({ ...prev, materials: { ...prev.materials, [getMaterialProgressKey(materialIndex)]: undefined } }));
    }
  };

  useEffect(() => {
    setLocalContent(lesson.content || '');
    if (lesson.difficulty !== localDifficulty) {
      setLocalDifficulty(lesson.difficulty || 'Easy');
    }
    setMaterials(lesson.materials || []);
  }, [lesson.content, lesson.difficulty, lesson.materials]);

  // Cấu hình lại ReactQuill để tránh warning
  const modules = {
    toolbar: [
      [{ 'font': [] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
  
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code'],
  
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }], // subscript/superscript
  
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
  
      ['link', 'image', 'video'],
  
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  switch (lesson.type) {
    case 'post':
      return (
        <div className="mt-4">
          <ReactQuill
            ref={quillRef}
            value={localContent}
            onChange={(content) => {
              setLocalContent(content);
              onUpdateLesson({ content });
            }}
            modules={modules}
            formats={formats}
            className="h-48 mb-12"
            preserveWhitespace={true}
            bounds=".lesson-content"
          />
          <Select
            value={localDifficulty}
            onChange={(value) => {
              setLocalDifficulty(value);
              onUpdateLesson({ difficulty: value });
            }}
            className="mt-[30px] min-w-[100px]"
          >
            <Option value="Easy">Dễ</Option>
            <Option value="Medium">Trung bình</Option>
            <Option value="Hard">Khó</Option>
          </Select>
        </div>
      );
    case 'video':
      return (
        <div className="mt-4 space-y-6">
          <div>
            <Label>Upload video bài học</Label>
            <div className="space-y-2">
              <Upload
                maxCount={1}
                beforeUpload={() => false}
                onChange={({ file }) => handleVideoUpload(file)}
                accept="video/*"
                fileList={lesson.videoUrl ? [{
                  uid: '-1',
                  name: 'Video bài học',
                  status: 'done',
                  url: lesson.videoUrl
                }] : []}
              >
                <Button icon={<UploadOutlined />}>Upload video bài học</Button>
              </Upload>
              {uploadProgress.lessonVideos[`${sectionIndex}-${lessonIndex}`] !== undefined && (
                <Progress 
                  percent={uploadProgress.lessonVideos[`${sectionIndex}-${lessonIndex}`]} 
                  status={uploadProgress.lessonVideos[`${sectionIndex}-${lessonIndex}`] === 100 ? "success" : "active"}
                  size="small"
                />
              )}
              {lesson.duration && (
                <div className="flex items-center mt-2 text-gray-600">
                  <PlayCircleOutlined style={{ marginRight: '5px' }} />
                  <span className="text-sm font-medium">
                    Thời lượng: <span className="text-blue-600">{formatDuration(lesson.duration)}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Material upload section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-base">Tài liệu đính kèm</Label>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  const newMaterial: Material = { 
                    id: undefined, // Set undefined for new materials
                    title: '', 
                    fileType: '', 
                    url: '', 
                    public_id: '' 
                  };
                  const updatedMaterials = [...materials, newMaterial];
                  setMaterials(updatedMaterials);
                  onUpdateLesson({ materials: updatedMaterials });
                }}
              >
                Thêm tài liệu
              </Button>
            </div>

            <div className="space-y-6">
              {materials.map((material, materialIndex) => (
                <div key={materialIndex} className="border rounded-lg p-6 bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-6">
                      <div>
                        <Label className="mb-2 block">Tên tài liệu</Label>
                        <Input
                          value={material.title}
                          onChange={(e) => {
                            const updatedMaterials = [...materials];
                            updatedMaterials[materialIndex] = {
                              ...updatedMaterials[materialIndex],
                              title: e.target.value
                            };
                            setMaterials(updatedMaterials);
                            onUpdateLesson({ materials: updatedMaterials });
                          }}
                          placeholder="Nhập tên tài liệu"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Loại tài liệu</Label>
                        <Select
                          value={material.fileType}
                          onChange={(value) => {
                            const updatedMaterials = [...materials];
                            updatedMaterials[materialIndex] = {
                              ...updatedMaterials[materialIndex],
                              fileType: value,
                              url: '',
                              public_id: ''
                            };
                            setMaterials(updatedMaterials);
                            onUpdateLesson({ materials: updatedMaterials });
                          }}
                          placeholder="Chọn loại tài liệu"
                          className="w-full"
                        >
                          <Option value="pdf">PDF</Option>
                          <Option value="doc">Word</Option>
                          <Option value="zip">ZIP</Option>
                          <Option value="image">Hình ảnh</Option>
                          <Option value="video">Video</Option>
                        </Select>
                      </div>

                      <div>
                        <Label className="mb-2 block">File tài liệu</Label>
                        <div className="space-y-2">
                          <Upload
                            maxCount={1}
                            beforeUpload={() => false}
                            onChange={({ file }) => handleMaterialUpload(file, materialIndex)}
                            accept={
                              material.fileType === 'pdf' ? '.pdf' :
                              material.fileType === 'doc' ? '.doc,.docx' :
                              material.fileType === 'zip' ? '.zip' :
                              material.fileType === 'image' ? 'image/*' :
                              material.fileType === 'video' ? 'video/*' :
                              undefined
                            }
                            fileList={material.url ? [{
                              uid: material.public_id || '-1',
                              name: material.title || 'Tài liệu',
                              status: 'done',
                              url: material.url
                            }] : []}
                          >
                            <Button icon={<UploadOutlined />}>Upload tài liệu</Button>
                          </Upload>
                          {uploadProgress.materials[getMaterialProgressKey(materialIndex)] !== undefined && (
                            <Progress 
                              percent={uploadProgress.materials[getMaterialProgressKey(materialIndex)]} 
                              status={uploadProgress.materials[getMaterialProgressKey(materialIndex)] === 100 ? "success" : "active"}
                              size="small"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Xác nhận xóa',
                          content: 'Bạn có chắc chắn muốn xóa tài liệu này?',
                          okText: 'Xóa',
                          okType: 'danger',
                          cancelText: 'Hủy',
                          onOk: () => {
                            const updatedMaterials = materials.filter((_, index) => index !== materialIndex);
                            setMaterials(updatedMaterials);
                            onUpdateLesson({ materials: updatedMaterials });
                          }
                        });
                      }}
                      className="ml-4 flex-shrink-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 'quiz':
      return (
        <QuizManagement
          sectionIndex={sectionIndex}
          lessonIndex={lessonIndex}
          lesson={lesson}
          onUpdateLesson={onUpdateLesson}
          uploadProgress={uploadProgress}
          setUploadProgress={setUploadProgress}
        />
      );
    case 'exercise':
      return (
        <ExerciseManagement
          sectionIndex={sectionIndex}
          lessonIndex={lessonIndex}
          lesson={lesson}
          onUpdateLesson={onUpdateLesson}
          uploadProgress={uploadProgress}
          setUploadProgress={setUploadProgress}
        />
      );
    default:
      return null;
  }
};

// Cập nhật interface cho QuizManagement
interface QuizManagementProps {
  sectionIndex: number;
  lessonIndex: number;
  lesson: Lesson;
  onUpdateLesson: (data: Partial<Lesson>) => void;
  uploadProgress: UploadProgressType;
  setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgressType>>;
}

// Cập nhật component QuizManagement
const QuizManagement = ({ 
  sectionIndex, 
  lessonIndex, 
  lesson, 
  onUpdateLesson,
  uploadProgress,
  setUploadProgress 
}: QuizManagementProps) => {
  const [questions, setQuestions] = useState<LessonQuestion[]>(lesson.questions || []);
  
  // Tạo unique key cho progress
  const getQuizProgressKey = (questionIndex: number) => `quiz-${sectionIndex}-${lessonIndex}-${questionIndex}`;

  const handleAddQuestion = () => {
    const newQuestion: LessonQuestion = {
      title: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      orderIndex: questions.length + 1,
      id: questions.length + 1
    };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    onUpdateLesson({ questions: updatedQuestions });
  };

  const handleDeleteQuestion = (questionIndex: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa câu hỏi này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        const updatedQuestions = questions.filter((_, index) => index !== questionIndex)
          .map((q, index) => ({ ...q, orderIndex: index + 1 }));
        setQuestions(updatedQuestions);
        onUpdateLesson({ questions: updatedQuestions });
      }
    });
  };

  const handleUpdateQuestion = (questionIndex: number, data: Partial<LessonQuestion>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], ...data };
    setQuestions(updatedQuestions);
    onUpdateLesson({ questions: updatedQuestions });
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-center">
        <Title level={5}>Danh sách câu hỏi</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddQuestion}
        >
          Thêm câu hỏi
        </Button>
      </div>

      {questions.map((question, questionIndex) => (
        <div key={question.id} className="border rounded p-4 bg-white">
          <div className="flex justify-between items-start mb-4">
            <Input
              value={question.title}
              onChange={(e) => handleUpdateQuestion(questionIndex, { title: e.target.value })}
              placeholder="Nhập câu hỏi"
              className="flex-1 mr-2"
            />
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteQuestion(questionIndex)}
            />
          </div>

          <div className="space-y-2">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <Radio
                  checked={option === question.correctAnswer}
                  onChange={() => handleUpdateQuestion(questionIndex, { correctAnswer: option })}
                />
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[optionIndex] = e.target.value;
                    handleUpdateQuestion(questionIndex, { 
                      options: newOptions,
                      correctAnswer: question.correctAnswer === option ? e.target.value : question.correctAnswer
                    });
                  }}
                  placeholder={`Đáp án ${optionIndex + 1}`}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Cập nhật interface cho ExerciseManagement
interface ExerciseManagementProps {
  sectionIndex: number;
  lessonIndex: number;
  lesson: Lesson;
  onUpdateLesson: (data: Partial<Lesson>) => void;
  uploadProgress: UploadProgressType;
  setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgressType>>;
}

// Cập nhật component ExerciseManagement
const ExerciseManagement = ({ 
  sectionIndex, 
  lessonIndex, 
  lesson, 
  onUpdateLesson,
  uploadProgress,
  setUploadProgress 
}: ExerciseManagementProps) => {
  const [tasks, setTasks] = useState<LessonTask[]>(lesson.tasks || []);
  
  // Tạo unique key cho progress
  const getExerciseProgressKey = (taskIndex: number) => `exercise-${sectionIndex}-${lessonIndex}-${taskIndex}`;

  const handleAddTask = () => {
    const newTask: LessonTask = {
      title: '',
      inputDesc: '',
      outputDesc: '',
      orderIndex: tasks.length + 1
      // Bỏ id vì backend sẽ tự sinh
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    onUpdateLesson({ tasks: updatedTasks });
  };

  const handleDeleteTask = (taskIndex: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài tập này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        const updatedTasks = tasks.filter((_, index) => index !== taskIndex)
          .map((t, index) => ({ ...t, orderIndex: index + 1 }));
        setTasks(updatedTasks);
        onUpdateLesson({ tasks: updatedTasks });
      }
    });
  };

  const handleUpdateTask = (taskIndex: number, data: Partial<LessonTask>) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...data };
    setTasks(updatedTasks);
    onUpdateLesson({ tasks: updatedTasks });
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-center">
        <Title level={5}>Danh sách bài tập</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddTask}
        >
          Thêm bài tập
        </Button>
      </div>

      {tasks.map((task, taskIndex) => (
        <div key={task.id} className="border rounded p-4 bg-white">
          <div className="flex justify-between items-start mb-4">
            <Input
              value={task.title}
              onChange={(e) => handleUpdateTask(taskIndex, { title: e.target.value })}
              placeholder="Nhập tiêu đề bài tập"
              className="flex-1 mr-2"
            />
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteTask(taskIndex)}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>Mô tả input</Label>
              <Input.TextArea
                value={task.inputDesc}
                onChange={(e) => handleUpdateTask(taskIndex, { inputDesc: e.target.value })}
                placeholder="Mô tả input của bài tập"
                rows={3}
              />
            </div>
            <div>
              <Label>Mô tả output</Label>
              <Input.TextArea
                value={task.outputDesc}
                onChange={(e) => handleUpdateTask(taskIndex, { outputDesc: e.target.value })}
                placeholder="Mô tả output của bài tập"
                rows={3}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Add interface for CourseFormData
interface CourseFormData {
  title: string;
  description: string;
  level: string;
  price?: number;
  priceCurrent?: number;
  categoryId: number;
  skillDescription: string;
  technologies: string;
  thumbnailUrl: string; // Bắt buộc
  previewUrl: string; // Bắt buộc
}

// Add interface for Section
interface Section {
  id?: number;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

// Thêm constants cho giới hạn file
const MAX_VIDEO_SIZE = 4 * 1024 * 1024 * 1024; // 4GB cho video (4 tiếng)
const MAX_DOCUMENT_SIZE = 100 * 1024 * 1024; // 100MB cho tài liệu
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB cho ảnh

// Helper function để format size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Add a helper function to format duration
const formatDuration = (seconds?: number): string => {
  if (!seconds) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Add a global helper for getMaterialProgressKey
const getMaterialProgressKey = (materialIndex: number, sectionIndex?: number, lessonIndex?: number) => {
  if (sectionIndex !== undefined && lessonIndex !== undefined) {
    return `${sectionIndex}-${lessonIndex}-${materialIndex}`;
  }
  return materialIndex.toString();
};

export default function ManageCourse() {
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [courses, setCourses] = useState<ICourseResponse | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [offset, setOffset] = useState(Number(searchParams.get("offset")) || 0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(Number(searchParams.get("quantity")) || 20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [errorData, setErrorData] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructor, setInstructor] = useState<User | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<RcFile | null>(null);
  const [previewFile, setPreviewFile] = useState<RcFile | null>(null);
  const [isFree, setIsFree] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm<CourseFormData>();
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [quillContent, setQuillContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [localQuillContents, setLocalQuillContents] = useState<{ [key: string]: string }>({});
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [tableLoading, setTableLoading] = useState(false);
  const [localMinPrice, setLocalMinPrice] = useState<string>('');
  const [localMaxPrice, setLocalMaxPrice] = useState<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType>({
    lessonVideos: {},
    materials: {}
  });
  // Add new state for tracking uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Định nghĩa columns bên trong component để có thể truy cập categories
  const columns: ColumnDefinition[] = [
    { key: "id", label: "ID" },
    { key: "title", label: "Tên khóa học" },
    { key: "description", label: "Mô tả" },
    { 
      key: "price", 
      label: "Giá (VNĐ)",
      render: (value: any) => {
        // Find the course in our data to access all fields
        const foundCourse = courses?.data.find(c => c.price === value);
        if (!foundCourse || (!foundCourse.price && !foundCourse.priceCurrent)) {
          return <span className="text-green-500">Miễn phí</span>;
        }

        return (
          <div>
            {foundCourse.priceCurrent && (
              <div className="text-red-500">
                <NumericFormat
                  value={foundCourse.priceCurrent}
                  thousandSeparator="."
                  decimalSeparator=","
                  suffix=" ₫"
                  decimalScale={0}
                  displayType="text"
                />
              </div>
            )}
            {foundCourse.price && foundCourse.price > (foundCourse.priceCurrent || 0) && (
              <div className="text-gray-400 line-through text-sm">
                <NumericFormat
                  value={foundCourse.price}
                  thousandSeparator="."
                  decimalSeparator=","
                  suffix=" ₫"
                  decimalScale={0}
                  displayType="text"
                />
              </div>
            )}
          </div>
        );
      }
    },
    { 
      key: "level", 
      label: "Trình độ",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          value === 'Cơ bản' ? 'bg-blue-100 text-blue-800' :
          value === 'Trung bình' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: "category", 
      label: "Chủ đề",
      render: (value: any) => {
        if (!value) return <span className="text-gray-500">Không xác định</span>;
        const categoryId = value?.id;
        const category = categories.find((cat: Category) => cat.id === categoryId);
        return (
          <span className="px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
            {category?.name || 'Không xác định'}
          </span>
        );
      }
    },
    { 
      key: "instructor", 
      label: "Giảng viên",
      render: (value: IInstructor) => (
        <div className="flex items-center gap-2">
          <img 
            src={value.avatarUrl || 'https://via.placeholder.com/32'} 
            alt={value.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span>{value.username}</span>
        </div>
      )
    },
    { 
      key: "createAt", 
      label: "Ngày tạo",
      render: (value: string) => {
        const date = new Date(value);
        return (
          <div className="flex flex-col">
            <span>{date.toLocaleDateString('vi-VN')}</span>
            <span className="text-gray-500 text-sm">{date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    },
    { 
      key: "updateAt", 
      label: "Ngày cập nhật",
      render: (value: string) => {
        const date = new Date(value);
        return (
          <div className="flex flex-col">
            <span>{date.toLocaleDateString('vi-VN')}</span>
            <span className="text-gray-500 text-sm">{date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    },
    {
      key: "active",
      label: "Trạng thái",
      render: (value: string) => {
        const status = value === 'HOAT_DONG' ? 'Hoạt động' : 'Chưa hoạt động';
        const color = value === 'HOAT_DONG' ? 'green' : 'orange';
        return (
          <span className={`px-2 py-1 rounded-full text-sm bg-${color}-100 text-${color}-800`}>
            {status}
          </span>
        );
      }
    }
  ];

  // Cập nhật lại hàm xử lý giá không cần delay
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? Number(value) : undefined;
    if (type === 'min') {
      setLocalMinPrice(value);
      setMinPrice(numValue);
    } else {
      setLocalMaxPrice(value);
      setMaxPrice(numValue);
    }
    setOffset(0);
  };

  // Cập nhật lại fetchCourses
  const fetchCourses = useCallback(async () => {
    if (!isInitialLoading) {
      setIsRefetching(true);
    }
    setTableLoading(true);
    try {
      const params = {
        page: offset,
        size: quantity,
        ...(keyword && { keyword }),
        ...(selectedCategory && { category: selectedCategory }), // selectedCategory is already the ID
        ...(selectedLevel && { level: selectedLevel }),
        ...(minPrice !== undefined && { minPrice }),
        ...(maxPrice !== undefined && { maxPrice })
      };

      const response = await getCourses(params);
      setCourses(response ?? []);
      
      if (response && response.data.length === 0) {
        setError("Không có dữ liệu nào");
      } else {
        setError(undefined);
      }

      // Cập nhật URL params
      const newParams = new URLSearchParams();
        newParams.set("limit", quantity.toString());
        newParams.set("offset", offset.toString());
      if (keyword) newParams.set("keyword", keyword);
      if (selectedCategory) newParams.set("category", selectedCategory.toString());
      if (selectedLevel) newParams.set("level", selectedLevel);
      if (minPrice !== undefined) newParams.set("minPrice", minPrice.toString());
      if (maxPrice !== undefined) newParams.set("maxPrice", maxPrice.toString());
      setSearchParams(newParams);

    } catch (error) {
      setError("Lỗi khi tải dữ liệu");
      message.error("Có lỗi xảy ra khi tải danh sách khóa học");
    } finally {
      if (isInitialLoading) {
        setIsInitialLoading(false);
      }
      setTableLoading(false);
      if (isRefetching) {
        setIsRefetching(false);
      }
    }
  }, [quantity, offset, keyword, selectedCategory, selectedLevel, minPrice, maxPrice, setSearchParams, isInitialLoading]);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const data = await getCategoryCourse();
      setCategories(data?.data.filter((item: any) => item.active === 'HOAT_DONG'));
    } catch (error) {
      message.error('Không thể tải danh sách chủ đề!');
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const debouncedSearch = useDebounceCallback((value: string) => {
    setKeyword(value);
    setOffset(0); // Reset về trang đầu tiên khi tìm kiếm
  }, 500);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Combine URL params and category related effects
  useEffect(() => {
    // Get category from URL params if present
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }

    // Ensure URL has proper pagination parameters
    if (!searchParams.get("limit") || !searchParams.get("offset")) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (!newParams.get("limit")) newParams.set("limit", "20");
        if (!newParams.get("offset")) newParams.set("offset", "0");
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  // Get instructor info once on component mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setInstructor({
          id: userData.id,
          name: userData.name || userData.username,
          email: userData.email
        });
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        message.error("Không thể lấy thông tin giảng viên!");
      }
    } else {
      message.error("Vui lòng đăng nhập để thêm khóa học!");
    }

    // Load categories once on mount
    fetchCategories();
  }, [fetchCategories]);

  const onEdit = async (item: any) => {
    try {
      setIsEditing(true);
      setEditingCourseId(item.id);
      setLoading(true);
      
      const response = await getCourseById(item.id);
      if (response?.status === 200) {
        const courseData = response.data;
        
        // Reset form fields with course data
        form.setFieldsValue({
          title: courseData.title,
          description: courseData.description,
          level: courseData.level,
          categoryId: courseData.category?.id,
          skillDescription: courseData.skillDescription,
          technologies: courseData.technologies,
          price: courseData.price,
          priceCurrent: courseData.priceCurrent,
          thumbnailUrl: courseData.thumbnailUrl,
          previewUrl: courseData.previewUrl
        });
        
        // Set isFree based on price
        setIsFree(!courseData.price);
        
        // Convert course sections to component state format with correct indices
        // IMPORTANT: Preserve original IDs for sections and lessons
        const formattedSections = courseData.sections.map((section: any, sectionIndex: number) => {
          return {
            id: section.id, // Preserve the section ID
            title: section.title,
            orderIndex: sectionIndex + 1, 
            lessons: section.lessons.map((lesson: any, lessonIndex: number) => {
              // Base lesson object with ID preserved
              const lessonObj: Lesson = {
                id: lesson.id, // Preserve the lesson ID
                type: lesson.type,
                title: lesson.title,
                orderIndex: lessonIndex + 1
              };
              
              // Add type-specific properties
              switch (lesson.type) {
                case 'video':
                  lessonObj.videoUrl = lesson.video?.videoUrl;
                  lessonObj.duration = lesson.video?.durationInSeconds;
                  
                  // Format materials if they exist
                  if (lesson.video?.materials?.length > 0) {
                    lessonObj.materials = lesson.video.materials.map((material: any) => ({
                      id: material.id, // Preserve material ID
                      title: material.fileName,
                      fileType: material.fileType,
                      url: material.fileUrl || material.fileType,
                      public_id: material.public_id || ''
                    }));
                  }
                  break;
                  
                case 'post':
                  lessonObj.content = lesson.post?.title;
                  lessonObj.difficulty = lesson.post?.difficulty || 'Easy';
                  // If post has an ID, preserve it
                  if (lesson.post?.postId) {
                    lessonObj.postId = lesson.post.postId;
                  }
                  break;
                  
                case 'quiz':
                  lessonObj.questions = lesson.quiz?.map((q: any, qIndex: number) => ({
                    id: q.quizId, // Preserve quiz question ID
                    title: q.title,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    orderIndex: qIndex + 1,
                  }));
                  break;
                  
                case 'exercise':
                  lessonObj.tasks = lesson.exercise?.map((e: any, eIndex: number) => ({
                    id: e.id, // Preserve exercise task ID
                    title: e.title,
                    inputDesc: e.inputDesc,
                    outputDesc: e.outputDesc,
                    orderIndex: eIndex + 1
                  }));
                  break;
              }
              
              return lessonObj;
            })
          };
        });
        
        setSections(formattedSections);
        setOpenModal(true);
      } else {
        message.error('Không thể tải dữ liệu khóa học!');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu khóa học!');
    } finally {
      setLoading(false);
    }
  };
  const onDelete = (id: string) => {};
  // Handle Book Number
  // const getIds = (data: any) => {
  //   setSelectedIds(data);
  // };

  const handleDelete = async (id: string | number) => {
    setLoading(true);
    try {
      // Call API delete here
      setSelectedIds((prev) => prev.filter((item) => item !== Number(id)));
      setOpenModal(false);
      const res = await deleteCourse(Number(id));
      if (res?.status === 200) {  
        message.success('Xóa khóa học thành công');
        fetchCourses();
      } else {
        message.error('Có lỗi xảy ra khi xóa khóa học. Vui lòng thử lại sau!');
      }
    } catch (error) {
      setError("Lỗi khi xóa dữ liệu");
    }
    setLoading(false);
  };

  const handleKeyDownSearch = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      fetchCourses();
    }
  };

  // Fix handlePreview
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewUrl(file.url || file.preview || '');
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url?.substring(file.url.lastIndexOf('/') + 1) || '');
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  const addSection = () => {
    // Sử dụng null cho id đối với section mới
    const newSection: Section = {
      id: undefined, // Set undefined (will be treated as null by the API)
      title: `Chương ${sections.length + 1}`,
      orderIndex: sections.length + 1,
      lessons: []
    };
    setSections([...sections, newSection]);
  };

  const addLesson = (sectionIndex: number, type: Lesson['type']) => {
    const newLesson: Lesson = {
      id: undefined, // Set undefined for new lessons
      type,
      title: '',
      orderIndex: sections[sectionIndex].lessons.length + 1,
      ...(type === 'post' && { content: '', difficulty: 'Easy' }),
      ...(type === 'quiz' && { questions: [] }),
      ...(type === 'exercise' && { tasks: [] })
    };
    
    const updatedSections = [...sections];
    updatedSections[sectionIndex].lessons.push(newLesson);
    setSections(updatedSections);
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, data: Partial<Lesson>) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].lessons[lessonIndex] = {
      ...updatedSections[sectionIndex].lessons[lessonIndex],
      ...data
    };
    setSections(updatedSections);
  };

  // Update handleSubmit function
  const handleSubmit = async (values: CourseFormData) => {
    try {

      
      

      setUploading(true);

      // Validate URLs
      if (!values.thumbnailUrl || values.thumbnailUrl.trim() === '') {
        message.error('Vui lòng upload thumbnail cho khóa học!');
        return;
      }

      if (!values.previewUrl || values.previewUrl.trim() === '') {
        message.error('Vui lòng upload video preview cho khóa học!');
        return;
      }

      const userStr = localStorage.getItem("user");
      if (!userStr) {
        message.error('Vui lòng đăng nhập để thêm khóa học!');
        return;
      }

      const userData = JSON.parse(userStr);
      if (!userData || !userData.id) {
        message.error('Không tìm thấy thông tin giảng viên!');
        return;
      }

      // Validate price
      if (!isFree) {
        if (values.priceCurrent && values.price && Number(values.priceCurrent) >= Number(values.price)) {
          message.error('Giá khuyến mãi phải nhỏ hơn giá gốc!');
          return;
        }
      }

      // Process sections to make sure orderIndex values are correct
      // Preserve IDs in the processed sections
      const processedSections = sections.map((section, sectionIndex) => ({
        ...section,
        id: section.id, // Include section ID if it exists
        orderIndex: sectionIndex + 1,
        lessons: section.lessons.map((lesson, lessonIndex) => ({
          ...lesson,
          id: lesson.id, // Include lesson ID if it exists
          orderIndex: lessonIndex + 1
        }))
      }));

      // Prepare course data với đảm bảo thumbnailUrl và previewUrl không undefined
      const courseData: CreateCourseData = {
        ...values,
        thumbnailUrl: values.thumbnailUrl || '', // Đảm bảo không undefined
        previewUrl: values.previewUrl || '', // Đảm bảo không undefined
        instructorId: userData.id,
        price: isFree ? undefined : Number(values.price),
        priceCurrent: isFree ? undefined : Number(values.priceCurrent),
        sections: processedSections.map(section => ({
          id: section.id, // Include section ID
          title: section.title,
          orderIndex: section.orderIndex,
          lessons: section.lessons.map(lesson => {
            const lessonData: any = {
              id: lesson.id, // Include lesson ID
              type: lesson.type,
              title: lesson.title,
              orderIndex: lesson.orderIndex
            };

            // Add type-specific data
            switch (lesson.type) {
              case 'video':
                lessonData.videoUrl = lesson.videoUrl;
                lessonData.duration = lesson.duration; // Thêm duration vào data gửi lên API
                lessonData.materials = lesson.materials?.map(material => ({
                  id: material.id, // Include material ID
                  title: material.title,
                  fileType: material.fileType,
                  url: material.url,
                  public_id: material.public_id
                }));
                break;
              case 'post':
                lessonData.postId = lesson.postId; // Include post ID if it exists
                lessonData.content = lesson.content;
                lessonData.difficulty = lesson.difficulty;
                break;
              case 'quiz':
                lessonData.questions = lesson.questions?.map((q, qIndex) => ({
                  id: q.id, // Include question ID
                  title: q.title,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  orderIndex: qIndex + 1
                }));
                break;
              case 'exercise':
                lessonData.tasks = lesson.tasks?.map((t, tIndex) => ({
                  id: t.id, // Include task ID
                  title: t.title,
                  inputDesc: t.inputDesc,
                  outputDesc: t.outputDesc,
                  orderIndex: tIndex + 1
                }));
                break;
            }

            return lessonData;
          })
        }))
      };


      
      let success = false;
      
      if (isEditing && editingCourseId) {
        // Update existing course
        const result = await updateCourse(editingCourseId, courseData);
        success = result?.status === 200;
        if (success) {
        message.success('Cập nhật khóa học thành công!');
        }
      } else {
        // Create new course
        const result = await createCourse(courseData);
        success = result?.status === 200 || result?.status === 201;
        if (success) {
        message.success('Thêm khóa học thành công!');
        }
      }
      
      if (success) {
      handleModalClose();
      fetchCourses();
      }
    } catch (error: any) {
      console.error(isEditing ? 'Error updating course:' : 'Error creating course:', error);
      message.error(error.message || `Có lỗi xảy ra khi ${isEditing ? 'cập nhật' : 'thêm'} khóa học!`);
    } finally {
      setUploading(false);
    }
  };

  // Thêm hàm xóa chương
  const deleteSection = (sectionIndex: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa chương này? Tất cả bài học trong chương sẽ bị xóa.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        const updatedSections = sections.filter((_, index) => index !== sectionIndex);
        // Cập nhật lại orderIndex cho các chương còn lại
        updatedSections.forEach((section, index) => {
          section.orderIndex = index + 1;
        });
        setSections(updatedSections);
      }
    });
  };

  // Thêm hàm xóa bài học
  const deleteLesson = (sectionIndex: number, lessonIndex: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài học này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: () => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].lessons = updatedSections[sectionIndex].lessons.filter((_, index) => index !== lessonIndex);
        // Cập nhật lại orderIndex cho các bài học còn lại
        updatedSections[sectionIndex].lessons.forEach((lesson, index) => {
          lesson.orderIndex = index + 1;
        });
        setSections(updatedSections);
      }
    });
  };

  // Cập nhật lại hàm handleDragEnd
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Xử lý kéo thả chương
    if (type === 'SECTION') {
      try {
        console.log('Dragging section', source.index, 'to', destination.index);
        
        // Kiểm tra xem source.droppableId có phải là "sections" không
        if (source.droppableId !== "sections" || destination.droppableId !== "sections") {
          console.error('Invalid droppableId for sections', source.droppableId, destination.droppableId);
          return;
        }
        
        // Tạo bản sao của sections array để thao tác
        const newSections = [...sections];
        
        // Lấy section để di chuyển
        const [movedSection] = newSections.splice(source.index, 1);
        
        // Chèn section vào vị trí đích
        newSections.splice(destination.index, 0, movedSection);
        
        // Cập nhật lại orderIndex và title cho tất cả chương, giữ nguyên id
        const updatedSections = newSections.map((section, index) => ({
          ...section,
          orderIndex: index + 1,
          title: section.title.startsWith('Chương ') ? `Chương ${index + 1}` : section.title,
          // Giữ nguyên ID của section (undefined cho section mới)
          id: section.id
        }));
        
        // Cập nhật state
        setSections(updatedSections);
        console.log('Sections updated:', updatedSections);
      } catch (error) {
        console.error('Error during section drag:', error);
      }
      return;
    }

    // Xử lý kéo thả bài học
    if (type === 'LESSON') {
      // Lấy chỉ số của section nguồn và đích từ droppableId (format: section-lessons-X)
      const sourceSectionIdParts = source.droppableId.split('-');
      const destSectionIdParts = destination.droppableId.split('-');
      
      if (sourceSectionIdParts.length < 3 || destSectionIdParts.length < 3) {
        console.error('Invalid droppable ID format', source.droppableId, destination.droppableId);
        return; // Kiểm tra định dạng ID hợp lệ
      }
      
      const sourceSectionIndex = parseInt(sourceSectionIdParts[2]);
      const destSectionIndex = parseInt(destSectionIdParts[2]);

      const newSections = [...sections];

      // Lấy bài học từ section nguồn
      const sourceSection = newSections[sourceSectionIndex];
      const destSection = newSections[destSectionIndex];
      
      if (!sourceSection || !destSection) {
        return; // Kiểm tra section tồn tại
      }

      const [movedLesson] = sourceSection.lessons.splice(source.index, 1);

      // Di chuyển bài học đến section đích
      destSection.lessons.splice(destination.index, 0, movedLesson);

      // Cập nhật lại orderIndex cho cả hai section
      sourceSection.lessons = sourceSection.lessons.map((lesson, index) => ({
        ...lesson,
        orderIndex: index + 1
      }));

      destSection.lessons = destSection.lessons.map((lesson, index) => ({
        ...lesson,
        orderIndex: index + 1
      }));

      // Cập nhật lại state
      setSections(newSections);
    }
  };

  // Hàm xử lý cập nhật nội dung bài học
  const handleQuillChange = (content: string, sectionIndex: number, lessonIndex: number) => {
    const key = `${sectionIndex}-${lessonIndex}`;
    setLocalQuillContents(prev => ({
      ...prev,
      [key]: content
    }));

    // Debounce cập nhật global state
    const timeoutId = setTimeout(() => {
      updateLesson(sectionIndex, lessonIndex, { content });
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Memoize expensive render functions
  const renderSectionManagement = useCallback(() => {
    const handleUpdateSection = (index: number, data: Partial<Section>) => {
      const updatedSections = [...sections];
      updatedSections[index] = { ...updatedSections[index], ...data };
      setSections(updatedSections);
    };

    return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <BookOutlined className="text-blue-500" />
            <Title level={4} className="m-0">Quản lý chương và bài học</Title>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={addSection}
            className="flex items-center gap-2"
          >
          Thêm chương
        </Button>
      </div>

      <Droppable droppableId="sections" type="SECTION">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                style={{
                  minHeight: '100px',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {sections.map((section, index) => (
                  <SectionItem
                    key={section.id ? `section-${section.id}` : `section-new-${index}`}
                    section={section}
                    index={index}
                    onUpdateSection={handleUpdateSection}
                    onDeleteSection={deleteSection}
                    uploadProgress={uploadProgress}
                    setUploadProgress={setUploadProgress}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
      </div>
    );
  }, [sections, uploadProgress, setUploadProgress]);

  // Memoize category search component
  const renderCategorySearch = useCallback(() => (
    <div>
      <Label htmlFor="courseCategory">Tìm kiếm theo chủ đề</Label>
      <Select
        id="courseCategory"
        className="w-full h-[41px]"
        placeholder="Chọn chủ đề khóa học"
        value={selectedCategory}
        onChange={(value) => {
          setSelectedCategory(value);
          setOffset(0);
        }}
        allowClear
        loading={loadingCategories}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.children as unknown as string)
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      >
        {categories?.map(category => (
          <Option key={category.id} value={category.name}>
            {category.name}
          </Option>
        ))}
      </Select>
    </div>
  ), [categories, loadingCategories, selectedCategory]);

  // Memoize price range search component
  const renderPriceRangeSearch = useCallback(() => (
    <div>
      <Label htmlFor="priceRange">Khoảng giá (VNĐ)</Label>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Từ"
          value={localMinPrice}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d]/g, '');
            handlePriceChange('min', value);
          }}
          className="w-1/2"
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
        />
        <Input
          type="text"
          placeholder="Đến"
          value={localMaxPrice}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d]/g, '');
            handlePriceChange('max', value);
          }}
          className="w-1/2"
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
        />
      </div>
    </div>
  ), [localMinPrice, localMaxPrice, handlePriceChange]);

  // Update modal form to include section management
  const renderAddCourseModal = () => (
    <Modal
      title={
        <div className="flex items-center gap-2 text-xl">
          <BookOutlined className="text-blue-500" />
          <span>{isEditing ? 'Cập nhật khóa học' : 'Thêm khóa học mới'}</span>
        </div>
      }
      open={openModal}
      onCancel={handleModalClose}
      footer={null}
      width={1000}
      className="course-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ isFree: false }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name="title"
            label={
              <div className="flex items-center gap-2">
                <BookOutlined className="text-blue-500" />
                <span>Tên khóa học</span>
              </div>
            }
          rules={[
            { required: true, message: 'Vui lòng nhập tên khóa học!' },
            { min: 5, message: 'Tên khóa học phải có ít nhất 5 ký tự!' }
          ]}
        >
            <Input prefix={<BookOutlined className="text-gray-400" />} />
        </Form.Item>

        <Form.Item
          name="level"
            label={
              <div className="flex items-center gap-2">
                <StarOutlined className="text-yellow-500" />
                <span>Trình độ</span>
              </div>
            }
          rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
        >
          <Select>
            <Option value="Cơ bản">Cơ bản</Option>
            <Option value="Trung bình">Trung bình</Option>
            <Option value="Nâng cao">Nâng cao</Option>
          </Select>
        </Form.Item>
        </div>

        <Form.Item
          name="description"
          label={
            <div className="flex items-center gap-2">
              <InfoCircleOutlined className="text-blue-500" />
              <span>Mô tả</span>
            </div>
          }
          rules={[
            { required: true, message: 'Vui lòng nhập mô tả!' },
            { min: 20, message: 'Mô tả phải có ít nhất 20 ký tự!' }
          ]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label={
            <div className="flex items-center gap-2">
              <DollarOutlined className="text-green-500" />
              <span>Khóa học miễn phí</span>
            </div>
          }>
          <Switch
            checked={isFree}
            onChange={(checked) => {
              setIsFree(checked);
              if (checked) {
                form.setFieldsValue({ price: undefined, priceCurrent: undefined });
              }
            }}
          />
        </Form.Item>

          <Form.Item
            name="categoryId"
            label={
              <div className="flex items-center gap-2">
                <TagsOutlined className="text-purple-500" />
                <span>Chủ đề</span>
              </div>
            }
            rules={[{ required: true, message: 'Vui lòng chọn chủ đề!' }]}
          >
            <Select loading={loadingCategories}>
              {categories?.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {!isFree && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="price"
              label={
                <div className="flex items-center gap-2">
                  <DollarOutlined className="text-green-500" />
                  <span>Giá gốc (VNĐ)</span>
                </div>
              }
              rules={[
                { required: !isFree, message: 'Vui lòng nhập giá gốc!' },
                { 
                  validator: (_, value) => {
                    if (value === undefined || value === '') {
                      return Promise.reject('Vui lòng nhập giá gốc!');
                    }
                    if (value <= 0) {
                      return Promise.reject('Giá phải lớn hơn 0!');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <CurrencyInput
                placeholder="Nhập giá gốc"
                className="w-full"
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  if (value) {
                    form.setFieldsValue({ price: Number(value) });
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="priceCurrent"
              label={
                <div className="flex items-center gap-2">
                  <TagOutlined className="text-orange-500" />
                  <span>Giá khuyến mãi (VNĐ)</span>
                </div>
              }
              rules={[
                { required: !isFree, message: 'Vui lòng nhập giá khuyến mãi!' },
                { 
                  validator: (_, value) => {
                    if (value === undefined || value === '') {
                      return Promise.reject('Vui lòng nhập giá khuyến mãi!');
                    }
                    if (value <= 0) {
                      return Promise.reject('Giá khuyến mãi phải lớn hơn 0!');
                    }
                    const originalPrice = form.getFieldValue('price');
                    if (originalPrice && value >= originalPrice) {
                      return Promise.reject('Giá khuyến mãi phải nhỏ hơn giá gốc!');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <CurrencyInput
                placeholder="Nhập giá khuyến mãi"
                className="w-full"
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  if (value) {
                    form.setFieldsValue({ priceCurrent: Number(value) });
                  }
                }}
              />
            </Form.Item>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="thumbnailUrl" label={
            <div className="flex items-center gap-2">
              <FileImageOutlined className="text-blue-500" />
              <span>Ảnh thumbnail</span>
            </div>
          }>
            <div className="space-y-2">
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                onChange={({ file }) => {
                  handleThumbnailUpload(file);
                }}
                onPreview={handlePreview}
                accept="image/*"
              >
                {!thumbnailFile && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
              {uploadProgress.thumbnail !== undefined && (
                <Progress 
                  percent={uploadProgress.thumbnail} 
                  status={uploadProgress.thumbnail === 100 ? "success" : "active"}
                  size="small"
                />
              )}
            </div>
          </Form.Item>

          <Form.Item name="previewUrl" label={
            <div className="flex items-center gap-2">
              <PlayCircleOutlined className="text-red-500" />
              <span>Video preview</span>
            </div>
          }>
            <div className="space-y-2">
              <Upload
                maxCount={1}
                beforeUpload={() => false}
                onChange={({ file }) => {
                  handlePreviewUpload(file as unknown as UploadFile);
                }}
                accept="video/*"
              >
                <Button icon={<UploadOutlined />}>Upload video</Button>
              </Upload>
              {uploadProgress.preview !== undefined && (
                <Progress 
                  percent={uploadProgress.preview} 
                  status={uploadProgress.preview === 100 ? "success" : "active"}
                  size="small"
                />
              )}
            </div>
          </Form.Item>
        </div>

        <Form.Item
          name="skillDescription"
          label={
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-green-500" />
              <span>Mô tả kỹ năng</span>
            </div>
          }
          rules={[
            { required: true, message: 'Vui lòng nhập mô tả kỹ năng!' },
            { min: 20, message: 'Mô tả kỹ năng phải có ít nhất 20 ký tự!' }
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Mô tả các kỹ năng học viên sẽ đạt được sau khóa học"
            className="resize-none h-[100px] max-h-[150px]"
          />
        </Form.Item>

        <Form.Item
          name="technologies"
          label={
            <div className="flex items-center gap-2">
              <ToolOutlined className="text-purple-500" />
              <span>Công nghệ sử dụng</span>
            </div>
          }
          rules={[
            { required: true, message: 'Vui lòng nhập công nghệ sử dụng!' }
          ]}
        >
          <Input 
            placeholder="Ví dụ: Java Backend, Spring Boot 3, Java 17, JPA, PostgreSQL, Docker, Maven, Kafka, Redis"
            prefix={<RocketOutlined className="text-gray-400" />}
          />
        </Form.Item>

        <Divider>
          <div className="flex items-center gap-2">
            <SettingOutlined className="text-blue-500" />
            <span>Quản lý nội dung khóa học</span>
          </div>
        </Divider>

        {renderSectionManagement()}

        <Form.Item className="flex justify-end">
          <Space>
            <Button 
              onClick={handleModalClose}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={uploading}
              icon={isEditing ? <EditOutlined /> : <PlusOutlined />}
            >
              {isEditing ? 'Cập nhật khóa học' : 'Thêm khóa học'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Thêm interface cho Cloudinary response
  interface UploadFileResponse {
    uid: string;
    lastModified: number;
    lastModifiedDate: string;
    name: string;
    size: number;
    type: string;
    percent: number;
    originFileObj: {
      uid: string;
    };
    thumbUrl?: string;
    status: 'uploading' | 'done' | 'error' | 'removed';
  }

  // Add function to delete files when modal is closed
  const handleModalClose = () => {
    setOpenModal(false);
    form.resetFields();
    setSections([]);
    setQuillContent('');
    setThumbnailFile(null);
    setPreviewFile(null);
    setUploadProgress({ 
      lessonVideos: {},
      materials: {} 
    });
    setUploadedFiles([]);
    setIsEditing(false);
    setEditingCourseId(null);
  };

  // Update handleThumbnailUpload
  const handleThumbnailUpload = async (file: UploadFile) => {
    if (file?.status === 'removed') {
      form.setFieldsValue({ thumbnailUrl: '' });
      setThumbnailFile(null);
      return;
    }

    if (!file?.type?.startsWith('image/')) {
      message.error('Chỉ chấp nhận file ảnh!');
      return;
    }

    // Kiểm tra kích thước file
    if (file.size && file.size > MAX_IMAGE_SIZE) {
      message.error(`Kích thước file quá lớn! Tối đa ${formatFileSize(MAX_IMAGE_SIZE)}`);
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, thumbnail: 0 }));
      
      if (file) {
        const res = await uploadToCloudinary(file as unknown as File) as CloudinaryResponse;
        if (!res?.secure_url) {
          throw new Error('Không nhận được URL từ Cloudinary');
        }
        
        form.setFieldsValue({ thumbnailUrl: res.secure_url });
        setThumbnailFile(file as unknown as RcFile);
        setUploadProgress(prev => ({ ...prev, thumbnail: 100 }));
        setUploadedFiles(prev => [...prev, { public_id: res.public_id, type: 'thumbnail' }]);
        
        message.success('Upload thumbnail thành công!');
      }
    } catch (error) {
      console.error('Upload thumbnail thất bại:', error);
      message.error('Upload thumbnail thất bại!');
      form.setFieldsValue({ thumbnailUrl: '' });
      setThumbnailFile(null);
      setUploadProgress(prev => ({ ...prev, thumbnail: undefined }));
    }
  };

  // Update handlePreviewUpload
  const handlePreviewUpload = async (file: UploadFile) => {
    if (file?.status === 'removed') {
      form.setFieldsValue({ previewUrl: '' });
      setPreviewFile(null);
      return;
    }

    if (!file?.type?.startsWith('video/')) {
      message.error('Chỉ chấp nhận file video!');
      return;
    }

    // Kiểm tra kích thước file
    if (file.size && file.size > MAX_VIDEO_SIZE) {
      message.error(`Kích thước video quá lớn! Tối đa ${formatFileSize(MAX_VIDEO_SIZE)} (khoảng 4 tiếng)`);
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, preview: 0 }));
      
      if (file) {
        const res = await uploadToCloudinary(file as unknown as File) as CloudinaryResponse;
        if (!res?.secure_url) {
          throw new Error('Không nhận được URL từ Cloudinary');
        }
        
        // Lưu lại URL và hiển thị thông tin thời lượng nếu có
        form.setFieldsValue({ previewUrl: res.secure_url });
        setPreviewFile(file as unknown as RcFile);
        setUploadProgress(prev => ({ ...prev, preview: 100 }));
        setUploadedFiles(prev => [...prev, { public_id: res.public_id, type: 'preview' }]);
        
        // Thêm thông báo về thời lượng
        if (res.duration) {
          const minutes = Math.floor(res.duration / 60);
          const seconds = Math.floor(res.duration % 60);
          message.success(`Upload video preview thành công! (Thời lượng: ${minutes}:${seconds.toString().padStart(2, '0')})`);
        } else {
          message.success('Upload video preview thành công!');
        }
      }
    } catch (error) {
      console.error('Upload video preview thất bại:', error);
      message.error('Upload video preview thất bại!');
      form.setFieldsValue({ previewUrl: '' });
      setPreviewFile(null);
      setUploadProgress(prev => ({ ...prev, preview: undefined }));
    }
  };

  // Update handleMaterialUpload
  const handleMaterialUpload = async (uploadFile: UploadFile, materialIndex: number) => {
    if (uploadFile?.status === "removed") {
      // Instead of using the direct materials array, get the current section and lesson
      // based on the context of where this function is called
      const sectionIndex = parseInt(getMaterialProgressKey(materialIndex).split('-')[0]);
      const lessonIndex = parseInt(getMaterialProgressKey(materialIndex).split('-')[1]);
      
      const updatedSections = [...sections];
      if (updatedSections[sectionIndex] && 
          updatedSections[sectionIndex].lessons[lessonIndex] && 
          updatedSections[sectionIndex].lessons[lessonIndex].materials) {
        
        const lessonMaterials = [...(updatedSections[sectionIndex].lessons[lessonIndex].materials || [])];
        lessonMaterials[materialIndex] = {
          ...lessonMaterials[materialIndex],
          url: '',
          public_id: ''
        };
        
        updatedSections[sectionIndex].lessons[lessonIndex].materials = lessonMaterials;
        setSections(updatedSections);
      }
      return;
    }

    // Use a helper function to get the proper material type
    const getMaterialType = (progressKey: string) => {
      const [sectionIndex, lessonIndex, matIndex] = progressKey.split('-').map(Number);
      if (sections[sectionIndex]?.lessons[lessonIndex]?.materials?.[matIndex]) {
        return sections[sectionIndex].lessons[lessonIndex].materials?.[matIndex].fileType;
      }
      return '';
    };

    const progressKey = materialIndex.toString(); // Simplified for now
    const materialType = getMaterialType(progressKey);
    
    const acceptedTypes: Record<string, string[]> = {
      pdf: ["application/pdf"],
      doc: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      zip: ["application/zip", "application/x-zip-compressed"],
      image: ["image/"],
      video: ["video/"]
    };

    const fileMimeType = uploadFile?.type || "";
    const allowedTypes = materialType ? acceptedTypes[materialType] : [];
    
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/')) {
        return fileMimeType.startsWith(type);
      }
      return fileMimeType === type;
    });

    if (!isValidType) {
      message.error(`Chỉ chấp nhận file ${materialType}!`);
      return;
    }

    // Kiểm tra kích thước file dựa vào loại file
    if (uploadFile.size) {
      if (materialType === 'video' && uploadFile.size > MAX_VIDEO_SIZE) {
        message.error(`Kích thước video quá lớn! Tối đa ${formatFileSize(MAX_VIDEO_SIZE)} (khoảng 4 tiếng)`);
        return;
      } else if (materialType === 'image' && uploadFile.size > MAX_IMAGE_SIZE) {
        message.error(`Kích thước ảnh quá lớn! Tối đa ${formatFileSize(MAX_IMAGE_SIZE)}`);
        return;
      } else if (uploadFile.size > MAX_DOCUMENT_SIZE) {
        message.error(`Kích thước tài liệu quá lớn! Tối đa ${formatFileSize(MAX_DOCUMENT_SIZE)}`);
        return;
      }
    }

    try {
      setUploadProgress(prev => ({
        ...prev,
        materials: { ...prev.materials, [progressKey]: 0 }
      }));

      if (uploadFile) {
        const res = await uploadToCloudinary(uploadFile as unknown as File) as CloudinaryResponse;
        
        // Find the right section and lesson to update based on progressKey
        const [sectionIndex, lessonIndex, matIndex] = progressKey.split('-').map(Number);
        if (sections[sectionIndex] && sections[sectionIndex].lessons[lessonIndex]) {
          const updatedSections = [...sections];
          const lesson = updatedSections[sectionIndex].lessons[lessonIndex];
          
          // Create or update materials array
          const materials = lesson.materials || [];
          if (matIndex < materials.length) {
            materials[matIndex] = {
              ...materials[matIndex],
              // Preserve the ID if it exists
              id: materials[matIndex].id,
              url: res.secure_url,
              public_id: res.public_id
            };
          }
          
          lesson.materials = materials;
          setSections(updatedSections);
        }

        setUploadProgress(prev => ({
          ...prev,
          materials: { ...prev.materials, [progressKey]: 100 }
        }));

        setUploadedFiles(prev => [...prev, { 
          public_id: res.public_id, 
          type: 'material',
          materialIndex 
        }]);

        message.success('Upload tài liệu thành công!');
      }
    } catch (error) {
      console.error('Upload tài liệu thất bại:', error);
      message.error('Upload tài liệu thất bại!');
      setUploadProgress(prev => ({
        ...prev,
        materials: { ...prev.materials, [progressKey]: undefined }
      }));
    }
  };

  // Cập nhật lại phần render Upload components để hiển thị progress
  const renderUploadComponent = (type: 'thumbnail' | 'preview' | 'material', materialIndex?: number) => {
    const progress = type === 'material' && materialIndex !== undefined 
      ? uploadProgress.materials[`material-${materialIndex}`] 
      : uploadProgress[type as 'thumbnail' | 'preview']; // Fix the type error

    return (
      <div>
        <Upload
          beforeUpload={() => false}
          onChange={({ file }) => {
            if (type === 'thumbnail') {
              handleThumbnailUpload(file);
            } else if (type === 'preview') {
              handlePreviewUpload(file);
            } else if (type === 'material' && materialIndex !== undefined) {
              handleMaterialUpload(file, materialIndex);
            }
          }}
          accept={type === 'thumbnail' ? 'image/*' : type === 'preview' ? 'video/*' : undefined}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Chọn file</Button>
        </Upload>
        {progress !== undefined && (
          <Progress 
            percent={progress} 
            status={progress === 100 ? 'success' : 'active'} 
            style={{ marginTop: 8 }}
          />
        )}
      </div>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="">
        <PageMeta
          title="Quản lý khóa học"
          description="Quản lý khóa học trong hệ thống"
        />
        <PageBreadcrumb pageTitle="Quản lý khóa học" />
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setOpenModal(true);
          }}
          className="flex items-center dark:bg-black dark:text-white gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50">
          <IoIosAdd size={24} />
          Thêm
        </button>
      </div>
      <ComponentCard title="Danh sách các khóa học trong hệ thống">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div>
            <Label htmlFor="inputTwo">Tìm kiếm theo tên khóa học</Label>
            <Input
              type="text"
              id="inputTwo"
              className="border-gray-300 h-[41px]"
              placeholder="Nhập vào tên khóa học..."
              defaultValue={keyword}
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
          {renderCategorySearch()}
          <div>
            <Label htmlFor="courseLevel">Tìm kiếm theo trình độ</Label>
            <Select
              id="courseLevel"
              className="w-full h-[41px]"
              placeholder="Chọn trình độ"
              value={selectedLevel}
              onChange={(value) => {
                setSelectedLevel(value);
                setOffset(0);
              }}
              allowClear
            >
              <Option value="Cơ bản">Cơ bản</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Nâng cao">Nâng cao</Option>
            </Select>
          </div>
          {renderPriceRangeSearch()}
        </div>

        <ReusableTable
          error={error}
          onCheck={(selectedIds: (string | number)[], selectedRows: ICourse[]) => {
            setSelectedIds(selectedIds.map(id => Number(id)));
          }}
          // setSelectedIds={setSelectedIds}
          // selectedIds={selectedIds}
          title="Danh sách khóa học"
          data={courses?.data ?? []}
          columns={columns}
          onEdit={(item) => {
            onEdit(item);
          }}
          isLoading={tableLoading}
          onDelete={(id) => {
            handleDelete(id);
          }}
        />

        <Pagination
          limit={quantity}
          offset={offset}
          totalPages={courses?.totalPages ?? 1}
          onPageChange={(limit, newOffset) => {
            setQuantity(limit);
            setOffset(newOffset);
          }}
          onLimitChange={(newLimit) => {
            setQuantity(newLimit);
            setOffset(0);
          }}
        />
      </ComponentCard>
      {renderAddCourseModal()}
    </div>
    </DragDropContext>
  );
}
