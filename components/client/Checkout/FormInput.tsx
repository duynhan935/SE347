// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormInput = ({ icon: Icon, type = "text", placeholder, name, value, onChange }: any) => (
        <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Icon className="text-gray-300" size={20} />
                </div>
                <input
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        className="w-full bg-black text-white placeholder-gray-300 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition"
                />
        </div>
);
