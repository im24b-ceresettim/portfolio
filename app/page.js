import { portfolioData, projects } from './portfolioData';

export default function Home() {
  return (
    <main className="portfolio-scroll">
      <section id="home" className="page-section">
        <div className="section-inner">
          <p className="section-tag">Portfolio</p>
          <h1>{portfolioData.name}</h1>
          <h2>{portfolioData.role}</h2>
          <p className="section-lead">{portfolioData.headline}</p>
        </div>
      </section>

      <section id="projects" className="page-section">
        <div className="section-inner">
          <p className="section-tag">Projects</p>
          <h2>Selected Work</h2>
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.title}>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <p className="stack">Stack: {project.stack}</p>
                <a href={project.url} target="_blank" rel="noreferrer">
                  View Repository
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about-me" className="page-section">
        <div className="section-inner">
          <p className="section-tag">About</p>
          <h2>Professional Profile</h2>
          <p className="section-lead">{portfolioData.about}</p>
        </div>
      </section>

      <section id="contact" className="page-section">
        <div className="section-inner">
          <p className="section-tag">Contact</p>
          <h2>Get In Touch</h2>
          <div className="contact-card">
            <p>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${portfolioData.email}`}>{portfolioData.email}</a>
            </p>
            <p>
              <strong>LinkedIn:</strong>{' '}
              <a href={portfolioData.linkedin}>{portfolioData.linkedin}</a>
            </p>
            <p>
              <strong>GitHub:</strong>{' '}
              <a href={portfolioData.github}>{portfolioData.github}</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
