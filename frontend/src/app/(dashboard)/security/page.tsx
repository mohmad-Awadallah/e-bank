// src/app/(dashboard)/security/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from '@/components/common/LoadingScreen';
import { getUserSecurityLogs, SecurityLog } from "@/services/security";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle, FaShieldAlt, FaClock, FaDesktop, FaNetworkWired } from 'react-icons/fa';


export default function SecurityPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (!user) return;

        getUserSecurityLogs(Number(user.id), currentPage).then((data) => {
            setLogs(data.content || []);
            setTotalPages(data.totalPages);
        });
    }, [user, currentPage]);

    if (!user) return <LoadingScreen />;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-xl text-blue-600" />
                Security Logs
            </h1>

            <section className="mb-6">
                <h2 className="text-xl font-bold mb-2 flex items-center">
                    <FaClock className="mr-2 text-lg text-gray-500" />
                    Your Security Logs
                </h2>
                {logs.length === 0 ? (
                    <p>No logs found.</p>
                ) : (
                    <>
                        <ul className="space-y-2">
                            {logs.map((log) => (
                                <li
                                    key={log.id}
                                    className="border p-4 rounded shadow-sm bg-white"
                                >
                                    <p><strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                                    <p><strong>Action:</strong> {log.action}</p>
                                    <p><strong>IP:</strong> <FaNetworkWired className="inline mr-1 text-gray-600" /> {log.ipAddress}</p>
                                    <p><strong>Device:</strong> <FaDesktop className="inline mr-1 text-gray-600" /> {log.deviceInfo}</p>
                                    <p><strong>Status:</strong> 
                                        <span className={log.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                                            {log.status === 'SUCCESS' ? <FaCheckCircle className="inline mr-1" /> : <FaTimesCircle className="inline mr-1" />}
                                            {log.status}
                                        </span>
                                    </p>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex gap-4 items-center">
                            <button
                                onClick={() => currentPage > 0 && setCurrentPage((prev) => prev - 1)}
                                disabled={currentPage === 0}
                                className="px-4 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                <FaArrowLeft className="inline mr-2" />
                                Previous
                            </button>
                            <span>
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <button
                                onClick={() => currentPage + 1 < totalPages && setCurrentPage((prev) => prev + 1)}
                                disabled={currentPage + 1 >= totalPages}
                                className="px-4 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                <FaArrowRight className="inline mr-2" />
                                Next
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
