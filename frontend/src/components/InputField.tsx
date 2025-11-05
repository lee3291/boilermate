import React from 'react';
import { twMerge } from 'tailwind-merge';

type InputFieldProps = {
  label: string;
  id: string;
  type: 'email' | 'password' | 'text';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

const InputField = ({
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  className,
}: InputFieldProps) => {
  return (
    <div className='mb-4'>
      <label htmlFor={id} className='text-maingray mb-2 block'>
        {label}
      </label>
      <input
        type={type}
        id={id}
        className={twMerge(
          'w-full rounded-lg border border-grayline bg-maingray-dark px-3 py-2 text-black placeholder:text-gray-500 focus:placeholder-transparent',
          className,
        )}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default InputField;
