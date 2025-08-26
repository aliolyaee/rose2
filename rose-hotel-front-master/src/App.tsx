import { useState, useEffect } from "react";
import { FaChair, FaArrowRight } from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import { IoRestaurant } from "react-icons/io5";
import { Link } from "react-router-dom";
import "./App.css";
import log0 from "./assets/images/rose-hotel-logo.png";
import "./index.css";
import homeImage from "./assets/images/rose-hotel-pic.jpg";

// نوع داده رستوران
interface Restaurant {
	id: number;
	name: string;
	description: string;
	image?: string;
}

function App() {
	const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [loading, setLoading] = useState(true);

	// دریافت لیست رستوران‌ها از بک‌اند
	useEffect(() => {
		const fetchRestaurants = async () => {
			try {
				// اینجا API call واقعی خود را جایگزین کنید
				// const response = await fetch('/api/restaurants');
				// const data = await response.json();

				// فعلاً داده‌های نمونه
				const mockData: Restaurant[] = [
					{
						id: 1,
						name: "رستوران اصلی",
						description: "رستوران اصلی هتل با منوی متنوع"
					},
					{
						id: 2,
						name: "کافی شاپ",
						description: "کافی شاپ هتل رز"
					}
				];

				setRestaurants(mockData);
			} catch (error) {
				console.error('Error fetching restaurants:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchRestaurants();
	}, []);

	const handleRestaurantSelect = (restaurant: Restaurant) => {
		setSelectedRestaurant(restaurant);
	};

	const handleBackToRestaurants = () => {
		setSelectedRestaurant(null);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#FBFBFB] sm:bg-white flex justify-center items-center">
				<div className="text-[#BB995B] text-lg">در حال بارگذاری...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#FBFBFB] sm:bg-white flex justify-center">
			<div className="w-full sm:max-w-[600px] flex flex-col h-screen sm:h-auto sm:my-8">
				<div className="relative w-full h-[50vh] min-h-[200px]">
					<img
						src={homeImage}
						alt="Hotel"
						className="h-full w-full object-cover"
					/>
					<img
						src={log0}
						alt="Rose Hotel Logo"
						className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-[50%] w-[150px] sm:w-[150px] h-auto z-10"
					/>
				</div>

				<div className="h-[50vh] flex flex-col gap-6 px-10 mt-6">
					<div className="text-lg text-center" style={{ marginTop: "7rem" }}>
						.به هتل رز خوش آمدید
					</div>

					{!selectedRestaurant ? (
						// مرحله اول: انتخاب رستوران
						<div>
							<div className="text-center mb-4 text-[#BB995B] font-semibold">
								لطفاً رستوران مورد نظر خود را انتخاب کنید
							</div>
							<div className="flex flex-col gap-4">
								{restaurants.map((restaurant) => (
									<button
										key={restaurant.id}
										onClick={() => handleRestaurantSelect(restaurant)}
										className="w-full flex flex-row items-center justify-between p-4"
										style={{
											border: "1px solid #BB995B",
											borderRadius: "16px",
											minHeight: "80px",
										}}
									>
										<div className="flex flex-row items-center gap-4">
											<IoRestaurant className="text-[#BB995B] text-3xl" />
											<div className="flex flex-col items-start">
												<span className="font-bold text-[#BB995B]">
													{restaurant.name}
												</span>
												<span className="text-sm text-gray-600">
													{restaurant.description}
												</span>
											</div>
										</div>
										<FaArrowRight className="text-[#BB995B] text-xl" />
									</button>
								))}
							</div>
						</div>
					) : (
						// مرحله دوم: انتخاب بین رزرو میز و مشاهده منو
						<div>
							<div className="flex items-center justify-between mb-4">
								<button
									onClick={handleBackToRestaurants}
									className="text-[#BB995B] text-sm flex items-center gap-2"
								>
									← بازگشت به انتخاب رستوران
								</button>
								<div className="text-[#BB995B] font-semibold">
									{selectedRestaurant.name}
								</div>
							</div>

							<div className="flex flex-row sm:flex-row gap-6">
								<Link
									to={`/reserve?restaurant=${selectedRestaurant.id}`}
									className="w-1/2 flex flex-row items-center justify-center"
									style={{
										border: "1px solid #BB995B",
										borderRadius: "16px",
										height: "120px",
									}}
								>
									<div className="flex flex-col items-center justify-center gap-3">
										<FaChair className="text-[#BB995B] text-4xl" />
										<span className="font-bold" style={{ color: "#BB995B" }}>
											رزرو میز
										</span>
									</div>
								</Link>

								<Link
									to={`/menu?restaurant=${selectedRestaurant.id}`}
									className="w-1/2 flex items-center justify-center"
									style={{
										border: "1px solid #BB995B",
										borderRadius: "16px",
										height: "120px",
									}}
								>
									<div className="flex flex-col items-center justify-center gap-3">
										<MdMenuBook className="text-[#BB995B] text-4xl" />
										<span className="font-bold" style={{ color: "#BB995B" }}>
											مشاهده منو
										</span>
									</div>
								</Link>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default App;