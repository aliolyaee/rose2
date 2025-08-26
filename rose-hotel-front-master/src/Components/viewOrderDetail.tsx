import { FaBars } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import icon from "../assets/images/logo.png";
import foodImage from "../assets/images/omlet.jpeg";
import { useCart } from "./CartContext";
import { toFarsiNumber } from "../Utils/setNumbersToPersian";
import { useState } from "react";

function OrderDetails() {
	const { cart, allMenuItems } = useCart();
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const orderTotal = Object.entries(cart).reduce((sum, [itemId, quantity]) => {
		const item = allMenuItems.find((i) => i.id === parseInt(itemId));
		return sum + (item ? item.fee * quantity : 0);
	}, 0);

	const tax = orderTotal * 0.09;

	const grandTotal = orderTotal + tax;

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

					{/* تیتر */}
					<div className="p-6 mx-4">
						<h2 className="text-sm text-[#BB995B] text-center">سفارش شما</h2>
					</div>

					{/* لیست آیتم‌های سفارش */}
					<div className="flex-1 overflow-y-auto p-6 mx-4 mb-4 rounded-lg bg-white shadow-xs">
						{Object.entries(cart).length === 0 ? (
							<p className="text-sm text-[#868686] text-right">
								سفارشی برای نمایش وجود ندارد
							</p>
						) : (
							<div className="grid grid-cols-1 gap-4">
								{Object.entries(cart).map(([itemId, quantity]) => {
									const item = allMenuItems.find(
										(i) => i.id === parseInt(itemId)
									);
									return item ? (
										<div
											key={itemId}
											className="bg-white rounded-lg shadow-xs overflow-hidden flex border border-[#C9C9C93D]"
										>
											{/* اطلاعات آیتم */}
											<div className="p-3 flex-1">
												<h3 className="text-sm text-[#1B1D1D] font-bold text-right">
													{item.title}
												</h3>
												<p className="text-xs text-[#868686] text-right mt-1">
													تعداد: {toFarsiNumber(quantity)}
												</p>
												<p className="text-sm text-[#138F96] font-bold text-right mt-1">
													{toFarsiNumber(
														(item.fee * quantity).toLocaleString()
													)}{" "}
													تومان
												</p>
											</div>
											{/* عکس غذا */}
											<div className="p-4">
												<img
													src={foodImage}
													alt={item.title}
													className="w-24 h-24 object-cover rounded-lg"
												/>
											</div>
										</div>
									) : null;
								})}
							</div>
						)}
					</div>

					{/* اطلاعات پرداخت */}
					<div className="p-6 mx-4 mb-4 bg-white rounded-lg shadow-xs">
						<h3 className="text-sm text-[#BB995B] text-center pb-4">
							اطلاعات پرداخت
						</h3>
						<div className="flex justify-between text-sm text-[#1B1D1D] mb-2">
							<div className="flex items-center gap-1" dir="rtl">
								{toFarsiNumber(orderTotal.toLocaleString())}
								<span>تومان</span>
							</div>
							<span>:هزینه سفارش</span>
						</div>
						<div className="flex justify-between text-sm text-[#1B1D1D] mb-2">
							<span className="flex items-center gap-1" dir="rtl">
								{toFarsiNumber(tax.toLocaleString())}
								<span>تومان</span>
							</span>
							<span>:مالیات (۱۰٪)</span>
						</div>
						<hr className="border-gray-300 my-3" />

						<div className="flex justify-between text-sm">
							<span className="flex items-center gap-1" dir="rtl">
								<span>تومان</span>
								{toFarsiNumber(grandTotal.toLocaleString())}
							</span>
							<span>:مجموع کل</span>
						</div>
					</div>

					{/* دکمه بازگشت به منو */}
					<div className="p-4 mx-4 mb-4">
						<button
							onClick={() => navigate("/menu")}
							className="w-full border border-[#138F96] text-[#138F96] font-bold py-3 rounded-4xl hover:bg-[#0F767B] transition-colors"
						>
							بازگشت به منو
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default OrderDetails;
