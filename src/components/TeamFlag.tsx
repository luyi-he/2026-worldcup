import React from "react";

interface TeamFlagProps {
  teamId: string;
  className?: string;
  altText?: string;
}

const FLAG_MAPPING: Record<string, string> = {
  MEX: "mx",
  RSA: "za",
  USA: "us",
  PAR: "py",
  ARG: "ar",
  JPN: "jp",
  ENG: "gb-eng",
  KOR: "kr",
  BRA: "br",
  SEN: "sn",
};

export default function TeamFlag({ teamId, className = "w-6 h-4", altText }: TeamFlagProps) {
  const code = FLAG_MAPPING[teamId?.toUpperCase()] || "un";
  const url = `https://flagcdn.com/w80/${code}.png`;

  return (
    <img
      src={url}
      alt={altText || teamId}
      className={`inline-block object-cover shadow-sm bg-slate-100 border border-slate-200/60 rounded-sm ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => {
        // Simple fallback to a general flag search or hide if failing
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
