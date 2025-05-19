// screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { z } from 'zod';
import { loginSchema, LoginFormData } from '../schemas/auth';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message'; // Import Toast
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const { login } = useAuth();
    const navigation = useNavigation();

    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState<Partial<LoginFormData>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Handle form field changes
    const handleChange = (field: keyof LoginFormData, value: string) => {
        setFormData({ ...formData, [field]: value });
        setErrors({ ...errors, [field]: undefined });
    };

    // Validate using Zod
    const validate = (): boolean => {
        try {
            loginSchema.parse(formData);
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const fieldErrors: Partial<LoginFormData> = {};
                err.errors.forEach(e => {
                    const key = e.path[0] as keyof LoginFormData;
                    fieldErrors[key] = e.message;
                });
                setErrors(fieldErrors);
            }
            return false;
        }
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Toast.show({  // Show error with Toast
                type: 'error',
                text1: 'Error',
                text2: 'Please correct the errors in the form.',
            });
            return;
        }

        setLoading(true);
        try {
            await login(formData.username, formData.password);
            Toast.show({  // Show success message with Toast
                type: 'success',
                text1: 'Login successful',
            });
            setTimeout(() => (navigation as any).navigate('Dashboard'), 2000);
        } catch (e: any) {
            Toast.show({  // Show error with Toast
                type: 'error',
                text1: 'Login Failed',
                text2: e?.response?.data?.message || 'Something went wrong.',
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-white p-5 justify-center"
        >
            {/* Added section with welcome message */}
            <View className="max-w-md mx-auto mb-8 text-center">
                <Text className="text-4xl font-bold text-gray-800 mb-4">
                    Welcome Back to E-Bank
                </Text>
                <Text className="text-gray-600">
                    Securely access your digital banking services
                </Text>
            </View>

            <Text className="text-3xl font-bold text-blue-600 mb-6 text-center">
                Login
            </Text>

            {/* Username Input */}
            <View className="flex-row items-center border border-gray-300 rounded-lg mb-2 px-3">
                <Icon name="user" className="text-gray-500 mr-2 text-lg" />
                <TextInput
                    className="flex-1 h-12"
                    placeholder="Username"
                    value={formData.username}
                    onChangeText={value => handleChange('username', value)}
                    autoCapitalize="none"
                />
            </View>
            {errors.username && (
                <Text className="text-red-500 mb-2 ml-1">{errors.username}</Text>
            )}

            {/* Password Input */}
            <View className="flex-row items-center border border-gray-300 rounded-lg mb-2 px-3">
                <Icon name="lock" className="text-gray-500 mr-2 text-lg" />
                <TextInput
                    className="flex-1 h-12"
                    placeholder="Password"
                    value={formData.password}
                    onChangeText={value => handleChange('password', value)}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                    onPress={() => setShowPassword(s => !s)}
                    className="p-2"
                >
                    <Icon name={showPassword ? "eye-slash" : "eye"} />
                </TouchableOpacity>
            </View>
            {errors.password && (
                <Text className="text-red-500 mb-2 ml-1">{errors.password}</Text>
            )}

            {/* Login Button */}
            <TouchableOpacity
                className={`bg-blue-600 h-12 rounded-lg justify-center items-center mt-4 ${loading ? 'opacity-60' : ''
                    }`}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text className="text-white text-lg font-semibold">Login</Text>
                )}
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

