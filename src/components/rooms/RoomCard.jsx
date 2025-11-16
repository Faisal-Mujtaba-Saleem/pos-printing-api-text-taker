import { formatCurrency } from "@/utlis/formatCurrency";
import Image from "next/image";

export default function RoomCard({ room, view, onBook, onDetails }) {
    return (
        <article
            className={`flex ${view === "grid" ? "flex-col items-stretch" : "flex-row items-center"
                } bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition`}
        >
            <div
                className={`relative flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl h-28 ${view === "grid" ? "w-40 sm:w-full" : "w-full sm:w-40"
                    } shrink-0 mb-3 sm:mb-0`}
            >
                {room.img ? (
                    <Image
                        src={room.img}
                        alt={room.name}
                        fill
                        style={{ objectFit: "cover" }}
                    />
                ) : (
                    <FaBed className="text-blue-600 text-3xl" />
                )}
            </div>

            <div
                className={`flex-1 flex flex-col gap-2 ${view === "grid" ? "pt-5" : "ps-5 py-2"
                    }`}
            >
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 text-base">{room.name}</h3>
                    {room.room_no && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            {room.room_no}
                        </span>
                    )}
                </div>

                <p className="text-sm text-gray-500">
                    {room.type} • Max {room.capacity} guests
                </p>

                <div className="flex flex-wrap gap-2">
                    {room.features.map((f) => (
                        <span
                            key={f}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                        >
                            {f}
                        </span>
                    ))}
                </div>

                <div className="flex justify-between items-center mt-5">
                    <p className="font-semibold text-gray-800">
                        {formatCurrency(room.price)}
                        <span className="text-gray-500 text-sm font-normal"> /-</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            className="text-gray-600 hover:text-blue-600 text-sm font-medium"
                            onClick={() => onDetails(room)}
                        >
                            Details
                        </button>
                        <button
                            className="px-3 py-1.5 rounded-md text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => onBook(room)}
                        >
                            Book
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}