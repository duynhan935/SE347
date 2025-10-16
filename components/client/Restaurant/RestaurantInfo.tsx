import { Clock, Info, MapPin, Phone } from "lucide-react";

type InfoProps = {
        name: string;
        about: string;
        address: string;
        phone: string;
        openingTime: string;
        closingTime: string;
};

export default function RestaurantInfo({ name, about, address, phone, openingTime, closingTime }: InfoProps) {
        return (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold font-roboto-serif mb-6 flex items-center gap-3">
                                <Info className="w-7 h-7 text-brand-purple" />
                                About {name}
                        </h2>
                        <div className="space-y-6">
                                <p className="text-gray-700 leading-relaxed">{about}</p>
                                <div className="border-t pt-6">
                                        <h3 className="text-xl font-bold mb-4">Location & Hours</h3>
                                        <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                                                <p className="text-gray-500">Map Placeholder</p>
                                        </div>
                                        <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm">
                                                        <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                        <p>
                                                                Open: {openingTime} - {closingTime}
                                                        </p>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm">
                                                        <MapPin className="w-5 h-5 mt-1 text-gray-500 flex-shrink-0" />
                                                        <p className="text-gray-700">{address}</p>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                        <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                        <p className="text-gray-700">{phone}</p>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
