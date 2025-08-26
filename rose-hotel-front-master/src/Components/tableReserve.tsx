import axios, { AxiosError } from "axios";
import moment from "moment-jalaali";
import { useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaBars, FaExclamation, FaMinus, FaPlus } from "react-icons/fa";
import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import reserveImage from "../assets/images/home.png";
import icon from "../assets/images/logo.png";
import { toFarsiNumber } from "../Utils/setNumbersToPersian";

interface ITable {
	name: string;
	photo: string;
	id: number;
	capacity: number;
}

function Reserve() {
	const [guests, setGuests] = useState(1);
	const [date, setDate] = useState<Date | null>(null);
	const [hour, setHour] = useState<DateObject | null>(null);
	const [loading, setLoading] = useState(false);
	const [_, setTables] = useState<ITable[]>([]);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// const times = ["ساعت ۳", "۲ ساعت", "۱ ساعت"];
	const navigate = useNavigate();

	const incrementGuests = () => setGuests((prev) => Math.min(prev + 1, 10));
	const decrementGuests = () => setGuests((prev) => Math.max(prev - 1, 1));

	// const getDuration = (time: string): number => {
	// 	switch (time) {
	// 		case "ساعت ۳":
	// 			return 1;
	// 		case "۲ ساعت":
	// 			return 1;
	// 		case "۱ ساعت":
	// 			return 1;
	// 		default:
	// 			return 1;
	// 	}
	// };

	const getTables = async (params: {
		date: string;
		hour: string;
		duration: number;
		people: number;
	}) => {
		try {
			console.log("params", params);

			const response = await axios.get(
				`${import.meta.env.VITE_API_BASE_URL}${
					import.meta.env.VITE_RESERVATIONS_AVAILABLE_ENDPOINT
				}`,
				{
					params,
				}
			);
			console.log("API Response:", response);

			setTables(response.data);
			return response.data;
		} catch (error) {
			if (error instanceof Error) {
				const err = error as AxiosError;
				return {
					message: err.message,
					response: err.response?.data,
					status: err.response?.status,
				};
			} else {
				return { message: String(error) };
			}
		}
	};

	const searchFunction = async () => {
		setLoading(true);
		try {
			if (!date || !hour) {
				toast.error("لطفاً تاریخ، ساعت و مدت زمان را انتخاب کنید");
				return;
			}
			const formattedDate = date.toISOString().split("T")[0];
			const duration = 1;
			console.log("Original date:", date.toISOString());
			console.log("formattedDate", formattedDate);
			// Convert date to Persian (Shamsi) for logging or display
			const persianDate = moment(date).format("jYYYY/jMM/jDD");
			const hourString = hour ? hour.format("HH:mm") : "";
			const reservationData = {
				date: persianDate,
				hour: hourString,
				duration,
				people: guests,
			};

			let tables = [];
			try {
				tables = await getTables(reservationData);
			} catch (error: any) {
				console.error("Search failed:");
				if (error.response?.status === 404) {
					tables = [];
					toast.warn("هیچ میزی برای این تعداد نفر و زمان یافت نشد");
				} else if (error.response?.statusCode === 400) {
					tables = [];
					toast.warn(error.response?.data.message);
				} else {
					toast.error("خطا در جستجوی میزها. لطفاً دوباره امتحان کنید.");
					return;
				}
			}
			navigate("/tables", { state: { reservationData, tables, persianDate } });
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("خطایی غیرمنتظره رخ داد. لطفاً دوباره امتحان کنید.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#FBFBFB] sm:bg-white flex justify-center">
			<div className="w-full sm:max-w-[600px] flex flex-col h-screen sm:h-auto sm:my-8">
				<div className="flex flex-col h-screen bg-[#FBFBFB]">
					{/* navbar*/}
					<nav className="w-full bg-[#FFFFFF] flex items-center justify-between h-15">
						<button
							className="text-2xl focus:outline-none px-6 text-[#138F96]"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							<FaBars />
						</button>
						<Link to="/" className="flex items-center gap-2">
							<img
								src={icon}
								alt="Logo"
								className="h-8 w-auto cursor-pointer"
								style={{ width: "100px", height: "auto" }}
							/>
						</Link>
					</nav>

					{/* menu */}
					{isMenuOpen && (
						<div className="absolute mt-14 w-35 bg-white rounded-sm shadow-md z-50 text-sm text-gray-700 flex flex-col">
							<Link
								to="/reserve"
								className="px-4 py-2 font-bold text-[#138F96] text-right"
							>
								رزرو میز
							</Link>
							<Link
								to="/menu"
								className="px-4 py-2 font-bold text-[#138F96] text-right"
							>
								 مشاهده منو
							</Link>
						</div>
					)}

					{/* image*/}
					<div className="h-1/3 w-full relative">
						<img
							src={reserveImage}
							alt="Reserve"
							className="h-full w-full object-cover"
						/>
					</div>

					{/* card */}
					<div className="relative -mt-36 mx-4 bg-white rounded-[16px] shadow-lg p-5 flex flex-col gap-4">
						<span className="text-sm text-center text-[#BB995B]">
							:رزرو میز
						</span>
						<hr className="border-gray-300" />
						<div className="flex justify-around items-center gap-4 mt-3">
							<div className="w-1/2">
								<label className="block text-sm font-bold text-gray-700 mb-2 text-right">
									:ساعت ورود
								</label>
								<DatePicker
									value={hour}
									format="HH:mm"
									onChange={setHour}
									plugins={[<TimePicker hideSeconds position="center" />]}
									locale={persian_fa}
									disableMonthPicker
									disableDayPicker
									disableYearPicker
									inputClass="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138F96] placeholder:text-[#138F96] text-right"
									placeholder="انتخاب ساعت"
								/>
							</div>
							<div className="w-1/2">
								<label className="block text-sm font-bold text-gray-700 mb-2 text-right">
									:تاریخ حضور
								</label>
								<div className="w-full">
									<DatePicker
										value={date}
										onChange={(date) => setDate(date?.toDate() || null)}
										calendar={persian}
										locale={persian_fa}
										calendarPosition="bottom-right"
										inputClass="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138F96] placeholder:text-[#138F96] text-right"
										format="YYYY/MM/DD"
										placeholder="انتخاب تاریخ"
										style={{ width: "100%" }}
									/>
								</div>
							</div>
						</div>
						<div className="mt-6">
							<label className="block text-sm font-bold text-gray-700 mb-2 text-right">
								:مدت زمان حضور
							</label>
							{/* <div className="flex gap-2">
						{times.map((time, index) => (
							<button
								key={index}
								onClick={() => setSelectedTime(time)}
								className={`flex-1 p-2 border rounded-lg text-sm font-medium 
                  ${
										selectedTime === time
											? "bg-[#BB995B] text-white border-[#BB995B]"
											: "text-[#666666] border-[#BBBBBB] hover:bg-[#BBBBBB] hover:text-white"
									}`}
							>
								{time}
							</button>
						))}
					</div> */}
							<div className="flex items-center justify-end mt-2">
								<p className="text-xs text-gray-500 text-right">
									.بیشترین زمان استفاده از میزها ۱ ساعت است
								</p>
								<div className="flex items-center justify-center w-5 h-5 border border-gray-300 rounded-full bg-white ml-2">
									<FaExclamation className="text-gray-500 text-xs" />
								</div>
							</div>
						</div>
						<div className="flex justify-between items-center mt-6">
							<div className="flex items-center gap-4">
								<button
									onClick={decrementGuests}
									className="p-2 border rounded-lg bg-[#BB995B] text-white"
								>
									<FaMinus />
								</button>
								<span
									className="text-lg font-bold text-[#BBBBBB] border py-1 px-5 rounded-[5px] flex items-center gap-1"
									dir="rtl"
								>
									<span>{toFarsiNumber(guests)}</span>
									<span>نفر</span>
								</span>
								<button
									onClick={incrementGuests}
									className="p-2 border rounded-lg bg-[#BB995B] text-white"
								>
									<FaPlus />
								</button>
							</div>
							<label className="text-sm font-bold text-gray-700">
								:تعداد نفرات
							</label>
						</div>
						<button
							onClick={searchFunction}
							className="mt-4 bg-[#138F96] text-white font-bold py-2 rounded-lg relative"
							disabled={loading}
						>
							{loading ? (
								<div className="flex items-center justify-center">
									<svg
										className="animate-spin h-5 w-5 text-white mr-2"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									در حال جستجو...
								</div>
							) : (
								"جستجو میز"
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Reserve;
