import Button from "@/components/Button";

// Giả lập dữ liệu người dùng
const user = {
        name: "Peter Moor",
        email: "peter.moor@example.com",
        phone: "+1 234 567 890",
        memberSince: "Oct 2025",
};

export default function ProfilePage() {
        return (
                <div className="bg-white p-8 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
                        <div className="space-y-4">
                                <div>
                                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                                        <p className="text-lg font-semibold">{user.name}</p>
                                </div>
                                <div>
                                        <label className="text-sm font-medium text-gray-500">Email Address</label>
                                        <p className="text-lg">{user.email}</p>
                                </div>
                                <div>
                                        <label className="text-sm font-medium text-gray-500">Phone Number</label>
                                        <p className="text-lg">{user.phone}</p>
                                </div>
                                <div>
                                        <label className="text-sm font-medium text-gray-500">Member Since</label>
                                        <p className="text-lg">{user.memberSince}</p>
                                </div>
                        </div>
                        <div className="mt-8">
                                <Button className="bg-brand-purple text-white hover:bg-brand-purple/90">
                                        Edit Profile
                                </Button>
                        </div>
                </div>
        );
}
