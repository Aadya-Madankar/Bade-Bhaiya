import React from "react";
import { FileText, Download, Share2, Mail, Phone, Linkedin, MapPin } from "lucide-react";

export type SectionType = "summary" | "experience" | "education" | "projects" | "skills" | "contactInfo";

export interface ResumeData {
    name: string;
    contactInfo?: {
        email: string;
        phone: string;
        linkedin: string;
        location: string;
    };
    summary?: string;
    skills: string[];
    experience: (string | { role: string; company: string; duration: string; points: string })[];
    education?: { degree: string; school: string; year: string }[];
    projects?: { title: string; description: string; techStack: string }[];
    layout?: {
        left: SectionType[];
        right: SectionType[];
    };
}

interface ResumeWorkspaceProps {
    data: ResumeData;
}

export const ResumeWorkspace: React.FC<ResumeWorkspaceProps> = ({ data }) => {
    // Default Layout if not provided
    const layout = data.layout || {
        left: ["experience", "skills", "summary"],
        right: ["education", "projects"]
    };

    const renderSection = (type: SectionType) => {
        switch (type) {
            case "summary":
                return data.summary ? (
                    <div key="summary" className="mb-6 animate-in slide-in-from-bottom-2 duration-500">
                        <h3 className="text-lg font-bold uppercase border-b-2 border-black mb-3 pb-1 tracking-wider">
                            Summary
                        </h3>
                        <p className="text-xs text-gray-800 leading-relaxed text-justify">
                            {data.summary}
                        </p>
                    </div>
                ) : null;

            case "experience":
                return data.experience.length > 0 ? (
                    <div key="experience" className="mb-6 animate-in slide-in-from-bottom-2 duration-500">
                        <h3 className="text-lg font-bold uppercase border-b-2 border-black mb-3 pb-1 tracking-wider">
                            Experience
                        </h3>
                        <div className="space-y-4">
                            {data.experience.map((exp, i) => (
                                <div key={i}>
                                    {typeof exp === 'string' ? (
                                        <p className="whitespace-pre-wrap text-sm">{exp}</p>
                                    ) : (
                                        <div>
                                            <div className="mb-0.5">
                                                <h4 className="font-bold text-gray-900 text-sm leading-tight">{exp.role}</h4>
                                                <div className="flex justify-between items-baseline text-xs mt-0.5">
                                                    <span className="font-semibold text-gray-700">{exp.company}</span>
                                                </div>
                                                <div className="flex gap-4 text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-1.5">
                                                    <span className="flex items-center gap-1">{exp.duration}</span>
                                                </div>
                                            </div>
                                            <ul className="list-disc pl-4 space-y-0.5">
                                                {exp.points.split('\n').filter(p => p.trim()).map((point, j) => (
                                                    <li key={j} className="text-[11px] text-gray-800 leading-snug pl-0 text-justify">
                                                        {point.replace(/^[•-]\s*/, '')}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case "education":
                return data.education && data.education.length > 0 ? (
                    <div key="education" className="mb-6 animate-in slide-in-from-bottom-2 duration-500">
                        <h3 className="text-lg font-bold uppercase border-b-2 border-black mb-3 pb-1 tracking-wider">
                            Education
                        </h3>
                        <div className="space-y-3">
                            {data.education.map((edu, i) => (
                                <div key={i}>
                                    <h4 className="font-bold text-gray-900 text-sm">{edu.degree}</h4>
                                    <div className="text-xs font-semibold text-gray-700">{edu.school}</div>
                                    <div className="text-[10px] text-gray-500 font-medium uppercase mt-0.5">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case "projects":
                return data.projects && data.projects.length > 0 ? (
                    <div key="projects" className="mb-6 animate-in slide-in-from-bottom-2 duration-500">
                        <h3 className="text-lg font-bold uppercase border-b-2 border-black mb-3 pb-1 tracking-wider">
                            Projects
                        </h3>
                        <div className="space-y-4">
                            {data.projects.map((proj, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h4 className="font-bold text-gray-900 text-sm">{proj.title}</h4>
                                    </div>
                                    <ul className="list-disc pl-4 space-y-0.5">
                                        <li className="text-[11px] text-gray-800 leading-snug pl-0 text-justify">
                                            {proj.description}
                                        </li>
                                        {proj.techStack && (
                                            <li className="text-[11px] text-gray-600 font-medium pl-0 mt-0.5">
                                                <span className="text-gray-900 italic">Stack:</span> {proj.techStack}
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case "skills":
                return data.skills.length > 0 ? (
                    <div key="skills" className="mb-6 animate-in slide-in-from-bottom-2 duration-500">
                        <h3 className="text-lg font-bold uppercase border-b-2 border-black mb-3 pb-1 tracking-wider">
                            Technical Skills
                        </h3>
                        <div className="text-xs text-gray-800 leading-relaxed">
                            <div className="mb-1"><span className="font-bold">Languages/Tools:</span> {data.skills.join(", ")}</div>
                        </div>
                    </div>
                ) : null;

            default:
                return null;
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#525659] relative">
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { 
                        margin: 0mm; 
                        size: A4 portrait;
                    }
                    
                    /* Hide everything by default using visibility, NOT display:none 
                       (display:none on parents kills children even if children are visible) */
                    body {
                        visibility: hidden;
                        background: white;
                    }

                    /* Unhide the resume paper and its children */
                    .resume-paper, .resume-paper * {
                        visibility: visible;
                    }

                    /* Position the paper at the very top-left of the physical page */
                    .resume-paper {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0;
                        padding: 30px !important;
                        
                        /* Ensure it sits on top of everything else and is opaque */
                        z-index: 9999;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    
                    /* Explicitly hide the unrelated UI elements to be safe */
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Toolbar */}
            <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 no-print shrink-0 z-10">
                <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <FileText size={20} className="text-emerald-700" />
                    Resume Preview
                </h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-900 text-white hover:bg-emerald-800 transition-all font-medium text-sm shadow-sm"
                        title="Download PDF"
                    >
                        <Download size={16} />
                        Download PDF
                    </button>
                    <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Resume Workspace (Scrollable Area) */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-gray-100/50">
                {/* A4 Paper Container - 2 Column Layout with Dynamic Sections */}
                <div className="resume-paper w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[30px] text-gray-900 font-sans relative box-border mx-auto animate-in fade-in duration-500 origin-top">

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide mb-2">
                            {data.name || "YOUR NAME"}
                        </h1>
                        {data.contactInfo && (
                            <div className="flex flex-wrap gap-4 text-xs text-gray-700 font-medium items-center">
                                {data.contactInfo.email && <div className="flex items-center gap-1"><Mail size={12} /> {data.contactInfo.email}</div>}
                                {data.contactInfo.phone && <div className="flex items-center gap-1"><Phone size={12} /> {data.contactInfo.phone}</div>}
                                {data.contactInfo.linkedin && <div className="flex items-center gap-1"><Linkedin size={12} /> {data.contactInfo.linkedin}</div>}
                                {data.contactInfo.location && <div className="flex items-center gap-1"><MapPin size={12} /> {data.contactInfo.location}</div>}
                            </div>
                        )}
                    </div>

                    {/* 2-Column Grid */}
                    <div className="grid grid-cols-2 gap-8">

                        {/* Left Column */}
                        <div className="flex flex-col">
                            {layout.left.map(section => renderSection(section))}
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col">
                            {layout.right.map(section => renderSection(section))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
