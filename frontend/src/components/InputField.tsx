import React from 'react'

type InputFieldProps = {
    label: string;
    id: string;
    type: 'email' | 'password' | 'text';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

const InputField = ({ label, id, type, value, onChange, placeholder}: InputFieldProps) => {
    return (
        <div className='mb-4'>
            <label htmlFor={id} className="block text-gray-700 mb-2">
                {label}
            </label>
            <input
              type={type}
              id={id}
              className="w-full px-3 py-2 border rounded-lg"
              value={value}
              onChange={onChange}
              placeholder={placeholder}
            />
        </div>       
    );
};

export default InputField;