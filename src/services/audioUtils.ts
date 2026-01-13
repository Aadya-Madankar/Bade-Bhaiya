export const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

export async function recordAudio(): Promise<MediaStream> {
    return await navigator.mediaDevices.getUserMedia({
        audio: {
            channelCount: 1,
            // We still request 16k, but browser/hardware might ignore it.
            // We must resample in software if context.sampleRate != 16000.
            sampleRate: 16000,
        },
    });
}

export function downsampleTo16k(input: Float32Array, inputRate: number): Float32Array {
    if (inputRate === 16000) return input;

    const ratio = inputRate / 16000;
    const newLength = Math.round(input.length / ratio);
    const output = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
        const offset = i * ratio;
        const index = Math.floor(offset);
        const decimal = offset - index;

        const a = input[index] || 0;
        const b = input[index + 1] || a;

        output[i] = a + (b - a) * decimal;
    }
    return output;
}

export function floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
}

export function pcmToFloat32(input: Int16Array): Float32Array {
    const output = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) {
        output[i] = input[i] / 32768.0;
    }
    return output;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export class AudioQueue {
    private queue: Float32Array[] = [];
    private nextTime = 0;
    private processing = false;

    constructor() {
        this.nextTime = audioContext.currentTime;
    }

    enqueue(pcmData: Int16Array) {
        const float32 = pcmToFloat32(pcmData);
        this.queue.push(float32);
        if (!this.processing) {
            this.process();
        }
    }

    process() {
        this.processing = true;

        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }

        if (this.nextTime < audioContext.currentTime) {
            this.nextTime = audioContext.currentTime + 0.05;
        }

        const bufferData = this.queue.shift()!;
        const buffer = audioContext.createBuffer(1, bufferData.length, 24000);
        buffer.getChannelData(0).set(bufferData);

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(this.nextTime);

        this.nextTime += buffer.duration;

        setTimeout(() => this.process(), 0);
    }

    clear() {
        this.queue = [];
        this.nextTime = audioContext.currentTime;
        this.processing = false;
    }
}
