// components/ui/InputWithIcon.tsx
import React from 'react';
import { Input } from './input'; // Assuming this is the path to your Input component

type InputWithIconProps = {
    placeholder: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    icon: React.ReactNode;
};

export const InputWithIcon: React.FC<InputWithIconProps> = ({ placeholder, value, onChange, icon }) => {
    return (
        <div className="relative">
            <Input
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="pl-10" // Add padding on the left to make space for the icon
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {icon}
            </div>
        </div>
    );
};
