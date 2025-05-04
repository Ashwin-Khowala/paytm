"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function p2pTransfer(to: string, amount: number) {
    const session = await getServerSession(authOptions);
    const from = session?.user?.id;
    if (!from) {
        return {
            message: "Error while sending"
        }
    }
    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    });

    if (!toUser) {
        return {
            message: "User not found"
        }
    }
    await prisma.$transaction(async (tx) => {
        // Lock the 'from' user's balance row
        await tx.$queryRawUnsafe(`
            SELECT * FROM "Balance"
            WHERE "userId" = ${Number(from)}
            FOR UPDATE
        `);
    
        // Lock the 'to' user's balance row
        await tx.$queryRawUnsafe(`
            SELECT * FROM "Balance"
            WHERE "userId" = ${toUser.id}
            FOR UPDATE
        `);
    
        const fromBalance = await tx.balance.findFirst({
            where: { 
                userId: Number(from) 
            },
        });
        
        console.log("HI");
        console.log(fromBalance, toUser.id, amount);

        if (!fromBalance || fromBalance.amount < amount) {
            throw new Error('Insufficient funds');
        }
    
        await tx.balance.update({
            where: { userId: Number(from) },
            data: { amount: { decrement: amount } },
        });
    
        await tx.balance.update({
            where: { userId: toUser.id },
            data: { amount: { increment: amount } },
        });

        await tx.p2pTransfer.create({
            data:{
                fromUserId:Number(from),
                toUserId:Number(toUser.id),
                amount,
                timestamp:new Date(),
            }
        })

    });
    
}