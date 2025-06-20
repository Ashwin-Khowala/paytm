// "use server";

export default function Transactions() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
        <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
            Transactions
        </div>
        <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-md">
            <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
                <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
                <th className="border border-gray-300 px-4 py-2">Amount</th>
                </tr>
            </thead>
            <tbody>
                {/* Sample data, replace with actual data */}
                {Array.from({ length: 10 }, (_, index) => (
                <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">2023-10-{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">Transaction {index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">$100.00</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>      
    </div>
  )
}

async function getTransactions(selectedTimeLine: string) {
    const user_transactions=await fetch(`/api/user/transaction-details?duration=${selectedTimeLine}`,{
        method: "GET",
        cache: "no-store",
        next: {
            revalidate: 0,
        },
    });
    if (!user_transactions.ok) {
        throw new Error("Failed to fetch transactions data");
    }
    const data = await user_transactions.json();
    return data;
}

