import axios from "axios";
import { useState } from "react";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/jalali";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaBars, FaCalendarAlt, FaClock, FaUser } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import icon from "../assets/images/logo.png";
import { toFarsiNumber } from "../Utils/setNumbersToPersian";

function ReservationConfirmation() {
	const { state } = useLocation();
	const { reservationData, selectedTable } = state || {};
	const navigate = useNavigate();
	const [phone, setPhone] = useState("");
	const [name, setName] = useState("");
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// تبدیل تاریخ میلادی به شمسی
	const formatToPersianDate = (gregorianDate: string) => {
		if (!gregorianDate) return "";
		const date = new DateObject({
			date: gregorianDate,
			calendar: persian,
			locale: persian_fa,
		});
		return date.format("YYYY/MM/DD"); // مثلاً ۱۴۰۴/۰۳/۰۱
	};

	const initiatePayment = async () => {
		console.log("1");
		setLoading(true);
		try {
			console.log("phone", phone);
			// اعتبارسنجی
			if (!phone || !name) {
				console.log("2");
				toast.error("لطفاً شماره تماس و نام را وارد کنید");
				return;
			}
			if (
				!reservationData?.date ||
				!reservationData?.hour ||
				!reservationData?.duration ||
				!reservationData?.people ||
				!selectedTable?.id
			) {
				toast.error("اطلاعات رزرو ناقص است");
				return;
			}

			// شبیه‌سازی پرداخت
			const paymentData = {
				tableId: selectedTable.id,
				phone,
				name,
				description: notes,
				date: reservationData.date,
				hour: reservationData.hour,
				duration: reservationData.duration,
				people: reservationData.people,
				amount: 100000,
			};

			console.log("Initiating payment with data:", paymentData);
			const paymentSuccessful = true;

			if (!paymentSuccessful) {
				throw new Error("Payment failed");
			}

			const response = await axios.post(
				`${import.meta.env.VITE_API_BASE_URL}${
					import.meta.env.VITE_RESERVATIONS_CREATE_ENDPOINT
				}`,
				{
					tableId: paymentData.tableId,
					date: paymentData.date,
					hour: paymentData.hour,
					duration: paymentData.duration,
					people: paymentData.people,
					phone: paymentData.phone,
					fullName: paymentData.name,
					description: paymentData.description,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			console.log("Reservation created:", response.data);
			toast.success(`${response.data.trackingCode} کد رهگیری`);
			navigate("/success", {
				state: { reservationData, selectedTable, phone, notes },
			});
		} catch (error) {
			console.error("Error initiating payment or creating reservation:", error);
			toast.error("خطا در پرداخت یا ثبت رزرو. لطفاً دوباره امتحان کنید.");
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

					{/* فیلترهای انتخابی */}
					<div className="px-4 py-4 bg-white mx-4 mt-4 rounded-lg">
						<h2 className="text-sm text-[#BB995B] text-center">
							:فیلترهای انتخابی
						</h2>
						<hr className="border-gray-300 mt-3" />
						<p className="text-[#138F96] text-right pt-3 font-bold">
							{selectedTable?.name}
						</p>
						<div className="mt-2 text-xs text-[#868686] flex justify-end p-2 gap-3">
							<div className="flex items-center gap-1 bg-[#BB995B0F] p-1 rounded-lg text-[#BB995B]">
								<span>نفر</span>
								<span>{toFarsiNumber(reservationData?.people)}</span>
								<FaUser />
							</div>
							<div className="flex items-center gap-1 bg-[#BB995B0F] p-1 rounded-lg text-[#BB995B]">
								<span>{toFarsiNumber(reservationData?.hour)} ساعت</span>
								<FaClock />
							</div>
							<div className="flex items-center gap-1 bg-[#BB995B0F] p-1 rounded-lg text-[#BB995B]">
								<span>{formatToPersianDate(reservationData?.date)}</span>
								<FaCalendarAlt />
							</div>
						</div>
					</div>

					{/* اطلاعات تکمیلی */}
					<div className="px-4 py-4 bg-white mx-4 mt-4 rounded-lg">
						<h2 className="text-sm text-[#BB995B] text-center">
							:اطلاعات تکمیلی رزرو
						</h2>
						<hr className="border-gray-300 mt-3" />
						<div className="mt-2 flex flex-col gap-4">
							<div>
								<label className="block text-xs text-[#1B1D1D] text-right my-3">
									:لطفاً جهت تکمیل رزرو، شماره تماس و نام خود را وارد نمایید
								</label>
								<input
									type="tel"
									value={phone}
									required
									placeholder="۰۹"
									onChange={(e) => {
										setPhone(e.target.value);
										localStorage.setItem("phone", e.target.value);
									}}
									className="w-full h-12 p-2 border border-gray-300 rounded-lg text-left text-xs focus:outline-none focus:ring-1 focus:ring-[#138F96] placeholder:text-[#138F96]"
								/>
							</div>
							<div>
								<label className="block text-xs text-[#1B1D1D] text-right my-3">
									:نام
								</label>
								<input
									type="text"
									value={name}
									required
									placeholder="نام و نام خانوادگی"
									onChange={(e) => setName(e.target.value)}
									className="w-full h-12 p-2 border border-gray-300 rounded-lg text-right text-xs focus:outline-none focus:ring-1 focus:ring-[#138F96] placeholder:text-[#138F96]"
								/>
							</div>
							<div>
								<label className="block text-xs text-[#1B1D1D] text-right mb-3">
									در صورت نیاز، توضیحات یا درخواست‌های خاص خود را در کادر زیر
									وارد کنید (اختیاری)
								</label>
								<textarea
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									className="w-full p-2 border border-gray-300 rounded-lg text-right text-xs focus:outline-none focus:ring-1 focus:ring-[#138F96]"
									rows={4}
								/>
							</div>
						</div>
					</div>

					{/* هزینه رزرو */}
					<div className="px-4 py-4 bg-white mx-4 mt-4 rounded-lg">
						<h2 className="text-sm text-[#BB995B] text-center">:هزینه رزرو</h2>
						<hr className="border-gray-300 mt-3" />
						<div className="mt-2 text-sm text-[#868686] text-right">
							<p className="text-[#138F96] font-bold text-right dir-rtl pb-3">
								۱۰۰,۰۰۰ تومان
							</p>
							<p className="text-[#1B1D1D]">
								برای نهایی شدن رزرو، مبلغ ۱۰۰,۰۰۰ تومان به‌عنوان پیش‌پرداخت
								دریافت می‌شود. پس از پرداخت، میز به نام شما ثبت خواهد شد.
							</p>
						</div>
					</div>

					{/* دکمه‌ها */}
					<div className="px-4 py-4 flex flex-col gap-4">
						<button
							onClick={initiatePayment}
							className="flex-1 bg-[#138F96] text-white font-bold py-2 rounded-4xl"
							disabled={loading}
						>
							{loading ? "در حال پردازش..." : "پرداخت"}
						</button>
						<div
							className="flex-1 text-center text-[#BB995B] rounded-lg"
							onClick={() => navigate("/detail")}
						>
							بازگشت
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ReservationConfirmation;
