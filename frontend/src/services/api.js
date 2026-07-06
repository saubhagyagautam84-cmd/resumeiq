/**
 * Centralised API client.
 * All requests go through /api which Vite proxies to http://localhost:8000.
 * Error responses are normalised to always include a `message` string.
 */
import axios from "axios";

// In production (Vercel), VITE_API_URL points to the Render backend.
// In development, /api is proxied to localhost:8000 by Vite.
const BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")  // strip trailing slash
  : "/api";

const client = axios.create({
  baseURL: BASE,
  timeout: 60000,
});

// Normalise errors — never expose raw stack traces to the UI
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail.map((d) => d.msg || d).join("; ")
        : err.message || "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

// ── Jobs ──────────────────────────────────────────────────────────────────

export const jobs = {
  list: () => client.get("/jobs").then((r) => r.data),
  get: (id) => client.get(`/jobs/${id}`).then((r) => r.data),
  create: (data) => client.post("/jobs", data).then((r) => r.data),
  updateRequirements: (id, data) =>
    client.put(`/jobs/${id}/requirements`, data).then((r) => r.data),
  updateWeights: (id, weights) =>
    client.put(`/jobs/${id}/weights`, weights).then((r) => r.data),
  delete: (id) => client.delete(`/jobs/${id}`),
};

// ── Candidates ────────────────────────────────────────────────────────────

export const candidates = {
  upload: (jobId, files) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    return client
      .post(`/jobs/${jobId}/candidates/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  list: (jobId) =>
    client.get(`/jobs/${jobId}/candidates`).then((r) => r.data),
  get: (jobId, candidateId) =>
    client.get(`/jobs/${jobId}/candidates/${candidateId}`).then((r) => r.data),
  delete: (jobId, candidateId) =>
    client.delete(`/jobs/${jobId}/candidates/${candidateId}`),
};

// ── Scoring ───────────────────────────────────────────────────────────────

export const scoring = {
  run: (jobId) => client.post(`/jobs/${jobId}/score`).then((r) => r.data),
  results: (jobId) => client.get(`/jobs/${jobId}/results`).then((r) => r.data),
  exportCsv: (jobId) =>
    client.get(`/jobs/${jobId}/results/csv`, { responseType: "blob" }).then((r) => r),
  scoreLive: (payload) =>
    client.post("/score-live", payload).then((r) => r.data),
};

// ── Builder ───────────────────────────────────────────────────────────────

export const builder = {
  create: (data) => client.post("/builder/resumes", data).then((r) => r.data),
  get: (id) => client.get(`/builder/resumes/${id}`).then((r) => r.data),
  update: (id, data) =>
    client.put(`/builder/resumes/${id}`, data).then((r) => r.data),
  setJd: (id, jdText) =>
    client.post(`/builder/resumes/${id}/set-jd`, { jd_text: jdText }).then((r) => r.data),
  rewriteBullet: (rawText, context = "") =>
    client
      .post("/builder/rewrite-bullet", { raw_text: rawText, context })
      .then((r) => r.data),
  exportResume: async (resumeId, format) => {
    const res = await client.post(
      "/builder/resumes/export",
      { resume_id: resumeId, format },
      { responseType: "blob" }
    );
    return {
      blob: res.data,
      warnings: res.headers["x-self-test-warnings"] || "",
    };
  },
};
