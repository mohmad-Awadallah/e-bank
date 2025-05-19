import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const sections = [
    {
        title: 'About Us',
        links: ['Who We Are', 'Careers', 'Terms & Conditions'],
    },
    {
        title: 'Our Services',
        links: ['Accounts', 'Loans', 'Cards'],
    },
    {
        title: 'Support',
        links: ['FAQ', 'Contact Us', 'Complaints'],
    },
];

type SocialPlatform = 'facebook' | 'twitter' | 'linkedin' | 'instagram';

export default function MobileFooter() {
    const currentYear = new Date().getFullYear();
    const socialLinks: SocialPlatform[] = ['facebook', 'twitter', 'linkedin'];

    return (
        <View className="bg-gray-800 py-10 px-4">
            {/* Sections */}
            <View className="flex-row flex-wrap justify-between">
                {sections.map((section, idx) => (
                    <View key={idx} className="w-1/2 mb-8">
                        <Text className="text-white text-lg font-semibold mb-4">
                            {section.title}
                        </Text>
                        <View className="space-y-2">
                            {section.links.map((link, lidx) => (
                                <FooterLink key={lidx} label={link} />
                            ))}
                        </View>
                    </View>
                ))}

                {/* Social Icons */}
                <View className="w-1/2 mb-8">
                    <Text className="text-white text-lg font-semibold mb-4">
                        Follow Us
                    </Text>
                    <View className="flex-row space-x-4">
                        {socialLinks.map((platform) => (
                            <SocialIcon key={platform} name={platform} />
                        ))}
                    </View>
                </View>
            </View>

            {/* Copyright */}
            <View className="border-t border-gray-700 pt-6 mt-4">
                <Text className="text-gray-400 text-center text-sm">
                    © {currentYear} E-Bank. All rights reserved.
                </Text>
            </View>
        </View>
    );
}

type FooterLinkProps = {
    label: string;
    onPress?: () => void;
};

function FooterLink({ label, onPress }: FooterLinkProps) {
    return (
        <TouchableOpacity
            onPress={onPress ?? (() => console.log(label))}
            accessibilityRole="button"
            accessibilityLabel={label}
            className="py-1"
        >
            <Text className="text-gray-300 text-base">{label}</Text>
        </TouchableOpacity>
    );
}

type SocialIconProps = {
    name: SocialPlatform;
};

function SocialIcon({ name }: SocialIconProps) {
    const socialUrls: Record<SocialPlatform, string> = {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        instagram: 'https://instagram.com',
    };

    return (
        <TouchableOpacity
            onPress={() => Linking.openURL(socialUrls[name])}
            accessibilityRole="button"
            accessibilityLabel={`Follow us on ${name}`}
            className="p-1"
        >
            <FontAwesome name={name} size={24} color="#60A5FA" />
        </TouchableOpacity>
    );
}
