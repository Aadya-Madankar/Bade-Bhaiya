import React, { useState } from "react";
import { AGENTS } from "./constants";
import { VoiceInterface } from "./components/VoiceInterface";
import { Sidebar } from "./components/Sidebar";
import { UserContext } from "./types";

import { Onboarding } from "./components/Onboarding";
import { OverviewWorkspace } from "./components/workspaces/OverviewWorkspace";
import { ResumeWorkspace, ResumeData } from "./components/workspaces/ResumeWorkspace";
import { FinanceWorkspace, Transaction } from "./components/workspaces/FinanceWorkspace";
import { PlannerWorkspace, Task } from "./components/workspaces/PlannerWorkspace";

function App() {
    // Session State
    const [hasOnboarded, setHasOnboarded] = useState(false);
    const [currentAgentKey, setCurrentAgentKey] = useState<keyof typeof AGENTS>("BadeBhaiya");
    const [userContext, setUserContext] = useState<UserContext>({
        history: [],
        summary: "New user session.",
    });

    // Agentic State (The "Brain")
    const [resumeData, setResumeData] = useState<ResumeData>({ name: "", skills: [], experience: [], education: [], projects: [] });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    const handleOnboardingSubmit = (data: { name: string; age: string; gender: string }) => {
        setUserContext((prev) => ({
            ...prev,
            userName: data.name,
            age: data.age,
            gender: data.gender,
            summary: `User is ${data.name}, ${data.age} years old, ${data.gender}.`,
        }));
        setResumeData(prev => ({ ...prev, name: data.name })); // Auto-fill name
        setHasOnboarded(true);
    };

    const handleAgentTransfer = (targetAgentName: string, reason: string) => {
        // Need to map partial names like "ResumeAgent" to keys if needed, but assuming exact match from tool for now
        // or simple lookup.
        let key: keyof typeof AGENTS = "BadeBhaiya";

        // Robust key matching
        if (targetAgentName.toLowerCase().includes("resume") || targetAgentName.toLowerCase().includes("rohan")) key = "ResumeAgent";
        if (targetAgentName.toLowerCase().includes("income") || targetAgentName.toLowerCase().includes("finance") || targetAgentName.toLowerCase().includes("ca")) key = "IncomeAgent";
        if (targetAgentName.toLowerCase().includes("planner") || targetAgentName.toLowerCase().includes("vikram")) key = "DayPlannerAgent";
        if (targetAgentName.toLowerCase().includes("bhaiya") || targetAgentName.toLowerCase().includes("master")) key = "BadeBhaiya";

        console.log(`Transferring to ${key} because: ${reason}`);

        // Update context to reflect transfer
        setUserContext(prev => ({
            ...prev,
            summary: prev.summary + `\n[System] Transferred to ${key}: ${reason}`
        }));

        setCurrentAgentKey(key);
    };

    // Return to Master
    const handleReturnToMaster = (reason: string) => {
        console.log(`Returning to Master: ${reason}`);
        setUserContext(prev => ({
            ...prev,
            summary: prev.summary + `\n[System] Returned to Bade Bhaiya: ${reason}.`
        }));
        setCurrentAgentKey("BadeBhaiya");
    };

    const handleUpdateContext = (newContextSnippet: string) => {
        setUserContext(prev => {
            // Prevent duplicate spam in logs
            if (prev.summary.endsWith(newContextSnippet)) return prev;

            // Limit context size to last 2000 chars to avoid token limit overflow and confusion
            let newSummary = prev.summary + `\n${newContextSnippet}`;
            if (newSummary.length > 5000) {
                newSummary = newSummary.slice(newSummary.length - 5000); // Keep last 5000
            }
            return {
                ...prev,
                summary: newSummary
            };
        });
    };

    // State Modifiers (passed to VoiceInterface)
    const handleUpdateResume = (data: Partial<ResumeData>) => {
        console.log("[App Debug] handleUpdateResume triggered:", data);
        setResumeData(prev => ({
            ...prev,
            ...data,
        }));
    };

    const handleAddTransaction = (t: Omit<Transaction, "id" | "date">) => {
        console.log("[App Debug] handleAddTransaction triggered:", t);
        const newT: Transaction = {
            ...t,
            id: Date.now().toString(),
            date: new Date().toLocaleDateString()
        };
        setTransactions(prev => [newT, ...prev]);
    };

    const handleAddTask = (t: { title: string; time: string }) => {
        console.log("[App Debug] handleAddTask triggered:", t);
        const newTask: Task = {
            id: Date.now().toString(),
            title: t.title,
            time: t.time,
            completed: false
        };
        setTasks(prev => [...prev, newTask]);
    };


    const handleToggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleDeleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const handleManualAgentSelect = (key: string) => {
        if (key === currentAgentKey) return;
        handleAgentTransfer(key, "User manually selected agent via sidebar.");
    };

    if (!hasOnboarded) {
        return <Onboarding onComplete={handleOnboardingSubmit} />;
    }

    return (
        <div className="flex h-screen bg-[#FDFBF7] text-gray-900 overflow-hidden font-sans">
            {/* Sidebar (Agent List) */}
            <Sidebar currentAgentKey={currentAgentKey} onAgentSelect={handleManualAgentSelect} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative transition-all duration-500">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-10 border-b border-gray-200 bg-white/50 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
                            nudgit | Experts
                        </h1>
                        <span className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Your Persona Companion</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                            <span className="text-xs font-bold text-gray-600 tracking-wide">ACTIVE SESSION</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Clean Interaction Area */}
                    <div className="w-[45%] flex flex-col items-center justify-center relative border-r border-gray-200 bg-[#FDFBF7]">
                        <div className="z-10 w-full max-w-sm px-6">
                            <VoiceInterface
                                currentAgent={AGENTS[currentAgentKey]}
                                userContext={userContext}
                                onAgentTransfer={handleAgentTransfer}
                                onReturnToMaster={handleReturnToMaster}
                                onUpdateContext={handleUpdateContext}
                                // Specialized Tool Handlers
                                onUpdateResume={handleUpdateResume}
                                onAddTransaction={handleAddTransaction}
                                onAddTask={handleAddTask}
                            />
                        </div>
                    </div>

                    {/* Right Panel: Active Workspace */}
                    <div className="flex-1 bg-white relative overflow-hidden">
                        {currentAgentKey === "BadeBhaiya" && <OverviewWorkspace userContext={userContext} />}
                        {currentAgentKey === "ResumeAgent" && <ResumeWorkspace data={resumeData} />}
                        {currentAgentKey === "IncomeAgent" && <FinanceWorkspace transactions={transactions} />}
                        {currentAgentKey === "DayPlannerAgent" && (
                            <PlannerWorkspace
                                tasks={tasks}
                                onToggleTask={handleToggleTask}
                                onDeleteTask={handleDeleteTask}
                            />
                        )}
                    </div>
                </div>

                {/* Context Log / Footer */}
                <div className="h-12 bg-white border-t border-gray-200 px-6 flex items-center justify-between text-xs text-gray-400 font-medium shrink-0">
                    <span>SYSTEM CONTEXT LOG // REALTIME</span>
                    <span className="truncate max-w-xl text-gray-500">{userContext.summary.split('\n').pop()}</span>
                </div>
            </main>
        </div>
    );
}

export default App;

