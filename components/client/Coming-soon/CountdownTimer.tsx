"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
        days?: number;
        hours?: number;
        minutes?: number;
        seconds?: number;
};

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
        const difference = +targetDate - +new Date();
        let timeLeft: TimeLeft = {};

        if (difference > 0) {
                timeLeft = {
                        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((difference / 1000 / 60) % 60),
                        seconds: Math.floor((difference / 1000) % 60),
                };
        }

        return timeLeft;
};

const TimerBox = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-lg w-24">
                <span className="text-4xl font-bold text-brand-purple">{String(value).padStart(2, "0")}</span>
                <span className="text-xs text-brand-grey uppercase tracking-wider">{label}</span>
        </div>
);

export const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
        const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate));

        useEffect(() => {
                const timer = setTimeout(() => {
                        setTimeLeft(calculateTimeLeft(targetDate));
                }, 1000);

                return () => clearTimeout(timer);
        });

        const timerComponents = Object.entries(timeLeft);

        return (
                <div className="flex gap-4 mt-8">
                        {timerComponents.length ? (
                                <>
                                        <TimerBox value={timeLeft.days ?? 0} label="Days" />
                                        <TimerBox value={timeLeft.hours ?? 0} label="Hours" />
                                        <TimerBox value={timeLeft.minutes ?? 0} label="Minutes" />
                                        <TimerBox value={timeLeft.seconds ?? 0} label="Seconds" />
                                </>
                        ) : (
                                <span className="text-2xl font-bold">We are live!</span>
                        )}
                </div>
        );
};
