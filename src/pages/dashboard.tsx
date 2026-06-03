import { useEffect, useState } from "react";
import ProjectCard from "../components/projectCard";
import ProjectForm from "../components/projectForm";
import ProjectDetail from "../components/projectDetail";
import { supabase } from "../utils/supabase";
import { sanitizeProject, isProjectLate, GRACE_PERIOD_DAYS } from "../utils/helpers";
import type { Project } from "../types";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const ADMIN_SECRET_KEY = "project-tracker-admin-2026";

  const fetchProjects = async (showSkeleton = false) => {
    if (showSkeleton) setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects((data as Project[]) || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      if (showSkeleton) setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const secret = localStorage.getItem("admin_secret");
      if (secret === ADMIN_SECRET_KEY) {
        setIsAdmin(true);
      }
      await fetchProjects(true);
    };

    init();
  }, []);

  const handleAdd = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleSubmit = async (formData: any) => {
    const timestamp = new Date().toISOString().split("T")[0];

    const projectData = {
      ...sanitizeProject(formData),
      status_last_updated: timestamp,
    };

    setIsSubmitting(true);
    try {
      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingProject.id);

        if (error) {
          console.error("Error updating project:", error);
          return;
        }
      } else {
        const { error } = await supabase.from("projects").insert([projectData]);

        if (error) {
          console.error("Error adding project:", error);
          return;
        }
      }

      await fetchProjects(false);
      setShowForm(false);
    } catch (err) {
      console.error("Error submitting project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setIsSubmitting(true);
    const id = projectToDelete.id;
    setProjectToDelete(null);
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) {
        console.error("Error deleting project:", error);
      } else {
        if (selectedProject?.id === id) {
          setSelectedProject(null);
        }
        await fetchProjects(false);
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inline KPI calculation
  const totalProjects = projects.length;
  const delayedProjects = projects.filter((p) => isProjectLate(p.target_end_date)).length;
  const gracePeriodProjects = projects.filter((p) => {
    const today = new Date();
    const targetDate = new Date(p.target_end_date);
    const diffDays = (today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= GRACE_PERIOD_DAYS;
  }).length;
  const onTrackProjects = totalProjects - delayedProjects - gracePeriodProjects;

  const renderSkeletons = () => (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-brand-bg-card border border-brand-border rounded-xl p-6 space-y-5 animate-pulse text-left">
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2.5 w-full">
              <div className="h-5.5 skeleton rounded-md w-2/3"></div>
              <div className="h-4 skeleton rounded-md w-1/2"></div>
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="h-7 w-12 skeleton rounded-lg"></div>
              <div className="h-7 w-14 skeleton rounded-lg"></div>
            </div>
          </div>
          {/* Phase & percentage */}
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 w-24 skeleton rounded-md"></div>
            <div className="h-5 w-10 skeleton rounded-md"></div>
          </div>
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-1.5 skeleton rounded-md w-full"></div>
            <div className="h-5.5 skeleton rounded-md w-full"></div>
          </div>
          {/* Dates */}
          <div className="flex justify-between items-center pt-4 border-t border-brand-border">
            <div className="space-y-1 w-1/3">
              <div className="h-3 skeleton rounded w-1/2"></div>
              <div className="h-4 skeleton rounded w-3/4"></div>
            </div>
            <div className="space-y-1 w-1/3 flex flex-col items-end">
              <div className="h-3 skeleton rounded w-1/2"></div>
              <div className="h-4 skeleton rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );

  // Conditional Rendering: If a project is selected, show detail view instead
  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        isAdmin={isAdmin}
        onBack={() => {
          setSelectedProject(null);
          window.scrollTo({ top: 0 });
          fetchProjects(false);
        }}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-brand-bg-page px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="text-left">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-brand-text-title tracking-tight sm:text-4xl m-0">
                  Project Dashboard
                </h1>
                <button
                  onClick={() => {
                    setPasscode("");
                    setPasscodeError("");
                    setShowLockModal(true);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    isAdmin
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                      : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-gray-100"
                  }`}
                  title={isAdmin ? "You are in Admin Mode. Click to manage." : "Enter Admin Mode"}
                >
                  {isAdmin ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h16.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Admin
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Read Only
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-brand-text-main">
                Track, monitor, and deliver your pipeline milestones on time.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Project
              </button>
            )}
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left">
            <div className="bg-brand-bg-card border border-brand-border p-4.5 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Projects</span>
              {isLoading ? (
                <div className="h-7 w-12 skeleton rounded-md mt-1"></div>
              ) : (
                <span className="text-2xl font-bold text-brand-text-title mt-1 block">{totalProjects}</span>
              )}
            </div>
            <div className="bg-brand-bg-card border border-brand-border p-4.5 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wider block">On Track</span>
              {isLoading ? (
                <div className="h-7 w-12 skeleton rounded-md mt-1"></div>
              ) : (
                <span className="text-2xl font-bold text-brand-text-title mt-1 block">{onTrackProjects}</span>
              )}
            </div>
            <div className="bg-brand-bg-card border border-brand-border p-4.5 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-amber-500 dark:text-amber-400 uppercase tracking-wider block">Grace Period</span>
              {isLoading ? (
                <div className="h-7 w-12 skeleton rounded-md mt-1"></div>
              ) : (
                <span className="text-2xl font-bold text-brand-text-title mt-1 block">{gracePeriodProjects}</span>
              )}
            </div>
            <div className="bg-brand-bg-card border border-brand-border p-4.5 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider block">Delayed</span>
              {isLoading ? (
                <div className="h-7 w-12 skeleton rounded-md mt-1"></div>
              ) : (
                <span className="text-2xl font-bold text-brand-text-title mt-1 block">{delayedProjects}</span>
              )}
            </div>
          </div>

          {/* Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              renderSkeletons()
            ) : projects.length > 0 ? (
              projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onEdit={() => handleEdit(p)}
                  onDelete={() => setProjectToDelete(p)}
                  onClick={() => {
                    window.scrollTo({ top: 0 });
                    setSelectedProject(p);
                  }}
                  isAdmin={isAdmin}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center p-12 bg-brand-bg-card border border-dashed border-gray-300 dark:border-zinc-800 rounded-2xl shadow-xs">
                <svg className="w-12 h-12 text-gray-300 dark:text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-base font-semibold text-brand-text-title">No projects tracked</h3>
                <p className="mt-1 text-sm text-brand-text-main max-w-xs">
                  Create a new project pipeline card to start tracking progress.
                </p>
                {isAdmin && (
                  <button
                    onClick={handleAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-sm rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                  >
                    Create Project
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <ProjectForm
          key={editingProject?.id || "new"}
          initialData={editingProject}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-brand-bg-card border border-brand-border p-6 rounded-xl w-full max-w-[400px] text-center shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-brand-text-title m-0">Delete Project</h3>
              <p className="text-sm text-brand-text-main">
                Are you sure you want to delete <span className="font-bold text-brand-text-title">"{projectToDelete.project_name}"</span>? This will permanently delete the project and all of its release items.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global mutation overlay spinner */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-xs flex flex-col items-center justify-center z-50">
          <div className="bg-brand-bg-card border border-brand-border p-5 rounded-2xl shadow-xl flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            <svg className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-text-title">Saving changes...</span>
          </div>
        </div>
      )}

      {/* Passcode / Access Control Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-brand-bg-card border border-brand-border p-6 rounded-xl w-full max-w-[400px] text-left shadow-xl space-y-4.5 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-brand-text-title m-0 pb-2 border-b border-brand-border">
              {isAdmin ? "Admin Access" : "Access Management"}
            </h3>

            {isAdmin ? (
              <div className="space-y-4">
                <p className="text-sm text-brand-text-main">
                  You are currently in <span className="font-bold text-emerald-600 dark:text-emerald-400">Admin Mode</span>. You have full edit and delete permissions.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLockModal(false)}
                    className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("admin_secret");
                      setIsAdmin(false);
                      setShowLockModal(false);
                    }}
                    className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all"
                  >
                    Exit Admin Mode
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (passcode === ADMIN_SECRET_KEY) {
                    localStorage.setItem("admin_secret", passcode);
                    setIsAdmin(true);
                    setShowLockModal(false);
                    setPasscodeError("");
                  } else {
                    setPasscodeError("Invalid admin passcode. Access denied.");
                  }
                }}
                className="space-y-4"
              >
                <p className="text-sm text-brand-text-main">
                  Enter the admin passcode to unlock editing, creating, and deleting projects.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 ml-0.5">
                    Passcode
                  </label>
                  <input
                    type="password"
                    placeholder="Enter admin passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-brand-bg-card border border-brand-border p-2.5 rounded-lg text-sm text-brand-text-title outline-none transition-all input-focus-ring"
                    required
                    autoFocus
                  />
                  {passcodeError && (
                    <p className="text-xs text-red-500 font-semibold mt-1">{passcodeError}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLockModal(false)}
                    className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
