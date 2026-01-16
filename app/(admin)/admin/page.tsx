"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to dashboard
		router.push("/admin/dashboard");
	}, [router]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Redirecting...</h2>
			</div>
		</div>
	);
}