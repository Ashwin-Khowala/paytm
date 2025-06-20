"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import TimeLineChart from "../../../components/TimeLineChart";

interface User {
    name: string;
}

interface UserBalance {
    amount: number;
}

interface UserData extends User, UserBalance {
    user: User;
    userBalance: UserBalance;
}

export default function DashboardChart() {
    const { data: session, status } = useSession();
    const [user_data, setUser_Data] = useState<UserData | null>(null);
    
    useEffect(() => {
        if (status === "authenticated") {
            fetch("/api/user/user-data")
                .then((res) => res.json())
                .then((data) => setUser_Data(data))
                .catch(err => console.error("Error fetching user data:", err));
        }
    }, [status]);

    if (status === "unauthenticated") {
        return <p className="text-center text-red-500">Not authenticated</p>;
    }
    
    const user = user_data?.user || null;
    const userBalance = user_data?.userBalance || null;

    return (
        <div className="p-6 space-y-6 w-screen h-screen">
            <h1 className="text-3xl font-bold text-purple-700">
                Good Afternoon, {user?.name ?? "Sample User"}
            </h1>

            <TimeLineChart
                isAuthenticated={status === "authenticated"}
                portfolioValue={userBalance?.amount ?? 0}
            />
        </div>
    );
}