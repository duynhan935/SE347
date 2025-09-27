type StatusType = "Pending" | "Success" | "Cancel";
export const StatusBadge = ({ status }: { status: StatusType }) => {
        const baseStyle = "text-xs font-bold px-2.5 py-1 rounded-full";
        switch (status) {
                case "Success":
                        return <span className={`${baseStyle} bg-green-100 text-green-800`}>Success</span>;
                case "Cancel":
                        return <span className={`${baseStyle} bg-red-100 text-red-800`}>Cancel</span>;
                case "Pending":
                default:
                        return <span className={`${baseStyle} bg-yellow-100 text-yellow-800`}>Pending</span>;
        }
};
