export interface AgentConfig {
    name: string;
    voiceName?: string; // e.g., "Charon" for Bade Bhaiya
    systemInstruction: string;
    tools?: ToolDeclaration[];
}

export interface UserContext {
    userName?: string;
    age?: string;
    gender?: string;
    summary: string; // Summary of conversation so far
    history: Content[]; // Raw message history if needed
}

// Gemini API Types
export interface ToolDeclaration {
    function_declarations: FunctionDeclaration[];
}

export interface FunctionDeclaration {
    name: string;
    description: string;
    parameters?: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
}

export interface Content {
    role: "user" | "model" | "system";
    parts: Part[];
}

export interface Part {
    text?: string;
    functionCall?: {
        name: string;
        args: Record<string, any>;
    };
    functionResponse?: {
        name: string;
        response: Record<string, any>;
    };
}
