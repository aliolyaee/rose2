import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Reserve from "./Components/tableReserve.tsx";
import AvailableTables from "./Components/AvailableTables.tsx";
import TableDetail from "./Components/tableDetails.tsx";
import ReservationConfirmation from "./Components/confirmReserve.tsx";
import ConfirmationSuccess from "./Components/successReserve.tsx";
import Menu from "./Components/menu.tsx";
import { CartProvider } from "./Components/CartContext.tsx";
import SelectService from "./Components/selectService.tsx";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import SuccessOrder from "./Components/successOrder.tsx";
import OrderDetail from "./Components/viewOrderDetail.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<CartProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<App />} />
					<Route path="/reserve" element={<Reserve />} />
					<Route path="/tables" element={<AvailableTables />} />
					<Route path="/detail" element={<TableDetail />} />
					<Route path="/confirmation" element={<ReservationConfirmation />} />
					<Route path="/success" element={<ConfirmationSuccess />} />
					<Route path="/successOrder" element={<SuccessOrder />} />
					<Route path="/orderDetail" element={<OrderDetail />} />
					<Route path="/menu" element={<Menu />} />
					<Route path="/selectService" element={<SelectService />} />
				</Routes>
			</BrowserRouter>
			<ToastContainer
				position="top-center"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={true}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
			/>
		</CartProvider>
	</StrictMode>
);