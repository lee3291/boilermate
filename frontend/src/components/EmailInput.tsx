import type { ChangeEvent } from "react";

//Need to design UI later
type Props = {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
};

function EmailInput({ value, onChange, placeholder = "Enter your email" }: Props) {
    return (
        <div>
            <input
                type="email"
                placeholder={placeholder}
                className="input"
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

export default EmailInput;
