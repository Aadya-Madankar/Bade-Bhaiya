import React, { useState } from "react";

interface OnboardingProps {
    onComplete: (data: { name: string; age: string; gender: string }) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [formData, setFormData] = useState({ name: "", age: "", gender: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(formData);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/5 rounded-full blur-[120px] pointer-events-none" />

            <form onSubmit={handleSubmit} className="relative z-10 bg-white p-10 rounded-2xl w-full max-w-md space-y-8 border border-gray-100 shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3 tracking-tight">Welcome</h1>
                    <p className="text-gray-500 text-sm tracking-wide font-medium uppercase">Let us know who you are to get started</p>
                </div>

                <div className="space-y-5">
                    <input
                        required autoComplete="off"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Your Name"
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                        required autoComplete="off" type="number"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Age"
                        value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })}
                    />
                    <select
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-gray-900 font-medium appearance-none"
                        value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    >
                        <option value="" className="text-gray-400">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <button type="submit" className="w-full bg-emerald-900 hover:bg-emerald-800 text-white py-4 rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-2">
                    Begin Journey
                </button>
            </form>
        </div>
    );
};
