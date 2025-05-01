import { getServerSession } from "next-auth/next";
import { BalanceCard } from "../../../components/BalanceCard";
import { SendCard } from "../../../components/SendCard";
import prisma from "@repo/db/client";
import { authOptions } from "../../lib/auth";
import { P2pTransfer } from "../../../components/p2pTransactions";

async function getBalance() {
    const session = await getServerSession(authOptions);
    const balance = await prisma.balance.findFirst({
        where: {
            userId: Number(session?.user?.id)
        }
    });
    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0
    }
}

async function getP2pTransfers() {
    const session = await getServerSession(authOptions);
    if(!session?.user?.id) {
        return []
    }
    const txns = await prisma.p2pTransfer.findMany({
        where: {
            fromUserId: Number(session.user.id)
        }
    });
    return txns.map(t => ({
        time: t.timestamp,
        amount: t.amount,
        status: "Success",
    }))
}


export default async function () {
    const balance = await getBalance();
    const p2pTransfers = await getP2pTransfers();
    return <div className="w-screen h-screen">
            <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
                P2P Transfer
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
                <div>
                    <SendCard/>
                </div>
                <div>
                    <BalanceCard amount={balance.amount} locked={balance.locked} />
                    <div className="pt-4">
                        <P2pTransfer transactions={p2pTransfers} />
                    </div>
                </div>
            </div>
        </div>
}