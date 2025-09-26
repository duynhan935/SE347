// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const InputField = ({ label, id, ...props }: any) => (
        <div>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                </label>
                <input
                        id={id}
                        name={id}
                        {...props}
                        className="block w-full border-gray-700 p-2 border-1 rounded-md focus:ring-brand-purple focus:border-brand-purple"
                />
        </div>
);
