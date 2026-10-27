"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth";

export default function SignUp() {
  const router = useRouter();
  const [data, setData] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'renter', neighbourhood: '' });
  const [err, setErr] = useState('');

  const submit = (e: any) => {
    e.preventDefault();
    const res = signUp(data);
    if (!res.success) return setErr(res.message || 'Error');
    router.push('/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="bg-white p-8 rounded shadow w-96 space-y-4">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        {err && <p className="text-red-600">{err}</p>}
        <input type="text" placeholder="First Name" required value={data.firstName} onChange={e => setData({...data, firstName: e.target.value})} className="w-full border p-2 rounded" />
        <input type="text" placeholder="Last Name" required value={data.lastName} onChange={e => setData({...data, lastName: e.target.value})} className="w-full border p-2 rounded" />
        <input type="email" placeholder="Email" required value={data.email} onChange={e => setData({...data, email: e.target.value})} className="w-full border p-2 rounded" />
        <input type="password" placeholder="Password" required value={data.password} onChange={e => setData({...data, password: e.target.value})} className="w-full border p-2 rounded" />
        <input type="tel" placeholder="Phone" required value={data.phone} onChange={e => setData({...data, phone: e.target.value})} className="w-full border p-2 rounded" />
        <input type="text" placeholder="Neighbourhood" value={data.neighbourhood} onChange={e => setData({...data, neighbourhood: e.target.value})} className="w-full border p-2 rounded" />
        <select value={data.role} onChange={e => setData({...data, role: e.target.value})} className="w-full border p-2 rounded">
          <option value="renter">Renter</option>
          <option value="owner">Owner</option>
        </select>
        <button className="w-full bg-blue-600 text-white p-2 rounded">Sign Up</button>
        <Link href="/signin" className="text-blue-600">Sign In</Link>
      </form>
    </div>
  );
}
