import { useState} from "react";
import type { ChangeEvent } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

//Need to design UI later
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
        className="input"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      <div onClick={() => setVisible(!visible)}>
        {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
      </div>
    </div>
  );
}

export default PasswordInput;

