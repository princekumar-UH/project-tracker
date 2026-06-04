import React, { useState, useEffect } from "react";
import { PROJECT_PHASES, calculateCompletion } from "../utils/helpers";
import type { Project } from "../types";

interface ProjectFormProps {
  initialData: Project | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function ProjectForm({ initialData, onSubmit, onClose }: ProjectFormProps) {
  const defaultForm = {
    project_name: "",
    project_lead: "",
    team_size: "" as string | number,
    start_date: "",
    target_end_date: "",
    current_phase_id: 1 as number | string,
    extended_delivery_date: "",
  };

  const [form, setForm] = useState({
    ...defaultForm,
    ...(initialData ? {
      ...initialData,
      extended_delivery_date: initialData.extended_delivery_date || ""
    } : {})
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...form,
      percent_complete: calculateCompletion(form.current_phase_id),
      extended_delivery_date: form.extended_delivery_date || null,
    };
    onSubmit(finalData);
  };

  return (
    <div
      onClick={(e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-brand-bg-card border border-brand-border p-6 rounded-xl w-full max-w-[440px] space-y-4.5 shadow-xl animate-in fade-in zoom-in-95 duration-200 text-left"
      >
        <h2 className="text-xl font-extrabold text-brand-text-title m-0 pb-2.5 border-b border-brand-border">
          {initialData ? "Edit Project" : "Add Project"}
        </h2>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 ml-0.5">
            Project Name
          </label>
          <input
            name="project_name"
            placeholder="Project Name"
            value={form.project_name}
            onChange={handleChange}
            className="w-full bg-brand-bg-card border border-brand-border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-brand-text-title placeholder-gray-400 dark:placeholder-zinc-600 outline-none transition-all text-sm input-focus-ring"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 ml-0.5">
            Project Lead
          </label>
          <input
            name="project_lead"
            placeholder="Project Lead"
            value={form.project_lead}
            onChange={handleChange}
            className="w-full bg-brand-bg-card border border-brand-border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-brand-text-title placeholder-gray-400 dark:placeholder-zinc-600 outline-none transition-all text-sm input-focus-ring"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 ml-0.5">
              Team Size
            </label>
            <input
              type="number"
              name="team_size"
              placeholder="Team Size"
              value={form.team_size}
              onChange={handleChange}
              className="w-full bg-brand-bg-card border border-brand-border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-brand-text-title placeholder-gray-400 dark:placeholder-zinc-600 outline-none transition-all text-sm input-focus-ring"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 ml-0.5">
              Current Phase
            </label>
            <select
              name="current_phase_id"
              value={form.current_phase_id}
              onChange={handleChange}
              className="w-full bg-brand-bg-card border border-brand-border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-brand-text-title outline-none transition-all text-sm bg-white dark:bg-zinc-900 cursor-pointer input-focus-ring"
            >
              {PROJECT_PHASES.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.name} ({phase.weight}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 ml-0.5">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className="w-full bg-brand-bg-card border border-brand-border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-brand-text-title outline-none transition-all text-sm input-focus-ring"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 ml-0.5">
              Target End Date
            </label>
            <input
              type="date"
              name="target_end_date"
              value={form.target_end_date}
              onChange={handleChange}
              className="w-full bg-brand-bg-card border border-brand-border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-brand-text-title outline-none transition-all text-sm input-focus-ring"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 ml-0.5">
            Extended Delivery Date (Optional)
          </label>
          <input
            type="date"
            name="extended_delivery_date"
            value={form.extended_delivery_date || ""}
            onChange={handleChange}
            className="w-full bg-brand-bg-card border border-brand-border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-brand-text-title outline-none transition-all text-sm input-focus-ring"
          />
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 flex justify-between items-center mt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            Calculated Progress
          </span>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            {calculateCompletion(form.current_phase_id)}%
          </span>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-brand-border mt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
