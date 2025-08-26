import { useEffect, useState } from "react";
import {
	FaBars,
	FaCalendarAlt,
	FaClock,
	FaExclamationCircle,
	FaUser,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import table1 from "../assets/images/home.png";
import icon from "../assets/images/logo.png";
import { toFarsiNumber } from "../Utils/setNumbersToPersian";

interface ITable {
	name: string;
	photo: string;
	id: number;
	capacity: number;
}

function AvailableTables() {
	const { state } = useLocation();
	const { reservationData, tables, persianDate } = state || {};
	const [noTable, setNoTable] = useState(false);
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		console.log("reserv:::", reservationData);
		if (!tables || tables.length === 0) {
			setNoTable(true);
		} else {
			setNoTable(false);
		}
	}, [tables]);

	
	const persianUpDate = persianDate
		? persianDate.replace(/\d/g, (d:string) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
		: "";

	const selectTable = (table: ITable) => {
		navigate("/detail", {
			state: { reservationData, selectedTable: table, persianDate },
		});
	};

	const notableFound = () => {
		return (
			<div className="flex flex-col items-center justify-center mt-10 gap-2 text-[#868686] text-sm">
				<div>
					<FaExclamationCircle className="text-[#E80000] text-4xl" />
				</div>
				<div className="flex flex-col items-center justify-center gap-2 text-[#E80000] text-sm">
					در حال حاضر میزی با مشخصات انتخابی شما موجود نیست. لطفاً زمان یا تعداد
					نفرات را تغییر دهید و دوباره جستجو کنید
				</div>
				<button
					onClick={() => navigate("/reserve")}
					className="mt-2 border border-[#138F96] text-[#138F96] py-1 px-4 rounded-lg"
				>
					ویرایش فیلترها
				</button>
			</div>
		);
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

					<p className="text-xs text-right text-[#868686] p-2">
						رزرو میز / جستجو
					</p>

					<div className="px-4 py-4 bg-white mx-4 rounded-lg">
						<h2 className="text-md text-[#BB995B] text-center">
							:فیلترهای انتخابی
						</h2>
						<hr className="border-gray-300 mt-3" />
						<div className="mt-2 text-xs text-[#868686] flex justify-between p-2">
							<div
								className="text-[#138F96] font-bold"
								onClick={() => navigate("/reserve")}
							>
								ویرایش فیلترها
							</div>
							<div className="flex items-center gap-1">
								<span>نفر</span>
								<span>{toFarsiNumber(reservationData?.people)}</span>
								<FaUser />
							</div>
							<div className="flex items-center gap-1">
								<span>{toFarsiNumber(reservationData?.hour)} ساعت</span>
								<FaClock />
							</div>
							<div className="flex items-center gap-1">
								<span>{persianUpDate}</span>
								<FaCalendarAlt />
							</div>
						</div>
					</div>

					<div className="px-4 mt-10 bg-white mx-4 rounded-lg">
						<h2 className="text-md text-[#BB995B] text-center mb-2 mt-2 ">
							:میزهای موجود
						</h2>
						<hr className="border-gray-300 my-3" />
						{noTable ? (
							notableFound()
						) : (
							<div className="grid grid-cols-2 gap-4">
								{tables?.map((table: ITable) => (
									<div
										key={table.id}
										className="bg-white rounded-[16px] shadow-lg p-2 gap-3 flex flex-col items-center border border-[#C9C9C93D]"
									>
										<img
											src={table.photo || table1}
											alt={table.name}
											className="h-32 w-full object-cover rounded-lg mb-2"
										/>
										<span className="text-sm font-bold text-[#138F96]">
											{table.name}
											<div className="flex items-center justify-center mt-1 text-xs text-[#868686] gap-1">
												<span>نفره</span>
												<span>
													{table.capacity
														.toString()
														.replace(
															/\d/g,
															(d: string) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]
														)}
												</span>

												<FaUser />
											</div>
										</span>
										<button
											onClick={() => selectTable(table)}
											className="mt-2 border border-[#BB995B] text-[#BB995B] py-1 px-4 rounded-lg w-full"
										>
											انتخاب
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default AvailableTables;
