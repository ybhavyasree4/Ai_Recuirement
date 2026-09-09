"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faUsers,
  faBriefcase,
  faFileCircleCheck,
  faMagnifyingGlass,
  faChartLine,
  faRobot,
  faUserCheck,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";

export default function HomePage() {
  const exploreFeatures = () => {
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const features = [
    [
      faFileCircleCheck,
      "Resume Screening",
      "Extract candidate information automatically.",
    ],
    [
      faUsers,
      "Candidate Profiling",
      "Create profiles with education, skills and experience.",
    ],
    [
      faMagnifyingGlass,
      "Job Matching",
      "Compare candidate skills with job requirements.",
    ],
    [
      faUserCheck,
      "Skill Gap Analysis",
      "Identify available and missing skills.",
    ],
    [
      faChartLine,
      "Candidate Ranking",
      "Prioritize stronger candidates automatically.",
    ],
    [
      faRobot,
      "AI Recommendations",
      "Generate AI-powered hiring insights.",
    ],
  ];

  const steps = [
    ["01", "Upload", "Add candidate resumes"],
    ["02", "Profile", "Extract candidate information"],
    ["03", "Match", "Compare job requirements"],
    ["04", "Rank", "Prioritize candidates"],
    ["05", "Decide", "Review AI insights"],
  ];

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden bg-[#050816] text-white">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="w-full px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7 lg:px-10 xl:px-12">
        <div className="flex w-full items-center justify-between gap-4">
          {/* LOGO */}

          <Link
            href="/home"
            className="flex min-w-0 shrink-0 items-center gap-3 sm:gap-4 md:gap-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 sm:h-14 sm:w-14 md:h-16 md:w-16">
              <FontAwesomeIcon
                icon={faBrain}
                className="text-xl text-cyan-400 sm:text-2xl md:text-[28px]"
              />
            </div>

            <div className="min-w-0">
              <h1 className="whitespace-nowrap text-2xl font-bold sm:text-[28px] md:text-[32px]">
                Talent<span className="text-cyan-400">IQ</span>
              </h1>

              <p className="mt-0.5 whitespace-nowrap text-[8px] tracking-[0.14em] text-gray-500 sm:text-[9px] md:text-[10px]">
                TALENT INTELLIGENCE
              </p>
            </div>
          </Link>

          {/* LOGIN / SIGN UP */}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white sm:px-5 sm:py-3 sm:text-base md:px-6 md:text-lg"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-300 sm:px-6 sm:py-3 sm:text-base md:px-7 md:py-3.5 md:text-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="flex min-h-[calc(100vh-90px)] w-full items-center px-4 py-16 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT HERO */}



<div className="w-full max-w-[720px]">
  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400 sm:text-base">
    AI-Powered Recruitment
  </p>

  <h2 className="mt-5 text-[clamp(46px,5.5vw,78px)] font-bold leading-[1.02] tracking-[-0.04em]">
    Hire smarter.
    <span className="mt-2 block text-cyan-400">
      Find better talent.
    </span>
  </h2>

  <p className="mt-7 max-w-[650px] text-base leading-[1.7] text-gray-400 sm:text-lg md:text-xl">
    TalentIQ helps recruiters screen resumes, understand candidate
    profiles, match talent with jobs, analyze skill gaps, and make
    data-driven hiring decisions with AI-powered intelligence.
  </p>

  <button
    onClick={exploreFeatures}
    className="mt-8 inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-semibold transition hover:bg-white/10 sm:text-lg"
  >
    Explore TalentIQ

    <FontAwesomeIcon
      icon={faArrowDown}
      className="ml-3"
    />
  </button>
</div>



          {/* RIGHT PANEL */}

          <div className="w-full max-w-[760px] rounded-3xl border border-white/5 bg-[#0b1020] p-8 sm:p-10 md:p-12">
            <p className="text-base font-semibold tracking-wide text-cyan-400">
              TALENT INTELLIGENCE
            </p>

            <h3 className="mt-3 text-[clamp(32px,2.5vw,42px)] font-bold">
              Smarter Recruitment
            </h3>

            <p className="mt-3 text-lg text-gray-500">
              AI-powered insights for better hiring
            </p>

            {/* STATS */}

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat
                icon={faUsers}
                title="Candidates"
                value="9K+"
              />

              <Stat
                icon={faBriefcase}
                title="Jobs"
                value="28+"
              />

              <Stat
                icon={faFileCircleCheck}
                title="Applications"
                value="10K+"
              />

              <Stat
                icon={faUserCheck}
                title="Matching"
                value="AI"
              />
            </div>

            {/* TOOLS */}

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Mini
                icon={faFileCircleCheck}
                title="Resume Screening"
              />

              <Mini
                icon={faUsers}
                title="Candidate Profiling"
              />

              <Mini
                icon={faMagnifyingGlass}
                title="Job Matching"
              />

              <Mini
                icon={faChartLine}
                title="Smart Ranking"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        id="features"
        className="w-full border-t border-white/[0.04] px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:px-10 lg:py-28 xl:px-12"
      >
        <div className="w-full">
          {/* HEADER */}

          <div className="mb-10 text-center sm:mb-12 md:mb-16">
            <p className="text-sm font-semibold tracking-wide text-cyan-400 sm:text-base">
              TALENTIQ FEATURES
            </p>

            <h3 className="mt-3 text-[clamp(30px,4vw,54px)] font-bold leading-tight">
              Everything recruiters need
            </h3>

            <p className="mx-auto mt-4 max-w-[700px] text-sm leading-relaxed text-gray-500 sm:text-base md:text-lg">
              Simplify candidate screening, matching and hiring decisions.
            </p>
          </div>

          {/* FEATURE CARDS */}

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:gap-6">
            {features.map(([icon, title, text]) => (
              <Feature
                key={title}
                icon={icon}
                title={title}
                text={text}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="w-full border-t border-white/[0.04] px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:px-10 lg:py-28 xl:px-12">
        <div className="w-full">
          {/* HEADER */}

          <div className="mb-10 text-center sm:mb-12 md:mb-16">
            <p className="text-sm font-semibold tracking-wide text-cyan-400 sm:text-base">
              HOW IT WORKS
            </p>

            <h3 className="mt-3 text-[clamp(30px,4vw,54px)] font-bold leading-tight">
              From resume to hiring decision
            </h3>
          </div>

          {/* STEPS */}

          <div className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5 xl:gap-8">
            {steps.map(([number, title, text]) => (
              <Step
                key={number}
                number={number}
                title={title}
                text={text}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="w-full border-t border-white/[0.04] px-4 py-7 text-center text-xs text-gray-600 sm:text-sm">
        TalentIQ — AI-Powered Recruitment Platform
      </footer>
    </main>
  );
}

/* =========================================================
   STAT COMPONENT
========================================================= */

function Stat({ icon, title, value }) {
  return (
    <div className="min-w-0 rounded-lg bg-white/[0.04] p-3 sm:p-3.5 md:p-4">
      <FontAwesomeIcon
        icon={icon}
        className="text-xs text-cyan-400 sm:text-sm"
      />

      <p className="mt-2 truncate text-[9px] text-gray-500 sm:text-[10px] md:text-xs">
        {title}
      </p>

      <p className="mt-1 text-base font-bold sm:text-lg md:text-xl">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   MINI COMPONENT
========================================================= */

function Mini({ icon, title }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-lg bg-white/[0.025] p-3 sm:gap-3 sm:p-3.5">
      <FontAwesomeIcon
        icon={icon}
        className="shrink-0 text-xs text-cyan-400 sm:text-sm"
      />

      <p className="min-w-0 truncate text-[11px] font-semibold sm:text-xs md:text-sm">
        {title}
      </p>
    </div>
  );
}

/* =========================================================
   FEATURE COMPONENT
========================================================= */

function Feature({ icon, title, text }) {
  return (
    <div className="w-full min-w-0 rounded-xl bg-[#0b1020] p-5 transition duration-300 hover:bg-[#0d1325] sm:p-6 lg:p-7">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-400/10">
        <FontAwesomeIcon
          icon={icon}
          className="text-lg text-cyan-400"
        />
      </div>

      <h4 className="text-lg font-bold sm:text-xl">
        {title}
      </h4>

      <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   STEP COMPONENT
========================================================= */

function Step({ number, title, text }) {
  return (
    <div className="w-full min-w-0 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10 sm:h-16 sm:w-16">
        <span className="text-sm font-bold text-cyan-400 sm:text-base">
          {number}
        </span>
      </div>

      <h4 className="mt-5 text-lg font-bold sm:text-xl">
        {title}
      </h4>

      <p className="mx-auto mt-3 max-w-[240px] text-sm leading-relaxed text-gray-500 sm:text-base">
        {text}
      </p>
    </div>
  );
}