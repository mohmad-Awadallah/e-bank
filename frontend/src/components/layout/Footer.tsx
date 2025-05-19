// components/layout/Footer.tsx
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">About Us</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:text-blue-400">Who We Are</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-400">Careers</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-400">Terms & Conditions</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Our Services</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:text-blue-400">Accounts</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-400">Loans</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-400">Cards</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:text-blue-400">FAQ</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-400">Contact Us</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-400">Complaints</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-blue-400">
                                <FaFacebook className="text-2xl" />
                            </a>
                            <a href="#" className="hover:text-blue-400">
                                <FaTwitter className="text-2xl" />
                            </a>
                            <a href="#" className="hover:text-blue-400">
                                <FaLinkedin className="text-2xl" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p>© {new Date().getFullYear()} E-Bank. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
