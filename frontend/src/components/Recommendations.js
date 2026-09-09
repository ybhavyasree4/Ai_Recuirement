"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faArrowLeft,
  faRightFromBracket,
  faMagnifyingGlass,
  faUser,
  faBriefcase,
  faChartLine,
  faCheckCircle,
  faXmarkCircle,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function Recommendations() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch(`${API_URL}/applications`);
      if (!res.ok) throw new Error();

      const data = await res.json();

      setApplications(
        data.filter(
          (x) =>
            x.recommendation !== null &&
            x.recommendation !== undefined &&
            String(x.recommendation).trim() !== ""
        )
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load recommendations.");
    } finally {
      setLoading(false);
    }
  }

  function getData(value) {
    try {
      const data =
        typeof value === "string"
          ? JSON.parse(value)
          : value;

      return {
        recommendation: String(
          data?.recommendation || ""
        ).trim(),
        why: String(data?.why || "").trim(),
      };
    } catch {
      return {
        recommendation: String(value || "").trim(),
        why: "",
      };
    }
  }

  function getType(value) {
    const text = getData(value)
      .recommendation
      .toUpperCase()
      .replace(/_/g, " ");

    if (text === "RECOMMENDED") return "Recommended";
    if (text === "NOT RECOMMENDED")
      return "Not Recommended";

    return "Consider";
  }

  function score(value) {
    const n = Number(value);

    if (value === null || value === undefined || isNaN(n))
      return "N/A";

    return n <= 1
      ? `${(n * 100).toFixed(2)}%`
      : `${n.toFixed(2)}%`;
  }

  function skillScore(value) {
    const n = Number(value);
    return value === null ||
      value === undefined ||
      isNaN(n)
      ? "N/A"
      : `${n.toFixed(2)}%`;
  }

  const filtered = applications.filter((app) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    // Exact numeric search
    if (/^\d+$/.test(q)) {
      return (
        String(app.candidate_id) === q ||
        String(app.application_id) === q ||
        String(app.job_id) === q
      );
    }

    const data = getData(app.recommendation);

    const text = [
      app.candidate_name,
      app.job_title,
      app.job_name,
      app.application_status,
      app.matched_skills,
      app.missing_skills,
      data.recommendation,
      data.why,
    ]
      .filter(Boolean)
      .flatMap((v) =>
        Array.isArray(v) ? v : [v]
      )
      .join(" ")
      .toLowerCase();

    return text.includes(q);
  });

  const recommended = applications.filter(
    (x) => getType(x.recommendation) === "Recommended"
  ).length;

  const consider = applications.filter(
    (x) => getType(x.recommendation) === "Consider"
  ).length;

  const notRecommended = applications.filter(
    (x) => getType(x.recommendation) === "Not Recommended"
  ).length;

  if (selected) {
    const data = getData(selected.recommendation);
    const type = getType(selected.recommendation);

    return (
      <main className="min-h-screen w-full bg-[#050816] text-white flex flex-col">

        <Navbar />

        <section className="flex-1 px-5 sm:px-7 md:px-10 lg:px-14 py-7 md:py-10 pb-24">

          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 text-base md:text-lg mb-6"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Recommendations
          </button>

          <p className="text-cyan-400 font-semibold text-base">
            APPLICATION #{selected.application_id}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2 mb-7">

            <h1 className="text-3xl md:text-5xl font-bold">
              AI Recommendation
            </h1>

            <Badge type={type} />

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

            <InfoCard
              icon={faUser}
              title="Candidate"
              value={`Candidate #${selected.candidate_id}`}
            />

            <InfoCard
              icon={faBriefcase}
              title="Job"
              value={`Job #${selected.job_id}`}
            />

            <InfoCard
              icon={faChartLine}
              title="Match Score"
              value={score(selected.match_score)}
              highlight
            />

            <InfoCard
              icon={faCheckCircle}
              title="Skill Match"
              value={skillScore(
                selected.skill_match_percentage
              )}
              highlight
            />

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

            <InfoCard
              icon={faLightbulb}
              title="AI Recommendation"
              value={data.recommendation || "Not available"}
              large
            />

            <InfoCard
              icon={faChartLine}
              title="Reason"
              value={data.why || "No reason available."}
              large
            />

            <InfoCard
              icon={faCheckCircle}
              title="Matched Skills"
              value={
                selected.matched_skills ||
                "No matched skills available."
              }
              large
            />

            <InfoCard
              icon={faXmarkCircle}
              title="Missing Skills"
              value={
                selected.missing_skills ||
                "No missing skills available."
              }
              large
            />

          </div>

        </section>

        <Footer />

      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#050816] text-white flex flex-col">

      <Navbar />

      <section className="flex-1 px-5 sm:px-7 md:px-10 lg:px-14 py-7 md:py-10 pb-24">

        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 text-base md:text-lg mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        <p className="text-cyan-400 font-semibold text-base">
          RECRUITMENT TOOL
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
          AI Recommendations
        </h1>

        <p className="text-gray-400 text-base md:text-lg mt-2 mb-7">
          AI-powered candidate recommendations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">

          <CountCard
            title="Recommended"
            count={recommended}
            icon={faCheckCircle}
            color="text-green-400"
          />

          <CountCard
            title="Consider"
            count={consider}
            icon={faLightbulb}
            color="text-yellow-400"
          />

          <CountCard
            title="Not Recommended"
            count={notRecommended}
            icon={faXmarkCircle}
            color="text-red-400"
          />

        </div>

        <div className="relative w-full max-w-3xl mb-7">

          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Candidate ID, Application ID, Job ID or recommendation"
            className="w-full bg-[#0b1020] rounded-lg py-4 pl-11 pr-4 text-base md:text-lg text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-cyan-400"
          />

        </div>

        {loading && (
          <p className="text-cyan-400 text-lg">
            Loading recommendations...
          </p>
        )}

        {error && (
          <p className="text-red-400 text-lg">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          filtered.length > 0 && (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

              {filtered.map((app) => {

                const data = getData(
                  app.recommendation
                );

                const type = getType(
                  app.recommendation
                );

                return (
                  <div
                    key={app.application_id}
                    className="bg-[#0b1020] rounded-xl p-5 min-h-[350px] flex flex-col"
                  >

                    <div className="flex justify-between items-center">

                      <p className="text-sm text-cyan-400 font-semibold">
                        APPLICATION #{app.application_id}
                      </p>

                      <Badge type={type} />

                    </div>

                    <h2 className="text-xl md:text-2xl font-bold mt-5">
                      Candidate #{app.candidate_id}
                    </h2>

                    <div className="space-y-4 mt-5 flex-1">

                      <Info
                        label="Job"
                        value={`Job #${app.job_id}`}
                      />

                      <Info
                        label="Match Score"
                        value={score(app.match_score)}
                        highlight
                      />

                      <Info
                        label="Skill Match"
                        value={skillScore(
                          app.skill_match_percentage
                        )}
                      />

                      <Info
                        label="Recommendation"
                        value={
                          data.recommendation ||
                          "Not available"
                        }
                      />

                    </div>

                    <button
                      onClick={() => setSelected(app)}
                      className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-base py-3 rounded-lg mt-5"
                    >
                      View Recommendation
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        {!loading &&
          !error &&
          filtered.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold">
                No recommendations found
              </h2>

              <p className="text-gray-500 text-base mt-2">
                Try another Candidate ID or search term.
              </p>
            </div>
          )}

      </section>

      <Footer />

    </main>
  );
}

function InfoCard({
  icon,
  title,
  value,
  highlight,
  large,
}) {
  return (
    <div className="bg-[#0b1020] rounded-xl p-6 min-h-[180px]">

      <div className="flex items-center gap-3 mb-5">

        <FontAwesomeIcon
          icon={icon}
          className="text-cyan-400 text-xl"
        />

        <h2 className="text-xl font-bold">
          {title}
        </h2>

      </div>

      <p
        className={
          highlight
            ? "text-3xl md:text-4xl font-bold text-cyan-400 break-words"
            : large
            ? "text-base md:text-lg text-gray-300 leading-7 break-words"
            : "text-lg font-semibold text-gray-300 break-words"
        }
      >
        {value}
      </p>

    </div>
  );
}

function Info({
  label,
  value,
  highlight,
}) {
  return (
    <div>

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p
        className={
          highlight
            ? "text-cyan-400 text-xl font-bold mt-1"
            : "text-gray-300 text-base md:text-lg font-semibold mt-1 break-words"
        }
      >
        {value}
      </p>

    </div>
  );
}

function CountCard({
  title,
  count,
  icon,
  color,
}) {
  return (
    <div className="bg-[#0b1020] rounded-xl p-5 min-h-[125px]">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-gray-400 text-base">
            {title}
          </p>

          <p
            className={`text-3xl font-bold mt-2 ${color}`}
          >
            {count}
          </p>
        </div>

        <FontAwesomeIcon
          icon={icon}
          className={`${color} text-2xl`}
        />

      </div>

    </div>
  );
}

function Badge({ type }) {
  const styles = {
    Recommended:
      "text-green-400 bg-green-400/10",
    Consider:
      "text-yellow-400 bg-yellow-400/10",
    "Not Recommended":
      "text-red-400 bg-red-400/10",
  };

  return (
    <span
      className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${
        styles[type]
      }`}
    >
      {type}
    </span>
  );
}

function Navbar() {
  return (
    <nav className="bg-[#080c1a] px-5 sm:px-7 md:px-10 py-5 flex justify-between items-center">

      <Link
        href="/dashboard"
        className="flex items-center gap-3"
      >

        <FontAwesomeIcon
          icon={faBrain}
          className="text-cyan-400 text-2xl"
        />

        <div>

          <h1 className="text-2xl font-bold">
            Talent<span className="text-cyan-400">
              IQ
            </span>
          </h1>

          <p className="text-xs text-gray-500">
            TALENT INTELLIGENCE
          </p>

        </div>

      </Link>

      <Link
        href="/"
        className="flex items-center gap-2 text-base md:text-lg text-gray-400 hover:text-white"
      >
        <FontAwesomeIcon
          icon={faRightFromBracket}
        />
        Logout
      </Link>

    </nav>
  );
}

function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#080c1a] py-3 text-center text-gray-600 text-sm z-50">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}