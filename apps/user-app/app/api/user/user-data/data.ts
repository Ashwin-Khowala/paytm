// /app/api/dashboard-data.ts
import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findFirst({
    where: { email: session.user.email },
  });

  const userBalance = await prisma.balance.findFirst({
    where: { userId: user?.id },
  });

  const userData = await prisma.onRampTransaction.findMany({
    where: { userId: user?.id },
  });

  return NextResponse.json({ user, userBalance, userData });
}
