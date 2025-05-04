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

interface TransactionDataItem {
    date: string;
    amount: number;
}

export default function DashboardChart() {
    const { data: session, status } = useSession();
    const [user_data, setUser_Data] = useState<UserData | null>(null);
    const [selectedTimeLine, setSelectedTimeLine] = useState("7 days");
    const [timelineData, setTimelineData] = useState<number[]>([]);
    const [timelineLabels, setTimelineLabels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (status === "authenticated") {
            fetch("/api/user/user-data")
                .then((res) => res.json())
                .then((data) => setUser_Data(data))
                .catch(err => console.error("Error fetching user data:", err));
        }
    }, [status]);

    useEffect(() => {
        const fetchTransactionData = async () => {
            if (status !== "authenticated") return;
            
            setIsLoading(true);
            setError(null);
            
            try {
                console.log("Fetching data for:", selectedTimeLine);
                const response = await fetch(`/api/user/transaction-details?duration=${selectedTimeLine}`);
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                console.log("Transaction data:", data);
                
                if (!data || !Array.isArray(data)) {
                    // Handle empty or invalid data
                    setTimelineLabels(generateTimelineLabels(selectedTimeLine));
                    setTimelineData(Array(generateTimelineLabels(selectedTimeLine).length).fill(0));
                    return;
                }
                
                // Extract labels and values from data
                const labels = data.map((item: TransactionDataItem) => item.date);
                const values = data.map((item: TransactionDataItem) => item.amount);
                
                // If we have data but not enough for all labels, fill in the gaps
                const defaultLabels = generateTimelineLabels(selectedTimeLine);
                if (labels.length < defaultLabels.length) {
                    setTimelineLabels(defaultLabels);
                    
                    // Create an array matching the default labels length, filled with values where available
                    const paddedValues = Array(defaultLabels.length).fill(0);
                    values.forEach((val, index) => {
                        paddedValues[index] = val;
                    });
                    setTimelineData(paddedValues);
                } else {
                    setTimelineLabels(labels);
                    setTimelineData(values);
                }
            } catch (err) {
                console.error("Error fetching transaction data:", err);
                setError("Failed to load transaction data");
                // Set default empty data
                setTimelineLabels(generateTimelineLabels(selectedTimeLine));
                setTimelineData(Array(generateTimelineLabels(selectedTimeLine).length).fill(0));
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchTransactionData();
    }, [selectedTimeLine, status]);

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
    
    const data = {
        labels: timelineLabels,
        datasets: [
            {
                label: "Portfolio Value",
                data: timelineData, 
                borderColor: '#6c47ff',
                backgroundColor: "#FFFF",
                tension: 0.4,
            },
        ],
    };

    const handleTimelineChange = (newTimeline: string) => {
        setSelectedTimeLine(newTimeline);
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
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <p>Loading data...</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-red-500">{error}</p>
                            </div>
                        ) : (
                            <Line options={options} data={data} className="w-full"/>
                        )}
                    </div>
                    
                    {/* timeline */}
                    <div className="w-full flex justify-center">
                        <div className="mt-3 flex gap-2 bg-gray-100 w-48 justify-center rounded-full h-8 items-center">
                            <Button text="1W" value="7 days" onClick={() => handleTimelineChange("7 days")} selectedTimeLine={selectedTimeLine} />
                            <Button text="1M" value="1 month" onClick={() => handleTimelineChange("1 month")} selectedTimeLine={selectedTimeLine} />
                            <Button text="3M" value="3 months" onClick={() => handleTimelineChange("3 months")} selectedTimeLine={selectedTimeLine} />
                            <Button text="6M" value="6 months" onClick={() => handleTimelineChange("6 months")} selectedTimeLine={selectedTimeLine} />
                            <Button text="1Y" value="1 year" onClick={() => handleTimelineChange("1 year")} selectedTimeLine={selectedTimeLine} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Button({ text, value, onClick, selectedTimeLine }:{
    text: string;
    value: string;
    onClick: () => void;
    selectedTimeLine: string;
}) {
    const isSelected = selectedTimeLine === value;
    
    return (
        <div className={`${isSelected ? "bg-white shadow-md rounded-lg" : ""}`}>
            <button onClick={onClick} className="m-1 text-xs text-black font-semibold">
                {text}
            </button>
        </div>
    );
}

function generateTimelineLabels(range: string) {
    const today = new Date();
    const labels = [];

    function addDays(date: Date, days: number) {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + days);
        return newDate;
    }

    function formatDate(date: Date, format: string) {
        return format === "day"
            ? date.toLocaleDateString("en-US", { weekday: "short" })     // e.g., Mon
            : format === "month"
            ? date.toLocaleDateString("en-US", { month: "short" })       // e.g., Jan
            : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }); // e.g., 01 Jan
    }

    if (range === "7 days") {
        for (let i = 6; i >= 0; i--) {
            const date = addDays(today, -i);
            labels.push(formatDate(date, "day")); // Mon, Tue, ...
        }
    } else if (range === "1 month") {
        for (let i = 30; i >= 0; i -= 3) {
            const date = addDays(today, -i);
            labels.push(formatDate(date, "short")); // 01 Apr, 04 Apr, ...
        }
    } else if (range === "3 months") {
        for (let i = 90; i >= 0; i -= 7) {
            const date = addDays(today, -i);
            labels.push(formatDate(date, "short"));
        }
    } else if (range === "6 months") {
        for (let i = 180; i >= 0; i -= 14) {
            const date = addDays(today, -i);
            labels.push(formatDate(date, "short"));
        }
    } else if (range === "1 year") {
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(formatDate(date, "month")); // Jan, Feb, ...
        }
    }

    return labels;
}