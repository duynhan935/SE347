"use client";

import Button from "@/components/Button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
        const [showCurrentPassword, setShowCurrentPassword] = useState(false);
        const [showNewPassword, setShowNewPassword] = useState(false);

        const [currentPassword, setCurrentPassword] = useState("");
        const [newPassword, setNewPassword] = useState("");

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                // Logic xử lý đổi mật khẩu ở đây
                console.log({ currentPassword, newPassword });
                alert("Password update logic would run here.");
        };

        return (
                <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
                        <div>
                                <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
                                <p className="text-gray-500">Manage your account preferences.</p>
                        </div>

                        {/* Change Password Section */}
                        <div className="border-t pt-6">
                                <h2 className="text-xl font-semibold">Change Password</h2>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-md">
                                        <div>
                                                <label className="block text-sm font-medium">Current Password</label>

                                                <div className="relative mt-1">
                                                        <input
                                                                title="Current Password"
                                                                type={showCurrentPassword ? "text" : "password"}
                                                                value={currentPassword}
                                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                                className="w-full p-2 border rounded-md pr-10"
                                                                required
                                                        />

                                                        <button
                                                                type="button"
                                                                onClick={() =>
                                                                        setShowCurrentPassword(!showCurrentPassword)
                                                                }
                                                                className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                                                        >
                                                                {showCurrentPassword ? (
                                                                        <EyeOff size={20} />
                                                                ) : (
                                                                        <Eye size={20} />
                                                                )}
                                                        </button>
                                                </div>
                                        </div>
                                        <div>
                                                <label className="block text-sm font-medium">New Password</label>
                                                <div className="relative mt-1">
                                                        <input
                                                                title="New Password"
                                                                type={showNewPassword ? "text" : "password"}
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
                                                                className="w-full p-2 border rounded-md pr-10"
                                                                required
                                                        />
                                                        <button
                                                                type="button"
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                                                        >
                                                                {showNewPassword ? (
                                                                        <EyeOff size={20} />
                                                                ) : (
                                                                        <Eye size={20} />
                                                                )}
                                                        </button>
                                                </div>
                                        </div>
                                        <Button type="submit" className="bg-brand-black text-white hover:bg-black/80">
                                                Update Password
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
