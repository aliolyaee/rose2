import { FaBars, FaCalendarAlt, FaClock, FaUser } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import table1 from "../assets/images/home.png";
import icon from "../assets/images/logo.png";
import { toFarsiNumber } from "../Utils/setNumbersToPersian";
import { useState } from "react";

function TableDetail() {
	const { state } = useLocation();
	const { reservationData, selectedTable, persianDate } = state || {};
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navigate = useNavigate();

	const completeReservation = () => {
		// هدایت به صفحه تأیید با ارسال اطلاعات
		navigate("/confirmation", { state: { reservationData, selectedTable } });
	};

	console.log("persianDate", persianDate);

	const persianUpDate = persianDate
		? persianDate.replace(/\d/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
		: "";

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

					<p className="text-xs text-right text-[#868686] py-3 px-4">
						{" "}
						رزرو میز / جیستجو / اطلاعات میز
					</p>
					{/* تصویر میز */}
					<div className="h-1/3 w-full p-3">
						<img
							src={selectedTable.photo || table1}
							alt={selectedTable?.number}
							className="h-full w-full object-cover rounded-3xl"
						/>
					</div>

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
								<span>{persianUpDate}</span>
								<FaCalendarAlt />
							</div>
						</div>
					</div>

					{/* توضیحات میز */}
					<div className="px-4 py-4 bg-white mx-4 mt-4 rounded-lg">
						<h2 className="text-sm text-[#BB995B] text-center">:توضیحات میز</h2>
						<hr className="border-gray-300 mt-3" />
						<div className="mt-2 text-xs text-[#1B1D1D] text-right">
							{selectedTable.description}
						</div>
					</div>

					{/* هزینه رزرو */}
					<div className="px-4 py-4 bg-white mx-4 mt-4 rounded-lg">
						<h2 className="text-sm text-[#BB995B] text-center">:هزینه رزرو</h2>
						<hr className="border-gray-300 mt-3" />
						<div className="mt-2 text-sm text-[#868686] text-right">
							<div className="text-[#138F96] font-bold text-right dir-rtl pb-3">
								<div className="flex flex-row-reverse gap-1">
									<span>۱۰۰,۰۰۰</span>
									<span>تومان</span>
								</div>
							</div>

							<p className="text-[#1B1D1D]">
								برای نهایی شدن رزرو، مبلغ ,۱۰۰۰۰۰ تومان به‌عنوان پیش‌پرداخت
								دریافت می‌شود. پس از پرداخت، میز به نام شما ثبت خواهد شد
							</p>
						</div>
					</div>

					{/* دکمه‌ها */}
					<div className="px-4 py-4 flex flex-col gap-4">
						<button
							onClick={completeReservation}
							className="flex-1 bg-[#138F96] text-white font-bold py-2 rounded-4xl"
						>
							تکمیل رزرو
						</button>
						<div
							className="flex-1 text-center text-[#BB995B] rounded-lg"
							onClick={() => navigate("/reserve")}
						>
							بازگشت
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TableDetail;
