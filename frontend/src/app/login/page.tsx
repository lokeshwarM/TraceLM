'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setToken, isAuthenticated } from '@/lib/auth';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '@/lib/api';
import LogoBadge from '@/components/brand/Logo';

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
        <div className="w-full max-w-md bg-card border border-card-border rounded-2xl shadow-xl p-8 relative z-10">
            <div className="text-center mb-8">
                <div className="inline-flex mb-4">
                    <LogoBadge size="w-11 h-11" iconSize="w-6.5 h-6.5" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-foreground mb-1.5">TraceLM Observatory</h1>
                <p className="text-muted-text text-xs font-semibold">Sign in to access your telemetry workspace</p>
            </div>
            
            {error && (
                <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-semibold rounded-xl p-3.5 mb-6 text-center shadow-inner">
                    {error}
                </div>
            )}

            <button 
                onClick={() => handleGoogleLogin()}
                className="w-full flex items-center justify-center gap-3 bg-card hover:bg-card-hover text-foreground font-bold py-3 rounded-xl border border-card-border transition-colors cursor-pointer shadow-sm text-sm"
            >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Sign in with Google</span>
            </button>

            <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-card-border flex-1"></div>
                <span className="text-muted-text text-[10px] uppercase font-bold tracking-wider">Or secure email</span>
                <div className="h-px bg-card-border flex-1"></div>
            </div>

            {step === 'EMAIL' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-foreground/90 mb-2">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-input-bg border border-input-border text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary text-sm shadow-inner transition-all placeholder:text-muted-text"
                          placeholder="you@company.com"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || !email}
                        className="w-full bg-primary hover:bg-primary-hover text-background font-bold py-3 rounded-xl transition-all shadow-[0_2px_8px_var(--primary-glow)] hover:shadow-[0_4px_16px_var(--primary-glow)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                    >
                        {loading ? 'Sending OTP code...' : 'Send OTP Code'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-foreground/90 mb-2">Enter 6-digit code sent to {email}</label>
                        <input 
                            type="text" 
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full bg-input-bg border border-input-border text-foreground text-center tracking-widest text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary shadow-inner transition-all placeholder:text-muted-text/30"
                            placeholder="------"
                            maxLength={6}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || otp.length < 6}
                        className="w-full bg-primary hover:bg-primary-hover text-background font-bold py-3 rounded-xl transition-all shadow-[0_2px_8px_var(--primary-glow)] hover:shadow-[0_4px_16px_var(--primary-glow)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                    >
                        {loading ? 'Verifying OTP...' : 'Verify & Sign In'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
            {/* Background illustrations */}
            <div className="mesh-gradient-bg opacity-30"></div>
            <div className="mesh-grid absolute inset-0 opacity-40 pointer-events-none"></div>

            <GoogleOAuthProvider clientId={CLIENT_ID}>
                <LoginContent />
            </GoogleOAuthProvider>
        </div>
    );
}
