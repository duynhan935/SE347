import { Check } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RadioField = ({ label, name, value, checked, onChange }: any) => (
        <label className="flex items-center cursor-pointer">
                <input
                        type="radio"
                        name={name}
                        value={value}
                        checked={checked}
                        onChange={onChange}
                        className="sr-only" // Ẩn nút radio mặc định
                />
                <div
                        className={`flex items-center justify-center w-full px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                                checked
                                        ? "bg-brand-purple text-white border-brand-purple"
                                        : "bg-white text-gray-700 border-gray-700 hover:bg-gray-200"
                        }`}
                >
                        {checked && <Check className="w-4 h-4 mr-2" />}
                        {label}
                </div>
        </label>
);
