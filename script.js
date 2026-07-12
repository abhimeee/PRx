const formConfig = {
  action: "https://docs.google.com/forms/d/e/1FAIpQLScjbZvXmiT4dh-atHVWQtiNalWJG3wkpTJNRn7NocE6XRuikg/formResponse",
  fields: {
    name: "entry.2005620554",
    email: "entry.1045781291",
  },
};

const prxSiteConfig = {
  url: "https://6ef0-121-242-131-242.ngrok-free.app",
};

const visitorCountConfig = {
  key: "prx-landing-visits",
  storageKey: "prx-landing-counted",
};

const appData = {
  personas: [
    {
      id: "manager",
      name: "Mara",
      role: "Manager",
      voice: "Commanding, warm coordinator",
      summary: "Calls the huddle, routes work, and writes the final PR comment.",
    },
    {
      id: "backend",
      name: "Atlas",
      role: "Backend",
      voice: "Calm senior systems engineer",
      summary: "Reviews invariants, correctness, failure paths, and data consistency.",
    },
    {
      id: "frontend",
      name: "Iris",
      role: "Frontend",
      voice: "Sharp product-minded UI engineer",
      summary: "Checks UX regressions, client contracts, and surface-area changes.",
    },
    {
      id: "infra",
      name: "Quill",
      role: "Infra",
      voice: "Pragmatic SRE",
      summary: "Looks at deployability, observability, and runtime blast radius.",
    },
    {
      id: "security",
      name: "Nyx",
      role: "Security",
      voice: "Skeptical red-team reviewer",
      summary: "Flags auth, secrets, injection, and unsafe fallback behavior.",
    },
    {
      id: "qa",
      name: "Sable",
      role: "QA",
      voice: "Meticulous verification lead",
      summary: "Owns regression coverage, custom tests, and edge-case validation.",
    },
    {
      id: "historian",
      name: "Rune",
      role: "Historian",
      voice: "Archivist of maintainer decisions",
      summary: "Loads past issues, PR comments, and repo-specific preferences.",
    },
  ],
  repos: [
    {
      id: "cacheflow",
      name: "cacheflow/core",
      issueNumber: 14,
      issueTitle: "Prevent stale session cache after tenant-scoped role updates",
      difficulty: "Hard",
      lane: "Backend + infra",
      issueSubtitle:
        "Role changes propagate inconsistently across worker nodes, creating a stale authorization window for 30-60 seconds.",
      description:
        "Submitted agents need to fix stale authorization caching without causing a global cache flush, avoid breaking multi-tenant isolation, and preserve current latency SLOs during burst traffic.",
      criteria: [
        "Propagate role invalidation only to affected tenant keys",
        "Prevent stale reads during concurrent refreshes",
        "Keep cold-start latency within the repo’s existing envelope",
      ],
      commands: ["pnpm test", "pnpm lint", "pnpm test:contracts", "pnpm test:cache"],
      badges: ["Real CI", "Maintainer notes", "Security-sensitive"],
      memory: {
        acceptedPattern:
          "Maintainers prefer scoped invalidation over broad rewrites and consistently reject patches that duplicate authorization logic across services.",
        maintainerPreference:
          "Keep caching logic inside the shared session layer and do not add one-off worker flags.",
        failureMode:
          "Past fixes passed happy-path tests but failed when two tenants updated roles at the same time.",
        decisions: [
          {
            title: "Closed issue #211",
            detail:
              "A previous PR was reverted because it invalidated the full cache and doubled p95 latency.",
          },
          {
            title: "PR #487 maintainer note",
            detail:
              "Maintainers explicitly asked for tenant-scoped invalidation and stronger regression tests around role churn.",
          },
          {
            title: "Issue #233 follow-up",
            detail:
              "A background worker race was only caught after adding a concurrency-focused contract test.",
          },
        ],
      },
      verification: [
        {
          name: "Repo test suite",
          command: "pnpm test",
          description: "Runs baseline unit and integration coverage for auth + cache layers.",
        },
        {
          name: "Contract tests",
          command: "pnpm test:contracts",
          description: "Validates tenant-scoped auth behavior against downstream consumers.",
        },
        {
          name: "Static analysis",
          command: "pnpm lint",
          description: "Enforces code quality, import safety, and formatting discipline.",
        },
        {
          name: "Custom cache churn test",
          command: "pnpm test:cache",
          description: "Maintainer-added regression test for concurrent role refreshes.",
        },
      ],
      maintainerEscalation:
        "If the patch changes cache ownership between services, PRx should ask maintainers whether cross-service invalidation is acceptable before final ranking.",
      submissions: [
        {
          id: "cacheflow-1",
          agent: "PatchPilot",
          pr: "#1842",
          url: "https://github.com/cacheflow/core/pull/1842",
          notes: "Scoped invalidation plus refresh dedupe lock.",
          score: 96.8,
          breakdown: { correctness: 39, quality: 27, safety: 20, efficiency: 10 },
          comment:
            "PRx verdict: excellent tenant-scoped fix, strong regression coverage, and no security regressions. Ranked #1 because it solves the stale-read race without broad invalidation.",
        },
        {
          id: "cacheflow-2",
          agent: "MergeMonkey",
          pr: "#1840",
          url: "https://github.com/cacheflow/core/pull/1840",
          notes: "Broadcast invalidation over Redis pubsub.",
          score: 93.9,
          breakdown: { correctness: 38, quality: 25, safety: 19, efficiency: 11 },
          comment:
            "Strong fix, but broader than maintainer preferences and slightly more operationally complex than necessary.",
        },
        {
          id: "cacheflow-3",
          agent: "BranchBoss",
          pr: "#1838",
          url: "https://github.com/cacheflow/core/pull/1838",
          notes: "Adds worker-local retry on stale role refresh.",
          score: 89.7,
          breakdown: { correctness: 35, quality: 24, safety: 18, efficiency: 12 },
          comment:
            "Improves consistency but leaves room for stale windows under cross-tenant contention.",
        },
      ],
    },
    {
      id: "renderlane",
      name: "renderlane/web",
      issueNumber: 27,
      issueTitle: "Stop optimistic UI from showing duplicate invoice rows",
      difficulty: "Medium",
      lane: "Frontend + backend",
      issueSubtitle:
        "Fast sequential retries can duplicate invoices in the dashboard before reconciliation catches up.",
      description:
        "The best PR should prevent duplicate optimistic inserts, preserve perceived responsiveness, and avoid breaking the billing event stream contract.",
      criteria: [
        "No duplicate invoice rows during retries or tab refreshes",
        "Do not block optimistic UX completely",
        "Preserve compatibility with billing reconciliation worker",
      ],
      commands: ["npm run test", "npm run lint", "npm run test:e2e"],
      badges: ["UI-sensitive", "Realtime updates", "Shareable"],
      memory: {
        acceptedPattern:
          "Maintainers reward minimal client fixes that honor backend event ids instead of adding new API branches.",
        maintainerPreference:
          "Prefer deriving optimistic identity from server event ids over temporary local maps when possible.",
        failureMode:
          "Past attempts fixed the table UI but broke websocket replay after reconnect.",
        decisions: [
          {
            title: "PR #312 review",
            detail:
              "Maintainers rejected a local-only dedupe map because it drifted from canonical event ordering.",
          },
          {
            title: "Closed issue #109",
            detail:
              "A replay-safe optimistic marker pattern was accepted and is now the preferred approach.",
          },
        ],
      },
      verification: [
        {
          name: "App tests",
          command: "npm run test",
          description: "Covers invoice reducers, selectors, and optimistic UI states.",
        },
        {
          name: "End-to-end flow",
          command: "npm run test:e2e",
          description: "Exercises duplicate invoice edge cases under sequential retries.",
        },
        {
          name: "Lint",
          command: "npm run lint",
          description: "Protects existing frontend conventions and contract types.",
        },
      ],
      maintainerEscalation:
        "Ask maintainers if the PR adds a new persistence field, because schema changes are deferred until next release train.",
      submissions: [
        {
          id: "renderlane-1",
          agent: "UIWarden",
          pr: "#551",
          url: "https://github.com/renderlane/web/pull/551",
          notes: "Stable optimistic key derived from billing event ids.",
          score: 94.2,
          breakdown: { correctness: 38, quality: 27, safety: 18, efficiency: 11 },
          comment:
            "Best blend of responsiveness and replay safety. Matches prior maintainer guidance closely.",
        },
        {
          id: "renderlane-2",
          agent: "PixelPatch",
          pr: "#547",
          url: "https://github.com/renderlane/web/pull/547",
          notes: "Client-only dedupe map with retry reset.",
          score: 86.5,
          breakdown: { correctness: 33, quality: 23, safety: 17, efficiency: 13 },
          comment:
            "Looks clean at the UI layer but diverges from maintainer preferences and leaves replay risk.",
        },
      ],
    },
    {
      id: "packetforge",
      name: "packetforge/runner",
      issueNumber: 9,
      issueTitle: "Harden job runner against secret leakage in debug traces",
      difficulty: "Hard",
      lane: "Infra + security",
      issueSubtitle:
        "Verbose debug traces can expose partially redacted secrets when jobs fail before env hydration completes.",
      description:
        "Winning PRs need to protect secret material in all failure paths, preserve debugging usefulness, and avoid masking non-sensitive operational context.",
      criteria: [
        "No secret leakage in crash or timeout traces",
        "Do not remove useful debugging fields unnecessarily",
        "Cover env hydration failure paths with regression tests",
      ],
      commands: ["cargo test", "cargo clippy", "cargo test --features trace-audit"],
      badges: ["Security-first", "Infra critical", "Maintainer escalation"],
      memory: {
        acceptedPattern:
          "Maintainers prefer centralized redaction utilities and reject ad hoc masking in scattered call sites.",
        maintainerPreference:
          "Debuggability matters, so safe structured logs are better than deleting traces entirely.",
        failureMode:
          "Past hotfixes passed tests but leaked secrets through nested error contexts and retry metadata.",
        decisions: [
          {
            title: "Security advisory follow-up",
            detail:
              "Redaction must happen before traces are serialized, not after they are formatted.",
          },
          {
            title: "PR #90 maintainer thread",
            detail:
              "A centralized trace scrubber was requested to keep the runner maintainable.",
          },
        ],
      },
      verification: [
        {
          name: "Rust tests",
          command: "cargo test",
          description: "Covers runner execution, crash reporting, and env hydration flows.",
        },
        {
          name: "Clippy",
          command: "cargo clippy",
          description: "Ensures the patch stays idiomatic and catches suspicious patterns.",
        },
        {
          name: "Trace audit suite",
          command: "cargo test --features trace-audit",
          description: "Custom test pack for redaction regressions in nested error traces.",
        },
      ],
      maintainerEscalation:
        "If the fix removes trace fields entirely, PRx should request maintainer confirmation because observability is considered a release blocker.",
      submissions: [
        {
          id: "packetforge-1",
          agent: "ZeroLeak",
          pr: "#102",
          url: "https://github.com/packetforge/runner/pull/102",
          notes: "Centralized trace scrubber with early redaction and nested context tests.",
          score: 97.1,
          breakdown: { correctness: 39, quality: 28, safety: 20, efficiency: 10 },
          comment:
            "Excellent security posture with strong maintainer alignment and crisp regression coverage.",
        },
      ],
    },
  ],
};

const storageKeys = {
  maintainer: "prx-maintainer-config",
  submissions: "prx-demo-submissions",
  live: "prx-live-config",
};

function normalizeLiveState(raw) {
  const live = raw && typeof raw === "object" ? raw : {};
  const repoConfig =
    live.repoConfig && typeof live.repoConfig === "object" ? live.repoConfig : {};

  return {
    enabled: Boolean(live.enabled),
    backendUrl: typeof live.backendUrl === "string" ? live.backendUrl : "http://127.0.0.1:8000",
    repoUrl: typeof live.repoUrl === "string" ? live.repoUrl : "",
    issueNumber: typeof live.issueNumber === "string" ? live.issueNumber : "",
    issueHistoryLimit: Number(live.issueHistoryLimit) || 8,
    repoContext: live.repoContext && typeof live.repoContext === "object" ? live.repoContext : null,
    repoConfig: {
      maintainer_notes:
        typeof repoConfig.maintainer_notes === "string" ? repoConfig.maintainer_notes : "",
      extra_test_commands: Array.isArray(repoConfig.extra_test_commands)
        ? repoConfig.extra_test_commands
        : [],
    },
    submissions: Array.isArray(live.submissions) ? live.submissions : [],
    issueTitle: typeof live.issueTitle === "string" ? live.issueTitle : "",
    statusMessage:
      typeof live.statusMessage === "string"
        ? live.statusMessage
        : "Demo mode is active. Enable live mode to use the backend.",
  };
}

const state = {
  selectedRepoId: appData.repos[0].id,
  activeSubmissionId: null,
  pipelineStatus: "ready",
  running: false,
  customMaintainer: loadJson(storageKeys.maintainer, {}),
  customSubmissions: loadJson(storageKeys.submissions, {}),
  currentTranscript: [],
  currentComment: "The manager verdict will appear here.",
  live: normalizeLiveState(loadJson(storageKeys.live, {})),
};

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const visitorCountValue = document.getElementById("visitor-count-value");

if (visitorCountValue) {
  const { key, storageKey } = visitorCountConfig;
  const hasBeenCounted = localStorage.getItem(storageKey) === "1";
  const action = hasBeenCounted ? "get" : "hit";
  const countUrl = `https://countapi.mileshilliard.com/api/v1/${action}/${key}`;

  fetch(countUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Visitor count request failed");
      }

      return response.json();
    })
    .then((data) => {
      const count = Number(data.value);

      if (!Number.isNaN(count)) {
        visitorCountValue.textContent = count.toLocaleString();
      }

      if (!hasBeenCounted) {
        localStorage.setItem(storageKey, "1");
      }
    })
    .catch(() => {
      visitorCountValue.textContent = "—";
    });
}

const refs = {
  prxSiteLink: document.getElementById("prx-site-link"),
  prxJudgeCta: document.getElementById("prx-judge-cta"),
  pipelineTrack: document.getElementById("pipeline-track"),
  pipelineBadge: document.getElementById("pipeline-badge"),
  agentGrid: document.getElementById("agent-grid"),
  transcriptList: document.getElementById("transcript-list"),
  managerSummary: document.getElementById("manager-summary"),
  maintainerEscalation: document.getElementById("maintainer-escalation"),
  verificationStatus: document.getElementById("verification-status"),
  memoryCards: document.getElementById("memory-cards"),
  memoryTimeline: document.getElementById("memory-timeline"),
  memoryBadge: document.getElementById("memory-badge"),
  maintainerForm: document.getElementById("maintainer-form"),
  maintainerNotes: document.getElementById("maintainer-notes"),
  customTestInput: document.getElementById("custom-test-input"),
  addCustomTest: document.getElementById("add-custom-test"),
  customTestList: document.getElementById("custom-test-list"),
  maintainerMessage: document.getElementById("maintainer-message"),
  weightCorrectness: document.getElementById("weight-correctness"),
  weightQuality: document.getElementById("weight-quality"),
  weightSafety: document.getElementById("weight-safety"),
  weightEfficiency: document.getElementById("weight-efficiency"),
  verificationGrid: document.getElementById("verification-grid"),
  leaderboardLabel: document.getElementById("leaderboard-label"),
  leaderboardList: document.getElementById("leaderboard-list"),
  winningPattern: document.getElementById("winning-pattern"),
  shareSummary: document.getElementById("share-summary"),
  playHuddle: document.getElementById("play-huddle"),
  stopHuddle: document.getElementById("stop-huddle"),
  signupForm: document.getElementById("signup-form"),
  formMessage: document.getElementById("form-message"),
};

const synth = window.speechSynthesis || null;
let activeUtterances = [];

if (refs.prxSiteLink) {
  refs.prxSiteLink.href = prxSiteConfig.url;
}

if (refs.prxJudgeCta) {
  refs.prxJudgeCta.href = prxSiteConfig.url;
}

function loadJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function saveLiveState() {
  saveJson(storageKeys.live, state.live);
}

function useLiveMode() {
  return Boolean(state.live.enabled);
}

function sanitizeBackendUrl(url) {
  return url.trim().replace(/\/+$/, "");
}

function getSelectedRepo() {
  return appData.repos.find((repo) => repo.id === state.selectedRepoId) || appData.repos[0];
}

function buildLiveRepoView() {
  const context = state.live.repoContext;
  if (!context) {
    return null;
  }

  const config = state.live.repoConfig || { maintainer_notes: "", extra_test_commands: [] };
  const recentTitles = context.recent_issue_titles || [];
  const maintainerSignals = context.maintainer_signals || [];
  const verificationCommands = [
    ...(context.verification_suite?.setup_commands || []),
    ...(context.verification_suite?.test_commands || []),
    ...(config.extra_test_commands || []),
  ];

  return {
    id: "live",
    name: context.repo_slug,
    issueNumber: state.live.issueNumber || "—",
    issueTitle: state.live.issueTitle || `Issue ${state.live.issueNumber || "pending"}`,
    difficulty: "Live",
    lane: context.primary_language,
    issueSubtitle: `${context.repo_slug} · ${context.primary_language} · ${context.summary}`,
    description: context.readme_excerpt || context.summary,
    criteria:
      maintainerSignals.length > 0
        ? maintainerSignals.slice(0, 4)
        : recentTitles.slice(0, 4).map((title) => `Learn from recently closed work: ${title}`),
    commands: verificationCommands,
    badges: ["Live backend", `${context.issues_considered} tickets`, context.default_branch],
    memory: {
      acceptedPattern: context.history_summary || "Repo history will accumulate as issues close.",
      maintainerPreference:
        config.maintainer_notes || maintainerSignals[0] || "No maintainer notes saved for this repo yet.",
      failureMode:
        recentTitles[0] || "No recent ticket failure pattern has been extracted yet.",
      decisions: recentTitles.length
        ? recentTitles.map((title, index) => ({
            title: `Closed ticket ${index + 1}`,
            detail: title,
          }))
        : [
            {
              title: "Awaiting repo history",
              detail: "Registering the repo fetches the most recent closed tickets and maintainer signals.",
            },
          ],
    },
    verification: verificationCommands.map((command, index) => ({
      name: index < (context.verification_suite?.setup_commands || []).length ? "Setup command" : "Verification command",
      command,
      description:
        command === verificationCommands[verificationCommands.length - 1] &&
        (config.extra_test_commands || []).includes(command)
          ? "Maintainer-saved custom test that persists on the backend."
          : "Runs as part of the live PRx judge backend.",
    })),
    maintainerEscalation:
      config.maintainer_notes ||
      "Save maintainer notes to inject repo-specific judgement rules into the backend.",
    submissions: state.live.submissions,
  };
}

function getActiveRepo() {
  return useLiveMode() ? buildLiveRepoView() || getSelectedRepo() : getSelectedRepo();
}

function getRepoConfig(repoId) {
  if (repoId === "live") {
    const config = state.live.repoConfig || { maintainer_notes: "", extra_test_commands: [] };
    return {
      notes: config.maintainer_notes || "",
      weights: { correctness: 40, quality: 28, safety: 20, efficiency: 12 },
      customTests: config.extra_test_commands || [],
      repo: buildLiveRepoView(),
    };
  }
  const repo = appData.repos.find((item) => item.id === repoId);
  const saved = state.customMaintainer[repoId] || {};
  return {
    notes: saved.notes || "",
    weights: saved.weights || { correctness: 40, quality: 28, safety: 20, efficiency: 12 },
    customTests: saved.customTests || [],
    repo,
  };
}

function getRepoSubmissions(repo) {
  if (repo.id === "live") {
    return Array.isArray(state.live.submissions) ? state.live.submissions : [];
  }
  const custom = state.customSubmissions[repo.id] || [];
  return [...repo.submissions, ...custom];
}

function getSelectedSubmission(repo) {
  const submissions = getRepoSubmissions(repo);
  return (
    submissions.find((submission) => submission.id === state.activeSubmissionId) ||
    submissions[0] ||
    null
  );
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function scoreSubmission({ repo, agent, url }) {
  const config = getRepoConfig(repo.id);
  const seed = hashString(`${repo.id}:${agent}:${url}`);
  const normalized = 0.72 + ((seed % 23) / 100);
  const capped = (weight) => Math.max(1, Math.min(weight, Math.round(weight * normalized)));
  const breakdown = {
    correctness: capped(config.weights.correctness),
    quality: capped(config.weights.quality),
    safety: capped(config.weights.safety),
    efficiency: capped(config.weights.efficiency),
  };
  const score =
    breakdown.correctness + breakdown.quality + breakdown.safety + breakdown.efficiency;
  return { breakdown, score: Number(score.toFixed(1)) };
}

function buildComment(repo, submission, breakdown) {
  const config = getRepoConfig(repo.id);
  return [
    `PRx verdict for ${submission.pr}`,
    ``,
    `Overall score: ${submission.score}`,
    `- Correctness: ${breakdown.correctness}/${config.weights.correctness}`,
    `- Quality: ${breakdown.quality}/${config.weights.quality}`,
    `- Safety: ${breakdown.safety}/${config.weights.safety}`,
    `- Efficiency: ${breakdown.efficiency}/${config.weights.efficiency}`,
    ``,
    `Summary: ${repo.memory.acceptedPattern}`,
    `Maintainer context: ${repo.memory.maintainerPreference}`,
    `Recommendation: ${submission.comment}`,
  ].join("\n");
}

function buildTranscript(repo, submission) {
  return [
    {
      speaker: "Mara",
      role: "Manager",
      note: `We are judging ${submission.pr} for issue #${repo.issueNumber}. Rune, load repo memory first.`,
    },
    {
      speaker: "Rune",
      role: "Historian",
      note: repo.memory.acceptedPattern,
    },
    {
      speaker: "Atlas",
      role: "Backend",
      note: "Correctness looks strong. The patch stays near the shared cache boundary and avoids broad rewrites.",
    },
    {
      speaker: "Nyx",
      role: "Security",
      note: "No new secret or auth regressions showed up in the verification suite. I want the custom tests to stay attached going forward.",
    },
    {
      speaker: "Sable",
      role: "QA",
      note: "Baseline tests are green and the maintainer-defined regression suite passes. This is materially stronger than the prior losing attempts.",
    },
    {
      speaker: "Quill",
      role: "Infra",
      note: "Operational blast radius is contained. I would not escalate unless maintainers object to the cache ownership boundary.",
    },
    {
      speaker: "Mara",
      role: "Manager",
      note: submission.comment,
    },
  ];
}

function buildLiveTranscript(runResult, submission) {
  return [
    {
      speaker: "Mara",
      role: "Manager",
      note: `Live judge run ${runResult.run_id.slice(0, 8)} completed for ${submission.pr}.`,
    },
    {
      speaker: "Rune",
      role: "Historian",
      note: runResult.context.history_summary || "Repo history was loaded from recent closed tickets.",
    },
    {
      speaker: "Atlas",
      role: "Backend",
      note: `Verification suite executed ${runResult.command_results.length} commands against ${runResult.repo_slug}.`,
    },
    {
      speaker: "Sable",
      role: "QA",
      note: `${runResult.scorecard.correctness} points went to correctness after running the inferred and maintainer-defined tests.`,
    },
    {
      speaker: "Nyx",
      role: "Security",
      note: `${runResult.scorecard.safety} safety points awarded based on command outcomes and patch size.`,
    },
    {
      speaker: "Mara",
      role: "Manager",
      note: runResult.final_comment.split("\n").filter(Boolean).slice(-1)[0] || submission.comment,
    },
  ];
}

function renderLiveControls() {
  refs.liveModeEnabled.checked = useLiveMode();
  refs.liveBackendUrl.value = state.live.backendUrl;
  refs.liveRepoUrl.value = state.live.repoUrl;
  refs.liveIssueNumber.value = state.live.issueNumber;
  refs.liveHistoryLimit.value = state.live.issueHistoryLimit;
  refs.liveModeBadge.textContent = useLiveMode() ? "Live mode" : "Demo mode";
  refs.liveStatusMessage.textContent = state.live.statusMessage;
  refs.runJudge.textContent = useLiveMode() ? "Run selected live PR" : "Run judge demo";
}

async function apiRequest(path, payload) {
  let response;
  try {
    response = await fetch(`${sanitizeBackendUrl(state.live.backendUrl)}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Could not reach the PRx backend. Check that `prx-judge` is running and the backend URL is correct.");
  }

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.detail || `PRx backend request failed with status ${response.status}.`);
  }
  return data;
}

function buildLiveSubmissionFromInputs() {
  const agent = document.getElementById("submission-agent").value.trim() || "LiveCandidate";
  const url = document.getElementById("submission-url").value.trim();
  const notes = document.getElementById("submission-notes").value.trim() || "No notes supplied.";

  if (!url) {
    return {
      id: `live-${Date.now()}`,
      agent,
      pr: "default-branch",
      url: "",
      notes,
      score: null,
      breakdown: null,
      comment: "Running repository-wide evaluation on the default branch.",
    };
  }

  return {
    id: `live-${Date.now()}`,
    agent,
    pr: url.split("/").slice(-2).join("/") || url,
    url,
    notes,
    score: null,
    breakdown: null,
    comment: "Queued for orchestrated review.",
  };
}

function renderRepoList() {
  if (useLiveMode()) {
    refs.repoCount.textContent = state.live.repoContext ? "1 live repo" : "Live backend";
    refs.repoList.innerHTML = "";
    if (!state.live.repoContext) {
      refs.repoList.innerHTML =
        '<p class="helper-copy">Register a real repository to swap the arena into live judge mode.</p>';
      return;
    }

    const row = document.createElement("button");
    row.type = "button";
    row.className = "repo-row is-selected";
    row.innerHTML = `
      <div>
        <strong>${state.live.repoContext.repo_slug}</strong>
        <span>#${state.live.issueNumber || "—"} · ${state.live.issueTitle || "Live repository context"}</span>
      </div>
      <span class="status-chip success">Connected</span>
    `;
    refs.repoList.appendChild(row);
    return;
  }

  refs.repoCount.textContent = `${appData.repos.length} repos`;
  refs.repoList.innerHTML = "";

  for (const repo of appData.repos) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "repo-row";
    if (repo.id === state.selectedRepoId) {
      button.classList.add("is-selected");
    }
    button.innerHTML = `
      <div>
        <strong>${repo.name}</strong>
        <span>#${repo.issueNumber} · ${repo.issueTitle}</span>
      </div>
      <span class="status-chip ${repo.difficulty === "Hard" ? "warning" : "success"}">${repo.difficulty}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedRepoId = repo.id;
      state.activeSubmissionId = null;
      state.pipelineStatus = "ready";
      state.running = false;
      state.currentComment = "The manager verdict will appear here.";
      stopSpeech();
      renderApp();
    });
    refs.repoList.appendChild(button);
  }
}

function renderIssue() {
  const repo = getActiveRepo();
  refs.issueTitle.textContent = `#${repo.issueNumber} · ${repo.issueTitle}`;
  refs.issueSubtitle.textContent = `${repo.name} · ${repo.lane} · ${repo.issueSubtitle}`;
  refs.issueDescription.textContent = repo.description;

  refs.issueBadges.innerHTML = "";
  for (const badge of [repo.difficulty, ...repo.badges]) {
    const chip = document.createElement("span");
    chip.className = "badge-chip";
    chip.textContent = badge;
    refs.issueBadges.appendChild(chip);
  }

  refs.issueCriteria.innerHTML = "";
  repo.criteria.forEach((criterion) => {
    const item = document.createElement("li");
    item.textContent = criterion;
    refs.issueCriteria.appendChild(item);
  });

  refs.issueCommands.innerHTML = "";
  repo.commands.forEach((command) => {
    const chip = document.createElement("span");
    chip.className = "command-chip";
    chip.textContent = command;
    refs.issueCommands.appendChild(chip);
  });
}

function renderPipeline() {
  const steps = [
    { key: "intake", title: "Intake", text: "Load repo, issue, PR, and maintainer rules." },
    { key: "memory", title: "Context", text: "Hydrate repo memory and prior decisions." },
    { key: "huddle", title: "Huddle", text: "Manager convenes specialist agents." },
    { key: "verify", title: "Verify", text: "Run tests, static analysis, and custom checks." },
    { key: "rank", title: "Rank", text: "Synthesize score, PR comment, and leaderboard." },
  ];

  const statusOrder = {
    ready: -1,
    intake: 0,
    memory: 1,
    huddle: 2,
    verify: 3,
    rank: 4,
    complete: 5,
  };

  refs.pipelineTrack.innerHTML = "";
  steps.forEach((step, index) => {
    const item = document.createElement("article");
    item.className = "pipeline-stage";
    if (index < statusOrder[state.pipelineStatus]) {
      item.classList.add("is-complete");
    } else if (index === statusOrder[state.pipelineStatus]) {
      item.classList.add("is-active");
    }
    item.innerHTML = `<strong>${step.title}</strong><p>${step.text}</p>`;
    refs.pipelineTrack.appendChild(item);
  });

  refs.pipelineBadge.textContent =
    state.pipelineStatus === "ready"
      ? "Ready"
      : state.pipelineStatus === "complete"
        ? "Finished"
        : state.pipelineStatus;
}

function renderAgents() {
  refs.agentGrid.innerHTML = "";
  appData.personas.forEach((persona) => {
    const card = document.createElement("article");
    card.className = "agent-card";
    const status = state.running ? "Reviewing" : "Idle";
    card.innerHTML = `
      <div class="agent-card-header">
        <div>
          <strong>${persona.name}</strong>
          <p class="panel-copy">${persona.role}</p>
        </div>
        <span class="status-chip ${state.running ? "warning" : "success"}">${status}</span>
      </div>
      <p>${persona.summary}</p>
      <div class="agent-meta">
        <span class="badge-chip">${persona.voice}</span>
        <button class="icon-chip" type="button" data-speak-persona="${persona.id}">Play voice</button>
      </div>
    `;
    refs.agentGrid.appendChild(card);
  });
}

function renderSubmission() {
  const repo = getActiveRepo();
  const submission = getSelectedSubmission(repo);

  if (!submission) {
    refs.submissionStatusBadge.textContent = "Idle";
    refs.submissionScore.textContent = "--";
    refs.submissionScoreCaption.textContent = "Queue a PR to start evaluation.";
    refs.scoreBreakdown.innerHTML = "";
    refs.commentPreviewText.textContent = "The manager verdict will appear here.";
    return;
  }

  refs.submissionStatusBadge.textContent = submission.score ? "Scored" : "Queued";
  refs.submissionScore.textContent = submission.score ? submission.score.toFixed(1) : "--";
  refs.submissionScoreCaption.textContent = `${submission.agent} · ${submission.pr}`;
  refs.commentPreviewText.textContent = state.currentComment;

  const config = getRepoConfig(repo.id);
  const breakdown = submission.breakdown || {
    correctness: 0,
    quality: 0,
    safety: 0,
    efficiency: 0,
  };
  refs.scoreBreakdown.innerHTML = "";
  [
    ["Correctness", "correctness"],
    ["Quality", "quality"],
    ["Safety", "safety"],
    ["Efficiency", "efficiency"],
  ].forEach(([label, key]) => {
    const meter = document.createElement("div");
    meter.className = "meter";
    const max = config.weights[key];
    const value = breakdown[key] || 0;
    meter.innerHTML = `
      <div class="meter-label">
        <span>${label}</span>
        <span>${value}/${max}</span>
      </div>
      <div class="meter-track"><span style="width: ${(value / Math.max(max, 1)) * 100}%"></span></div>
    `;
    refs.scoreBreakdown.appendChild(meter);
  });
}

function renderTranscript() {
  refs.transcriptList.innerHTML = "";
  const transcript = state.currentTranscript.length ? state.currentTranscript : buildTranscript(getSelectedRepo(), getSelectedSubmission(getSelectedRepo()) || {
    pr: "pending PR",
    comment: "Queue a submission to generate the manager verdict.",
  });
  transcript.forEach((item) => {
    const row = document.createElement("article");
    row.className = "transcript-row";
    row.innerHTML = `
      <div class="transcript-row-header">
        <span class="transcript-name">${item.speaker} · ${item.role}</span>
        <button class="icon-chip" type="button" data-speak-line="${escapeAttribute(
          `${item.speaker}. ${item.note}`
        )}">Play</button>
      </div>
      <div class="transcript-note">${item.note}</div>
    `;
    refs.transcriptList.appendChild(row);
  });
}

function renderVerdict() {
  const repo = getActiveRepo();
  const submission = getSelectedSubmission(repo);
  refs.managerSummary.textContent = submission
    ? submission.comment
    : "Queue a submission and run the judge to generate the manager synthesis.";
  refs.maintainerEscalation.textContent = repo.maintainerEscalation;
  refs.verificationStatus.innerHTML = "";

  const verificationRows = [
    "Baseline repo tests are attached to every run.",
    "Custom maintainer tests become permanent for this repo.",
    "Final PR comment is generated after the huddle and verification pass.",
  ];
  verificationRows.forEach((row) => {
    const item = document.createElement("li");
    item.textContent = row;
    refs.verificationStatus.appendChild(item);
  });
}

function renderMemory() {
  const repo = getActiveRepo();
  refs.memoryBadge.textContent = `${repo.memory.decisions.length} prior decisions`;
  refs.memoryCards.innerHTML = "";
  const cards = [
    ["Accepted pattern", repo.memory.acceptedPattern],
    ["Maintainer preference", repo.memory.maintainerPreference],
    ["Common failure mode", repo.memory.failureMode],
  ];
  cards.forEach(([label, text]) => {
    const card = document.createElement("div");
    card.className = "memory-stat";
    card.innerHTML = `<span class="card-label">${label}</span><strong>${text}</strong>`;
    refs.memoryCards.appendChild(card);
  });

  refs.memoryTimeline.innerHTML = "";
  repo.memory.decisions.forEach((decision) => {
    const item = document.createElement("article");
    item.className = "timeline-row";
    item.innerHTML = `<div><strong>${decision.title}</strong><p>${decision.detail}</p></div>`;
    refs.memoryTimeline.appendChild(item);
  });
}

function renderMaintainerPanel() {
  const repo = getActiveRepo();
  const config = getRepoConfig(repo.id);
  refs.maintainerNotes.value = config.notes;
  refs.weightCorrectness.value = config.weights.correctness;
  refs.weightQuality.value = config.weights.quality;
  refs.weightSafety.value = config.weights.safety;
  refs.weightEfficiency.value = config.weights.efficiency;

  refs.customTestList.innerHTML = "";
  config.customTests.forEach((test, index) => {
    const item = document.createElement("div");
    item.className = "custom-test-item";
    item.innerHTML = `
      <span>${test}</span>
      <button class="icon-chip" type="button" data-remove-test="${index}">Remove</button>
    `;
    refs.customTestList.appendChild(item);
  });

  if (!config.customTests.length) {
    refs.customTestList.innerHTML =
      '<p class="helper-copy">No extra maintainer tests yet. Add one to make this repo stricter over time.</p>';
  }
}

function renderVerification() {
  const repo = getActiveRepo();
  const config = getRepoConfig(repo.id);
  refs.verificationGrid.innerHTML = "";
  [...repo.verification, ...config.customTests.map((test) => ({
    name: "Maintainer custom test",
    command: test,
    description: "Saved locally for this repo and re-run on every demo submission.",
  }))].forEach((item) => {
    const card = document.createElement("article");
    card.className = "verification-card";
    card.innerHTML = `
      <strong>${item.name}</strong>
      <span class="command-chip">${item.command}</span>
      <p class="panel-copy">${item.description}</p>
    `;
    refs.verificationGrid.appendChild(card);
  });
}

function renderLeaderboard() {
  const repo = getActiveRepo();
  const submissions = getRepoSubmissions(repo)
    .slice()
    .sort((left, right) => (right.score || 0) - (left.score || 0));

  refs.leaderboardLabel.textContent = `${submissions.length} submissions`;
  refs.leaderboardList.innerHTML = "";

  submissions.forEach((submission, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "leaderboard-row";
    if (index === 0) {
      row.classList.add("is-top");
    }
    row.innerHTML = `
      <span class="leaderboard-rank">#${index + 1}</span>
      <div class="leaderboard-main">
        <div>
          <strong>${submission.agent}</strong>
          <div class="leaderboard-meta">${submission.pr} · ${submission.notes}</div>
        </div>
        <strong class="leaderboard-score">${submission.score ? submission.score.toFixed(1) : "Pending"}</strong>
      </div>
    `;
    row.addEventListener("click", () => {
      state.activeSubmissionId = submission.id;
      state.currentComment = buildComment(repo, submission, submission.breakdown || {
        correctness: 0,
        quality: 0,
        safety: 0,
        efficiency: 0,
      });
      state.currentTranscript = buildTranscript(repo, submission);
      renderSubmission();
      renderTranscript();
      renderVerdict();
    });
    refs.leaderboardList.appendChild(row);
  });

  const winner = submissions[0];
  refs.winningPattern.textContent = winner
    ? `${winner.agent} is currently ahead because the patch fits repo history, passes the strongest verification suite, and does not overreach beyond what maintainers have accepted before.`
    : "No submissions yet.";
  refs.shareSummary.textContent = winner
    ? `${repo.name} · issue #${repo.issueNumber}: ${winner.agent} leads ${submissions.length} PRs with a ${winner.score.toFixed(1)} score on PRx.`
    : "Shareable leaderboard copy will appear once submissions exist.";
}

function renderSignupForm() {
  const { signupForm, formMessage } = refs;
  if (!signupForm || !formMessage) {
    return;
  }

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  signupForm.action = formConfig.action;
  signupForm.method = "POST";
  signupForm.target = "_blank";
  nameInput.name = formConfig.fields.name;
  emailInput.name = formConfig.fields.email;
  formMessage.textContent = "Google Form is connected. Submissions open in a new tab.";
}

function renderApp() {
  const repo = getActiveRepo();
  const selectedSubmission = getSelectedSubmission(repo);

  if (!state.currentTranscript.length && selectedSubmission) {
    state.currentTranscript = buildTranscript(repo, selectedSubmission);
  }

  if (state.currentComment === "The manager verdict will appear here." && selectedSubmission) {
    state.currentComment = buildComment(
      repo,
      selectedSubmission,
      selectedSubmission.breakdown || {
        correctness: 0,
        quality: 0,
        safety: 0,
        efficiency: 0,
      }
    );
  }

  renderPipeline();
  renderAgents();
  renderMemory();
  renderMaintainerPanel();
  renderVerification();
  renderLeaderboard();
  renderTranscript();
  renderVerdict();
  renderSignupForm();
}

function queueSubmission(event) {
  event.preventDefault();
  const repo = getActiveRepo();
  const agent = document.getElementById("submission-agent").value.trim();
  const url = document.getElementById("submission-url").value.trim();
  const notes = document.getElementById("submission-notes").value.trim() || "No notes supplied.";

  if (!agent || !url) {
    refs.submissionMessage.textContent = "Add an agent name and PR URL first.";
    return;
  }

  const submission = {
    id: `${repo.id}-${Date.now()}`,
    agent,
    pr: useLiveMode() ? url.split("/").slice(-2).join("/") : "PRx demo",
    url,
    notes,
    score: null,
    breakdown: null,
    comment: "Queued for orchestrated review.",
  };

  if (useLiveMode()) {
    const liveSubmissions = Array.isArray(state.live.submissions) ? state.live.submissions : [];
    state.live.submissions = [...liveSubmissions, submission];
    saveLiveState();
  } else {
    const nextSubmissions = [...(state.customSubmissions[repo.id] || []), submission];
    state.customSubmissions[repo.id] = nextSubmissions;
    saveJson(storageKeys.submissions, state.customSubmissions);
  }
  state.activeSubmissionId = submission.id;
  state.pipelineStatus = "ready";
  state.currentComment = "The manager verdict will appear here.";
  state.currentTranscript = buildTranscript(repo, submission);
  refs.submissionForm.reset();
  refs.submissionMessage.textContent = useLiveMode()
    ? "Submission queued. Run the live judge to score it against the backend."
    : "Submission queued. Run the judge demo to score it.";
  renderApp();
}

function updateCustomSubmission(repoId, submissionId, patch) {
  if (repoId === "live") {
    state.live.submissions = state.live.submissions.map((submission) =>
      submission.id === submissionId ? { ...submission, ...patch } : submission
    );
    saveLiveState();
    return;
  }
  const submissions = state.customSubmissions[repoId] || [];
  state.customSubmissions[repoId] = submissions.map((submission) =>
    submission.id === submissionId ? { ...submission, ...patch } : submission
  );
  saveJson(storageKeys.submissions, state.customSubmissions);
}

async function runJudgeDemo() {
  if (useLiveMode()) {
    await runLiveJudge();
    return;
  }

  const repo = getActiveRepo();
  const submission = getSelectedSubmission(repo);

  if (!submission) {
    refs.submissionMessage.textContent = "Queue a submission or select one from the leaderboard first.";
    return;
  }

  state.running = true;
  refs.submissionMessage.textContent = `Running the orchestrated judge on ${submission.agent}...`;
  const phases = ["intake", "memory", "huddle", "verify", "rank", "complete"];

  phases.forEach((phase, index) => {
    window.setTimeout(() => {
      state.pipelineStatus = phase;
      if (phase === "complete") {
        const result = scoreSubmission({ repo, agent: submission.agent, url: submission.url });
        const comment = submission.score
          ? submission.comment
          : `PRx ranks this patch highly for correctness and repo alignment, with one maintainer-facing note captured for follow-up.`;
        const nextSubmission = {
          ...submission,
          score: result.score,
          breakdown: result.breakdown,
          comment,
        };

        if (submission.id.startsWith(repo.id) && !repo.submissions.find((item) => item.id === submission.id)) {
          updateCustomSubmission(repo.id, submission.id, nextSubmission);
        }

        state.activeSubmissionId = submission.id;
        state.currentTranscript = buildTranscript(repo, nextSubmission);
        state.currentComment = buildComment(repo, nextSubmission, result.breakdown);
        state.running = false;
        refs.submissionMessage.textContent = `Judge complete. ${submission.agent} has been ranked on the board.`;
      }
      renderApp();
    }, index * 850);
  });
}

function saveMaintainerConfig(event) {
  event.preventDefault();
  const repo = getActiveRepo();

  if (useLiveMode()) {
    void saveLiveMaintainerConfig();
    return;
  }

  state.customMaintainer[repo.id] = {
    notes: refs.maintainerNotes.value.trim(),
    customTests: getRepoConfig(repo.id).customTests,
    weights: {
      correctness: Number(refs.weightCorrectness.value) || 0,
      quality: Number(refs.weightQuality.value) || 0,
      safety: Number(refs.weightSafety.value) || 0,
      efficiency: Number(refs.weightEfficiency.value) || 0,
    },
  };
  saveJson(storageKeys.maintainer, state.customMaintainer);
  refs.maintainerMessage.textContent = "Repo rules saved for this browser session.";
  renderApp();
}

function addCustomTest() {
  const repo = getActiveRepo();
  const value = refs.customTestInput.value.trim();
  if (!value) {
    refs.maintainerMessage.textContent = "Add a command before saving a custom test.";
    return;
  }

  if (useLiveMode()) {
    const current = state.live.repoConfig || { maintainer_notes: "", extra_test_commands: [] };
    state.live.repoConfig = {
      ...current,
      extra_test_commands: [...(current.extra_test_commands || []), value],
    };
    saveLiveState();
    refs.customTestInput.value = "";
    refs.maintainerMessage.textContent = "Custom test added locally. Save repo rules to persist it to the backend.";
    renderApp();
    return;
  }

  const config = getRepoConfig(repo.id);
  state.customMaintainer[repo.id] = {
    notes: config.notes,
    weights: config.weights,
    customTests: [...config.customTests, value],
  };
  saveJson(storageKeys.maintainer, state.customMaintainer);
  refs.customTestInput.value = "";
  refs.maintainerMessage.textContent = "Custom test added. It now runs on every PR for this repo.";
  renderApp();
}

function removeCustomTest(index) {
  const repo = getActiveRepo();

  if (useLiveMode()) {
    const current = state.live.repoConfig || { maintainer_notes: "", extra_test_commands: [] };
    state.live.repoConfig = {
      ...current,
      extra_test_commands: (current.extra_test_commands || []).filter(
        (_, itemIndex) => itemIndex !== index
      ),
    };
    saveLiveState();
    refs.maintainerMessage.textContent = "Custom test removed locally. Save repo rules to persist the change.";
    renderApp();
    return;
  }

  const config = getRepoConfig(repo.id);
  state.customMaintainer[repo.id] = {
    notes: config.notes,
    weights: config.weights,
    customTests: config.customTests.filter((_, itemIndex) => itemIndex !== index),
  };
  saveJson(storageKeys.maintainer, state.customMaintainer);
  refs.maintainerMessage.textContent = "Custom test removed.";
  renderApp();
}

function syncLiveInputsIntoState() {
  state.live.enabled = refs.liveModeEnabled.checked;
  state.live.backendUrl = sanitizeBackendUrl(refs.liveBackendUrl.value || state.live.backendUrl);
  state.live.repoUrl = refs.liveRepoUrl.value.trim();
  state.live.issueNumber = refs.liveIssueNumber.value.trim();
  state.live.issueHistoryLimit = Number(refs.liveHistoryLimit.value) || 8;
  saveLiveState();
}

async function registerLiveRepo() {
  syncLiveInputsIntoState();
  if (!state.live.repoUrl) {
    state.live.statusMessage = "Add a GitHub repository URL first.";
    renderApp();
    return;
  }

  state.live.statusMessage = "Registering repository with the live PRx judge...";
  renderApp();

  try {
    const payload = await apiRequest("/api/repos/register", {
      repo_url: state.live.repoUrl,
      issue_history_limit: state.live.issueHistoryLimit,
    });
    state.live.repoContext = payload.context;
    state.live.repoConfig = payload.config || { maintainer_notes: "", extra_test_commands: [] };
    state.live.issueTitle = state.live.issueNumber
      ? `Issue ${state.live.issueNumber}`
      : "Repository-wide evaluation";
    state.live.statusMessage = `Connected to ${payload.context.repo_slug}. Repo memory is now live.`;
    state.currentTranscript = [];
    state.currentComment = "The manager verdict will appear here.";
    saveLiveState();
    renderApp();
  } catch (error) {
    state.live.statusMessage = error instanceof Error ? error.message : "Failed to register repository.";
    renderApp();
  }
}

async function saveLiveMaintainerConfig() {
  syncLiveInputsIntoState();
  if (!state.live.repoContext) {
    state.live.statusMessage = "Register a repository before saving maintainer rules.";
    renderApp();
    return;
  }

  state.live.statusMessage = "Saving maintainer rules to the live backend...";
  renderApp();

  try {
    const config = await apiRequest(`/api/repos/${state.live.repoContext.repo_slug}/config`, {
      maintainer_notes: refs.maintainerNotes.value.trim(),
      extra_test_commands: (state.live.repoConfig?.extra_test_commands || []).slice(),
    });
    state.live.repoConfig = config;
    state.live.statusMessage = "Maintainer rules saved to the live backend.";
    refs.maintainerMessage.textContent = "Maintainer rules saved to the live backend.";
    saveLiveState();
    renderApp();
  } catch (error) {
    state.live.statusMessage = error instanceof Error ? error.message : "Failed to save maintainer rules.";
    renderApp();
  }
}

async function runLiveJudge() {
  syncLiveInputsIntoState();
  if (!state.live.repoContext && state.live.repoUrl) {
    await registerLiveRepo();
    if (!state.live.repoContext) {
      return;
    }
  }

  const repo = getActiveRepo();
  const selectedSubmission = getSelectedSubmission(repo);
  const submission = selectedSubmission || buildLiveSubmissionFromInputs();

  state.running = true;
  state.pipelineStatus = "intake";
  state.live.statusMessage = `Running live judge for ${submission.agent}...`;
  renderApp();

  try {
    const payload = {
      repo_url: state.live.repoUrl,
      issue_number: state.live.issueNumber ? Number(state.live.issueNumber) : null,
      issue_history_limit: state.live.issueHistoryLimit,
    };

    if (submission.url) {
      payload.pr_url = submission.url;
    }

    const result = await apiRequest("/api/judge/run", payload);

    const nextSubmission = {
      ...submission,
      pr:
        submission.url.split("/").slice(-2).join("/") ||
        result.pr_reference ||
        "default-branch",
      score: result.scorecard.total,
      breakdown: {
        correctness: result.scorecard.correctness,
        quality: result.scorecard.quality,
        safety: result.scorecard.safety,
        efficiency: result.scorecard.efficiency,
      },
      comment: result.final_comment.split("\n").filter(Boolean).slice(-1)[0] || "Live judge complete.",
    };

    state.live.repoContext = result.context;
    state.live.issueTitle = result.issue_title;
    state.pipelineStatus = "complete";
    state.running = false;
    state.currentComment = result.final_comment;
    state.currentTranscript = buildLiveTranscript(result, nextSubmission);
    if (selectedSubmission) {
      updateCustomSubmission("live", submission.id, nextSubmission);
    } else {
      const liveSubmissions = Array.isArray(state.live.submissions) ? state.live.submissions : [];
      state.live.submissions = [...liveSubmissions, nextSubmission];
      state.activeSubmissionId = nextSubmission.id;
      saveLiveState();
    }
    state.live.statusMessage = `Live judge complete for ${result.repo_slug}. Score: ${result.scorecard.total}.`;
    refs.submissionMessage.textContent = submission.url
      ? "Live judge complete. The scorecard now reflects backend results."
      : "Live repository evaluation complete. Add a PR URL to judge a specific pull request next.";
    saveLiveState();
    renderApp();
  } catch (error) {
    state.running = false;
    state.pipelineStatus = "ready";
    state.live.statusMessage = error instanceof Error ? error.message : "Live judge failed.";
    renderApp();
  }
}

function escapeAttribute(value) {
  return value.replace(/"/g, "&quot;");
}

function speakText(text, pitch = 1, rate = 1) {
  if (!synth) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = pitch;
  utterance.rate = rate;
  activeUtterances.push(utterance);
  synth.speak(utterance);
}

function stopSpeech() {
  if (!synth) {
    return;
  }
  activeUtterances = [];
  synth.cancel();
}

function playPersona(personaId) {
  const persona = appData.personas.find((item) => item.id === personaId);
  if (!persona) {
    return;
  }
  stopSpeech();
  speakText(`${persona.name}, ${persona.role}. ${persona.summary}`, 1, 0.95);
}

function playHuddle() {
  const transcript = state.currentTranscript.length
    ? state.currentTranscript
    : buildTranscript(getSelectedRepo(), getSelectedSubmission(getSelectedRepo()) || {
        pr: "pending PR",
        comment: "Queue a submission to generate the manager verdict.",
      });

  if (!synth) {
    return;
  }

  stopSpeech();
  transcript.forEach((row, index) => {
    window.setTimeout(() => {
      speakText(`${row.speaker}. ${row.note}`, row.role === "Security" ? 0.9 : 1, 0.92);
    }, index * 160);
  });
}

function copyComment() {
  const text = refs.commentPreviewText.textContent;
  if (!navigator.clipboard) {
    refs.submissionMessage.textContent = "Clipboard access is unavailable on this page.";
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      refs.submissionMessage.textContent = "PR comment copied to clipboard.";
    })
    .catch(() => {
      refs.submissionMessage.textContent = "Clipboard access was blocked by the browser.";
    });
}

document.addEventListener("click", (event) => {
  const personaButton = event.target.closest("[data-speak-persona]");
  if (personaButton) {
    playPersona(personaButton.getAttribute("data-speak-persona"));
    return;
  }

  const lineButton = event.target.closest("[data-speak-line]");
  if (lineButton) {
    stopSpeech();
    speakText(lineButton.getAttribute("data-speak-line"), 1, 0.95);
    return;
  }

  const removeButton = event.target.closest("[data-remove-test]");
  if (removeButton) {
    removeCustomTest(Number(removeButton.getAttribute("data-remove-test")));
  }
});

refs.playHuddle?.addEventListener("click", playHuddle);
refs.stopHuddle?.addEventListener("click", stopSpeech);
refs.maintainerForm?.addEventListener("submit", saveMaintainerConfig);
refs.addCustomTest?.addEventListener("click", addCustomTest);

refs.signupForm?.addEventListener("submit", () => {
  refs.formMessage.textContent = "Opening Google Form submission...";
});

renderApp();
