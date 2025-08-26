import axios from "axios";
import { useEffect, useState } from "react";
import { FaBars, FaChevronDown } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import icon from "../assets/images/logo.png";
import foodImage from "../assets/images/omlet.jpeg";
import { toFarsiNumber } from "../Utils/setNumbersToPersian";
import { useCart } from "./CartContext";

interface Table {
	id: number;
	name: string;
	capacity: number;
	photo: string;
	description?: string;
}

const getAllTables = async (sessionId: string, restaurantId: string) => {
        try {
                const response = await axios.get(
                        `${import.meta.env.VITE_API_BASE_URL}${
                                import.meta.env.VITE_TABLES_ENDPOINT
                        }`,
                        {
                                params: { restaurantId },
                                headers: {
                                        "x-session-id": sessionId,
                                },
                        }
                );
                console.log("Tables API Response:", response.data);
                return response.data;
        } catch (error: any) {
                console.error(
                        "Error fetching tables:",
                        error.response?.data || error.message
                );
                toast.error("خطا در دریافت لیست میزها");
                throw error;
        }
};

function SelectService() {
        const { cart, setCart, allMenuItems } = useCart();
        const [selectedTable, setSelectedTable] = useState("");
	const [additionalNotes, setAdditionalNotes] = useState("");
	const [tables, setTables] = useState<Table[]>();
	const [customerName, setCustomerName] = useState<string>("");
	const [customerPhone, setCustomerPhone] = useState<string>("");
	const [isMenuOpen, setIsMenuOpen] = useState(false);
        const navigate = useNavigate();
        const restaurantId = parseInt(localStorage.getItem("restaurantId") || "0");

	const [sessionId] = useState<string>(() => {
		const existingId = localStorage.getItem("sessionId");
		if (existingId) return existingId;
		const newId = uuidv4();
		localStorage.setItem("sessionId", newId);
		return newId;
	});

        useEffect(() => {
                console.log("sessionId:", sessionId);
                if (restaurantId) {
                        getAllTables(sessionId, restaurantId.toString()).then((tables) => setTables(tables));
                }
        }, [sessionId, restaurantId]);

	const totalPrice = Object.entries(cart).reduce((sum, [itemId, quantity]) => {
		const item = allMenuItems.find((i) => i.id === parseInt(itemId));
		return sum + (item ? item.fee * quantity : 0);
	}, 0);

	const updateQuantity = (itemId: number, delta: number) => {
		setCart((prev) => {
			const newQuantity = (prev[itemId] || 0) + delta;
			if (newQuantity <= 0) {
				const { [itemId]: _, ...rest } = prev;
				return rest;
			}
			return { ...prev, [itemId]: newQuantity };
		});
	};

	const handlePayment = async () => {
		if (!selectedTable) {
			toast.error("لطفاً یک میز انتخاب کنید");
			return;
		}
		if (!customerName) {
			toast.error("لطفاً نام خود را وارد کنید");
			return;
		}
		if (!customerPhone) {
			toast.error("لطفاً شماره تماس خود را وارد کنید");
			return;
		}
		if (Object.keys(cart).length === 0) {
			toast.error("سبد خرید خالی است");
			return;
		}

		// اعتبارسنجی tableId
		const tableId = parseInt(selectedTable);

		const validCartItems = Object.entries(cart).filter(([itemId]) =>
			allMenuItems.some((item) => item.id === parseInt(itemId))
		);
		if (validCartItems.length === 0) {
			toast.error("هیچ آیتم معتبری در سبد خرید نیست");
			return;
		}

		// آماده‌سازی داده‌های سبد خرید به‌صورت آرایه با menuItemId به‌صورت عدد
		const cartData = {
			items: validCartItems.map(([itemId, quantity]) => ({
				menuItemId: parseInt(itemId),
				quantity,
			})),
		};

		const orderData = {
			customerName,
			phoneNumber: customerPhone,
			description: additionalNotes,
			tableId,
		};

		try {
			const cartResponse = await axios.post(
				`${import.meta.env.VITE_API_BASE_URL}${
					import.meta.env.VITE_CART_ADD_ENDPOINT_MULTIPLE
				}`,
				cartData,
				{
					headers: {
						"Content-Type": "application/json",
						"x-session-id": sessionId,
					},
				}
			);
			console.log("Cart API Response:", cartResponse.data);

			const orderResponse = await axios.post(
				`${import.meta.env.VITE_API_BASE_URL}${
					import.meta.env.VITE_RESERVATIONS_SET_ORDER
				}`,
				orderData,
				{
					headers: {
						"Content-Type": "application/json",
						"x-session-id": sessionId,
					},
				}
			);
			console.log("Order API Response:", orderResponse.data);

			localStorage.removeItem("sessionId");

			navigate("/successOrder");
			toast.success(`سفارش شما با موفقیت برای میز شماره ثبت شد`);
		} catch (error: any) {
			console.error("خطا در ثبت سفارش:", error.response?.data || error.message);
			toast.error(
				"خطا در ثبت سفارش: " +
					(error.response?.data?.message || "لطفاً دوباره امتحان کنید")
			);
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

					<div
						className="flex-1 overflow-y-auto mb-10"
						style={{
							height: "calc(100vh - 60px - 80px)",
						}}
					>
						<div className="p-6 mx-4 bg-white rounded-lg shadow-xs my-4">
							<h2 className="text-sm text-[#BB995B] text-center pb-3">
								:اطلاعات تکمیلی سفارش
							</h2>
							<div>
								<label className="block text-sm text-[#1B1D1D] text-right my-3">
									نام
								</label>
								<input
									type="text"
									placeholder="نام و نام خانوادگی"
									value={customerName}
									required
									onChange={(e) => setCustomerName(e.target.value)}
									className="w-full h-8 p-2 border border-gray-300 rounded-lg text-right text-xs focus:outline-none focus:ring-1 focus:ring-[#138F96] placeholder:text-[#138F96]"
								/>
							</div>
							<div>
								<label className="block text-sm text-[#1B1D1D] text-right my-3">
									شماره تماس
								</label>
								<input
									type="tel"
									placeholder="۰۹..."
									value={customerPhone}
									required
									onChange={(e) => setCustomerPhone(e.target.value)}
									className="w-full h-8 p-2 border border-gray-300 rounded-lg text-left text-xs focus:outline-none focus:ring-1 focus:ring-[#138F96] placeholder:text-[#138F96] mb-3"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm text-[#1B1D1D] text-right mb-2">
									نام میز را انتخاب کنید
								</label>
								<div className="relative w-full">
									<select
										value={selectedTable}
										onChange={(e) => setSelectedTable(e.target.value)}
										className="w-full px-3 pl-10 border border-gray-300 rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#138F96] appearance-none bg-white h-8"
									>
										<option value=""></option>
										{tables?.map((table) => (
											<option key={table.id} value={table.id}>
												{table.name}
											</option>
										))}
									</select>
									<FaChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#868686] text-sm" />
								</div>
							</div>
							<div>
								<label className="block text-sm text-[#1B1D1D] text-right mb-2">
									توضیحات اضافه
								</label>
								<textarea
									value={additionalNotes}
									onChange={(e) => setAdditionalNotes(e.target.value)}
									className="w-full p-3 border border-gray-300 rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#138F96] resize-none"
									rows={4}
								/>
							</div>
						</div>

						<div className="p-6 mx-4 mb-4 rounded-lg bg-white shadow-xs">
							<div className="flex justify-between items-center">
								<Link
									to="/menu"
									className="text-sm text-[#138F96] text-center pb-6"
								>
									بازگشت به منو
								</Link>
								<h2 className="text-sm text-[#BB995B] text-center pb-6">
									سفارش شما
								</h2>
							</div>
							{Object.entries(cart).length === 0 ? (
								<p className="text-sm text-[#868686] text-right">
									هنوز هیچ سفارشی ثبت نکرده اید
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
												className="bg-white rounded-lg shadow-xs overflow-hidden flex transition-transform transform hover:scale-105 border border-[#C9C9C93D]"
											>
												<div className="p-3 flex-1">
													<h3 className="text-sm text-[#1B1D1D] font-bold text-right">
														{item.title}
													</h3>
													<p className="text-xs text-[#868686] text-right mt-1 line-clamp-2">
														{item.description}
													</p>
													<div className="flex justify-between items-center mt-4">
														<div className="flex items-center gap-2">
															<button
																onClick={() => updateQuantity(item.id, 1)}
																className="w-6 h-6 rounded-lg text-[#BB995B] border border-[#C9C9C97D]"
															>
																+
															</button>
															<span className="text-sm">
																{toFarsiNumber(quantity)}
															</span>
															<button
																onClick={() => updateQuantity(item.id, -1)}
																className="w-6 h-6 rounded-lg text-[#BB995B] border border-[#C9C9C97D]"
															>
																-
															</button>
														</div>
														<p
															className="text-xs text-[#138F96] font-bold"
															dir="rtl"
														>
															{toFarsiNumber(
																(item.fee * quantity).toLocaleString()
															)}
														</p>
													</div>
												</div>
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
					</div>

					<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#BB995B] p-2 flex justify-between items-center">
						<button
							onClick={handlePayment}
							className="bg-[#138F96] text-white font-bold py-3 px-4 rounded-4xl hover:bg-[#0F767B] transition-colors"
						>
							تأیید نهایی
						</button>
						<div className="text-right">
							<p className="text-sm text-[#1B1D1D]">مجموع سفارش</p>
							<p className="text-sm font-bold">
								{toFarsiNumber(totalPrice.toLocaleString())} تومان
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SelectService;
