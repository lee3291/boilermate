import { type ChangeEvent } from "react";

type Props = {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    id?: string;
};

export default function PasswordInput({value, onChange, placeholder = "Enter your password", id,}: Props) {                                    
    return (
        <input
            type="password"
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
    );
}

