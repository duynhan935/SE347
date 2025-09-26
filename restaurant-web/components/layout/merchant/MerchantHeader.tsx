import Tooltip from "@/components/merchant/dashboard/Tooltip";
import { Bell, MessageCircleQuestionMark, Settings, Store, User, ChevronDown, MapPin, Plus, LogOut } from "@/constants";
import HeaderDropdown from "./HeaderDropdown";

export default function MerchantHeader() {
    return (
        <header className="flex items-center justify-end gap-4 px-8 py-2 bg-white border-b relative">
            {/* Location Dropdown */}
            <HeaderDropdown
                trigger={
                    <button className="font-medium text-button3 cursor-pointer flex items-center gap-2 bg-white px-4 py-2 rounded">
                        Select a location
                        <ChevronDown size={15} className="text-gray-500 mt-1" />
                    </button>
                }
                width="w-64"
            >
                <div>
                    <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer">
                        <MapPin size={18} className="text-gray-700" />
                        <span className="flex-1">Location 1</span>
                        <span className="text-blue-600 text-sm cursor-pointer">Edit</span>
                    </div>
                    <div className="border-t my-1"></div>
                    <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer">
                        <Plus size={18} className="text-gray-700" />
                        <span className="flex-1">New location</span>
                    </div>
                </div>
            </HeaderDropdown>

            <Tooltip text="Storefront">
                <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                    <Store size={18} className="text-gray-700 cursor-pointer" />
                </div>
            </Tooltip>
            <Tooltip text="Help Center">
                <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                    <MessageCircleQuestionMark size={18} className="text-gray-700 cursor-pointer" />
                </div>
            </Tooltip>

            {/* Bell Dropdown */}
            <HeaderDropdown
                trigger={
                    <button>
                        <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                            <Bell size={18} className="text-gray-700 cursor-pointer" />
                        </div>
                    </button>
                }
                width="w-80"
                align="end"
            >
                <div>
                    <div className="font-semibold px-6 py-4 border-b">Notifications</div>
                    <div className="px-6 py-6 text-center text-gray-600">There are no notifications available.</div>
                    <div className="border-t"></div>
                    <div className="px-6 py-2 text-center text-gray-400 text-xl">...</div>
                </div>
            </HeaderDropdown>

            <Tooltip text="Settings">
                <Settings size={18} className="text-gray-700 cursor-pointer" />
            </Tooltip>

            {/* User Dropdown */}
            <HeaderDropdown
                trigger={
                    <button>
                        <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                            <User size={32} className="text-gray-400 rounded-full bg-gray-200 cursor-pointer" />
                        </div>
                    </button>
                }
                width="w-80"
                align="end"
            >
                <div>
                    <div className="flex flex-col items-center py-6">
                        <User size={64} className="text-gray-300 rounded-full bg-gray-200 mb-2" />
                        <div className="font-semibold text-lg">nhan duy</div>
                        <div className="text-gray-500 mb-2">Owner</div>
                        <div className="flex items-center gap-2 px-4 py-1 rounded-full border border-green-400 bg-green-50">
                            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                            <span className="text-green-700 text-sm font-medium">Online</span>
                        </div>
                    </div>
                    <div className="border-t"></div>
                    <div className="px-6 py-4 flex flex-col gap-3">
                        <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer">
                            <User size={20} />
                            My Account
                        </button>
                        <button className="flex items-center gap-2 text-red-600 hover:text-red-800 cursor-pointer">
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </div>
            </HeaderDropdown>
        </header>
    );
}
