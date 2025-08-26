
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface CartContextType {
  cart: { [key: string]: number };
  setCart: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  allMenuItems: MenuItem[];
}

interface MenuItem {
  id: number;
  title: string;
  description: string;
  fee: number;
  image: string;
  categoryId: number;
  available: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const updateRestaurant = () => {
      setRestaurantId(localStorage.getItem("restaurantId"));
    };
    updateRestaurant();
    window.addEventListener("storage", updateRestaurant);
    return () => window.removeEventListener("storage", updateRestaurant);
  }, []);

  useEffect(() => {
    if (!restaurantId) {
      setAllMenuItems([]);
      return;
    }
    const fetchAllMenuItems = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}${
            import.meta.env.VITE_MENU_ITEMS_ENDPOINT
          }`,
          { params: { restaurantId } }
        );
        console.log("All Menu Items API Response:", response.data);
        let items = [] as any[];
        if (Array.isArray(response.data)) {
          items = response.data;
        } else if (response.data && typeof response.data === "object") {
          items = response.data.items || response.data.data || [];
        }
        console.log("Extracted All Menu Items:", items, "Length:", items.length);
        setAllMenuItems(items);
      } catch (error) {
        console.error("Error fetching all menu items:", error);
        setAllMenuItems([]);
      }
    };
    fetchAllMenuItems();
  }, [restaurantId]);

  return (
    <CartContext.Provider value={{ cart, setCart, allMenuItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}