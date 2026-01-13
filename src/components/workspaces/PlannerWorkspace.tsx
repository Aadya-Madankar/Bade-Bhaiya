import React from "react";
import { Clock, Plus, Trash2, Check, RefreshCw } from "lucide-react";

export interface Task {
    id: string;
    title: string;
    time: string;
    completed: boolean;
}

interface PlannerWorkspaceProps {
    tasks: Task[];
    onToggleTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
}

export const PlannerWorkspace: React.FC<PlannerWorkspaceProps> = ({ tasks, onToggleTask, onDeleteTask }) => {
    // Sort tasks by time roughly
    const sortedTasks = [...tasks].sort((a, b) => a.time.localeCompare(b.time));
    const pendingTasks = sortedTasks.filter(t => !t.completed);
    const completedTasks = sortedTasks.filter(t => t.completed);

    return (
        <div className="h-full w-full p-8 flex flex-col animate-in fade-in duration-500 bg-gray-50/50">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    DAY PLANNER
                </h2>
                <div className="px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 text-xs font-mono font-bold flex items-center gap-2 border border-orange-500/20">
                    <Clock size={14} />
                    <span>TODAY'S SCHEDULE</span>
                </div>
            </div>

            {/* Task List (Single Column) */}
            <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full space-y-8">

                {/* Pending Tasks */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                            Pending Tasks
                        </h3>
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold font-mono">
                            {pendingTasks.length}
                        </span>
                    </div>

                    {pendingTasks.length > 0 ? (
                        pendingTasks.map(task => (
                            <div key={task.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="flex flex-col items-center mt-1">
                                    <span className="font-mono text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 whitespace-nowrap">{task.time}</span>
                                </div>

                                <div className="flex-1">
                                    <p className="text-gray-900 font-medium text-lg leading-snug font-serif">{task.title}</p>
                                </div>

                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onToggleTask(task.id)}
                                        className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors"
                                        title="Mark as Done"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteTask(task.id)}
                                        className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                                        title="Delete Task"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 opacity-60 flex flex-col items-center border-2 border-dashed border-gray-200 rounded-xl">
                            <Plus size={48} className="mb-4 text-gray-300" />
                            <p className="text-sm font-medium text-gray-500 font-serif italic">No pending tasks. You're free!</p>
                        </div>
                    )}
                </div>

                {/* Completed Tasks (Dimmed) */}
                {completedTasks.length > 0 && (
                    <div className="space-y-4 pt-8 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                Completed
                            </h3>
                            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-bold font-mono">
                                {completedTasks.length}
                            </span>
                        </div>

                        {completedTasks.map(task => (
                            <div key={task.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4 grayscale hover:grayscale-0 transition-all">
                                <span className="font-mono text-xs text-gray-400 line-through">{task.time}</span>
                                <p className="text-gray-500 font-medium text-md line-through flex-1">{task.title}</p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onToggleTask(task.id)}
                                        className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                                        title="Resume Task"
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteTask(task.id)}
                                        className="p-1.5 rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-transparent transition-colors"
                                        title="Delete Forever"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
