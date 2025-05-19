// app/screens/RegisterScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';

// Define form data type
type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    username: string;
    password: string;
};

// FIELD_DEFS uses keyof FormData for type safety
const FIELD_DEFS: { key: keyof FormData; placeholder: string; icon: string; required: boolean }[] = [
    { key: 'firstName', placeholder: 'First Name', icon: 'user-tie', required: true },
    { key: 'lastName', placeholder: 'Last Name', icon: 'user-tie', required: true },
    { key: 'email', placeholder: 'Email Address', icon: 'envelope', required: true },
    { key: 'phoneNumber', placeholder: 'Phone Number', icon: 'phone', required: true },
    { key: 'username', placeholder: 'Username', icon: 'user', required: true },
];

const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const { register } = useAuth();

    const [form, setForm] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(0);

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (pwd: string) => /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/.test(pwd);
    const calcStrength = (pwd: string) => {
        let s = 0;
        if (pwd.length >= 8) s++;
        if (pwd.length >= 12) s++;
        if (/[A-Z]/.test(pwd)) s++;
        if (/[0-9]/.test(pwd)) s++;
        if (/[!@#$%^&*]/.test(pwd)) s++;
        return Math.min(s, 5);
    };

    useEffect(() => {
        setStrength(calcStrength(form.password));
    }, [form.password]);

    const handleChange = (key: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    const handleSubmit = async () => {
        const errs: Partial<Record<keyof FormData, string>> = {};
        FIELD_DEFS.forEach(({ key, required }) => {
            if (required && !form[key].trim()) errs[key] = 'Required';
        });
        if (form.email && !validateEmail(form.email)) errs.email = 'Invalid email';
        if (!validatePassword(form.password)) errs.password = '8+ chars, uppercase & symbol';

        if (Object.keys(errs).length) {
            setErrors(errs);
            Toast.show({ type: 'error', text1: 'Fix form errors.' });
            return;
        }

        try {
            await register(
                form.username,
                form.password,
                form.email,
                form.firstName,
                form.lastName,
                form.phoneNumber
            );
            Toast.show({ type: 'success', text1: 'Registration successful!' });
            setTimeout(() => navigation.navigate('Login'), 2000);
        } catch (e: any) {
            Toast.show({ type: 'error', text1: e.message || 'Registration failed' });
        }
    };

    const strengthColors = ['#eee', '#ff4d4f', '#ff7a45', '#ffa940', '#bae637', '#73d13d'];

    return (
        <View className="flex-1 justify-center p-5 bg-white">
            <Text className="text-2xl font-bold mb-5 text-center">Create New Account</Text>

            {FIELD_DEFS.map(({ key, placeholder, icon }) => (
                <View key={key} className="flex-row items-center mb-3 border border-gray-300 rounded-lg px-3">
                    <Icon name={icon} size={20} className="text-gray-600 mr-2" />
                    <TextInput
                        className="flex-1 h-12 text-base"
                        placeholder={placeholder}
                        value={form[key]}
                        onChangeText={text => handleChange(key, text)}
                        keyboardType={
                            icon === 'envelope'
                                ? 'email-address'
                                : icon === 'phone'
                                ? 'phone-pad'
                                : 'default'
                        }
                        autoCapitalize="none"
                    />
                    {errors[key] && <Text className="text-red-500 text-xs mt-1 ml-8">{errors[key]}</Text>}
                </View>
            ))}

            <View className="flex-row items-center mb-3 border border-gray-300 rounded-lg px-3">
                <Icon name="lock" size={20} className="text-gray-600 mr-2" />
                <TextInput
                    className="flex-1 h-12 text-base"
                    placeholder="Password"
                    value={form.password}
                    onChangeText={text => handleChange('password', text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                    <Icon name={showPassword ? 'eye-slash' : 'eye'} size={18} className="text-gray-600" />
                </TouchableOpacity>
            </View>
            {errors.password && <Text className="text-red-500 text-xs mt-1 ml-8">{errors.password}</Text>}

            <View className="flex-row h-1.5 mt-2 mb-1">
                {[...Array(5)].map((_, i) => (
                    <Animated.View
                        key={i}
                        className="flex-1 mx-0.5 rounded-full bg-gray-200"
                        style={{ backgroundColor: i < strength ? strengthColors[strength] : undefined }}
                    />
                ))}
            </View>
            <Text className="text-xs text-gray-600 mb-3 text-center">
                {['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][Math.min(strength, 4)]}
            </Text>

            <TouchableOpacity className="bg-blue-600 py-3 rounded-lg" onPress={handleSubmit}>
                <Text className="text-white text-center font-bold">Register</Text>
            </TouchableOpacity>
        </View>
    );
};

export default RegisterScreen;
