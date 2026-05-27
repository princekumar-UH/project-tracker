import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { formatDate, getPhaseName, isProjectLate, GRACE_PERIOD_DAYS } from "../utils/helpers";
import SegmentedProgressBar from "./segmentedProgressBar";
import type { Project, ReleaseItem } from "../types";

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const [items, setItems] = useState<ReleaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [itemToDelete, setItemToDelete] = useState<ReleaseItem | null>(null);

  const isLate = isProjectLate(project.target_end_date);
  const today = new Date();
  const targetDate = new Date(project.target_end_date);
  const diffDays = (today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
  const isInGracePeriod = diffDays > 0 && diffDays <= GRACE_PERIOD_DAYS;

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("release_items")
        .select("*")
        .eq("project_id", project.id)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching release items:", error);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error("Error fetching release items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
    fetchItems();
  }, [project.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("release_items")
        .insert([
          {
            project_id: project.id,
            title: title.trim(),
            description: description.trim() || null,
          },
        ]);

      if (error) {
        console.error("Error adding release item:", error);
      } else {
        setTitle("");
        setDescription("");
        await fetchItems();
      }
    } catch (err) {
      console.error("Error adding release item:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsSubmitting(true);
    const id = itemToDelete.id;
    setItemToDelete(null);
    try {
      const { error } = await supabase
        .from("release_items")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting release item:", error);
      } else {
        await fetchItems();
      }
    } catch (err) {
      console.error("Error deleting release item:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg-page px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button and Actions Header */}
        <div className="mb-6 flex justify-start">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBack();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold text-sm rounded-lg border border-gray-200 dark:border-zinc-700 shadow-xs cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Project Overview Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-brand-bg-card border border-brand-border rounded-xl shadow-xs p-6 text-left">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold rounded-md uppercase tracking-wider border border-indigo-100/50 dark:border-indigo-900/30 w-fit">
                  {getPhaseName(project.current_phase_id)}
                </span>
                {isLate && (
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 animate-pulse flex items-center gap-1 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/40">
                    <span className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full"></span>
                    DELAYED
                  </span>
                )}
                {isInGracePeriod && (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/40">
                    <span className="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full"></span>
                    GRACE PERIOD
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-black text-brand-text-title tracking-tight m-0">
                {project.project_name}
              </h1>

              <div className="mt-4 space-y-2 text-sm text-brand-text-main">
                <p><span className="font-semibold text-brand-text-title">Lead:</span> {project.project_lead}</p>
                <p><span className="font-semibold text-brand-text-title">Team Size:</span> {project.team_size}</p>
                <p><span className="font-semibold text-brand-text-title">Progress:</span> {project.percent_complete}%</p>
              </div>

              {/* Progress visual */}
              <div className="mt-4">
                <SegmentedProgressBar
                  currentPhaseId={project.current_phase_id}
                  targetDate={project.target_end_date}
                />
              </div>

              {/* Status dates */}
              <div className="flex justify-between items-center text-xs mt-6 pt-4 border-t border-brand-border">
                <div className="flex flex-col">
                  <span className="font-bold text-[9px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Start Date</span>
                  <span className="text-brand-text-main font-medium mt-0.5">
                    {formatDate(project.start_date)}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-bold text-[9px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Target End</span>
                  <span className="text-brand-text-main font-medium mt-0.5">
                    {formatDate(project.target_end_date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Release Items Manager */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-bg-card border border-brand-border rounded-xl shadow-xs p-6 text-left">
              <div className="flex justify-between items-center pb-4 border-b border-brand-border mb-6">
                <h2 className="text-xl font-bold text-brand-text-title m-0 flex items-center gap-2.5">
                  Release Items
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100/50 dark:border-indigo-900/30">
                    {isLoading ? "..." : items.length}
                  </span>
                </h2>
              </div>

              {/* Add New Release Item Form */}
              <form onSubmit={handleAdd} className="space-y-4 mb-8 bg-gray-50 dark:bg-zinc-900/40 p-4.5 rounded-xl border border-brand-border">
                <h3 className="text-xs font-extrabold text-brand-text-title uppercase tracking-wider m-0">Add Release Point</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div className="sm:col-span-1 space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Title</label>
                    <input
                      placeholder="e.g., Auth Module"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-brand-bg-card border border-brand-border p-2.5 rounded-lg text-sm text-brand-text-title outline-none transition-all input-focus-ring"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Description (Optional)</label>
                    <input
                      placeholder="e.g., Setup OAuth & JWT"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-brand-bg-card border border-brand-border p-2.5 rounded-lg text-sm text-brand-text-title outline-none transition-all input-focus-ring"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      Add Point
                    </button>
                  </div>
                </div>
              </form>

              {/* Release Items List */}
              <div className="space-y-3">
                {isLoading ? (
                  // Simple loading skeleton
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-4 border border-brand-border rounded-xl animate-pulse">
                      <div className="w-5 h-5 skeleton rounded-full mt-0.5"></div>
                      <div className="space-y-2 w-full">
                        <div className="h-4.5 skeleton rounded w-1/3"></div>
                        <div className="h-3.5 skeleton rounded w-2/3"></div>
                      </div>
                    </div>
                  ))
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="group flex justify-between items-start p-4 border border-brand-border rounded-xl bg-brand-bg-card hover:bg-gray-50/50 dark:hover:bg-zinc-900/20 transition-all"
                    >
                      <div className="flex gap-3.5">
                        {/* Dot indicator */}
                        <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 text-indigo-500">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]"></span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-brand-text-title m-0 leading-tight">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-brand-text-main leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 inline-flex items-center justify-center p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-100 dark:hover:border-red-950/50 rounded-lg shadow-xs cursor-pointer transition-all duration-150"
                        title="Remove release item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-brand-bg-card border border-dashed border-gray-300 dark:border-zinc-800 rounded-xl">
                    <svg className="w-10 h-10 text-gray-300 dark:text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-bold text-brand-text-title">No release items</span>
                    <p className="text-xs text-brand-text-main mt-0.5">Add the initial release points above to populate the list.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-brand-bg-card border border-brand-border p-6 rounded-xl w-full max-w-[400px] text-center shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-brand-text-title m-0">Remove Release Point</h3>
              <p className="text-sm text-brand-text-main">
                Are you sure you want to remove <span className="font-bold text-brand-text-title">"{itemToDelete.title}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all"
              >
                Remove
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
            <span className="text-xs font-bold uppercase tracking-wider text-brand-text-title">Updating points...</span>
          </div>
        </div>
      )}
    </div>
  );
}
