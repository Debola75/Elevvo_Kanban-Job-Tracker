import { useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  ArrowDownUp,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  FileText,
  Filter,
  LayoutGrid,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { columns, starterJobs } from "./data";
import { isStatus, parseJobs, type Job, type Status } from "./types";
import { useStoredJobs } from "./hooks/useStoredJobs";

interface JobFormValues {
  company: string;
  role: string;
  status: Status;
  location: string;
  salary: string;
}

function SkeletonCard() {
  return (
    <div className="job-card skeleton-card" aria-hidden="true">
      <div className="skeleton-line skeleton-heading" />
      <div className="skeleton-line skeleton-copy" />
      <div className="skeleton-line skeleton-copy short" />
      <div className="skeleton-divider" />
      <div className="skeleton-line skeleton-footer" />
    </div>
  );
}

function JobCard({ job, overlay = false }: { job: Job; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: job.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`job-card${isDragging && !overlay ? " job-card-dragging" : ""}${overlay ? " job-card-overlay" : ""}`}
      aria-label={`${job.role} at ${job.company}. Drag to change status.`}
    >
      <div className="job-card-top">
        <div className={`company-logo ${job.logoColor}`}>{job.logo}</div>
        <span className="icon-button card-menu" aria-hidden="true">
          <MoreHorizontal size={18} />
        </span>
      </div>
      <div className="job-title-block">
        <h3>{job.role}</h3>
        <p>{job.company}</p>
      </div>
      <div className="job-meta">
        <span><MapPin size={13} />{job.location}</span>
        <span><BriefcaseBusiness size={13} />{job.salary}</span>
      </div>
      <div className="job-card-footer">
        <span className="applied-date"><Clock3 size={13} />{job.appliedAt}</span>
        <span className="avatar avatar-small">{job.company.slice(0, 1)}</span>
      </div>
    </article>
  );
}

function BoardColumn({
  status,
  title,
  description,
  accent,
  dot,
  jobs,
  isLoading,
  onAdd,
}: {
  status: Status;
  title: string;
  description: string;
  accent: string;
  dot: string;
  jobs: Job[];
  isLoading: boolean;
  onAdd: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={`board-column ${accent}${isOver ? " column-over" : ""}`}
      aria-label={`${title} jobs`}
    >
      <div className="column-heading">
        <div className="column-title-row">
          <span className={`status-dot ${dot}`} />
          <h2>{title}</h2>
          <span className="job-count">{isLoading ? "—" : jobs.length}</span>
          <span className="icon-button column-menu" aria-hidden="true">
            <MoreHorizontal size={18} />
          </span>
        </div>
        <p>{description}</p>
      </div>
      <div className="column-cards">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <div className="empty-column">
            <span className="empty-icon"><FileText size={17} /></span>
            <p>No jobs here yet</p>
            <span>Drop a job here or add one</span>
          </div>
        )}
        {!isLoading && (
          <button type="button" className="add-card-button" onClick={onAdd}>
            <Plus size={16} /> Add a job
          </button>
        )}
      </div>
    </section>
  );
}

function AddJobModal({
  initialStatus,
  onClose,
  onSubmit,
}: {
  initialStatus: Status;
  onClose: () => void;
  onSubmit: (values: JobFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormValues>({
    defaultValues: {
      status: initialStatus,
      company: "",
      role: "",
      location: "",
      salary: "",
    },
  });

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="job-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">YOUR NEXT OPPORTUNITY</span>
            <h2 id="modal-title">Add a new job</h2>
            <p>Keep all the details in one place.</p>
          </div>
          <button type="button" className="icon-button close-modal" onClick={onClose} aria-label="Close dialog">
            <X size={19} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="job-form">
          <label>
            Company
            <input
              autoFocus
              placeholder="e.g. Linear"
              {...register("company", {
                required: "Company name is required.",
                validate: (value) => value.trim().length > 0 || "Company name is required.",
              })}
            />
            {errors.company && <span className="field-error">{errors.company.message}</span>}
          </label>
          <label>
            Job title
            <input
              placeholder="e.g. Product Designer"
              {...register("role", {
                required: "Job title is required.",
                validate: (value) => value.trim().length > 0 || "Job title is required.",
              })}
            />
            {errors.role && <span className="field-error">{errors.role.message}</span>}
          </label>
          <div className="form-row">
            <label>
              Status
              <select {...register("status", { required: true })}>
                {columns.map((column) => (
                  <option key={column.status} value={column.status}>{column.title}</option>
                ))}
              </select>
            </label>
            <label>
              Salary range
              <input placeholder="e.g. $120k – $150k" {...register("salary")} />
            </label>
          </div>
          <label>
            Location
            <input placeholder="e.g. Remote · United States" {...register("location")} />
          </label>
          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary"><Plus size={16} /> Add job</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const { jobs, setJobs, isLoading } = useStoredJobs("orbit-jobs-v1", starterJobs, parseJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalStatus, setModalStatus] = useState<Status | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [sortAscending, setSortAscending] = useState(true);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const visibleJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return jobs
      .filter((job) => filterStatus === "All" || job.status === filterStatus)
      .filter((job) =>
        !query || `${job.company} ${job.role} ${job.location}`.toLowerCase().includes(query),
      )
      .sort((left, right) =>
        left.company.localeCompare(right.company) * (sortAscending ? 1 : -1),
      );
  }, [filterStatus, jobs, searchQuery, sortAscending]);

  const openAddJob = (status: Status = "Applied") => setModalStatus(status);
  const handleAddJob = (values: JobFormValues) => {
    const company = values.company.trim();
    const role = values.role.trim();
    const newJob: Job = {
      id: crypto.randomUUID(),
      company,
      role,
      status: values.status,
      location: values.location.trim() || "Location not specified",
      salary: values.salary.trim() || "Salary not specified",
      appliedAt: "Just now",
      logo: company.slice(0, 1).toUpperCase(),
      logoColor: "logo-new",
    };
    setJobs((currentJobs) => [newJob, ...currentJobs]);
    setModalStatus(null);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const job = jobs.find((item) => item.id === active.id);
    setActiveJob(job ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveJob(null);
    if (!over || !isStatus(over.id)) return;
    const destination = over.id;
    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.id === active.id && job.status !== destination
          ? { ...job, status: destination }
          : job,
      ),
    );
  };

  const handleDragCancel = () => setActiveJob(null);

  const handleExport = () => {
    const contents = JSON.stringify(jobs, null, 2);
    const file = new Blob([contents], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "orbit-jobs.json";
    link.click();
    URL.revokeObjectURL(link.href);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Orbit home">
          <span className="brand-mark"><span /></span>
          <span>Octa<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-switcher">
          <span className="workspace-icon">J</span>
          <span className="workspace-name">Jamie’s workspace</span>
          <ChevronDown size={15} />
        </div>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#board"><LayoutGrid size={17} /> My board <span className="nav-count">{jobs.length}</span></a>
          <a className="nav-item" href="#board"><Target size={17} /> My goals</a>
          <a className="nav-item" href="#board"><CalendarDays size={17} /> Calendar</a>
        </nav>
        <div className="sidebar-section-label saved-label">SAVED VIEWS <button type="button" aria-label="Add saved view"><Plus size={14} /></button></div>
        <nav className="main-nav" aria-label="Saved views">
          <a className="nav-item" href="#board"><span className="saved-dot green" /> Active applications</a>
          <a className="nav-item" href="#board"><span className="saved-dot purple" /> This week</a>
          <a className="nav-item" href="#board"><span className="saved-dot orange" /> Follow-ups</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-sparkle"><Sparkles size={16} /></span>
            <p>Make your next move<br /><strong>your best one.</strong></p>
            <button type="button" onClick={handleExport}>Export your board <ArrowRight size={14} /></button>
          </div>
          <a href="#help" className="nav-item"><CircleHelp size={17} /> Help & feedback</a>
          <button type="button" className="profile-button">
            <span className="avatar profile-avatar">JC</span>
            <span className="profile-copy"><strong>Jamie Chen</strong><small>Free plan</small></span>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>

      <main className="main-area" id="board">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>My board</strong></div>
          <div className="topbar-actions">
            <button type="button" className="topbar-icon" aria-label="Notifications"><Bell size={17} /><i /></button>
            <span className="topbar-divider" />
            <button type="button" className="help-button"><CircleHelp size={16} /> Help</button>
            <span className="avatar top-avatar">JC</span>
          </div>
        </header>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow welcome-eyebrow"><span className="eyebrow-line" /> {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()).toUpperCase()}</div>
              <h1>Your next chapter <span>starts here.</span></h1>
              <p className="welcome-subtitle">A little progress every day adds up to something big.</p>
            </div>
            <button type="button" className="button button-primary new-job-button" onClick={() => openAddJob()}>
              <Plus size={17} /> Add a job
            </button>
          </div>

          <section className="insight-strip" aria-label="Job search summary">
            <div className="insight-item">
              <span className="insight-icon insight-icon-purple"><BriefcaseBusiness size={17} /></span>
              <span><strong>{isLoading ? "—" : jobs.length}</strong><small>Applications</small></span>
            </div>
            <span className="insight-divider" />
            <div className="insight-item">
              <span className="insight-icon insight-icon-blue"><CalendarDays size={17} /></span>
              <span><strong>{isLoading ? "—" : jobs.filter((job) => job.status === "Interviewing").length}</strong><small>Interviews</small></span>
            </div>
            <span className="insight-divider" />
            <div className="insight-item">
              <span className="insight-icon insight-icon-green"><Check size={17} /></span>
              <span><strong>{isLoading ? "—" : jobs.filter((job) => job.status === "Offer").length}</strong><small>Offers</small></span>
            </div>
            <div className="insight-tip"><Sparkles size={15} /><span><strong>You’re building momentum.</strong> Keep showing up — it’s working.</span></div>
          </section>

          <div className="board-toolbar">
            <div className="board-heading">
              <h2>Application board</h2>
              <span className="board-total">{isLoading ? "Loading" : `${jobs.length} total`}</span>
            </div>
            <div className="board-actions">
              <label className="search-box">
                <Search size={16} />
                <input
                  type="search"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  aria-label="Search jobs"
                />
                <kbd><Command size={11} /> K</kbd>
              </label>
              <label className="toolbar-button filter-select">
                <Filter size={15} />
                <select
                  aria-label="Filter jobs by status"
                  value={filterStatus}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFilterStatus(value === "All" || isStatus(value) ? value : "All");
                  }}
                >
                  <option value="All">Filter</option>
                  {columns.map((column) => <option key={column.status} value={column.status}>{column.title}</option>)}
                </select>
                <span className="filter-count">{filterStatus === "All" ? "0" : "1"}</span>
              </label>
              <button
                type="button"
                className="toolbar-button sort-button"
                onClick={() => setSortAscending((current) => !current)}
                aria-label={`Sort by company ${sortAscending ? "descending" : "ascending"}`}
              >
                <ArrowDownUp size={15} /><span>Sort</span><ChevronDown size={13} />
              </button>
              <button type="button" className="icon-button toolbar-more" aria-label="More board options"><MoreHorizontal size={19} /></button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="kanban-board">
              {columns.map((column) => (
                <BoardColumn
                  key={column.status}
                  {...column}
                  jobs={visibleJobs.filter((job) => job.status === column.status)}
                  isLoading={isLoading}
                  onAdd={() => openAddJob(column.status)}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeJob ? <JobCard job={activeJob} overlay /> : null}
            </DragOverlay>
          </DndContext>

          <footer className="board-footer">
            <span><span className="footer-live-dot" /> All changes saved</span>
            <button type="button" onClick={handleExport}><FileText size={14} /> Export board</button>
            <span className="footer-tip"><Sparkles size={13} /> Tip: drag a card to update its status</span>
          </footer>
        </section>
      </main>

      {modalStatus && (
        <AddJobModal
          initialStatus={modalStatus}
          onClose={() => setModalStatus(null)}
          onSubmit={handleAddJob}
        />
      )}
      {savedNotice && <div className="toast"><Check size={16} /> Board exported successfully</div>}
    </div>
  );
}

export default App;
