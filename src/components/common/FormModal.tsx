import React, { useEffect } from "react";
import { Form, Input, Button, Upload, Modal, Select, Checkbox } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface Field {
  name: string;
  label: string;
  placeholder?: string;
  initialValue?: any;
  rules?: any[];
  type?:
    | "text"
    | "number"
    | "email"
    | "textarea"
    | "upload"
    | "select"
    | "checkbox"
    | "checkbox-group";
  options?: { label: string; value: any }[];
  minLength?: number;
  maxLength?: number;
  readOnly?: boolean;
  disabled?: boolean;
}

interface FormModalProps {
  title?: string;
  isOpen: boolean;
  isLoading?: boolean;
  onSubmit?: (values: any) => void;
  onCancel?: () => void;
  formFields: Field[];
  okText?: string;
  cancelText?: string;
  extraContent?: React.ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({
  title = "Form nhập liệu",
  isOpen,
  isLoading = false,
  onSubmit,
  onCancel,
  formFields = [],
  okText = "Xác nhận",
  cancelText = "Đóng",
  extraContent,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOpen) {
      // Cập nhật giá trị của các trường khi modal mở
      const initialValues: Record<string, any> = formFields.reduce((values, field: Field) => {
        values[field.name] = field.initialValue || "";
        return values;
      }, {} as Record<string, any>);
      form.setFieldsValue(initialValues);
    } else {
      // Reset các trường khi modal đóng
      form.resetFields();
    }
  }, [isOpen, formFields, form]);

  const onFinish = (values: any) => {
    if (onSubmit) onSubmit(values);
  };
  const renderField = (field: Field) => {
    const validationRules = [];

    if (field.rules) {
      validationRules.push(...field.rules);
    }

    switch (field.type) {
      case "textarea":
        return (
          <Input.TextArea
            className="max-h-[200px]"
            placeholder={field.placeholder}
          />
        );
      case "upload":
        return (
          <Upload beforeUpload={() => false} multiple listType="text">
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        );
      case "select":
        return (
          <Select placeholder={field.placeholder}>
            {field.options?.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );
      case "checkbox":
        return <Checkbox>{field.label}</Checkbox>;
      case "checkbox-group":
        return (
          <Checkbox.Group options={field.options} disabled={field.disabled} />
        );
      default:
        return (
          <Input
            readOnly={field.readOnly}
            disabled={field.disabled}
            className={`${field.readOnly ? "bg-gray-200" : "bg-white"} ${
              field.disabled ? "cursor-not-allowed" : ""
            }`}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <Modal
      className="max-h-[620px] overflow-y-auto"
      title={<span className="text-lg font-bold">{title}</span>}
      open={isOpen}
      confirmLoading={isLoading}
      onOk={() => form.submit()}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      centered>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {formFields.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            valuePropName={field.type === "checkbox-group" ? "value" : "value"}
            initialValue={
              field.initialValue || (field.type === "checkbox-group" ? [] : "")
            }
            label={
              field.type !== "checkbox" ? (
                <label className="font-semibold text-gray-700">
                  {field.label}
                </label>
              ) : null
            }
            // rules={renderField(field).props.rules || []} // Áp dụng các quy tắc xác thực
            rules={field.rules || renderField(field).props.rules}
            className="mb-4">
            {renderField(field)}
          </Form.Item>
        ))}
        
        {/* Hiển thị nội dung bổ sung */}
        {extraContent && (
          <div className="mt-4">
            {extraContent}
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default FormModal;
