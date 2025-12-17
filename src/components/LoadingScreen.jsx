import React, { useEffect, useState } from 'react';

const LoadingScreen = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + Math.random() * 10;
            });
        }, 150);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a14] overflow-hidden">
            {/* Background glowing orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Main Container */}
            <div className="relative flex flex-col items-center">

                {/* Logo Container with rotating rings */}
                <div className="relative mb-10 w-40 h-40">
                    {/* Rotating Outer Ring */}
                    <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-[spin_3s_linear_infinite] shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                        style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} />

                    {/* Rotating Inner Ring (Reverse) */}
                    <div className="absolute inset-[15px] border-2 border-purple-500/30 rounded-full animate-[spin_4s_linear_infinite_reverse] shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        style={{ borderBottomColor: 'transparent', borderLeftColor: 'transparent' }} />

                    {/* Logo */}
                    <div className="absolute inset-[25px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/5 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]">
                        <img src="/logo.png" alt="Scholar Archive" className="w-[85%] h-[85%] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                    </div>
                </div>

                {/* Text and Progress */}
                <div className="flex flex-col items-center space-y-6">
                    <h1 className="text-xl font-semibold tracking-[0.3em] text-white/90 uppercase animate-pulse drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] font-['Inter']">
                        Scholar Archive
                    </h1>

                    {/* Progress Bar */}
                    <div className="w-[180px] h-[3px] bg-white/5 rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent absolute w-1/2"
                            style={{ left: `${progress - 50}%`, transition: 'left 0.1s linear' }}
                        >
                        </div>
                        {/* Shimmer effect for progress */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-[shimmer_2s_infinite]" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoadingScreen;
