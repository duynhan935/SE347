// File: components/client/restaurants/RestaurantInfo.tsx
import { MapPin, Phone } from "lucide-react";

type RestaurantInfoProps = {
        about: string;
        address: string;
        phone: string;
};

export default function RestaurantInfo({ about, address, phone }: RestaurantInfoProps) {
        return (
                <section>
                        <div>
                                <h2 className="text-xl font-bold mb-3">About {`The Burger Cafe`}</h2>
                                <p className="text-gray-600 leading-relaxed">{about}</p>
                        </div>
                        <div className="mt-8">
                                <h2 className="text-xl font-bold mb-3">Location & Hours</h2>
                                {/* Map Placeholder */}
                                <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                                        <p className="text-gray-500">Map Placeholder</p>
                                        {/* Để nhúng Google Map thật, bạn có thể dùng <iframe> */}
                                </div>
                                <div className="space-y-2">
                                        <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 mt-1 text-gray-500 flex-shrink-0" />
                                                <p className="text-gray-700">{address}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                <p className="text-gray-700">{phone}</p>
                                        </div>
                                </div>
                        </div>
                </section>
        );
}
