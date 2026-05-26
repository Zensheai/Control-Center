import { youtubeVideos } from "@/data/youtubeVideos";

const aiTools = [
  {
    title: "Claude research workspace",
    label: "Used in latest tutorial",
    role: "Thinking partner",
    stack: "Claude Desktop + saved project context",
    note: "The working setup Simone uses to stop re-explaining context before every deep work session.",
    coverClass: "research",
    coverLabel: "Research",
    coverIcon: "search"
  },
  {
    title: "Claude Projects setup",
    label: "Creator favorite",
    role: "Deep work",
    stack: "Claude Projects + saved system prompts",
    note: "How Simone organizes Claude Projects to keep brand context, scripts, and research in one reusable workspace.",
    coverClass: "projects",
    coverLabel: "Projects",
    coverIcon: "folder"
  },
  {
    title: "Notion creator OS",
    label: "Recommended stack",
    role: "Creator hub",
    stack: "Ideas, scripts, resources, and publishing status",
    note: "The calm home base for keeping tutorials, client notes, content plans, and AI workflows organized."
  },
  {
    title: "Canva repurposing system",
    label: "Used weekly",
    role: "Visual production",
    stack: "Templates + brand assets + short-form layouts",
    note: "Design once, then reuse the same visual language across thumbnails, posts, and lead magnets."
  },
  {
    title: "Zapier automation starter",
    label: "Recently updated",
    role: "Simple automation",
    stack: "Forms, folders, email, and content handoffs",
    note: "Lightweight recipes for removing repetitive admin without building a complicated tech stack."
  },
  {
    title: "Airtable content tracker",
    label: "Most downloaded",
    role: "Operations",
    stack: "Assets, workflow status, and publish momentum",
    note: "A structured view for tracking what is filmed, edited, published, and ready to repurpose."
  }
];

const workflows = [
  {
    step: "01",
    title: "Capture the idea",
    copy: "Turn video notes, client questions, or trend research into a clear starting point.",
    reference: "Used in: Claude desktop setup"
  },
  {
    step: "02",
    title: "Build the workflow",
    copy: "Choose the right AI tool, prompt structure, and automation path for the job.",
    reference: "Tool pair: Claude + Notion"
  },
  {
    step: "03",
    title: "Ship and reuse",
    copy: "Create templates, checklists, and repeatable systems you can return to every week.",
    reference: "Resource: automation audit"
  }
];

const resources = [
  {
    title: "AI content planning worksheet",
    label: "Updated this week",
    note: "Plan topics, angles, tools, and repurposing notes.",
    coverClass: "emerald",
    coverIcon: "⊞",
    coverLabel: "AI Planner"
  },
  {
    title: "Automation audit checklist",
    label: "Popular workflow",
    note: "Find the repetitive tasks worth automating first.",
    coverClass: "navy",
    coverIcon: "☑",
    coverLabel: "Audit"
  },
  {
    title: "Prompt pack for solopreneurs",
    label: "Creator note",
    note: "Reusable prompts for planning, writing, and review.",
    coverClass: "terracotta",
    coverIcon: "❯",
    coverLabel: "Prompts"
  },
  {
    title: "Video workflow templates",
    label: "From tutorials",
    note: "Simple systems pulled from Keys to AI walkthroughs.",
    coverClass: "emerald",
    coverIcon: "▶",
    coverLabel: "Workflow"
  }
];

function videoHref(url: string) {
  return url || undefined;
}

function thumbnailBackground(path: string) {
  return {
    backgroundImage: `url(${path})`
  };
}

export default function HomePage() {
  const featuredVideo = youtubeVideos[0];
  const featuredTutorials = youtubeVideos.slice(0, 2);
  const supportingTutorials = youtubeVideos.slice(2, 5);
  const recentVideos = youtubeVideos.slice(1);

  return (
    <main>
      <header className="site-nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Keys to AI home">
          <span className="brand-mark">K</span>
          <span>
            <strong>Keys to AI</strong>
            <small>YouTube companion hub</small>
          </span>
        </a>
        <nav>
          <a href="#top">Home</a>
          <a href="#tutorials">Tutorials</a>
          <a href="#tools">AI Tools</a>
          <a href="#workflows">Workflows</a>
          <a href="#resources">Resources</a>
          <a href="#newsletter">Newsletter</a>
          <a href="#tutorials">YouTube</a>
        </nav>
        <a className="nav-cta" href="#tutorials">
          Watch
        </a>
      </header>

      <section className="hero-section" id="top">
        <img
          className="hero-image"
          src="/new_hero.png"
          alt="Simone Keys seated in a cinematic workspace beside a laptop"
        />
        <div className="hero-copy">
          <p className="hero-channel">Official companion site for the Keys to AI YouTube channel</p>
          <h1>AI Automation Made Simple</h1>
          <p>Step-by-step AI workflows built for one-person businesses.</p>
          <div className="hero-actions" aria-label="Hero calls to action">
            <a className="button primary" href="#tutorials">
              Watch Latest Video
            </a>
            <a className="button secondary" href="#tools">
              Explore AI Tools
            </a>
          </div>
        </div>

        <div className="hero-image-shade" aria-hidden="true" />
      </section>

      {false ? (
      <section className="video-section" id="youtube">
        <div className="section-heading youtube-heading">
          <div>
            <p className="section-kicker">Latest from YouTube</p>
            <h2>Fresh tutorials, practical workflows, and tools worth testing.</h2>
          </div>
          <a href="#newsletter">Get upload notes</a>
        </div>

        <div className="video-card">
          <a
            className="video-frame"
            href={videoHref(featuredVideo.youtubeUrl)}
            aria-label={`Watch ${featuredVideo.title}`}
            style={thumbnailBackground(featuredVideo.thumbnailPath)}
          >
            <span className="play-button" aria-hidden="true" />
          </a>
          <div className="video-copy">
            <p className="video-content-meta">
              {[featuredVideo.categoryTag, featuredVideo.duration || "Watch tutorial"]
                .filter(Boolean)
                .join(" • ")}
            </p>
            <h2>{featuredVideo.title}</h2>
            <p>
              {featuredVideo.description}
            </p>
            <div className="video-actions">
              {featuredVideo.youtubeUrl ? (
                <a className="video-text-link" href={featuredVideo.youtubeUrl}>
                  Watch on YouTube →
                </a>
              ) : (
                <span className="video-text-link muted">Watch tutorial</span>
              )}
            </div>
            <div className="recent-stack" aria-label="Recent YouTube uploads">
              <div className="creator-note">
                <strong>Creator note</strong>
                <span>New guides are organized around real setup questions from solopreneurs.</span>
              </div>
              {recentVideos.map((video) => (
                <a
                  className="recent-upload"
                  href={videoHref(video.youtubeUrl)}
                  key={video.title}
                >
                  <span
                    className="mini-thumb"
                    aria-hidden="true"
                    style={thumbnailBackground(video.thumbnailPath)}
                  >
                    <span className="mini-play" />
                  </span>
                  <span>
                    <small>{[video.categoryTag, video.duration || "Watch tutorial"].join(" • ")}</small>
                    <strong>{video.title}</strong>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      ) : null}

      <section className="section-shell" id="tutorials">
        <div className="section-heading">
          <div>
            <p className="section-kicker">From the channel</p>
            <h2>Start with the tutorials viewers watch first.</h2>
          </div>
        </div>
        <div className="tutorial-grid">
          {featuredTutorials.map((video, index) => (
            <article
              className={[
                "tutorial-card",
                index === 0 ? "tutorial-card-featured" : "",
                index === 1 ? "tutorial-card-secondary" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              key={video.title}
            >
              <div
                className="tutorial-thumb"
                aria-hidden="true"
                style={thumbnailBackground(video.thumbnailPath)}
              >
                <span className="play-button small" />
              </div>
              <div className="tutorial-meta-row">
                <p>{[video.categoryTag, video.duration || "Watch tutorial"].join(" • ")}</p>
              </div>
              <h3>{video.title}</h3>
              <span>{video.description}</span>
              {video.publishLabel ? <small>{video.publishLabel}</small> : null}
              {video.youtubeUrl ? (
                <a className="tutorial-card-action" href={video.youtubeUrl}>
                  Watch on YouTube →
                </a>
              ) : (
                <span className="tutorial-card-action muted">Watch tutorial</span>
              )}
            </article>
          ))}
        </div>
        <div className="tutorial-small-grid" aria-label="More Keys to AI tutorials">
          {supportingTutorials.map((video) => (
            <article className="tutorial-small-card" key={video.title}>
              <div
                className="tutorial-small-thumb"
                aria-hidden="true"
                style={thumbnailBackground(video.thumbnailPath)}
              />
              <p>{[video.categoryTag, video.duration || "Watch tutorial"].join(" \u2022 ")}</p>
              <h3>{video.title}</h3>
              <p className="tutorial-small-description">{video.description}</p>
              {video.youtubeUrl ? (
                <a href={video.youtubeUrl}>Watch {"\u2192"}</a>
              ) : (
                <span>Watch</span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="creator-presence" aria-label="A note from Simone Keys">
        <div className="creator-portrait">
          <img
            src="/simone-warm-authority.png"
            alt="Simone Keys seated in a warm workspace beside a laptop"
          />
        </div>
        <div className="creator-perspective">
          <p className="section-kicker">From Simone</p>
          <blockquote>
            I teach the AI systems I would actually trust in a solo business:
            simple enough to repeat, useful enough to save real hours.
          </blockquote>
          <a className="creator-setup-link" href={videoHref(featuredVideo.youtubeUrl)}>
            → Watch how I set it up
          </a>
          <div className="creator-signoff">
            <span>Simone Keys</span>
            <small>Creator, Keys to AI</small>
          </div>
        </div>
      </section>

      <section className="tools-library" id="tools">
        <div className="section-heading">
          <div>
            <p className="section-kicker">AI tools library</p>
            <h2>Practical guides for the tools creators already use.</h2>
          </div>
          <a href="#newsletter">Get tool updates</a>
        </div>
        <div className="toolkit-intro">
          <p>Inside Simone's creator operating system</p>
          <span>
            A curated stack of tools, prompts, and repeatable systems featured
            across Keys to AI tutorials.
          </span>
          <small>What I actually use when a workflow needs to survive a busy week.</small>
        </div>
        <div className="tool-list">
          {aiTools.map((tool, index) => (
            <a
              className={index === 0 ? "tool-card-featured" : ""}
              href="#newsletter"
              key={tool.title}
            >
              {tool.coverClass ? (
                <div className={`tool-cover ${tool.coverClass}`} aria-hidden="true">
                  {tool.coverIcon === "search" ? (
                    <svg
                      className="ti ti-search"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                      <path d="M21 21l-6 -6" />
                    </svg>
                  ) : (
                    <svg
                      className="ti ti-folder"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                    </svg>
                  )}
                  <small>{tool.coverLabel}</small>
                </div>
              ) : null}
              <span>
                <small>{tool.label}</small>
                <strong>{tool.title}</strong>
                <i>{tool.role}</i>
                <em>{tool.note}</em>
                <u>{tool.stack}</u>
              </span>
              <b>{index === 0 ? "Core system" : "Guide"}</b>
            </a>
          ))}
        </div>
      </section>

      <section className="workflow-section" id="workflows">
        <div className="workflow-copy">
          <p className="section-kicker">Step-by-step workflow guides</p>
          <h2>Turn every tutorial into a repeatable system.</h2>
          <p>
            Keys to AI is built for follow-through: watch the video, use the
            guide, download the resource, and come back when you are ready for
            the next workflow.
          </p>
          <div className="simone-aside">
            <span>Simone's workflow rule</span>
            <p>If a setup cannot be reused next week, it is not finished yet.</p>
          </div>
        </div>
        <div className="workflow-panel">
          {workflows.map((workflow) => (
            <article className="workflow-row" key={workflow.title}>
              <span>{workflow.step}</span>
              <div>
                <h3>{workflow.title}</h3>
                <p>{workflow.copy}</p>
                <small>{workflow.reference}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="resources-section" id="resources">
        <div>
          <p className="section-kicker">Free resources from videos</p>
          <h2>Download the worksheets, prompt packs, and checklists mentioned on YouTube.</h2>
          <div className="section-note">
            <span>Curated companion materials</span>
            <p>Built to help viewers turn a tutorial into a practical next step.</p>
            <b>Downloaded by solopreneurs in 40+ countries</b>
            <small>This is where I keep the checklists I wish I had before testing a workflow on camera.</small>
          </div>
        </div>
        <div className="resource-grid">
          {resources.map((resource) => (
            <article className="resource-card" key={resource.title}>
              <div className={`resource-cover ${resource.coverClass}`} aria-hidden="true">
                <span>{resource.coverIcon}</span>
                <small>{resource.coverLabel}</small>
              </div>
              <small>{resource.label}</small>
              <h3>{resource.title}</h3>
              <p>{resource.note}</p>
              <a href="#newsletter">Send it to me</a>
            </article>
          ))}
        </div>
      </section>

      <section className="newsletter-section" id="newsletter">
        <div>
          <p className="section-kicker">Newsletter</p>
          <h2>One email. One workflow. Actually useful.</h2>
          <div className="newsletter-note">
            <span>Simone&apos;s weekly pick</span>
            <p>The one AI workflow worth your time this week — straight from my own stack.</p>
          </div>
        </div>
        <form className="newsletter-form">
          <label htmlFor="email">Email address</label>
          <div>
            <input id="email" type="email" placeholder="Drop your email here" />
            <button type="submit">Send me the weekly workflow</button>
          </div>
        </form>
      </section>

      <footer className="site-footer">
        <a className="brand" href="#top" aria-label="Keys to AI home">
          <span className="brand-mark">K</span>
          <span>
            <strong>Keys to AI</strong>
            <small>AI Automation Made Simple</small>
          </span>
        </a>
        <p>The official content hub for the Keys to AI YouTube channel.</p>
        <div className="footer-social" aria-label="Social media links">
          <a
            href="https://www.instagram.com/keystoaiofficial/"
            target="_blank"
            rel="noreferrer"
            aria-label="Keys to AI on Instagram"
          >
            <svg
              className="ti ti-brand-instagram"
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
              <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              <path d="M16.5 7.5l0 .01" />
            </svg>
          </a>
          <a
            href="http://www.youtube.com/@KeystoAIOfficial"
            target="_blank"
            rel="noreferrer"
            aria-label="Keys to AI on YouTube"
          >
            <svg
              className="ti ti-brand-youtube"
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" />
              <path d="M10 9l5 3l-5 3z" />
            </svg>
          </a>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#tutorials">YouTube</a>
          <a href="#tutorials">Tutorials</a>
          <a href="#tools">AI Tools</a>
          <a href="#resources">Resources</a>
        </nav>
      </footer>
    </main>
  );
}
