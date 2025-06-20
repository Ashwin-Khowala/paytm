import { useState, useEffect } from "react";
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

interface TransactionDataItem {
    date: string;
    amount: number;
}

interface PortfolioChartProps {
    isAuthenticated: boolean;
    portfolioValue: number;
}

export default function TimeLineChart({ isAuthenticated, portfolioValue }: PortfolioChartProps) {
    const [selectedTimeLine, setSelectedTimeLine] = useState("7 days");
    const [timelineData, setTimelineData] = useState<number[]>([]);
    const [timelineLabels, setTimelineLabels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactionData = async () => {
            if (!isAuthenticated) return;

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
    }, [selectedTimeLine, isAuthenticated]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
        },
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                grid: {
                    display: false
                }
            }
        }
    };

    const dataTime = [...timelineData].reverse(); // Create a copy first, then reverse

    const data = {
        labels: timelineLabels,
        datasets: [
            {
                label: "Portfolio Value",
                data: dataTime,
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
        <div className="w-full max-w-[900px]">
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                    <p className="text-sm text-gray-500">Portfolio Value</p>
                    <p className="text-2xl font-semibold">₹{portfolioValue}</p>
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
                        <Line options={options} data={data} className="w-full" />
                    )}
                </div>

                {/* Timeline selector */}
                <div className="w-full flex justify-center">
                    <div className="mt-3 flex gap-2 bg-gray-100 w-48 justify-center rounded-full h-8 items-center">
                        <TimelineButton text="1W" value="7 days" onClick={() => handleTimelineChange("7 days")} selectedTimeLine={selectedTimeLine} />
                        <TimelineButton text="1M" value="1 month" onClick={() => handleTimelineChange("1 month")} selectedTimeLine={selectedTimeLine} />
                        <TimelineButton text="3M" value="3 months" onClick={() => handleTimelineChange("3 months")} selectedTimeLine={selectedTimeLine} />
                        <TimelineButton text="6M" value="6 months" onClick={() => handleTimelineChange("6 months")} selectedTimeLine={selectedTimeLine} />
                        <TimelineButton text="1Y" value="1 year" onClick={() => handleTimelineChange("1 year")} selectedTimeLine={selectedTimeLine} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function TimelineButton({ text, value, onClick, selectedTimeLine }: {
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
    // const today = now.toLocaleString('en-IN', {
        // timeZone: 'Asia/Kolkata'
    // });
    const labels = [];

    function subtractDays(date: Date, days: number) {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() - days);
        return newDate;
    }

    function formatDate(date: Date, format: string) {
        return format === "day"
            ? date.toLocaleDateString("en-IN", { weekday: "short" })     // e.g., Mon
            : format === "month"
                ? date.toLocaleDateString("en-IN", { month: "short" })       // e.g., Jan
                : date.toLocaleDateString("en-In", { day: "2-digit", month: "short" }); // e.g., 01 Jan
    }

    if (range === "7 days") {
        // Generate labels for the past 7 days
        for (let i = 6; i >= 0; i--) {
            const date = subtractDays(today, i);
            labels.push(formatDate(date, "day")); // Mon, Tue, ...
        }
    } else if (range === "1 month") {
        // Generate labels for the past 30 days (every 3 days)
        for (let i = 30; i >= 0; i -= 3) {
            const date = subtractDays(today, i);
            labels.push(formatDate(date, "short")); // 01 Apr, 04 Apr, ...
        }
    } else if (range === "3 months") {
        // Generate labels for the past 90 days (every 7 days)
        for (let i = 90; i >= 0; i -= 7) {
            const date = subtractDays(today, i);
            labels.push(formatDate(date, "short"));
        }
    } else if (range === "6 months") {
        // Generate labels for the past 180 days (every 14 days)
        for (let i = 180; i >= 0; i -= 14) {
            const date = subtractDays(today, i);
            labels.push(formatDate(date, "short"));
        }
    } else if (range === "1 year") {
        // Generate labels for the past 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(formatDate(date, "month")); // Jan, Feb, ...
        }
    }

    return labels;
}