import React from "react";
import { AGENTS } from "../constants";
import { Brain, Briefcase, Calculator, Calendar } from "lucide-react";

interface SidebarProps {
    currentAgentKey: string;
    onAgentSelect: (key: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentAgentKey, onAgentSelect }) => {
    const agents = Object.entries(AGENTS);

    const getIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes("bhaiya")) return <Brain size={20} />;
        if (lower.includes("resume")) return <Briefcase size={20} />;
        if (lower.includes("income")) return <Calculator size={20} />;
        if (lower.includes("planner")) return <Calendar size={20} />;
        return <Brain size={20} />;
    };

    return (
        <div className="w-72 h-full bg-[#fcfbf9] border-r border-[#e5e5e5] flex flex-col p-6 relative z-50">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 px-2">Your Experts</h2>

            <div className="space-y-4">
                {agents.map(([key, config]) => {
                    const isActive = key === currentAgentKey;
                    return (
                        <div
                            key={key}
                            onClick={() => onAgentSelect(key)}
                            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${isActive
                                ? "agent-card-active"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                        >
                            <div className={`${isActive ? "text-white" : ""}`}>
                                {getIcon(config.name)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold tracking-wide">
                                    {config.name}
                                </span>
                                <span className={`text-[10px] uppercase tracking-wider ${isActive ? "text-emerald-200" : "text-gray-400"}`}>
                                    {isActive ? "Active" : "Standard"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto">
                <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">System Status</p>
                    </div>
                    <p className="text-xs text-gray-800 font-medium">ONLINE // V 1.0.5</p>
                </div>
            </div>
        </div>
    );
};
