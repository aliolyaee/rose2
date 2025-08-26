import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Custom TimePicker component
export default function CustomTimePicker() {
	const [hour, setHour] = useState(""); // Store time as string (e.g., "12:34")
	const [selectedHour, setSelectedHour] = useState("");
	const [selectedMinute, setSelectedMinute] = useState("");
	const [period, setPeriod] = useState("AM");

	// Generate arrays for hours (1-12) and minutes (00-59)
	const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
	const minutes = Array.from({ length: 60 }, (_, i) =>
		String(i).padStart(2, "0")
	);

	const handleConfirm = () => {
		if (selectedHour && selectedMinute) {
			const timeString = `${selectedHour.padStart(2, "0")}:${selectedMinute}`;
			setHour(timeString);
			toast.success(`زمان انتخاب شده: ${timeString}`);
		} else {
			toast.error("لطفاً ساعت و دقیقه را انتخاب کنید");
		}
	};

	const handleNow = () => {
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const period = hours >= 12 ? "PM" : "AM";
		const formattedHour = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
		const timeString = `${String(formattedHour).padStart(2, "0")}:${String(
			minutes
		).padStart(2, "0")}`;

		setSelectedHour(String(formattedHour));
		setSelectedMinute(String(minutes).padStart(2, "0"));
		setPeriod(period);
		setHour(timeString);
		toast.success(`زمان فعلی: ${timeString}`);
	};

	return (
		<div className="w-1/2" dir="rtl">
			<label className="block text-sm font-bold text-gray-700 mb-2 text-right">
				:ساعت ورود
			</label>
			<div className="flex items-center space-x-2 space-x-reverse">
				<select
					value={selectedHour}
					onChange={(e) => setSelectedHour(e.target.value)}
					className="w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138F96] text-right"
				>
					<option value="" disabled>
						ساعت
					</option>
					{hours.map((h) => (
						<option key={h} value={h}>
							{h}
						</option>
					))}
				</select>
				<span className="text-gray-700">:</span>
				<select
					value={selectedMinute}
					onChange={(e) => setSelectedMinute(e.target.value)}
					className="w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138F96] text-right"
				>
					<option value="" disabled>
						دقیقه
					</option>
					{minutes.map((m) => (
						<option key={m} value={m}>
							{m}
						</option>
					))}
				</select>
				<select
					value={period}
					onChange={(e) => setPeriod(e.target.value)}
					className="w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138F96] text-right"
				>
					<option value="AM">ق.ظ</option>
					<option value="PM">ب.ظ</option>
				</select>
			</div>
			<div className="flex justify-between mt-2 space-x-2 space-x-reverse">
				<button
					onClick={handleNow}
					className="w-1/2 p-2 bg-gray-500 text-white rounded-lg text-right hover:bg-gray-600"
				>
					اکنون
				</button>
				<button
					onClick={handleConfirm}
					className="w-1/2 p-2 bg-[#138F96] text-white rounded-lg text-right hover:bg-[#0f7a80]"
				>
					تأیید
				</button>
			</div>
			{hour && (
				<p className="mt-2 text-sm text-gray-700 text-right">
					زمان انتخاب شده: {hour}
				</p>
			)}
		</div>
	);
}
