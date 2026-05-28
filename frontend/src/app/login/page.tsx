'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setToken, isAuthenticated } from '@/lib/auth';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '@/lib/api';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

function LoginContent() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated()) {
            router.push('/chat');
        }
    }, [router]);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${API_BASE_URL}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: tokenResponse.access_token })
                });
                if (!res.ok) throw new Error('Google authentication failed');
                const data = await res.json();
                setToken(data.token);
                router.push('/chat');
            } catch (err: any) {
                setError(err.message || 'Error with Google login');
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError('Google login failed or was cancelled.');
        }
    });

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/auth/otp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (!res.ok) throw new Error('Failed to send OTP');
            setStep('OTP');
        } catch (err: any) {
            setError(err.message || 'Error sending OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            if (!res.ok) throw new Error('Invalid or expired OTP');
            const data = await res.json();
            setToken(data.token);
            router.push('/chat');
        } catch (err: any) {
            setError(err.message || 'Error verifying OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-[#161921] border border-gray-800/80 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">TraceLM</h1>
                <p className="text-gray-400 text-sm">Sign in to your AI Observability Workspace</p>
            </div>
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-6 text-center">
                    {error}
                </div>
            )}

            <button 
                onClick={() => handleGoogleLogin()}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-2.5 rounded-lg hover:bg-gray-100 transition-colors mb-6"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
            </button>

            <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-gray-800 flex-1"></div>
                <span className="text-gray-500 text-xs uppercase font-medium">Or continue with</span>
                <div className="h-px bg-gray-800 flex-1"></div>
            </div>

            {step === 'EMAIL' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Email address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#0d0f15] border border-gray-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="you@company.com"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || !email}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Enter 6-digit code sent to {email}</label>
                        <input 
                            type="text" 
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full bg-[#0d0f15] border border-gray-800 text-white text-center tracking-widest text-lg rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="------"
                            maxLength={6}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || otp.length < 6}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#0d0f15] text-white flex items-center justify-center p-4">
            <GoogleOAuthProvider clientId={CLIENT_ID}>
                <LoginContent />
            </GoogleOAuthProvider>
        </div>
    );
}
