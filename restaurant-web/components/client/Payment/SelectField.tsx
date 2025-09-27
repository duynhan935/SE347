// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SelectField = ({ label, id, children, ...props }: any) => (
        <div>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                </label>
                <select
                        id={id}
                        name={id}
                        {...props}
                        className="block w-full border-1 p-2 border-gray-700 rounded-md focus:ring-brand-purple focus:border-brand-purple"
                >
                        {children}
                </select>
        </div>
);
