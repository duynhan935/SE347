"use client";

import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import RatingStar from "./RatingStar";

export default function Slider() {
        const reviews = [
                //... dữ liệu reviews của bạn
                {
                        id: 1,
                        name: "Peter Moor",
                        role: "UI/UX Designer",
                        text: "I’m obsessed with excellent customer service...thanks foodeats for being awesome!",
                },
                {
                        id: 2,
                        name: "Anna Lee",
                        role: "Product Manager",
                        text: "Foodeats makes it super easy to order food online. Love the fast delivery and smooth UI!",
                },
                {
                        id: 3,
                        name: "John Smith",
                        role: "Entrepreneur",
                        text: "Great platform for food lovers. The ordering experience is seamless and reliable!",
                },
                {
                        id: 4,
                        name: "Peter Moor",
                        role: "UI/UX Designer",
                        text: "I’m obsessed with excellent customer service...thanks foodeats for being awesome!",
                },
                {
                        id: 5,
                        name: "Peter Moor",
                        role: "UI/UX Designer",
                        text: "I’m obsessed with excellent customer service...thanks foodeats for being awesome!",
                },
                {
                        id: 6,
                        name: "Peter Moor",
                        role: "UI/UX Designer",
                        text: "I’m obsessed with excellent customer service...thanks foodeats for being awesome!",
                },
        ];

        return (
                <div className="max-w-6xl mx-auto px-4 reviews-slider">
                        <Swiper
                                modules={[Pagination]}
                                pagination={{
                                        clickable: true,
                                        // Ra lệnh cho Swiper render pagination vào div có class 'custom-pagination'
                                        el: ".custom-pagination",
                                }}
                                spaceBetween={30}
                                breakpoints={{
                                        640: { slidesPerView: 1 },
                                        768: { slidesPerView: 2 },
                                        1024: { slidesPerView: 3 },
                                }}
                        >
                                {reviews.map((review) => (
                                        <SwiperSlide key={review.id}>
                                                <div className="p-6 bg-white rounded-2xl shadow-md h-full flex flex-col">
                                                        <RatingStar rating={5} />
                                                        <p className="mt-[16px] text-gray-700 flex-grow">
                                                                {review.text}
                                                        </p>
                                                        <hr className="my-4" />
                                                        <p className="font-bold">{review.name}</p>
                                                        <p className="text-sm text-gray-500">{review.role}</p>
                                                </div>
                                        </SwiperSlide>
                                ))}
                        </Swiper>

                        {/* ✨ Thêm thẻ div này để chứa pagination */}
                        <div className="custom-pagination text-center mt-8 h-[20px] cursor-pointer"></div>
                </div>
        );
}
