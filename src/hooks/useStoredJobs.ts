import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Job } from "../types";

interface StoredJobsState {
  jobs: Job[];
  setJobs: Dispatch<SetStateAction<Job[]>>;
  isLoading: boolean;
}

export function useStoredJobs(
  key: string,
  initialJobs: Job[],
  parseJobs: (value: unknown) => Job[],
): StoredJobsState {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      try {
        const savedJobs = window.localStorage.getItem(key);
        if (savedJobs !== null && !cancelled) {
          setJobs(parseJobs(JSON.parse(savedJobs) as unknown));
        }
      } catch (error) {
        console.error("Unable to load saved jobs from localStorage.", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [key, parseJobs]);

  useEffect(() => {
    if (isLoading) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(jobs));
    } catch (error) {
      console.error("Unable to save jobs to localStorage.", error);
    }
  }, [isLoading, jobs, key]);

  return { jobs, setJobs, isLoading };
}
