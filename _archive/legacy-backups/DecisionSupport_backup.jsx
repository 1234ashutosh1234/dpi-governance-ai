import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

const DISTRICTS = [
  "Patna",
  "Katihar",
  "Gaya",
  "Muzaffarpur",
  "Bhagalpur",
];

const CATEGORIES = [
  "Water Supply",
  "Roads",
  "Healthcare",
  "Electricity",
  "Education",
];

const DISTRICT_POPULATIONS = {
  Patna: 5838465,
  Katihar: 3071702,
  Gaya: 4391418,
  Muzaffarpur: 4801062,
  Bhagalpur: 3038114,
};

const DEFAULT_PROJECTS = {
  "Water Supply": {
    project: "Drinking Water Infrastructure Improvement",

    actions: [
      "Repair damaged water pipelines",
      "Expand reliable drinking-water coverage",
      "Prioritize areas with repeated citizen complaints",
      "Monitor local water-supply availability",
    ],

    reason:
      "The issue should be included in the medium-term development planning cycle.",

    investment: 850,
    infrastructureGap: 18,
    vulnerability: 45,
    urgency: 18,
    infrastructureAccess: 82,
    populationDensity: 1823,
  },

  Roads: {
    project: "Road Infrastructure Rehabilitation",

    actions: [
      "Repair damaged roads and potholes",
      "Prioritize high-demand road segments",
      "Improve rural road connectivity",
      "Monitor road quality after intervention",
    ],

    reason:
      "Road infrastructure should be included in the medium-term development planning cycle.",

    investment: 850,
    infrastructureGap: 32,
    vulnerability: 45,
    urgency: 22,
    infrastructureAccess: 68,
    populationDensity: 1823,
  },

  Healthcare: {
    project: "Primary Healthcare Infrastructure Improvement",

    actions: [
      "Improve availability of healthcare staff",
      "Strengthen local health centres",
      "Prioritize underserved communities",
      "Monitor essential healthcare availability",
    ],

    reason:
      "Healthcare access should be strengthened through targeted development planning.",

    investment: 700,
    infrastructureGap: 24,
    vulnerability: 45,
    urgency: 24,
    infrastructureAccess: 76,
    populationDensity: 1823,
  },

  Electricity: {
    project: "Rural Electricity Reliability Improvement",

    actions: [
      "Repair unreliable electricity infrastructure",
      "Prioritize areas with repeated complaints",
      "Improve power reliability",
      "Monitor electricity service availability",
    ],

    reason:
      "Electricity reliability should be addressed through targeted infrastructure improvements.",

    investment: 650,
    infrastructureGap: 9,
    vulnerability: 45,
    urgency: 9,
    infrastructureAccess: 91,
    populationDensity: 1823,
  },

  Education: {
    project: "Government School Infrastructure Improvement",

    actions: [
      "Repair damaged school buildings",
      "Improve essential school infrastructure",
      "Prioritize schools with repeated complaints",
      "Monitor school infrastructure conditions",
    ],

    reason:
      "Education infrastructure should be included in the medium-term development planning cycle.",

    investment: 750,
    infrastructureGap: 20.75,
    vulnerability: 45,
    urgency: 21,
    infrastructureAccess: 79.25,
    populationDensity: 1823,
  },
};

function safeNumber(value, fallback = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return number;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(
    max,
    Math.max(
      min,
      safeNumber(value)
    )
  );
}

export default function DecisionSupport({
  district: districtProp = "Patna",
  category: categoryProp = "Water Supply",
}) {
  return <div>Legacy Backup Component</div>;
}
