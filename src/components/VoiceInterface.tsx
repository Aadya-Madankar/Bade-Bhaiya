
import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, Volume2 } from "lucide-react";
import { AgentConfig, ToolDeclaration, UserContext } from "../types";
import { API_KEY, MODEL_NAME } from "../constants";
import { audioContext, floatTo16BitPCM, pcmToFloat32, downsampleTo16k, arrayBufferToBase64 } from "../services/audioUtils";
import { AgentDisplay } from "./AgentDisplay";
import { ResumeData } from "./workspaces/ResumeWorkspace";
import { Transaction } from "./workspaces/FinanceWorkspace";

interface VoiceInterfaceProps {
    currentAgent: AgentConfig;
    userContext: UserContext;
    onAgentTransfer: (targetAgent: string, reason: string) => void;
    onReturnToMaster: (reason: string) => void;
    onUpdateContext: (newContextSnippet: string) => void;

    // State Modifiers
    onUpdateResume: (data: Partial<ResumeData>) => void;
    onAddTransaction: (t: Omit<Transaction, "id" | "date">) => void;
    onAddTask: (t: { title: string; time: string }) => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
    currentAgent,
    userContext,
    onAgentTransfer,
    onReturnToMaster,
    onUpdateContext,
    onUpdateResume,
    onAddTransaction,
    onAddTask,
}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [micVolume, setMicVolume] = useState(0);
    const [isTalking, setIsTalking] = useState(false); // Kept for future use if needed

    const websocketRef = useRef<WebSocket | null>(null);
    const audioQueueRef = useRef<Float32Array[]>([]);
    const isPlayingRef = useRef(false);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Initial Connection & Re-connection on Agent Change
    useEffect(() => {
        if (isConnected) {
            console.log(`%c[System] Connecting to agent: ${currentAgent.name}...`, "color: #3b82f6; font-weight: bold;");
            connectToGemini();
        }
        return () => {
            console.log("%c[System] Cleaning up connection...", "color: #ef4444");
            cleanup();
        };
    }, [currentAgent, isConnected]);

    const cleanup = () => {
        if (websocketRef.current) {
            console.log("[Cleanup] Closing WebSocket...");
            websocketRef.current.close();
        }
        if (processorRef.current) {
            console.log("[Cleanup] Disconnecting Processor...");
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceRef.current) {
            console.log("[Cleanup] Disconnecting Source...");
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (streamRef.current) {
            console.log("[Cleanup] Stopping Microphone Tracks...");
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const connectToGemini = async () => {
        const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

        // FORCE RESET AUDIO & SOCKET
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        if (websocketRef.current) {
            websocketRef.current.close();
            await new Promise(r => setTimeout(r, 50));
        }

        console.log(`[Connection] Opening Fresh WebSocket to ${url}`);
        const ws = new WebSocket(url);
        websocketRef.current = ws;

        ws.onopen = () => {
            console.log("%c[WebSocket] Connected Open.", "color: #22c55e; font-weight: bold;");

            const setupMsg = {
                setup: {
                    model: MODEL_NAME,
                    tools: currentAgent.tools,
                    generation_config: {
                        response_modalities: ["AUDIO"],
                        speech_config: {
                            voice_config: {
                                prebuilt_voice_config: {
                                    voice_name: currentAgent.voiceName || "Charon"
                                }
                            }
                        }
                    },
                    system_instruction: {
                        parts: [{ text: currentAgent.systemInstruction }],
                    },
                },
            };
            console.log("[WebSocket] Sending Setup Message:", JSON.stringify(setupMsg, null, 2));
            ws.send(JSON.stringify(setupMsg));

            const initialContext = `
              [SYSTEM_UPDATE]
              User Context: ${JSON.stringify(userContext)}
              Current Date and Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              Role: You are ${currentAgent.name}.
              Task: Greet the user based on the context. If you were just transferred, acknowledge it.
              `;

            const clientContent = {
                client_content: {
                    turns: [{ role: "user", parts: [{ text: initialContext }] }],
                    turn_complete: true,
                },
            };
            console.log("[WebSocket] Sending Initial Context:", initialContext);
            ws.send(JSON.stringify(clientContent));

            if (audioContext.state === 'suspended') {
                console.log("[Audio] Resuming AudioContext...");
                audioContext.resume();
            }

            console.log("[Audio] Starting Fresh Microphone...");
            startMicrophone();
        };

        ws.onmessage = async (event) => {
            let data;
            try {
                if (event.data instanceof Blob) {
                    const text = await event.data.text();
                    data = JSON.parse(text);
                } else {
                    data = JSON.parse(event.data);
                }
            } catch (e) {
                console.error("[WebSocket] Error parsing message:", e);
                return;
            }

            // Verbose Logging
            if (data.serverContent?.modelTurn) {
                const parts = data.serverContent.modelTurn.parts;
                const textPart = parts.find((p: any) => p.text);
                const audioPart = parts.find((p: any) => p.inlineData);

                if (textPart) {
                    console.log(`%c[Model Transcript] ${textPart.text}`, "color: #a855f7; font-weight: bold;");
                }
                if (audioPart) {
                    console.log(`%c[Model Audio] Received chunk: ${audioPart.inlineData.data.length} bytes`, "color: #ec4899;");
                }
            }

            if (data.toolCall) {
                console.log(`%c[Tool Call] Received:`, "color: #f59e0b; font-weight: bold;", JSON.stringify(data.toolCall, null, 2));
            }

            // Handle Audio Output
            if (data.serverContent?.modelTurn?.parts) {
                for (const part of data.serverContent.modelTurn.parts) {
                    if (part.inlineData) {
                        const base64 = part.inlineData.data;
                        const binaryString = atob(base64);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
                        const pcm16 = new Int16Array(bytes.length / 2);
                        for (let i = 0; i < pcm16.length; i++) {
                            pcm16[i] = dataView.getInt16(i * 2, true);
                        }
                        playAudio(pcm16);
                    }
                }
            }

            // Handle Tool Calls
            if (data.toolCall) {
                const functionCalls = data.toolCall.functionCalls;
                if (functionCalls && functionCalls.length > 0) {
                    handleFunctionCalls(functionCalls);
                }
            }
        };

        ws.onerror = (err) => {
            console.error("%c[WebSocket] Error:", "color: red; font-size: 14px;", err);
        };
        ws.onclose = (event) => {
            console.log(`%c[WebSocket] Closed. Code: ${event.code}, Reason: ${event.reason}`, "color: red; font-weight: bold;");
            if (!event.wasClean) {
                console.warn("[WebSocket] Unclean closure. Possible network issue or API timeout.");
            }
        };
    };

    const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // ... (rest of refs)

    const stopAIPlayback = () => {
        if (activeSourceRef.current) {
            try {
                activeSourceRef.current.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            activeSourceRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
    };

    // Track if user is currently speaking to prevent AI from speaking over them (echo/repeat issue)
    const isUserSpeakingRef = useRef(false);
    const lastUserSpeechTimeRef = useRef(0); // For debouncing barge-in

    // ...

    const startMicrophone = async () => {
        try {
            console.log("[Mic] Requesting access...");
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            console.log("[Mic] Access granted.");
            streamRef.current = stream;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);

            source.connect(processor);
            processor.connect(audioContext.destination);

            processor.onaudioprocess = (e) => {
                if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) return;

                const inputData = e.inputBuffer.getChannelData(0);

                // Calculate Volume
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                const newVol = Math.min(1, rms * 10);

                // BARGE-IN / INTERRUPTION LOGIC:
                if (rms > 0.02) {
                    isUserSpeakingRef.current = true;
                    lastUserSpeechTimeRef.current = Date.now(); // Mark time

                    if (isPlayingRef.current) {
                        console.log("[Barge-in] User speech detected. Stopping AI playback.");
                        stopAIPlayback();
                    }
                } else if (rms < 0.01) {
                    isUserSpeakingRef.current = false;
                }

                if (Math.random() < 0.2) {
                    setMicVolume(newVol);
                }

                // Downsample to 16kHz
                const downsampled = downsampleTo16k(inputData, audioContext.sampleRate);
                const pcm16 = floatTo16BitPCM(downsampled);
                const buffer = new ArrayBuffer(pcm16.length * 2);
                const view = new DataView(buffer);
                for (let i = 0; i < pcm16.length; i++) {
                    view.setInt16(i * 2, pcm16[i], true);
                }

                const base64Audio = arrayBufferToBase64(buffer);
                const msg = {
                    realtime_input: {
                        media_chunks: [{ mime_type: "audio/pcm", data: base64Audio }],
                    },
                };
                websocketRef.current.send(JSON.stringify(msg));
            };

            sourceRef.current = source;
            processorRef.current = processor;
        } catch (err) {
            console.error("[Mic] Error starting microphone:", err);
        }
    };

    const playAudio = (pcmData: Int16Array) => {
        // STRONG DEBOUNCE: If user spoke in last 1.5 seconds, discard AI audio.
        // This prevents the "Tail" of the interrupted sentence from playing during short pauses.
        const timeSinceSpeech = Date.now() - lastUserSpeechTimeRef.current;
        if (isUserSpeakingRef.current || timeSinceSpeech < 1500) {
            return;
        }

        const float32 = pcmToFloat32(pcmData);
        audioQueueRef.current.push(float32);
        if (!isPlayingRef.current) {
            processAudioQueue();
        }
    };

    const processAudioQueue = () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            return;
        }
        isPlayingRef.current = true;
        const data = audioQueueRef.current.shift()!;

        const buffer = audioContext.createBuffer(1, data.length, 24000);
        buffer.getChannelData(0).set(data);

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();

        activeSourceRef.current = source;

        source.onended = () => {
            activeSourceRef.current = null;
            processAudioQueue();
        };
    };

    const handleFunctionCalls = (functionCalls: any[]) => {
        functionCalls.forEach((call) => {
            console.log("Tool Call:", call.name, call.args);

            // Handle Agent Transfers (No response needed as connection closes)
            if (call.name === "connect_to_specialist") {
                const { agent_name, transfer_reason } = call.args;
                onAgentTransfer(agent_name, transfer_reason);
                return;
            }

            if (call.name === "return_to_master_agent") {
                const { reason } = call.args;
                onReturnToMaster(reason);
                return;
            }

            // Handle Internal Tools (State Updates)
            console.log("Executing internal tool:", call.name);
            let result = { result: "Success. Action logged." };

            try {
                if (call.name === "generate_resume") {
                    // ARGUMENT DESTRUCTURING: Now supports both flat and nested (just in case)
                    const { name, skills, experience, education, projects, contactInfo, summary, email, phone, linkedin, location } = call.args;
                    console.log("[Tool Debug] generate_resume called with args:", JSON.stringify(call.args)); // DEBUG LOG

                    const updateData: any = {};

                    if (name) updateData.name = name;

                    // Handle Contact Info: Try flat fields first, fall back to nested object if model sends it
                    // Reconstruction of the contactInfo object for the state
                    const newContactInfo: any = {};
                    if (email) newContactInfo.email = email;
                    if (phone) newContactInfo.phone = phone;
                    if (linkedin) newContactInfo.linkedin = linkedin;
                    if (location) newContactInfo.location = location;

                    // If we built a valid object from flat args, use it
                    if (Object.keys(newContactInfo).length > 0) {
                        updateData.contactInfo = newContactInfo;
                    }
                    // Fallback: If model still sent the old nested object
                    else if (contactInfo) {
                        updateData.contactInfo = contactInfo;
                    }

                    if (summary) updateData.summary = summary;

                    if (skills) {
                        const skillsArray = typeof skills === 'string'
                            ? skills.split(',').map((s: string) => s.trim())
                            : (Array.isArray(skills) ? skills : []);

                        // Strict check to prevent empty wipes, but allow updates if valid
                        if (skillsArray.length > 0) {
                            updateData.skills = skillsArray;
                        } else {
                            console.log("[Tool Debug] Skills skipped: Empty array or invalid format.");
                        }
                    }

                    // Log reason for skipping arrays to helps debug "why didn't it update?"
                    if (experience && Array.isArray(experience) && experience.length > 0) {
                        updateData.experience = experience;
                    } else if (experience) {
                        console.log("[Tool Debug] Experience skipped: Provided but empty/invalid.");
                    }

                    if (education && Array.isArray(education) && education.length > 0) {
                        updateData.education = education;
                    } else if (education) {
                        console.log("[Tool Debug] Education skipped: Provided but empty/invalid.");
                    }

                    if (projects && Array.isArray(projects) && projects.length > 0) {
                        updateData.projects = projects;
                    } else if (projects) {
                        console.log("[Tool Debug] Projects skipped: Provided but empty/invalid.");
                    }

                    console.log("[Tool Debug] Final Update Payload:", JSON.stringify(updateData)); // DEBUG LOG

                    if (Object.keys(updateData).length > 0) {
                        onUpdateResume(updateData);
                        onUpdateContext(`[System] Resume updated. Visuals refreshed.`);
                        result = { result: "Resume visual updated successfully." };
                    } else {
                        console.warn("[Tool Debug] No valid fields found to update.");
                        result = { result: "No changes made. Please provide valid data for at least one section." };
                    }

                } else if (call.name === "update_resume_layout") {
                    const { left_column, right_column } = call.args;
                    console.log("[Tool Debug] update_resume_layout called:", call.args); // DEBUG LOG

                    const validSections = ["summary", "experience", "education", "projects", "skills", "contactInfo"];

                    const sanitize = (list: any[]) => {
                        if (!Array.isArray(list)) return [];
                        return list
                            .map(s => String(s).trim())
                            .filter(s => {
                                // loose match
                                const match = validSections.find(v => v.toLowerCase() === s.toLowerCase());
                                return !!match;
                            })
                            .map(s => validSections.find(v => v.toLowerCase() === s.toLowerCase())!); // normalize case
                    };

                    onUpdateResume({
                        layout: {
                            left: sanitize(left_column) as any,
                            right: sanitize(right_column) as any
                        }
                    });

                    onUpdateContext(`[System] Resume layout rearranged.`);
                    result = { result: "Layout updated successfully." };

                } else if (call.name === "log_transaction") {
                    const { amount, source, type } = call.args;
                    console.log("[Tool Debug] log_transaction called:", call.args); // DEBUG LOG

                    // Robust helper to parse "500", "Rs 500", 500
                    const parseAmount = (val: any) => {
                        if (typeof val === 'number') return val;
                        if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                        return 0;
                    };

                    const safeAmount = parseAmount(amount);
                    const txType = (String(type).toLowerCase().includes('income')) ? 'income' : 'expense';

                    onAddTransaction({
                        amount: safeAmount,
                        source: String(source || "Unknown"),
                        type: txType
                    });

                    onUpdateContext(`[System] Logged ${txType.toUpperCase()}: ₹${safeAmount} for ${source}`);
                    result = { result: `Transaction logged as ${txType}. Dashboard updated.` };

                } else if (call.name === "add_task") {
                    const { task, time } = call.args;
                    console.log("[Tool Debug] add_task called:", call.args); // DEBUG LOG

                    onAddTask({
                        title: String(task || "Untitled Task"),
                        time: String(time || "Today")
                    });

                    onUpdateContext(`[System] Added Task: ${task} at ${time}`);
                    result = { result: "Task added to day plan and visible to user." };
                }
            } catch (e) {
                console.error("Error executing internal tool:", e);
                result = { result: "Error executing tool." };
            }

            // Send Response Back to Model
            const response = {
                tool_response: {
                    function_responses: [{
                        response: result,
                        id: call.id,
                        name: call.name
                    }]
                }
            };

            if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                websocketRef.current.send(JSON.stringify(response));
            } else {
                console.warn("[WebSocket] Cannot send tool response, socket closed.");
            }
        });
    };

    const toggleConnection = () => {
        if (isConnected) {
            setIsConnected(false);
            cleanup();
        } else {
            setIsConnected(true);
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md">
            <div className="mb-6 w-full">
                <AgentDisplay agent={currentAgent} isActive={isConnected} />
            </div>

            {/* Visualizer Placeholder */}
            <div className="h-32 w-full bg-white border border-gray-200 rounded-2xl mb-8 flex items-center justify-center overflow-hidden relative shadow-sm">
                <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                    {isConnected ? (
                        <>
                            <div className="w-1.5 h-12 bg-emerald-400 animate-pulse delay-75 rounded-full"></div>
                            <div className="w-1.5 h-16 bg-emerald-500 animate-pulse delay-150 rounded-full"></div>
                            <div className="w-1.5 h-20 bg-emerald-600 animate-pulse delay-300 rounded-full"></div>
                            <div className="w-1.5 h-16 bg-emerald-500 animate-pulse delay-150 rounded-full"></div>
                            <div className="w-1.5 h-12 bg-emerald-400 animate-pulse delay-75 rounded-full"></div>
                        </>
                    ) : (
                        <span className="text-gray-400 font-medium text-xs tracking-widest uppercase">Offline</span>
                    )}
                </div>
            </div>

            <button
                onClick={toggleConnection}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${isConnected
                    ? "bg-rose-500 shadow-rose-200"
                    : "bg-emerald-900 shadow-emerald-100"
                    }`}
            >
                {isConnected ? <Square size={28} fill="white" /> : <Mic size={28} color="white" />}
            </button>

            {/* Mic Volume Indicator */}
            <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-6 overflow-hidden">
                <div
                    className="h-full bg-emerald-600 transition-all duration-100 ease-out"
                    style={{ width: `${micVolume * 100}%` }}
                />
            </div>

            <p className="mt-3 text-gray-400 text-xs font-medium tracking-wide uppercase">
                {isConnected ? "Listening & Connected" : "Tap to Start Session"}
            </p>
        </div>
    );
};
