import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import JDInput from "./JDInput";
import RequirementsEditor from "./RequirementsEditor";
import WeightConfig from "./WeightConfig";
import ResumeUpload from "./ResumeUpload";
import ResultsDashboard from "./ResultsDashboard";
import Spinner from "../../components/Spinner";
import ErrorAlert from "../../components/ErrorAlert";

const STEPS = ["JD Input", "Requirements", "Weights", "Upload", "Results"];

/**
 * Module A — orchestrator that manages the 5-step recruiter workflow.
 * Job state is loaded from the URL so you can share/bookmark a job URL.
 */
export default function ModuleA() {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobIdParam = searchParams.get("job");

  const [step, setStep] = useState(jobIdParam ? 4 : 0); // jump to upload if job already exists
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(!!jobIdParam);
  const [loadError, setLoadError] = useState("");

  // Load job from URL param on mount
  useEffect(() => {
    if (!jobIdParam) return;
    (async () => {
      try {
        const { jobs: jobsApi } = await import("../../services/api");
        const loaded = await jobsApi.get(parseInt(jobIdParam));
        setJob(loaded);
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoadingJob(false);
      }
    })();
  }, [jobIdParam]);

  function updateUrl(id) {
    setSearchParams(id ? { job: id } : {});
  }

  // Step handlers
  function handleJobCreated(newJob) {
    setJob(newJob);
    updateUrl(newJob.id);
    setStep(1);
  }

  function handleRequirementsSaved(updated) {
    setJob((prev) => ({ ...prev, ...updated }));
    setStep(2);
  }

  function handleWeightsSaved(updated) {
    setJob((prev) => ({ ...prev, ...updated }));
    setStep(3);
  }

  function handleScored() {
    setStep(4);
  }

  function handleReset() {
    setJob(null);
    setStep(0);
    updateUrl(null);
  }

  if (loadingJob) return <Spinner label="Loading job…" />;
  if (loadError) return <ErrorAlert message={loadError} />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Module A — Resume Shortlisting</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a job posting, configure scoring, upload resumes, see ranked results.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((label, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <div key={label} className="flex items-center gap-1">
              <button
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : done
                    ? "bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200"
                    : "bg-gray-100 text-gray-400 cursor-default"
                }`}
                onClick={() => { if (done && job) setStep(i); }}
                disabled={!done && !active}
              >
                {done ? "✓ " : ""}{label}
              </button>
              {i < STEPS.length - 1 && <span className="text-gray-300 text-xs">›</span>}
            </div>
          );
        })}
      </div>

      {/* Existing jobs panel — show only on step 0 */}
      {step === 0 && <JobList onSelect={(j) => { setJob(j); updateUrl(j.id); setStep(3); }} />}

      {/* Active step */}
      {step === 0 && <JDInput onCreated={handleJobCreated} />}
      {step === 1 && job && <RequirementsEditor job={job} onSaved={handleRequirementsSaved} />}
      {step === 2 && job && <WeightConfig job={job} onSaved={handleWeightsSaved} />}
      {step === 3 && job && <ResumeUpload job={job} onScored={handleScored} />}
      {step === 4 && job && (
        <ResultsDashboard jobId={job.id} onBack={handleReset} />
      )}
    </div>
  );
}

/** Quick list of existing jobs so recruiters can return to previous postings. */
function JobList({ onSelect }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { jobs: jobsApi } = await import("../../services/api");
        setJobs(await jobsApi.list());
      } catch {
        // Not critical — list stays empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || jobs.length === 0) return null;

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Existing Job Postings</h3>
      <div className="space-y-1">
        {jobs.map((j) => (
          <button
            key={j.id}
            onClick={() => onSelect(j)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-blue-50 hover:text-blue-700 text-left"
          >
            <span>{j.title}</span>
            <span className="text-xs text-gray-400">{j.candidate_count} candidate(s)</span>
          </button>
        ))}
      </div>
    </div>
  );
}
