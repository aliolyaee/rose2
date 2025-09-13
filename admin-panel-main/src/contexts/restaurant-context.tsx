// src/contexts/restaurant-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Restaurant } from '@/types';
import axiosInstance from '@/lib/axiosInstance';
import { useToast } from '@/hooks/use-toast';

interface RestaurantContextType {
    currentRestaurant: Restaurant | null;
    setCurrentRestaurant: (restaurant: Restaurant | null) => void;
    restaurants: Restaurant[];
    refreshRestaurants: () => Promise<void>;
    isLoading: boolean;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

const CURRENT_RESTAURANT_KEY = 'currentRestaurant';

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const [currentRestaurant, setCurrentRestaurantState] = useState<Restaurant | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const setCurrentRestaurant = (restaurant: Restaurant | null) => {
        setCurrentRestaurantState(restaurant);
        if (typeof window !== 'undefined') {
            if (restaurant) {
                localStorage.setItem(CURRENT_RESTAURANT_KEY, JSON.stringify(restaurant));
            } else {
                localStorage.removeItem(CURRENT_RESTAURANT_KEY);
            }
        }
    };

    const refreshRestaurants = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/resturants');
            const restaurantsData = (response.data || []).map((restaurant: any) => ({
                ...restaurant,
                tableIds: restaurant.tableIds || [], // اطمینان از وجود آرایه
            }));
            setRestaurants(restaurantsData);

            // اگر رستوران فعلی تنظیم نشده، اولین رستوران را انتخاب کن
            if (!currentRestaurant && restaurantsData.length > 0) {
                setCurrentRestaurant(restaurantsData[0]);
            }

            // بررسی کن که آیا رستوران فعلی هنوز در لیست موجود است
            if (currentRestaurant) {
                const exists = restaurantsData.find((r: Restaurant) => r.id === currentRestaurant.id);
                if (!exists) {
                    setCurrentRestaurant(restaurantsData[0] || null);
                }
            }
        } catch (error) {
            console.error('Failed to fetch restaurants:', error);
            toast({
                title: "خطا در بارگیری رستوران‌ها",
                description: "نمی‌توان رستوران‌ها را از سرور دریافت کرد.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // بازیابی رستوران فعلی از localStorage
        if (typeof window !== 'undefined') {
            const savedRestaurant = localStorage.getItem(CURRENT_RESTAURANT_KEY);
            if (savedRestaurant) {
                try {
                    setCurrentRestaurantState(JSON.parse(savedRestaurant));
                } catch (error) {
                    console.error('Failed to parse saved restaurant:', error);
                    localStorage.removeItem(CURRENT_RESTAURANT_KEY);
                }
            }
        }

        refreshRestaurants();
    }, []);

    const value: RestaurantContextType = {
        currentRestaurant,
        setCurrentRestaurant,
        restaurants,
        refreshRestaurants,
        isLoading,
    };

    return (
        <RestaurantContext.Provider value={value}>
            {children}
        </RestaurantContext.Provider>
    );
}

export function useRestaurant() {
    const context = useContext(RestaurantContext);
    if (!context) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
}