'use client';

/**
 * ProjectInfoHeader component.
 * Displays editable project metadata fields above the table,
 * matching the layout shown in the reference image.
 */

import React from 'react';
import { ProjectInfo } from '@/types/tableTypes';

interface ProjectInfoHeaderProps {
  projectInfo: ProjectInfo;
  onChange: (info: ProjectInfo) => void;
}

export default function ProjectInfoHeader({ projectInfo, onChange }: ProjectInfoHeaderProps) {
  const handleChange = (field: keyof ProjectInfo, value: string) => {
    onChange({ ...projectInfo, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Title */}
      <h2 className="text-center text-lg font-bold text-gray-800 mb-6 uppercase tracking-wide">
        Justifications on Time Extension Request
      </h2>

      {/* Two-column layout for project info fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3">
        {/* Left Column */}
        <div className="space-y-3">
          <InfoField
            label="Client"
            value={projectInfo.client}
            onChange={(v) => handleChange('client', v)}
          />
          <InfoField
            label="Name of Project"
            value={projectInfo.nameOfProject}
            onChange={(v) => handleChange('nameOfProject', v)}
          />
          <InfoField
            label="Project Location"
            value={projectInfo.projectLocation}
            onChange={(v) => handleChange('projectLocation', v)}
          />
          <InfoField
            label="Main Contractor"
            value={projectInfo.mainContractor}
            onChange={(v) => handleChange('mainContractor', v)}
          />
          <InfoField
            label="Consultant"
            value={projectInfo.consultant}
            onChange={(v) => handleChange('consultant', v)}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <InfoField
            label="Project Contract Time (in terms of Date)"
            value={projectInfo.projectContractTime}
            onChange={(v) => handleChange('projectContractTime', v)}
          />
          <InfoField
            label="Project Signed Date"
            value={projectInfo.projectSignedDate}
            onChange={(v) => handleChange('projectSignedDate', v)}
            type="date"
          />
          <InfoField
            label="Actual Project Started Date"
            value={projectInfo.actualProjectStartedDate}
            onChange={(v) => handleChange('actualProjectStartedDate', v)}
            type="date"
          />
          <InfoField
            label="Project Started Date according to Contract"
            value={projectInfo.projectStartedDateAccordingToContract}
            onChange={(v) => handleChange('projectStartedDateAccordingToContract', v)}
            type="date"
          />
          <InfoField
            label="Site Acceptance Date"
            value={projectInfo.siteAcceptanceDate}
            onChange={(v) => handleChange('siteAcceptanceDate', v)}
            type="date"
          />
        </div>
      </div>
    </div>
  );
}

/** Reusable inline field component with label and underlined input */
function InfoField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-semibold text-gray-700 whitespace-nowrap min-w-[120px]">
        {label}:
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border-b border-gray-400 bg-transparent px-1 py-0.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition-colors"
        placeholder="_______________"
      />
    </div>
  );
}
