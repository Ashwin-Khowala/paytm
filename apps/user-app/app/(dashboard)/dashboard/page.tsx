"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

// Chart.js registration
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
interface User{
    name: string 
}
interface userBalance{ 
    amount: number 
};
interface UserData extends User, userBalance{
    user:User,
    userBalance:userBalance
}

export default function DashboardChart() {
    const { data: session, status } = useSession();
    const [user_data, setUser_Data] = useState<UserData | null>(null);
    const [selectedTimeLine, setSelectedTimeLine] = useState("1W");
    const [isSelectedButton, setSelectedButton] = useState(selectedTimeLine);
    
    useEffect(() => {
        if (status === "authenticated") {
            fetch("/api/user/user-data")
                .then((res) => res.json())
                .then((data) => setUser_Data(data));
        }
    }, [status]);

    if (status === "unauthenticated") {
        return <p className="text-center text-red-500">Not authenticated</p>;
    }
    const user = user_data?.user || null;
    const userBalance = user_data?.userBalance || null;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
        },
    };
    
    const timelineLabels = generateTimelineLabels(selectedTimeLine);
    
    const data = {
        labels: timelineLabels,
        datasets: [
            {
                label: "Portfolio Value",
                data: [100, 200, 300, 250, 400, 350, 500], 
                borderColor: '#6c47ff',
                backgroundColor: "#FFFF",
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="p-6 space-y-6 w-screen h-screen">
            <h1 className="text-3xl font-bold text-purple-700">
                Good Afternoon, {user?.name ?? "Sample User"}
            </h1>

            <div className="w-full max-w-[900px]">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="mb-4">
                        <p className="text-sm text-gray-500">Portfolio Value</p>
                        <p className="text-2xl font-semibold">₹{userBalance?.amount ?? 0}</p>
                    </div>

                    <div className="w-full h-72">
                        <Line options={options} data={data} className="w-full"/>
                    </div>
                    {/* timeline */}
                    <div className="w-full flex justify-center">
                        <div className="mt-3 flex gap-2 bg-gray-100 w-48 justify-center rounded-full h-8 items-center">
                            <Button text="1W" onClick={() => setSelectedTimeLine("1W")} selectedTimeLine={selectedTimeLine} />
                            <Button text="1M" onClick={() => setSelectedTimeLine("1M")} selectedTimeLine={selectedTimeLine} />
                            <Button text="3M" onClick={() => setSelectedTimeLine("3M")} selectedTimeLine={selectedTimeLine} />
                            <Button text="6M" onClick={() => setSelectedTimeLine("6M")} selectedTimeLine={selectedTimeLine} />
                            <Button text="1Y" onClick={() => setSelectedTimeLine("1Y")} selectedTimeLine={selectedTimeLine} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Button({ text, onClick, selectedTimeLine }:{
    text: string;
    onClick: () => void;
    selectedTimeLine: string;
}) {
    return (
        <div className={`${selectedTimeLine === text ? "bg-white shadow-md rounded-lg" : ""}`}>
            <button onClick={onClick} className="m-1 text-xs text-black font-semibold">
                {text}
            </button>
        </div>
    );
}

function generateTimelineLabels(range:any) {
    const today = new Date();
    const labels = [];

    function addDays(date:Date, days:number) {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + days);
        return newDate;
    }

    function formatDate(date:Date, format:string) {
        return format === "day"
            ? date.toLocaleDateString("en-US", { weekday: "short" })     // e.g., Mon
            : format === "month"
            ? date.toLocaleDateString("en-US", { month: "short" })       // e.g., Jan
            : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }); // e.g., 01 Jan
    }

    if (range === "1W") {
        for (let i = 6; i >= 0; i--) {
            const date = addDays(today, -i);
            labels.push(formatDate(date, "day")); // Mon, Tue, ...
        }
    } else if (range === "1M") {
        for (let i = 30; i >= 0; i -= 3) {
            const date = addDays(today, -i);
            labels.push(formatDate(date, "short")); // 01 Apr, 04 Apr, ...
        }
    } else if (range === "3M") {
        for (let i = 90; i >= 0; i -= 7) {
            const date = addDays(today, -i);
            labels.push(formatDate(date, "short"));
        }
    } else if (range === "6M") {
        for (let i = 180; i >= 0; i -= 14) {
            const date = addDays(today, -i);
            labels.push(formatDate(date, "short"));
        }
    } else if (range === "1Y") {
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(formatDate(date, "month")); // Jan, Feb, ...
        }
    }

    return labels;
}