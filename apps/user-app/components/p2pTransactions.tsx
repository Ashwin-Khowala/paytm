import { Card } from "@repo/ui/card"

export const P2pTransfer = ({ transactions }: {
    transactions: {
        time: Date,
        amount: number,
        // TODO: Can the type of `status` be more specific?
        status: string,
    }[]
}) => {
    if (!transactions.length) {
        return <Card title="Recent Transactions">
            <div className="text-center pb-8 pt-8">
                No Recent transfers
            </div>
        </Card>
    }
    return <Card title="Recent Transactions">
        <div className="pt-2">
            {transactions.map(t => <div className="flex justify-between">
                <div>
                    <div className="flex justify-center items-center">
                        <div className="text-sm m-1 mr-4">
                            Paid INR
                        </div>
                        <div className={`m-1 text-sm  ${t.status === "Processing" ? "text-gray-700" : "text-red-500"} font-semibold`}>
                            Credited
                        </div>
                    </div>
                    <div className="text-slate-600 text-xs">
                        {t.time.toDateString()}
                    </div>
                </div>
                <div className={`flex flex-col justify-center ${t.status === "Processing" ? "text-gray-700" : "text-red-500"} font-semibold`}>
                    - Rs {t.amount / 100}
                </div>

            </div>)}
        </div>
    </Card>
}