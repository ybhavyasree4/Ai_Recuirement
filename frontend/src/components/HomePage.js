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
    <main className="min-h-screen w-full bg-[#050816] text-white overflow-x-hidden">

      <nav className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-3 sm:py-4 flex justify-between items-center gap-4">

        <Link
          href="/home"
          className="flex items-center gap-2 sm:gap-3 min-w-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">
            <FontAwesomeIcon
              icon={faBrain}
              className="text-cyan-400 text-lg sm:text-xl md:text-2xl"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-normal">
              Talent<span className="text-cyan-400">IQ</span>
            </h1>

            <p className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-500 tracking-wide">
              TALENT INTELLIGENCE
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
          <Link
            href="/login"
            className="px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-sm font-normal text-gray-300"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg bg-cyan-400 text-black font-normal text-xs sm:text-sm md:text-sm"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <section className="w-full min-h-[calc(100vh-70px)] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-10 md:py-12 lg:py-14 flex items-center">

        <div className="w-full grid grid-cols-2 gap-3 sm:gap-5 md:gap-8 lg:gap-14 items-center">

          <div className="min-w-0">

            <p className="text-cyan-400 text-[9px] sm:text-xs md:text-sm font-normal">
              AI-POWERED RECRUITMENT
            </p>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal mt-2 sm:mt-3 md:mt-4 leading-[1.08]">

              Hire smarter.

              <span className="block text-cyan-400 mt-1.5 sm:mt-2">
                Find better talent.
              </span>
            </h2>

            <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm lg:text-base mt-3 sm:mt-4 md:mt-5 max-w-3xl leading-relaxed">
              TalentIQ helps recruiters screen resumes, understand candidate
              profiles, match talent with jobs and make better hiring
              decisions.
            </p>

            <button
              onClick={exploreFeatures}
              className="mt-4 sm:mt-5 md:mt-6 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg bg-white/5 border border-white/10 font-normal text-[10px] sm:text-xs md:text-sm"
            >
              Explore TalentIQ

              <FontAwesomeIcon
                icon={faArrowDown}
                className="ml-1.5"
              />
            </button>
          </div>

          <div className="w-full min-w-0 bg-[#0b1020] rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">

            <p className="text-cyan-400 text-[8px] sm:text-[10px] md:text-xs font-normal">
              TALENT INTELLIGENCE
            </p>

            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal mt-1">
              Smarter Recruitment
            </h3>

            <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 mt-1">
              AI-powered insights for better hiring
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 mt-3 sm:mt-4">

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

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 mt-2 sm:mt-3">

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

      <section
        id="features"
        className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-14 md:py-16 lg:py-20"
      >

        <div className="text-center mb-8 sm:mb-10 md:mb-12">

          <p className="text-cyan-400 text-xs sm:text-sm font-normal">
            TALENTIQ FEATURES
          </p>

          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal mt-2 sm:mt-3">
            Everything recruiters need
          </h3>

          <p className="text-gray-500 text-xs sm:text-sm md:text-base mt-3">
            Simplify candidate screening, matching and hiring decisions.
          </p>
        </div>

        <div className="w-full grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6">

          {features.map(([icon, title, text]) => (
            <Feature
              key={title}
              icon={icon}
              title={title}
              text={text}
            />
          ))}
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-14 md:py-16 lg:py-20">

        <div className="text-center mb-8 sm:mb-10 md:mb-12">

          <p className="text-cyan-400 text-xs sm:text-sm font-normal">
            HOW IT WORKS
          </p>

          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal mt-2 sm:mt-3">
            From resume to hiring decision
          </h3>
        </div>

        <div className="w-full grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">

          {steps.map(([number, title, text]) => (
            <Step
              key={number}
              number={number}
              title={title}
              text={text}
            />
          ))}
        </div>
      </section>

      <footer className="w-full text-center px-4 py-5 sm:py-6 text-gray-600 text-[10px] sm:text-xs">
        TalentIQ — AI-Powered Recruitment Platform
      </footer>

    </main>
  );
}

function Stat({ icon, title, value }) {
  return (
    <div className="w-full bg-white/[0.04] rounded-lg p-2 sm:p-2.5 md:p-3">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 text-[10px] sm:text-xs md:text-sm"
      />

      <p className="text-[7px] sm:text-[8px] md:text-[10px] text-gray-500 mt-1">
        {title}
      </p>

      <p className="text-xs sm:text-sm md:text-base font-normal mt-0.5">
        {value}
      </p>

    </div>
  );
}

function Mini({ icon, title }) {
  return (
    <div className="w-full min-w-0 flex items-center gap-1.5 sm:gap-2 bg-white/[0.025] rounded-lg p-2 sm:p-2.5 md:p-3">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 text-[10px] sm:text-xs md:text-sm shrink-0"
      />

      <p className="text-[7px] sm:text-[9px] md:text-xs font-normal truncate">
        {title}
      </p>

    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="w-full min-w-0 bg-[#0b1020] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 text-base sm:text-lg md:text-xl mb-2 sm:mb-3"
      />

      <h4 className="text-xs sm:text-sm md:text-base lg:text-lg font-normal">
        {title}
      </h4>

      <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-1.5 sm:mt-2 leading-relaxed">
        {text}
      </p>

    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="text-center min-w-0">

      <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto rounded-full bg-cyan-400/10 flex items-center justify-center">

        <span className="text-cyan-400 font-normal text-xs sm:text-sm">
          {number}
        </span>

      </div>

      <h4 className="font-normal text-sm sm:text-base md:text-lg mt-2 sm:mt-3">
        {title}
      </h4>

      <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-1.5 sm:mt-2">
        {text}
      </p>

    </div>
  );
}