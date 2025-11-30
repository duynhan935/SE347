"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to dashboard
		router.push("/admin/dashboard");
	}, [router]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Đang chuyển hướng...</h2>
			</div>
		</div>
	);
}