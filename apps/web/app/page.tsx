import Link from "next/link";
import { ArrowRight, MapPin, Briefcase } from "lucide-react";
import { getProjects, getSkills, getExperience, getCategories } from "@/lib/fetchers";
import type { Category, Project } from "@/types/api";

async function getApiStatus() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/health`,
      { cache: "no-store" }
    );
    return response.ok;
  } catch {
    return false;
  }
}




export default async function Home() {
  const [apiStatus, categories, projects, skills, experience] = await Promise.allSettled([
    getApiStatus(),
    getCategories(),
    getProjects(),
    getSkills(),
    getExperience(),
  ]);

  const isApiConnected = apiStatus.status === "fulfilled" && apiStatus.value;
  const allCategories = categories.status === "fulfilled" ? categories.value : [];
  const allProjects = projects.status === "fulfilled" ? projects.value : [];
  const featuredSkills = skills.status === "fulfilled" ? skills.value : [];
  const workExperience = experience.status === "fulfilled" ? experience.value : [];

  // Group projects by category
  const projectsByCategory = allCategories
    .filter((cat) => cat.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((category) => ({
      category,
      projects: allProjects
        .filter((p) => p.categoryId === category.id && p.isPublished)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    }))
    .filter((group) => group.projects.length > 0);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            PR<span className="text-accent">.</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="#works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Works
            </Link>
            <Link href="#skills" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Skills
            </Link>
            <Link href="#experience" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Experience
            </Link>
            <Link href="#contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
            <Link 
              href="/chat" 
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-foreground/50 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-foreground"></span>
              </span>
              Chat with AI
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--accent)_0%,transparent_100%)] opacity-10" />
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm">
              <span className={`h-2 w-2 rounded-full ${isApiConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-muted-foreground">
                {isApiConnected ? "API Connected" : "API Offline - Start the API Gateway"}
              </span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Senior Software Engineer
              <br />
              <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
                Building the Future
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              5+ years crafting enterprise-grade applications with modern technologies.
              Passionate about clean architecture, DevOps, and delivering exceptional user experiences.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="#works"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:scale-105 hover:bg-foreground/90"
              >
                View My Work
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
              >
                Get in Touch
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Available Worldwide
              </span>
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Open to Opportunities
              </span>
            </div>
          </div>
        </section>

        {/* Works Section */}
        <section id="works" className="border-t border-border bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Works</h2>
              <p className="text-muted-foreground">
                Projects organized by domain expertise.
              </p>
            </div>
            {projectsByCategory.length > 0 ? (
              <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                {projectsByCategory.map(({ category, projects }) => (
                  <div key={category.id} className="space-y-4">
                    {/* Category Header */}
                    <div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: category.color || undefined }}
                      >
                        {category.name}
                      </h3>
                      <hr 
                        className="mt-2 border-t"
                        style={{ 
                          borderColor: category.color 
                            ? `${category.color}30` 
                            : 'var(--border)' 
                        }}
                      />
                    </div>
                    {/* Project Links */}
                    <ul className="space-y-2">
                      {projects.map((project) => (
                        <li key={project.id}>
                          <Link
                            href={`/projects/${project.slug}`}
                            className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <span 
                              className="mr-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 transition-colors group-hover:bg-accent"
                              style={{ 
                                backgroundColor: category.color 
                                  ? `${category.color}50` 
                                  : undefined 
                              }}
                            />
                            <span className="group-hover:underline underline-offset-2">
                              {project.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">
                  {isApiConnected
                    ? "No projects yet. Add some via the API!"
                    : "Start the API Gateway to load projects."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Skills & Technologies</h2>
              <p className="text-muted-foreground">
                Technologies I work with to build scalable, maintainable applications.
              </p>
            </div>
            {featuredSkills.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {featuredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-accent/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      {skill.iconUrl ? (
                        <img src={skill.iconUrl} alt={skill.name} className="h-6 w-6" />
                      ) : (
                        skill.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-xs text-muted-foreground">{skill.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">
                  {isApiConnected
                    ? "No skills added yet. Add some via the API!"
                    : "Start the API Gateway to load skills."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="border-t border-border bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Work Experience</h2>
              <p className="text-muted-foreground">
                My professional journey building software at scale.
              </p>
            </div>
            {workExperience.length > 0 ? (
              <div className="space-y-8">
                {workExperience.map((exp) => (
                  <div
                    key={exp.id}
                    className="relative pl-8 before:absolute before:left-0 before:top-2 before:h-3 before:w-3 before:rounded-full before:bg-accent after:absolute after:left-1.5 after:top-5 after:h-full after:w-px after:bg-border last:after:hidden"
                  >
                    <div className="rounded-xl border border-border bg-background p-6">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{exp.role}</h3>
                        <span className="text-muted-foreground">@</span>
                        <span className="font-medium text-accent">{exp.company}</span>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        {" - "}
                        {exp.isCurrent
                          ? "Present"
                          : exp.endDate
                          ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                          : ""}
                        {exp.location && ` · ${exp.location}`}
                      </p>
                      {exp.description && (
                        <p className="mb-4 text-sm text-muted-foreground">{exp.description}</p>
                      )}
                      {exp.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {exp.techStack.slice(0, 5).map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">
                  {isApiConnected
                    ? "No experience added yet. Add some via the API!"
                    : "Start the API Gateway to load experience."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Let&apos;s Work Together</h2>
            <p className="mb-8 text-muted-foreground">
              Have a project in mind? I&apos;d love to hear about it. Send me a message and let&apos;s create something amazing.
            </p>
    
          </div>
        </section>
      </main>

    </div>
  );
}

