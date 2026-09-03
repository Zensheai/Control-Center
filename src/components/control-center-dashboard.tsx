"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  CalendarEntry,
  ContentItem,
  InboxItem,
  Transaction,
  TrendingTopic
} from "@/lib/types";
import { CalendarQuickAdd } from "@/components/calendar-quick-add";
import { LogoutButton } from "@/components/logout-button";
import { PipelineBoard } from "@/components/pipeline-board";
import { QuickAddPanel } from "@/components/quick-add-panel";
import styles from "./control-center-dashboard.module.css";

type DashboardTab =
  | "today"
  | "pipeline"
  | "trends"
  | "calendar"
  | "inbox"
  | "finance";

type DashboardData = {
  content: ContentItem[];
  trends: TrendingTopic[];
  calendar: CalendarEntry[];
  transactions: Transaction[];
  inbox: InboxItem[];
  errors: string[];
};

const navigation: Array<{ id: DashboardTab; label: string; short: string }> = [
  { id: "today", label: "Today", short: "01" },
  { id: "pipeline", label: "Content pipeline", short: "02" },
  { id: "trends", label: "Trend radar", short: "03" },
  { id: "calendar", label: "Calendar", short: "04" },
  { id: "inbox", label: "Inbox", short: "05" },
  { id: "finance", label: "Finance", short: "06" }
];

function formatDate(value: string, includeTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {})
  }).format(date);
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function formatCompact(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className={styles.empty}>{children}</div>;
}

export function ControlCenterDashboard({
  data,
  userEmail
}: {
  data: DashboardData;
  userEmail: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("today");
  const [promotingTrendId, setPromotingTrendId] = useState<string | null>(null);
  const [trendActionMessage, setTrendActionMessage] = useState("");

  async function promoteTrend(trend: TrendingTopic) {
    setPromotingTrendId(trend.id);
    setTrendActionMessage("");

    const response = await fetch(`/api/trends/${trend.id}/promote`, {
      method: "POST"
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setTrendActionMessage(result?.error ?? "That trend could not be promoted.");
      setPromotingTrendId(null);
      return;
    }

    setTrendActionMessage(`“${trend.title}” is now an idea in your pipeline.`);
    setPromotingTrendId(null);
    setActiveTab("pipeline");
    router.refresh();
  }

  const metrics = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const currentMonth = data.transactions.filter((item) => {
      const date = new Date(`${item.transaction_date}T12:00:00`);
      return date.getMonth() === month && date.getFullYear() === year;
    });
    const revenue = currentMonth
      .filter((item) => item.transaction_type === "revenue")
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const expenses = currentMonth
      .filter((item) => item.transaction_type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const activeContent = data.content.filter(
      (item) => !["published", "archived"].includes(item.status)
    );
    const upcoming = data.calendar
      .filter((item) => new Date(item.starts_at).getTime() >= now.getTime())
      .sort(
        (left, right) =>
          new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime()
      );

    return {
      activeContent,
      expenses,
      net: revenue - expenses,
      newInbox: data.inbox.filter((item) => item.status === "new"),
      upcoming
    };
  }, [data]);

  const activeLabel = navigation.find((item) => item.id === activeTab)?.label;

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>K</span>
          <span>
            <strong>Keys to AI</strong>
            <small>Control Center</small>
          </span>
        </Link>

        <nav className={styles.navigation} aria-label="Control Center navigation">
          {navigation.map((item) => (
            <button
              aria-current={activeTab === item.id ? "page" : undefined}
              className={activeTab === item.id ? styles.activeNav : ""}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              type="button"
            >
              <span>{item.short}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.liveDot}>Private workspace</span>
          <small>{userEmail}</small>
          <LogoutButton />
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <p>Creator operations / {activeLabel}</p>
            <h1>{activeLabel}</h1>
          </div>
          <div className={styles.topbarActions}>
            <button onClick={() => setActiveTab("inbox")} type="button">
              + Quick capture
            </button>
            <Link href="/">View public site</Link>
          </div>
        </header>

        {data.errors.length > 0 ? (
          <div className={styles.errorBanner} role="status">
            Some workspace data could not be loaded: {data.errors.join(" · ")}
          </div>
        ) : null}

        {activeTab === "today" ? (
          <div className={styles.page}>
            <section className={styles.intro}>
              <div>
                <p className={styles.eyebrow}>Wednesday command brief</p>
                <h2>What deserves your attention today.</h2>
                <p>
                  A focused view of production, opportunities, commitments, and
                  cash movement across Keys to AI.
                </p>
              </div>
              <div className={styles.dateCard}>
                <span>Live workspace</span>
                <strong>
                  {new Intl.DateTimeFormat(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                  }).format(new Date())}
                </strong>
              </div>
            </section>

            <section className={styles.metricGrid} aria-label="Business snapshot">
              <article>
                <span>Active content</span>
                <strong>{metrics.activeContent.length}</strong>
                <small>Moving through production</small>
              </article>
              <article>
                <span>Fresh signals</span>
                <strong>{data.trends.length}</strong>
                <small>Topics ready to review</small>
              </article>
              <article>
                <span>Open inbox</span>
                <strong>{metrics.newInbox.length}</strong>
                <small>Ideas and follow-ups</small>
              </article>
              <article>
                <span>Monthly net</span>
                <strong className={metrics.net < 0 ? styles.negative : ""}>
                  {formatCurrency(metrics.net)}
                </strong>
                <small>{formatCurrency(metrics.expenses)} in expenses</small>
              </article>
            </section>

            <section className={styles.todayGrid}>
              <article className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div>
                    <p className={styles.eyebrow}>Production</p>
                    <h3>Next through the pipeline</h3>
                  </div>
                  <button onClick={() => setActiveTab("pipeline")} type="button">
                    See board →
                  </button>
                </div>
                <div className={styles.stackList}>
                  {metrics.activeContent.slice(0, 4).map((item) => (
                    <div className={styles.stackRow} key={item.id}>
                      <span className={styles.status}>{item.status}</span>
                      <div>
                        <strong>{item.title}</strong>
                        <small>
                          {item.content_type} · priority {item.priority}
                        </small>
                      </div>
                    </div>
                  ))}
                  {metrics.activeContent.length === 0 ? (
                    <EmptyState>Add your first idea to start the production board.</EmptyState>
                  ) : null}
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div>
                    <p className={styles.eyebrow}>Schedule</p>
                    <h3>Coming up</h3>
                  </div>
                  <button onClick={() => setActiveTab("calendar")} type="button">
                    Calendar →
                  </button>
                </div>
                <div className={styles.stackList}>
                  {metrics.upcoming.slice(0, 4).map((item) => (
                    <div className={styles.stackRow} key={item.id}>
                      <span className={styles.dateTile}>{formatDate(item.starts_at)}</span>
                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.entry_type} · {formatDate(item.starts_at, true)}</small>
                      </div>
                    </div>
                  ))}
                  {metrics.upcoming.length === 0 ? (
                    <EmptyState>No upcoming milestones are scheduled.</EmptyState>
                  ) : null}
                </div>
              </article>

              <article className={`${styles.panel} ${styles.widePanel}`}>
                <div className={styles.panelHeading}>
                  <div>
                    <p className={styles.eyebrow}>Opportunity radar</p>
                    <h3>Signals worth turning into content</h3>
                  </div>
                  <button onClick={() => setActiveTab("trends")} type="button">
                    Open radar →
                  </button>
                </div>
                <div className={styles.signalGrid}>
                  {data.trends.slice(0, 3).map((trend) => (
                    <article key={trend.id}>
                      <span>{trend.platform}</span>
                      <strong>{trend.title}</strong>
                      <small>
                        {trend.source_channel || "Trend feed"} · {formatCompact(trend.engagement_views)} views
                      </small>
                    </article>
                  ))}
                  {data.trends.length === 0 ? (
                    <EmptyState>Your trend feed is ready for its first ingestion.</EmptyState>
                  ) : null}
                </div>
              </article>
            </section>
          </div>
        ) : null}

        {activeTab === "pipeline" ? (
          <div className={styles.page}>
            <section className={styles.sectionIntro}>
              <p className={styles.eyebrow}>From spark to published</p>
              <h2>Move every idea forward.</h2>
              <p>Keep production visible without turning it into a second job.</p>
            </section>
            <div className={styles.componentSurface}>
              <PipelineBoard content={data.content} />
            </div>
            <div className={styles.componentSurface}>
              <QuickAddPanel />
            </div>
          </div>
        ) : null}

        {activeTab === "trends" ? (
          <div className={styles.page}>
            <section className={styles.sectionIntro}>
              <p className={styles.eyebrow}>YouTube + AI intelligence</p>
              <h2>Find the angle before the feed gets crowded.</h2>
              <p>Review emerging topics and promote the strongest ones into your pipeline.</p>
            </section>
            <section className={styles.cardGrid}>
              {trendActionMessage ? (
                <p className={styles.actionMessage} role="status">
                  {trendActionMessage}
                </p>
              ) : null}
              {data.trends.map((trend) => (
                <article className={styles.trendCard} key={trend.id}>
                  <div>
                    <span>{trend.platform}</span>
                    <small>{trend.source_channel || "Discovered signal"}</small>
                  </div>
                  <h3>{trend.title}</h3>
                  {trend.keyword_context ? <p>{trend.keyword_context}</p> : null}
                  <dl>
                    <div><dt>Views</dt><dd>{formatCompact(trend.engagement_views)}</dd></div>
                    <div><dt>Likes</dt><dd>{formatCompact(trend.engagement_likes)}</dd></div>
                    <div><dt>Published</dt><dd>{trend.published_at ? formatDate(trend.published_at) : "—"}</dd></div>
                  </dl>
                  <div className={styles.trendActions}>
                    {trend.topic_url ? (
                      <a href={trend.topic_url} rel="noreferrer" target="_blank">
                        Review source ↗
                      </a>
                    ) : null}
                    <button
                      disabled={promotingTrendId !== null}
                      onClick={() => promoteTrend(trend)}
                      type="button"
                    >
                      {promotingTrendId === trend.id ? "Creating..." : "+ Create content"}
                    </button>
                  </div>
                </article>
              ))}
            </section>
            {data.trends.length === 0 ? (
              <EmptyState>No trend signals yet. Use your documented ingestion endpoint to add the first set.</EmptyState>
            ) : null}
          </div>
        ) : null}

        {activeTab === "calendar" ? (
          <div className={styles.page}>
            <section className={styles.sectionIntro}>
              <p className={styles.eyebrow}>Publishing rhythm</p>
              <h2>See every commitment in one place.</h2>
            </section>
            <section className={styles.splitGrid}>
              <article className={styles.panel}>
                <div className={styles.panelHeading}><h3>Upcoming milestones</h3></div>
                <div className={styles.timeline}>
                  {data.calendar.map((item) => (
                    <div key={item.id}>
                      <time>{formatDate(item.starts_at, true)}</time>
                      <span />
                      <section>
                        <strong>{item.title}</strong>
                        <small>{item.entry_type} · {item.status}</small>
                      </section>
                    </div>
                  ))}
                  {data.calendar.length === 0 ? <EmptyState>Your calendar is clear.</EmptyState> : null}
                </div>
              </article>
              <div className={styles.componentSurface}>
                <CalendarQuickAdd content={data.content} />
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === "inbox" ? (
          <div className={styles.page}>
            <section className={styles.sectionIntro}>
              <p className={styles.eyebrow}>Capture first, organize second</p>
              <h2>Clear the loose ends.</h2>
            </section>
            <section className={styles.splitGrid}>
              <article className={styles.panel}>
                <div className={styles.panelHeading}><h3>Recent inbox</h3></div>
                <div className={styles.stackList}>
                  {data.inbox.map((item) => (
                    <div className={styles.inboxRow} key={item.id}>
                      <span>{item.inbox_type}</span>
                      <div>
                        <strong>{item.title}</strong>
                        {item.body ? <p>{item.body}</p> : null}
                        <small>{item.status} · {formatDate(item.created_at)}</small>
                      </div>
                    </div>
                  ))}
                  {data.inbox.length === 0 ? <EmptyState>Nothing is waiting in the inbox.</EmptyState> : null}
                </div>
              </article>
              <div className={styles.componentSurface}>
                <QuickAddPanel />
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === "finance" ? (
          <div className={styles.page}>
            <section className={styles.sectionIntro}>
              <p className={styles.eyebrow}>Business pulse</p>
              <h2>Know what the creator engine costs.</h2>
            </section>
            <section className={styles.financeSummary}>
              <article><span>Current-month expenses</span><strong>{formatCurrency(metrics.expenses)}</strong></article>
              <article><span>Current-month net</span><strong className={metrics.net < 0 ? styles.negative : ""}>{formatCurrency(metrics.net)}</strong></article>
            </section>
            <section className={styles.splitGrid}>
              <article className={styles.panel}>
                <div className={styles.panelHeading}><h3>Recent transactions</h3></div>
                <div className={styles.stackList}>
                  {data.transactions.map((item) => (
                    <div className={styles.transactionRow} key={item.id}>
                      <span className={item.transaction_type === "revenue" ? styles.revenue : styles.expense}>
                        {item.transaction_type === "revenue" ? "+" : "−"}
                        {formatCurrency(Number(item.amount), item.currency_code)}
                      </span>
                      <div>
                        <strong>{item.description || item.category}</strong>
                        <small>{item.category} · {formatDate(item.transaction_date)}</small>
                      </div>
                    </div>
                  ))}
                  {data.transactions.length === 0 ? <EmptyState>No transactions recorded yet.</EmptyState> : null}
                </div>
              </article>
              <div className={styles.componentSurface}>
                <QuickAddPanel />
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
