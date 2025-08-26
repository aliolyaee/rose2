
import { FaBars, FaCheckCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import icon from "../assets/images/logo.png";
import { useState } from "react";

function SuccessOrder() {
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

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

					<div className="flex flex-col items-center mt-8">
						<FaCheckCircle className="text-[#138F96] text-6xl" />
						<h2 className="text-lg mt-4">!سفارش شما با موفقیت ثبت شد</h2>
						<p className="text-sm text-[#868686] mt-2 text-center px-4">
							سفارش شما تا چند دقیقه دیگر آماده است. از صبوری شما سپاسگزاریم .
						</p>
					</div>

					<div className="px-4 py-4 mt-8 gap-3 flex justify-center">
						<div className="w-1/2">
							<button
								onClick={() => navigate("/menu")}
								className="w-full border border-[#138F96] text-[#138F96] font-bold py-2 rounded-4xl flex justify-center items-center gap-2"
							>
								بازگشت به منو
							</button>
						</div>
						<div className="w-1/2">
							<button
								onClick={() => navigate("/orderDetail")}
								className="w-full border border-[#138F96] text-[#BB995B] font-bold py-2 rounded-4xl flex justify-center items-center gap-2 bg-[#138F96] text-white"
							>
								مشاهده سفارش
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SuccessOrder;

