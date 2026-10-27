"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession, signOut } from "@/lib/auth";
import { initData } from "@/lib/storage";

export function Navbar() {
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    initData();
    setSession(getSession());
  }, []);

  const logout = () => {
    signOut();
    setSession(null);
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SW</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Sheggar Wheels</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Home</Link>
          <Link href="/cars" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Browse Cars</Link>
          {session?.roles?.includes('renter') && <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Dashboard</Link>}
          {session?.roles?.includes('owner') && <Link href="/owner" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Owner Portal</Link>}
          {session?.roles?.includes('admin') && <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Admin</Link>}
        </div>
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {session.firstName[0]}
                </div>
                <span className="text-gray-700 font-medium">Hi, {session.firstName}</span>
              </div>
              <button onClick={logout} className="text-gray-700 hover:text-red-600 transition-colors font-medium">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Sign In</Link>
              <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
