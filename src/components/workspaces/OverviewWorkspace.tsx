import React from "react";
import { Activity, Battery, Server, Wifi } from "lucide-react";
import { UserContext } from "../../types";

interface OverviewWorkspaceProps {
    userContext: UserContext;
}

export const OverviewWorkspace: React.FC<OverviewWorkspaceProps> = ({ userContext }) => {
    return (
        <div className="h-full w-full p-8 flex flex-col gap-8 animate-in fade-in duration-500 text-gray-900">
            <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
                SYSTEM OVERVIEW
            </h2>

            {/* Active Session Context */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex-1 flex flex-col relative overflow-hidden">

                <h3 className="text-sm text-gray-400 uppercase font-bold tracking-widest mb-6 border-b border-gray-100 pb-4">
                    Active Session Context
                </h3>

                <div className="flex-1 overflow-y-auto space-y-4 font-mono z-10">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {new Date().toLocaleDateString()}
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-md">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-400 block mb-1 font-semibold tracking-wider">USER</span>
                            <span className="text-gray-900 font-medium">{userContext.userName || "Unknown"}</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-400 block mb-1 font-semibold tracking-wider">PROFILE</span>
                            <span className="text-gray-900 font-medium">{userContext.age || "--"} / {userContext.gender || "--"}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider font-semibold">Session Memory</p>
                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100">
                            {userContext.summary}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
