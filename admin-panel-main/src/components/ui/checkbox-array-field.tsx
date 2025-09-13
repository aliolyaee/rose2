// src/components/ui/checkbox-array-field.tsx
"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";

interface CheckboxArrayFieldProps {
    value: string[];
    onChange: (value: string[]) => void;
    options: Array<{ id: string; name: string; capacity?: number }>;
    disabled?: boolean;
}

export function CheckboxArrayField({ value = [], onChange, options, disabled = false }: CheckboxArrayFieldProps) {
    const currentValue = Array.isArray(value) ? value : [];

    const handleCheckboxChange = (itemId: string, checked: boolean) => {
        if (checked) {
            onChange([...currentValue, itemId]);
        } else {
            onChange(currentValue.filter(id => id !== itemId));
        }
    };

    return (
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {options.map((option) => (
                <FormItem
                    key={option.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                >
                    <FormControl>
                        <Checkbox
                            checked={currentValue.includes(option.id)}
                            onCheckedChange={(checked) =>
                                handleCheckboxChange(option.id, checked === true)
                            }
                            disabled={disabled}
                        />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                        {option.name}
                        {option.capacity && ` (ظرفیت: ${option.capacity})`}
                    </FormLabel>
                </FormItem>
            ))}
        </div>
    );
}