import Image from 'next/image';
import { portfolioData, projects } from './portfolioData';

export default function Home() {
  return (
    <main>
      <section id="home" className="page-section">
        <div className="section-inner home-layout">
          <div className="home-copy">
            <p className="section-tag">Portfolio</p>
            <h1>{portfolioData.name}</h1>
            <h2>{portfolioData.role}</h2>
            <p className="section-lead">{portfolioData.headline}</p>
          </div>
          <div className="profile-placeholder" aria-label="Platzhalter fuer Profilbild">
            <Image
              className="profile-placeholder-image"
              src={portfolioData.profileImage}
              alt="Profilbild Platzhalter"
              width={220}
              height={220}
            />
          </div>
        </div>
      </section>

      <section id="projects" className="page-section">
        <div className="section-inner">
          <p className="section-tag">Projekte</p>
          <h2>Ausgewaehlte Arbeiten</h2>
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.title}>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <p className="stack">Tech-Stack: {project.stack}</p>
                <a href={project.url} target="_blank" rel="noreferrer">
                  Projekt ansehen
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about-me" className="page-section">
        <div className="section-inner">
          <p className="section-tag">Ueber mich</p>
          <h2>Profil</h2>
          <p className="section-lead">{portfolioData.about}</p>
        </div>
      </section>

      <section id="contact" className="page-section">
        <div className="section-inner">
          <p className="section-tag">Kontakt</p>
          <h2>Kontaktaufnahme</h2>
          <div className="contact-card">
            <p>
              <strong>Telefon:</strong>{' '}
              <a href={`tel:${portfolioData.phone.replace(/\s+/g, '')}`}>{portfolioData.phone}</a>
            </p>
            <p>
              <strong>E-Mail:</strong>{' '}
              <a href={`mailto:${portfolioData.email}`}>{portfolioData.email}</a>
            </p>
            <p>
              <strong>GitHub:</strong>{' '}
              <a href={portfolioData.github} target="_blank" rel="noreferrer">
                {portfolioData.github}
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
