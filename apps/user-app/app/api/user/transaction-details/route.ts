import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth"; 

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = Number(session?.user.id);
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
  }

  try {
    // Get duration from URL search params
    const searchParams = req.nextUrl.searchParams;
    const duration = searchParams.get('duration');
    
    if (!isValidDuration(duration)) {
      return NextResponse.json({ error: "Invalid duration parameter" }, { status: 400 });
    }

    const transactionDetails = await getOnRampTransactionDetails(userId, duration);
    
    // Format the data in a way that's easier for the frontend to use
    console.log("Formatted Data:", transactionDetails||"No data found");
    const formattedData = formatTransactionData(transactionDetails);
    if(!formattedData) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }
    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Helper function to validate duration
function isValidDuration(duration: string | null): duration is '7 days' | '1 month' | '3 months' | '6 months' | '1 year' {
  return duration !== null && [
    '7 days',
    '1 month',
    '3 months',
    '6 months',
    '1 year'
  ].includes(duration);
}

async function getOnRampTransactionDetails(
  userId: number | string,
  duration: '7 days' | '1 month' | '3 months' | '6 months' | '1 year'
) {
  const result = await prisma.$queryRawUnsafe(`
    SELECT time_bucket('1 day', "startTime") AS period, SUM(amount) as amount
    FROM "OnRampTransaction"
    WHERE "userId" = $1 AND "startTime" >= now() - interval '${duration}'
    GROUP BY period
    ORDER BY period ASC;
  `, userId);

  return result;
}


// Format the data to match what the frontend expects
function formatTransactionData(data: any) {
  // If no data, return default values to prevent frontend errors
  if (!data || data.length === 0) {
    return {
      labels: [],
      values: []
    };
  }

  // Extract dates and sum values from the query result
  const formattedData = data.map((item: any) => ({
    date: formatDate(new Date(item.period)),
    amount: Number(item.amount)/100
  }));

  return formattedData;
}

// Format date to a readable string
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

// CREATE EXTENSION IF NOT EXISTS timescaledb;