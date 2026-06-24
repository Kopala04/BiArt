import type { UploadMetricsSnapshot } from "./types";

const state = {
  uploadsStarted: 0,
  uploadsSucceeded: 0,
  uploadsFailed: 0,
  bytesStored: 0,
  totalDurationMs: 0,
};

export const mediaMetrics = {
  recordStart() {
    state.uploadsStarted += 1;
  },
  recordSuccess(byteSize: number, durationMs: number) {
    state.uploadsSucceeded += 1;
    state.bytesStored += byteSize;
    state.totalDurationMs += durationMs;
  },
  recordFailure(durationMs: number) {
    state.uploadsFailed += 1;
    state.totalDurationMs += durationMs;
  },
  snapshot(): UploadMetricsSnapshot {
    return { ...state };
  },
  reset() {
    state.uploadsStarted = 0;
    state.uploadsSucceeded = 0;
    state.uploadsFailed = 0;
    state.bytesStored = 0;
    state.totalDurationMs = 0;
  },
};
