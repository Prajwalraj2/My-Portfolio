import Link from "next/link";
import { Container } from "./container";

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Profiles",
    links: [
      { label: "GitHub", href: "https://github.com/Prajwalraj2", external: true },
      { label: "Docker", href: "https://hub.docker.com/u/prajwal270", external: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/prajwalraj1", external: true },
      { label: "Twitter", href: "https://x.com/prajwalraj23", external: true },
      { label: "Medium", href: "https://medium.com/@prajwalraj", external: true },
    ],
  },
  {
    heading: "Projects",
    links: [
      { label: "Web Dev Work", href: "/projects/webdev" },
      { label: "DevOps Work", href: "/projects/devops" },
      { label: "AI Work", href: "/projects/ai" },
      { label: "MCP Works", href: "/projects/mcp" },
      { label: "Advance AI Work", href: "/projects/advance-ai" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Book A Call", href: "/connect" },
      { label: "Guides", href: "/guides" },
      { label: "Blogs", href: "/blogs" },
      { label: "Chat Features", href: "/chatfeatures" },
      { label: "Status Page", href: "#", external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t py-16">
      <Container>
        <div className="rounded-2xl border p-10">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="mb-4 text-sm font-semibold">{col.heading}</h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        {...(link.external
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Prajwal Raj. Built as the proof.
        </p>
      </Container>
    </footer>
  );
}
