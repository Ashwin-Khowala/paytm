import Transactions from "../../../components/Transactions"

export default function () {
    return <div className="w-screen">
        <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
            Transactions
        </div>
        <div>
            <Transactions/>
        </div>
    </div>
}