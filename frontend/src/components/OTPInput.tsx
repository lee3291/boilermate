import { useState, useRef, type KeyboardEvent, type ClipboardEvent, type ChangeEvent } from "react"

interface OTPInputProps {
    length?: number
    onComplete?: (otp: string) => void
}

export default function OTPInput({ length = 6, onComplete }: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Only allow digits
        if (value && !/^\d$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Move to next input if value is entered
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }

        // Call onComplete if all boxes are filled
        if (newOtp.every((digit) => digit !== "") && onComplete) {
            onComplete(newOtp.join(""))
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text/plain").slice(0, length)

        // Only allow digits
        if (!/^\d+$/.test(pastedData)) return

        const newOtp = [...otp]
        pastedData.split("").forEach((char, index) => {
            if (index < length) {
                newOtp[index] = char
            }
        })
        setOtp(newOtp)

        // Focus the next empty input or the last input
        const nextIndex = Math.min(pastedData.length, length - 1)
        inputRefs.current[nextIndex]?.focus()

        // Call onComplete if all boxes are filled
        if (newOtp.every((digit) => digit !== "") && onComplete) {
            onComplete(newOtp.join(""))
        }
    }

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
            ))}
        </div>
    )
}
