import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  LayoutDashboard,
  MessageSquare,
  Clock3,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sparkles,
  ArrowUpRight,
  Database,
  Activity,
  Plus,
  Send,
  Check,
  Menu,
  X,
  Users,
  CalendarDays,
  Lightbulb,
  ChevronDown,
  ShieldCheck,
  History,
  Target,
} from "lucide-react";

import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  // =========================================================
  // STATE
  // =========================================================

  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [hindsightStatus, setHindsightStatus] =
    useState("Checking...");

  const [activePage, setActivePage] = useState("dashboard");

  // ---------------------------------------------------------
  // ASK DECISIA
  // ---------------------------------------------------------

  const [askQuery, setAskQuery] = useState("");
  const [askAnswer, setAskAnswer] = useState("");
  const [memories, setMemories] = useState([]);
  const [memoryCount, setMemoryCount] = useState(0);
  const [loadingAsk, setLoadingAsk] = useState(false);
  const [askError, setAskError] = useState("");

  // ---------------------------------------------------------
  // ADD CONVERSATION
  // ---------------------------------------------------------

  const [conversationText, setConversationText] = useState("");
  const [loadingRetain, setLoadingRetain] = useState(false);
  const [retainSuccess, setRetainSuccess] = useState("");
  const [retainError, setRetainError] = useState("");
  const [lastStoredConversation, setLastStoredConversation] =
    useState("");

  // ---------------------------------------------------------
  // MOBILE MENU
  // ---------------------------------------------------------

  const [mobileMenu, setMobileMenu] = useState(false);

  // =========================================================
  // CHECK BACKEND + HINDSIGHT
  // =========================================================

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    // -------------------------------------------------------
    // FastAPI
    // -------------------------------------------------------

    try {
      const response = await fetch(
        `${API_BASE_URL}/health`
      );

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      const data = await response.json();

      if (data.status === "healthy") {
        setBackendStatus("Connected");
      } else {
        setBackendStatus("Offline");
      }
    } catch {
      setBackendStatus("Offline");
    }

    // -------------------------------------------------------
    // Hindsight
    // -------------------------------------------------------

    try {
      const response = await fetch(
        `${API_BASE_URL}/hindsight/health`
      );

      if (!response.ok) {
        throw new Error("Hindsight unavailable");
      }

      const data = await response.json();

      if (data.status === "connected") {
        setHindsightStatus("Connected");
      } else {
        setHindsightStatus("Offline");
      }
    } catch {
      setHindsightStatus("Offline");
    }
  };

  // =========================================================
  // ASK DECISIA
  // =========================================================

  const askDecisia = async () => {
    const query = askQuery.trim();

    if (!query) {
      return;
    }

    setLoadingAsk(true);
    setAskAnswer("");
    setMemories([]);
    setMemoryCount(0);
    setAskError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/memory/recall`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to recall memory from Hindsight."
        );
      }

      // -----------------------------------------------------
      // HINDSIGHT RESULTS
      // -----------------------------------------------------

      const results = Array.isArray(data?.memories)
        ? data.memories
        : [];

      setMemories(results);

      setMemoryCount(
        typeof data?.memory_count === "number"
          ? data.memory_count
          : results.length
      );

      // -----------------------------------------------------
      // AI ANSWER
      // -----------------------------------------------------

      if (data?.answer?.trim()) {
        setAskAnswer(data.answer.trim());
      } else if (results.length === 0) {
        setAskAnswer(
          "I couldn't find any relevant memories for this question."
        );
      } else {
        const bestMemory = results[0];

        const memoryText =
          bestMemory?.text ||
          bestMemory?.content ||
          "I found a relevant memory, but its text was unavailable.";

        setAskAnswer(
          `Based on remembered context: ${memoryText}`
        );
      }
    } catch (error) {
      setAskError(
        error.message ||
          "Unable to connect to DECISIA."
      );
    } finally {
      setLoadingAsk(false);
    }
  };

  // =========================================================
  // RETAIN CONVERSATION
  // =========================================================

  const retainConversation = async () => {
    const content = conversationText.trim();

    if (!content) {
      setRetainError(
        "Please enter a meeting or conversation first."
      );
      setRetainSuccess("");
      return;
    }

    setLoadingRetain(true);
    setRetainSuccess("");
    setRetainError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/memory/retain`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to store conversation."
        );
      }

      setRetainSuccess(
        "Conversation successfully remembered by DECISIA."
      );

      setLastStoredConversation(content);

      setConversationText("");
    } catch (error) {
      setRetainError(
        error.message ||
          "Unable to connect to DECISIA."
      );
    } finally {
      setLoadingRetain(false);
    }
  };

  // =========================================================
  // ENTER KEY
  // =========================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      askDecisia();
    }
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "add",
      label: "Add Conversation",
      icon: Plus,
    },
    {
      id: "ask",
      label: "Ask DECISIA",
      icon: MessageSquare,
    },
    {
      id: "memories",
      label: "Memory Timeline",
      icon: Clock3,
    },
    {
      id: "decisions",
      label: "Decisions",
      icon: FileText,
    },
    {
      id: "commitments",
      label: "Commitments",
      icon: CheckCircle2,
    },
    {
      id: "conflicts",
      label: "Conflicts",
      icon: AlertTriangle,
    },
  ];

  // =========================================================
  // DEMO DATA
  // =========================================================

  const recentDecisions = [
    {
      title: "Client rejected dark theme",
      project: "Website Redesign",
      date: "Sep 27, 2026",
      status: "Confirmed",
    },
    {
      title: "UI prototype assigned to Sarah",
      project: "Website Redesign",
      date: "Sep 27, 2026",
      status: "In Progress",
    },
    {
      title: "Launch moved to October",
      project: "Product Launch",
      date: "Sep 25, 2026",
      status: "Confirmed",
    },
  ];

  const memoryActivity = [
    {
      title: "Client interface preferences",
      type: "Preference",
      time: "2 min ago",
    },
    {
      title: "Sarah assigned UI prototype",
      type: "Commitment",
      time: "18 min ago",
    },
    {
      title: "Dark theme rejected",
      type: "Decision",
      time: "32 min ago",
    },
  ];

  // =========================================================
  // MEMORY CLEANING
  // =========================================================

  const getMemoryText = (memory) => {
    return (
      memory?.text ||
      memory?.content ||
      "Memory content unavailable."
    );
  };

  const getMemoryScore = (memory) => {
    const score = memory?.scores?.final;

    if (
      typeof score === "number" &&
      Number.isFinite(score)
    ) {
      return score;
    }

    return null;
  };

  /*
   * Hindsight can return several very similar memories.
   * We remove exact duplicates before showing evidence.
   */
  const uniqueMemories = useMemo(() => {
    const seen = new Set();

    return memories.filter((memory) => {
      const text = getMemoryText(memory)
        .trim()
        .toLowerCase();

      if (!text) {
        return false;
      }

      if (seen.has(text)) {
        return false;
      }

      seen.add(text);
      return true;
    });
  }, [memories]);

  /*
   * Only show the strongest useful evidence.
   *
   * We do NOT hide the total memory count because the
   * demo should still make it clear that Hindsight
   * searched persistent memory.
   */
  const visibleMemories = useMemo(() => {
    return uniqueMemories
      .filter((memory) => {
        const score = getMemoryScore(memory);

        if (score === null) {
          return true;
        }

        return score > 0.01;
      })
      .slice(0, 5);
  }, [uniqueMemories]);

  // =========================================================
  // SIDEBAR
  // =========================================================

  const renderSidebar = () => (
    <aside
      className={`sidebar ${
        mobileMenu ? "sidebar-open" : ""
      }`}
    >
      <div className="brand">
        <div className="brand-icon">
          <Brain size={24} />
        </div>

        <div>
          <h2>DECISIA</h2>
          <span>Decision Continuity AI</span>
        </div>

        <button
          className="close-menu"
          onClick={() =>
            setMobileMenu(false)
          }
        >
          <X size={20} />
        </button>
      </div>

      <div className="nav-section">
        <p className="nav-title">
          WORKSPACE
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActivePage(item.id);
                setMobileMenu(false);
              }}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-bottom">
        <div className="system-card">
          <div className="system-icon">
            <Activity size={18} />
          </div>

          <div>
            <strong>System Status</strong>

            <span>
              FastAPI{" "}
              <b
                className={
                  backendStatus === "Connected"
                    ? "online"
                    : ""
                }
              >
                {backendStatus}
              </b>
            </span>

            <span>
              Hindsight{" "}
              <b
                className={
                  hindsightStatus ===
                  "Connected"
                    ? "online"
                    : ""
                }
              >
                {hindsightStatus}
              </b>
            </span>
          </div>
        </div>

        <div className="profile">
          <div className="avatar">
            H
          </div>

          <div>
            <strong>Harika</strong>
            <span>Workspace Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );

  // =========================================================
  // DASHBOARD
  // =========================================================

  const renderDashboard = () => (
    <div className="page-content">
      <div className="topbar">
        <div>
          <p className="eyebrow">
            AI DECISION INTELLIGENCE
          </p>

          <h1>
            Good evening, Harika 👋
          </h1>

          <p className="subtitle">
            Your decisions, context, and
            commitments — continuously
            remembered.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setActivePage("add")
          }
        >
          <Plus size={18} />
          Add Conversation
        </button>
      </div>

      <div className="insight-banner">
        <div className="insight-icon">
          <Sparkles size={22} />
        </div>

        <div>
          <strong>
            Memory insight
          </strong>

          <p>
            DECISIA remembers why decisions
            were made, not just what was said.
          </p>
        </div>

        <button
          onClick={() =>
            setActivePage("memories")
          }
        >
          Explore memory
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Memories</span>
            <Database size={19} />
          </div>

          <h2>128</h2>

          <p className="positive">
            +12 this week
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Decisions</span>
            <FileText size={19} />
          </div>

          <h2>34</h2>

          <p className="positive">
            +5 this week
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Commitments</span>
            <CheckCircle2 size={19} />
          </div>

          <h2>17</h2>

          <p>
            4 due this week
          </p>
        </div>

        <div className="stat-card warning-card">
          <div className="stat-top">
            <span>Conflicts</span>
            <AlertTriangle size={19} />
          </div>

          <h2>2</h2>

          <p className="warning-text">
            Needs attention
          </p>
        </div>
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Recent Decisions
              </h3>

              <p>
                Important decisions remembered
                by DECISIA
              </p>
            </div>

            <button
              onClick={() =>
                setActivePage(
                  "decisions"
                )
              }
            >
              View all
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="decision-list">
            {recentDecisions.map(
              (decision, index) => (
                <div
                  className="decision-row"
                  key={index}
                >
                  <div className="decision-icon">
                    <FileText size={17} />
                  </div>

                  <div className="decision-info">
                    <strong>
                      {decision.title}
                    </strong>

                    <span>
                      {decision.project} •{" "}
                      {decision.date}
                    </span>
                  </div>

                  <span
                    className={`status ${
                      decision.status ===
                      "In Progress"
                        ? "progress"
                        : "confirmed"
                    }`}
                  >
                    {decision.status}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Memory Activity
              </h3>

              <p>
                Recently retained context
              </p>
            </div>

            <Clock3 size={18} />
          </div>

          <div className="activity-list">
            {memoryActivity.map(
              (item, index) => (
                <div
                  className="activity-row"
                  key={index}
                >
                  <div className="activity-dot"></div>

                  <div>
                    <strong>
                      {item.title}
                    </strong>

                    <span>
                      {item.type} •{" "}
                      {item.time}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>

      <section className="quick-actions">
        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Continue working with your
            decision memory.
          </p>
        </div>

        <div className="quick-buttons">
          <button
            onClick={() =>
              setActivePage("add")
            }
          >
            <Plus size={18} />
            Add Conversation
          </button>

          <button
            onClick={() =>
              setActivePage("ask")
            }
          >
            <MessageSquare size={18} />
            Ask DECISIA
          </button>

          <button
            onClick={() =>
              setActivePage("memories")
            }
          >
            <Clock3 size={18} />
            Memory Timeline
          </button>

          <button
            onClick={() =>
              setActivePage("conflicts")
            }
          >
            <AlertTriangle size={18} />
            Check Conflicts
          </button>
        </div>
      </section>
    </div>
  );

  // =========================================================
  // ADD CONVERSATION PAGE
  // =========================================================

  const renderAddConversationPage =
    () => (
      <div className="page-content">
        <div className="topbar">
          <div>
            <p className="eyebrow">
              HINDSIGHT RETAIN
            </p>

            <h1>
              Add Conversation
            </h1>

            <p className="subtitle">
              Give DECISIA a meeting,
              discussion, or project
              conversation to remember for
              future decisions.
            </p>
          </div>
        </div>

        <div className="content-grid">
          <section className="panel conversation-panel">
            <div className="panel-header">
              <div>
                <h3>
                  Conversation / Meeting
                  Notes
                </h3>

                <p>
                  DECISIA will store this
                  context in persistent
                  Hindsight memory.
                </p>
              </div>

              <Database size={19} />
            </div>

            <textarea
              className="conversation-input"
              value={conversationText}
              onChange={(event) => {
                setConversationText(
                  event.target.value
                );

                setRetainError("");
                setRetainSuccess("");
              }}
              placeholder={`Example:

Client meeting — September 28

The client prefers a light blue and white interface.
They rejected the previous dark theme.

Sarah will prepare the UI prototype by October 2.
Alex will complete the database schema by October 1.

The team decided to use React for the frontend.`}
            />

            <div className="conversation-footer">
              <span>
                {conversationText.length}{" "}
                characters
              </span>

              <button
                className="primary-button"
                onClick={
                  retainConversation
                }
                disabled={
                  loadingRetain
                }
              >
                {loadingRetain ? (
                  <>
                    <Activity
                      size={18}
                    />
                    Remembering...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Remember
                    Conversation
                  </>
                )}
              </button>
            </div>

            {retainSuccess && (
              <div className="success-message">
                <div className="success-icon">
                  <Check size={18} />
                </div>

                <div>
                  <strong>
                    Memory stored
                    successfully
                  </strong>

                  <span>
                    {retainSuccess}
                  </span>
                </div>
              </div>
            )}

            {retainError && (
              <div className="error-message">
                <div className="error-icon">
                  <AlertTriangle
                    size={18}
                  />
                </div>

                <div>
                  <strong>
                    Unable to store
                    memory
                  </strong>

                  <span>
                    {retainError}
                  </span>
                </div>
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>
                  What DECISIA remembers
                </h3>

                <p>
                  Useful information becomes
                  persistent context.
                </p>
              </div>

              <Brain size={19} />
            </div>

            <div className="memory-types">
              <div className="memory-type-card">
                <div className="memory-type-icon">
                  <Lightbulb
                    size={18}
                  />
                </div>

                <div>
                  <strong>
                    Decisions
                  </strong>

                  <span>
                    What the team decided
                    and why.
                  </span>
                </div>
              </div>

              <div className="memory-type-card">
                <div className="memory-type-icon">
                  <Users size={18} />
                </div>

                <div>
                  <strong>
                    People &
                    Responsibilities
                  </strong>

                  <span>
                    Who is responsible
                    for what.
                  </span>
                </div>
              </div>

              <div className="memory-type-card">
                <div className="memory-type-icon">
                  <CalendarDays
                    size={18}
                  />
                </div>

                <div>
                  <strong>
                    Deadlines &
                    Commitments
                  </strong>

                  <span>
                    Important dates and
                    agreed actions.
                  </span>
                </div>
              </div>

              <div className="memory-type-card">
                <div className="memory-type-icon">
                  <MessageSquare
                    size={18}
                  />
                </div>

                <div>
                  <strong>
                    Preferences &
                    Context
                  </strong>

                  <span>
                    Client preferences
                    and conversation
                    history.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {lastStoredConversation && (
          <section className="panel stored-preview">
            <div className="panel-header">
              <div>
                <h3>
                  Last Stored
                  Conversation
                </h3>

                <p>
                  This content was
                  successfully sent to
                  Hindsight RETAIN.
                </p>
              </div>

              <CheckCircle2
                size={20}
              />
            </div>

            <div className="stored-content">
              {lastStoredConversation}
            </div>

            <div className="stored-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setActivePage("ask")
                }
              >
                <MessageSquare
                  size={17}
                />
                Ask DECISIA
                About It
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  setActivePage(
                    "memories"
                  )
                }
              >
                <Clock3 size={17} />
                View Memory
                Timeline
              </button>
            </div>
          </section>
        )}
      </div>
    );

  // =========================================================
  // ASK DECISIA PAGE
  // =========================================================

  const renderAskPage = () => (
    <div className="page-content">
      <div className="topbar">
        <div>
          <p className="eyebrow">
            HINDSIGHT RECALL
          </p>

          <h1>
            Ask DECISIA
          </h1>

          <p className="subtitle">
            Ask questions about decisions,
            preferences, commitments, and
            past conversations.
          </p>
        </div>
      </div>

      {/* =====================================================
          ASK HERO
      ===================================================== */}

      <section className="ask-hero">
        <div className="ask-icon">
          <Brain size={30} />
        </div>

        <div className="memory-powered-label">
          <ShieldCheck size={15} />
          Persistent memory powered
        </div>

        <h2>
          What do you want to remember?
        </h2>

        <p>
          DECISIA searches persistent
          Hindsight memory, retrieves
          relevant context, and reasons
          over it before answering.
        </p>

        <div className="ask-box">
          <Search size={21} />

          <input
            type="text"
            value={askQuery}
            onChange={(event) =>
              setAskQuery(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            placeholder="Example: What interface style does the client prefer?"
          />

          <button
            onClick={askDecisia}
            disabled={loadingAsk}
          >
            {loadingAsk
              ? "Thinking..."
              : "Ask"}
          </button>
        </div>

        <div className="suggestion-row">
          <button
            onClick={() =>
              setAskQuery(
                "What interface style does the client prefer?"
              )
            }
          >
            Client preferences
          </button>

          <button
            onClick={() =>
              setAskQuery(
                "Who is responsible for the UI prototype?"
              )
            }
          >
            Assigned responsibilities
          </button>

          <button
            onClick={() =>
              setAskQuery(
                "What decisions were made about the website?"
              )
            }
          >
            Website decisions
          </button>

          <button
            onClick={() =>
              setAskQuery(
                "What deadlines were discussed?"
              )
            }
          >
            Deadlines
          </button>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loadingAsk && askError && (
        <section className="error-message ask-error">
          <div className="error-icon">
            <AlertTriangle
              size={18}
            />
          </div>

          <div>
            <strong>
              DECISIA couldn't complete
              the recall
            </strong>

            <span>{askError}</span>
          </div>
        </section>
      )}

      {/* =====================================================
          MEMORY PIPELINE
      ===================================================== */}

      {loadingAsk && (
        <section className="recall-pipeline">
          <div className="pipeline-step active">
            <div className="pipeline-icon">
              <Search size={18} />
            </div>

            <div>
              <strong>
                Searching memory
              </strong>

              <span>
                Hindsight is retrieving
                relevant context...
              </span>
            </div>
          </div>

          <div className="pipeline-line"></div>

          <div className="pipeline-step active">
            <div className="pipeline-icon">
              <Brain size={18} />
            </div>

            <div>
              <strong>
                Reasoning with context
              </strong>

              <span>
                DECISIA is generating a
                context-aware answer...
              </span>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          AI ANSWER
      ===================================================== */}

      {!loadingAsk && askAnswer && (
        <section className="answer-panel">
          <div className="answer-header">
            <div className="answer-title">
              <div className="small-ai-icon">
                <Brain size={17} />
              </div>

              <div>
                <strong>
                  DECISIA's Answer
                </strong>

                <span>
                  Context-aware response
                  from persistent memory
                </span>
              </div>
            </div>

            <div className="answer-badge">
              <Sparkles size={14} />
              AI + Memory
            </div>
          </div>

          <div className="answer-content">
            <p>{askAnswer}</p>
          </div>

          <div className="answer-footer">
            <div>
              <ShieldCheck
                size={16}
              />

              <span>
                Answer grounded in
                retrieved decision
                context
              </span>
            </div>

            {memoryCount > 0 && (
              <span>
                {memoryCount} memories
                searched
              </span>
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          MEMORY EVIDENCE
      ===================================================== */}

      {!loadingAsk &&
        askAnswer &&
        visibleMemories.length > 0 && (
          <section className="memory-results">
            <div className="memory-evidence-header">
              <div>
                <div className="evidence-title-row">
                  <Database
                    size={19}
                  />

                  <h3>
                    Memory Evidence
                  </h3>
                </div>

                <p>
                  The strongest relevant
                  context retrieved from
                  Hindsight.
                </p>
              </div>

              <div className="evidence-count">
                <strong>
                  {visibleMemories.length}
                </strong>

                <span>
                  evidence shown
                </span>
              </div>
            </div>

            <div className="hindsight-proof">
              <div className="hindsight-proof-icon">
                <Check size={15} />
              </div>

              <div>
                <strong>
                  Hindsight Recall
                </strong>

                <span>
                  {memoryCount} persistent
                  memories were searched
                  for this question.
                </span>
              </div>
            </div>

            <div className="memory-results-list">
              {visibleMemories.map(
                (memory, index) => {
                  const score =
                    getMemoryScore(
                      memory
                    );

                  return (
                    <div
                      className="memory-result"
                      key={
                        memory.id ||
                        `${index}-${getMemoryText(
                          memory
                        )}`
                      }
                    >
                      <div className="memory-number">
                        {index + 1}
                      </div>

                      <div className="memory-result-content">
                        <div className="memory-result-top">
                          <div className="memory-type">
                            {memory.type ||
                              "Relevant Memory"}
                          </div>

                          {score !==
                            null && (
                            <span className="memory-score">
                              Relevant
                            </span>
                          )}
                        </div>

                        <p>
                          {getMemoryText(
                            memory
                          )}
                        </p>

                        {memory.entities &&
                          memory.entities
                            .length >
                            0 && (
                            <div className="memory-entities">
                              {memory.entities
                                .slice(
                                  0,
                                  5
                                )
                                .map(
                                  (
                                    entity,
                                    entityIndex
                                  ) => (
                                    <span
                                      key={
                                        entityIndex
                                      }
                                    >
                                      {entity}
                                    </span>
                                  )
                                )}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {uniqueMemories.length >
              visibleMemories.length && (
              <div className="more-memory-note">
                <ChevronDown
                  size={17}
                />

                <span>
                  Additional related
                  memories were retrieved
                  but are hidden to keep
                  the evidence focused.
                </span>
              </div>
            )}
          </section>
        )}

      {/* =====================================================
          NO MEMORY FOUND
      ===================================================== */}

      {!loadingAsk &&
        askAnswer &&
        memories.length === 0 && (
          <section className="memory-results">
            <div className="panel-header">
              <div>
                <h3>
                  No Memory Evidence
                  Found
                </h3>

                <p>
                  DECISIA could not retrieve
                  relevant Hindsight memories
                  for this question.
                </p>
              </div>

              <Database size={19} />
            </div>
          </section>
        )}
    </div>
  );

  // =========================================================
  // PLACEHOLDER PAGES
  // =========================================================

  const renderPlaceholderPage = (
    title,
    eyebrow,
    description,
    icon
  ) => {
    const Icon = icon;

    return (
      <div className="page-content">
        <div className="topbar">
          <div>
            <p className="eyebrow">
              {eyebrow}
            </p>

            <h1>{title}</h1>

            <p className="subtitle">
              {description}
            </p>
          </div>
        </div>

        <div className="coming-soon">
          <div className="coming-icon">
            <Icon size={30} />
          </div>

          <h2>
            Module ready to build
          </h2>

          <p>
            This DECISIA module will be
            connected to the same
            persistent Hindsight memory
            layer.
          </p>
        </div>
      </div>
    );
  };

  // =========================================================
  // PAGE ROUTER
  // =========================================================

  const renderPage = () => {
    switch (activePage) {
      case "add":
        return renderAddConversationPage();

      case "ask":
        return renderAskPage();

      case "memories":
        return renderPlaceholderPage(
          "Memory Timeline",
          "PERSISTENT MEMORY",
          "Explore everything DECISIA has learned over time.",
          Clock3
        );

      case "decisions":
        return renderPlaceholderPage(
          "Decision History",
          "DECISION INTELLIGENCE",
          "Review important decisions and the context behind them.",
          FileText
        );

      case "commitments":
        return renderPlaceholderPage(
          "Commitment Tracking",
          "RESPONSIBILITY MEMORY",
          "Track who agreed to what and when it is due.",
          CheckCircle2
        );

      case "conflicts":
        return renderPlaceholderPage(
          "Conflict Detection",
          "CONTEXT CONSISTENCY",
          "Detect when new information conflicts with previous decisions.",
          AlertTriangle
        );

      default:
        return renderDashboard();
    }
  };

  // =========================================================
  // MAIN APP
  // =========================================================

  return (
    <div className="app">
      <button
        className="mobile-menu-button"
        onClick={() =>
          setMobileMenu(true)
        }
      >
        <Menu size={22} />
      </button>

      {renderSidebar()}

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;