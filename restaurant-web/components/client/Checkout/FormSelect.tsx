// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormSelect = ({ icon: Icon, placeholder, name, value, onChange, options }: any) => (
        <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Icon className="text-gray-300" size={20} />
                </div>
                <select
                        title="Select"
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={`w-full bg-black border border-gray-600 rounded-lg py-3 pl-12 pr-12 appearance-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition ${
                                value ? "text-white" : "text-gray-300"
                        }`}
                >
                        <option value="" disabled className="text-gray-500">
                                {placeholder}
                        </option>{" "}
                        {options.map((opt: string) => (
                                <option key={opt} value={opt.toLowerCase()} className="bg-gray-800 text-white">
                                        {opt}
                                </option>
                        ))}{" "}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg
                                className="w-5 h-5 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                        >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                </div>
        </div>
);
