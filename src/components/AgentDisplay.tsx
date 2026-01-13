import React from "react";
import { AgentConfig } from "../types";
import { Brain, Briefcase, Calculator, Calendar, User } from "lucide-react";

interface AgentDisplayProps {
    agent: AgentConfig;
    isActive: boolean;
}

export const AgentDisplay: React.FC<AgentDisplayProps> = ({ agent, isActive }) => {
    // Determine icon based on agent name (simple heuristic)
    const getIcon = () => {
        const name = agent.name.toLowerCase();
        if (name.includes("bhaiya")) return <Brain size={64} className="text-purple-900" />;
        if (name.includes("resume")) return <Briefcase size={64} className="text-indigo-900" />;
        if (name.includes("income")) return <Calculator size={64} className="text-emerald-900" />;
        if (name.includes("planner")) return <Calendar size={64} className="text-orange-900" />;
        return <User size={64} className="text-gray-400" />;
    };

    return (
        <div className={`flex flex-col items-center justify-center transition-all duration-700 ${isActive ? "opacity-100 scale-100" : "opacity-40 scale-90"}`}>
            <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-8 bg-white relative
                ${isActive ? "shadow-[0_4px_30px_rgba(0,0,0,0.08)]" : "border border-gray-100"}`}
            >
                {/* Inner Ring */}
                {isActive && (
                    <div className="absolute inset-1 rounded-full border border-emerald-900/10 animate-spin-slow" />
                )}

                <div className={`transition-transform duration-500 ${isActive ? "scale-110" : ""}`}>
                    {getIcon()}
                </div>

                {isActive && (
                    <div className="absolute -bottom-3 px-4 py-1 bg-emerald-900 text-white text-[10px] tracking-widest font-bold rounded-full shadow-lg">
                        LIVE
                    </div>
                )}
            </div>

            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2 tracking-tight">
                {agent.name}
            </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
                <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                    {agent.voiceName || "Standard"} Voice
                </span>
            </div>
        </div>
    );
};
