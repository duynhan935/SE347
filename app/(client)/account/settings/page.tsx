"use client";

import Button from "@/components/Button";
import { authApi } from "@/lib/api/authApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SettingsPage() {
        const [showNewPassword, setShowNewPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const [newPassword, setNewPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");
        const [loading, setLoading] = useState(false);
        const { user } = useAuthStore();

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                if (!user?.id) {
                        toast.error("User information not available");
                        return;
                }

                if (newPassword !== confirmPassword) {
                        toast.error("Passwords do not match");
                        return;
                }

                if (newPassword.length < 6) {
                        toast.error("Password must be at least 6 characters long");
                        return;
                }

                setLoading(true);
                try {
                        await authApi.resetPassword(user.id, {
                                password: newPassword,
                                confirmPassword: confirmPassword,
                        });
                        toast.success("Password updated successfully!");
                        setNewPassword("");
                        setConfirmPassword("");
                } catch (error: any) {
                        const errorMessage =
                                error.response?.data?.message || error.message || "Failed to update password";
                        toast.error(errorMessage);
                } finally {
                        setLoading(false);
                }
        };

        return (
                <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
                        <div>
                                <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
                                <p className="text-gray-500">Manage your account preferences.</p>
                        </div>

                        {/* Change Password Section */}
                        <div className="border-t pt-6">
                                <h2 className="text-xl font-semibold mb-2">Change Password</h2>
                                <p className="text-sm text-gray-600 mb-4">
                                        Update your account password. Make sure to use a strong password.
                                </p>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-md">
                                        <div>
                                                <label className="block text-sm font-medium mb-1">New Password</label>
                                                <div className="relative">
                                                        <input
                                                                title="New Password"
                                                                type={showNewPassword ? "text" : "password"}
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
                                                                className="w-full p-2 border rounded-md pr-10 focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
                                                                placeholder="Enter new password"
                                                                required
                                                                minLength={6}
                                                                disabled={loading}
                                                        />
                                                        <button
                                                                type="button"
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                                className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                                                        >
                                                                {showNewPassword ? (
                                                                        <EyeOff size={20} />
                                                                ) : (
                                                                        <Eye size={20} />
                                                                )}
                                                        </button>
                                                </div>
                                        </div>
                                        <div>
                                                <label className="block text-sm font-medium mb-1">
                                                        Confirm New Password
                                                </label>
                                                <div className="relative">
                                                        <input
                                                                title="Confirm New Password"
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                value={confirmPassword}
                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                className="w-full p-2 border rounded-md pr-10 focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
                                                                placeholder="Confirm new password"
                                                                required
                                                                minLength={6}
                                                                disabled={loading}
                                                        />
                                                        <button
                                                                type="button"
                                                                onClick={() =>
                                                                        setShowConfirmPassword(!showConfirmPassword)
                                                                }
                                                                className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                                                        >
                                                                {showConfirmPassword ? (
                                                                        <EyeOff size={20} />
                                                                ) : (
                                                                        <Eye size={20} />
                                                                )}
                                                        </button>
                                                </div>
                                        </div>
                                        <Button
                                                type="submit"
                                                className="bg-brand-purple text-white hover:bg-brand-purple/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={loading}
                                        >
                                                {loading ? (
                                                        <>
                                                                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                                                Updating...
                                                        </>
                                                ) : (
                                                        "Update Password"
                                                )}
                                        </Button>
                                </form>
                        </div>

                        {/* Two-Factor Authentication Section */}
                        <div className="border-t pt-6">
                                <h2 className="text-xl font-semibold">Two-Factor Authentication (2FA)</h2>
                                <p className="mt-2 text-gray-600">
                                        Secure your account with an extra layer of protection.
                                </p>
                                <div className="mt-4">
                                        <Button className="bg-brand-purple text-white hover:bg-brand-purple/90">
                                                Enable 2FA
                                        </Button>
                                </div>
                        </div>
                </div>
        );
}
