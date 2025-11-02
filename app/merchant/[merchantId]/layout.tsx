import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Toaster } from "react-hot-toast";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
        return (
                <ProtectedRoute allowedRoles={["MERCHANT"]}>
                        <div className="flex min-h-screen bg-gray-100">
                                <div className="flex-1 flex flex-col">
                                        <main className="flex-1 p-4 md:p-6">
                                                <Toaster position="top-center" />
                                                {children}
                                        </main>
                                </div>
                        </div>
                </ProtectedRoute>
        );
}
