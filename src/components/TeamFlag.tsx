import React from "react";

interface TeamFlagProps {
  teamId: string;
  className?: string;
  altText?: string;
}

const FLAG_MAPPING: Record<string, string> = {
  // Group A
  MEX: "mx",
  RSA: "za",
  KOR: "kr",
  CZE: "cz",
  // Group B
  CAN: "ca",
  BIH: "ba",
  QAT: "qa",
  SUI: "ch",
  // Group C
  BRA: "br",
  MAR: "ma",
  HAI: "ht",
  SCO: "gb-sct",
  // Group D
  USA: "us",
  PAR: "py",
  AUS: "au",
  TUR: "tr",
  // Group E
  GER: "de",
  CUW: "cw",
  CIV: "ci",
  ECU: "ec",
  // Group F
  NED: "nl",
  JPN: "jp",
  SWE: "se",
  TUN: "tn",
  // Group G
  BEL: "be",
  EGY: "eg",
  IRN: "ir",
  NZL: "nz",
  // Group H
  ESP: "es",
  CPV: "cv",
  KSA: "sa",
  URU: "uy",
  // Group I
  FRA: "fr",
  SEN: "sn",
  IRQ: "iq",
  NOR: "no",
  // Group J
  ARG: "ar",
  ALG: "dz",
  AUT: "at",
  JOR: "jo",
  // Group K
  POR: "pt",
  COD: "cd",
  UZB: "uz",
  COL: "co",
  // Group L
  ENG: "gb-eng",
  CRO: "hr",
  GHA: "gh",
  PAN: "pa",
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
