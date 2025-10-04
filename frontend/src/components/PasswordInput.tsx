import { useState} from "react";
import type { ChangeEvent } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function PasswordInput({ value, onChange, placeholder = "Enter your Password" }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div onClick={() => setVisible(!visible)}>
        {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
      </div>
    </div>
  );
}

export default PasswordInput;

