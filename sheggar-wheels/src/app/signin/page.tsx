"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, safeReturn } from "@/lib/auth";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const [data, setData] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = (e: any) => {
    e.preventDefault();
    const res = signIn(data.email, data.password);
    if (!res.success) return setErr(res.message || 'Error');
    const next = safeReturn(params.get('next'));
    if (res.session?.roles?.includes('admin')) router.push('/admin');
    else if (res.session?.roles?.includes('owner')) router.push('/owner');
    else router.push(next === '/' ? '/dashboard' : next);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="bg-white p-8 rounded shadow w-96 space-y-4">
        <h1 className="text-2xl font-bold">Sign In</h1>
        {err && <p className="text-red-600">{err}</p>}
        <input type="email" placeholder="Email" required value={data.email} onChange={e => setData({...data, email: e.target.value})} className="w-full border p-2 rounded" />
        <input type="password" placeholder="Password" required value={data.password} onChange={e => setData({...data, password: e.target.value})} className="w-full border p-2 rounded" />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Sign In</button>
        <p>Demo: admin@sheggar.com/admin123, owner1@sheggar.com/owner123, renter1@sheggar.com/renter123</p>
        <Link href="/signup" className="text-blue-600">Sign Up</Link>
      </form>
    </div>
  );
}

export default function SignIn() {
  return <Suspense><Form /></Suspense>;
}
