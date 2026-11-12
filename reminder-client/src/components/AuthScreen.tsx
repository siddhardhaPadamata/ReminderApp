import React, { useState } from 'react';
import { authApi } from '../services/auth';

interface AuthScreenProps {
    onAuthSuccess: (token: string) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
    const [isRegister, setIsRegister] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isRegister) {
                const response = await authApi.register({ email, phoneNumber, password });
                localStorage.setItem('token', response.accessToken);
                onAuthSuccess(response.accessToken);
            } else {
                const response = await authApi.login({ identifier, password });
                localStorage.setItem('token', response.accessToken);
                onAuthSuccess(response.accessToken);
            }
        } catch (err: any) {
            const serverMessage =
                err.response?.data?.message ||
                err.response?.data?.title ||
                'Authentication failed. Please verify your details.';
            setError(serverMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className= "min-h-screen flex items-center justify-center bg-gray-100 p-4" >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8" >
            <div className="text-center mb-8" >
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight" > ReminderApp </h1>
                    < p className = "text-sm text-gray-500 mt-1" >
                    { isRegister? 'Set up an account to manage your bills and warranties': 'Sign in to access your dashboard' }
                        </p>
                        </div>

    {/* Tab Switcher */ }
    <div className="flex bg-gray-100 p-1 rounded-xl mb-6" >
        <button
            type="button"
    onClick = {() => { setIsRegister(false); setError(null); }
}
className = {`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isRegister ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
    }`}
          >
    Sign In
        </button>
        < button
type = "button"
onClick = {() => { setIsRegister(true); setError(null); }}
className = {`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isRegister ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
    }`}
          >
    Register
    </button>
    </div>

{
    error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start space-x-2" >
            <span className="font-semibold text-base leading-none" > !</span>
                < span > { error } </span>
                </div>
        )
}

<form onSubmit={ handleSubmit } className = "space-y-4" >
    {!isRegister ? (
        <div>
        <label className= "block text-xs font-semibold uppercase text-gray-600 mb-1" >
        Email or Phone Number
            </label>
            < input
type = "text"
required
value = { identifier }
onChange = {(e) => setIdentifier(e.target.value)}
placeholder = "test@example.com or 7095834571"
className = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
    />
    </div>
          ) : (
    <>
    <div>
    <label className= "block text-xs font-semibold uppercase text-gray-600 mb-1" >
    Email Address
        </label>
        < input
type = "email"
required
value = { email }
onChange = {(e) => setEmail(e.target.value)}
placeholder = "name@example.com"
className = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
    />
    </div>

    < div >
    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1" >
        Mobile Number
            </label>
            < input
type = "tel"
required
value = { phoneNumber }
onChange = {(e) => setPhoneNumber(e.target.value)}
placeholder = "9876543210"
className = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
    />
    </div>
    </>
          )}

<div>
    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1" >
        Password
        </label>
        < input
type = "password"
required
value = { password }
onChange = {(e) => setPassword(e.target.value)}
placeholder = "••••••••"
className = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
    />
    </div>

    < button
type = "submit"
disabled = { loading }
className = "w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
{ loading? 'Authenticating...': isRegister ? 'Create Account' : 'Sign In' }
    </button>
    </form>
    </div>
    </div>
  );
}