export type Status = "Applied" | "Interviewing" | "Offer" | "Rejected";

export interface Job {
  id: string;
  company: string;
  role: string;
  status: Status;
  location: string;
  salary: string;
  appliedAt: string;
  logo: string;
  logoColor: string;
}

export interface Column {
  status: Status;
  title: string;
  description: string;
  accent: string;
  dot: string;
}

export const STATUSES: Status[] = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
];

export const isStatus = (value: unknown): value is Status =>
  STATUSES.some((status) => status === value);

export const isJob = (value: unknown): value is Job => {
  if (typeof value !== "object" || value === null) return false;
  const job = value as Record<string, unknown>;

  return (
    typeof job.id === "string" &&
    typeof job.company === "string" &&
    typeof job.role === "string" &&
    isStatus(job.status) &&
    typeof job.location === "string" &&
    typeof job.salary === "string" &&
    typeof job.appliedAt === "string" &&
    typeof job.logo === "string" &&
    typeof job.logoColor === "string"
  );
};

export const parseJobs = (value: unknown): Job[] => {
  if (!Array.isArray(value) || !value.every(isJob)) {
    throw new Error("Saved job data is not in the expected format.");
  }
  return value;
};
