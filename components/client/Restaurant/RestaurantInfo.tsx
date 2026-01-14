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
        // Generate Google Maps embed URL
        const mapUrl = address 
                ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6Y4cYZuGTtoY&q=${encodeURIComponent(address)}`
                : null;

        return (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <Info className="w-7 h-7 text-[#EE4D2D]" />
                                About {name}
                        </h2>
                        <div className="space-y-6">
                                <p className="text-gray-700 leading-relaxed">{about}</p>
                                <div className="border-t pt-6">
                                        <h3 className="text-xl font-bold mb-4">Location & Hours</h3>
                                        
                                        {/* Google Maps Embed */}
                                        {mapUrl ? (
                                                <div className="h-64 md:h-80 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                                                        <iframe
                                                                width="100%"
                                                                height="100%"
                                                                style={{ border: 0 }}
                                                                loading="lazy"
                                                                allowFullScreen
                                                                referrerPolicy="no-referrer-when-downgrade"
                                                                src={mapUrl}
                                                        />
                                                </div>
                                        ) : (
                                                <div className="h-64 md:h-80 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                                                        <p className="text-gray-500">Map unavailable</p>
                                                </div>
                                        )}

                                        <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm">
                                                        <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                        <p className="text-gray-700">
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
