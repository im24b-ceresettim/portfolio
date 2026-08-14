import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import ProfileImageLightbox from './components/ProfileImageLightbox';
import ProjectCard from './components/ProjectCard';
import { portfolioData, projects } from './portfolioData';
import { getProjectImages } from './utils/getProjectImages';

export default function Home() {
  noStore();

  return (
    <main>
      <section id="home" className="page-section">
        <div className="section-inner home-layout">
          <div className="home-copy">
            <p className="section-tag">Home</p>
            <h1>{portfolioData.name}</h1>
            <h2>{portfolioData.role}</h2>
            <p className="section-lead">{portfolioData.headline}</p>
          </div>
          <ProfileImageLightbox
            src={portfolioData.profileImage}
            alt="Profilbild"
          />
        </div>
      </section>

      <section id="projects" className="page-section">
        <div className="section-inner">
          <p className="section-tag">Projects</p>
          <div className="project-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                images={getProjectImages(project.slug)}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="about-me" className="page-section">
        <div className="section-inner">
          <p className="section-tag">about me</p>
          <p className="section-lead">{portfolioData.about}</p>

          <div className="skills-container">
            <div className="skills-section">
              <h3 className="skills-title">Sprachen</h3>
              <div className="skills-grid">
                {portfolioData.languages.map(lang => (
                  <div key={lang.name} className="skill-item">
                    <img
                      src={`https://flagcdn.com/w40/${lang.flag}.png`}
                      alt={`${lang.name} flag`}
                      className="skill-icon flag-icon"
                    />
                    <span className="skill-name">{lang.name}</span>
                    {lang.level && <span className="skill-level">{lang.level}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="skills-section">
              <h3 className="skills-title">Technologien</h3>
              <div className="skills-columns">

                <div className="skills-col">
                  <h4 style={{ fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>Frontend</h4>
                  <div className="skills-list">
                    {portfolioData.techSkills.frontend.map(skill => (
                      <div key={skill.name} className="skill-item">
                        <img
                          src={`https://skillicons.dev/icons?i=${skill.icon}`}
                          alt={`${skill.name} icon`}
                          className="skill-icon"
                        />
                        <span className="skill-name">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="skills-col">
                  <h4 style={{ fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>Backend</h4>
                  <div className="skills-list">
                    {portfolioData.techSkills.backend.map(skill => (
                      <div key={skill.name} className="skill-item">
                        <img
                          src={`https://skillicons.dev/icons?i=${skill.icon}`}
                          alt={`${skill.name} icon`}
                          className="skill-icon"
                        />
                        <span className="skill-name">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="skills-col">
                  <h4 style={{ fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>Datenbank</h4>
                  <div className="skills-list">
                    {portfolioData.techSkills.database.map(skill => (
                      <div key={skill.name} className="skill-item">
                        <img
                          src={`https://skillicons.dev/icons?i=${skill.icon}`}
                          alt={`${skill.name} icon`}
                          className="skill-icon"
                        />
                        <span className="skill-name">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="page-section">
        <div className="section-inner">
          <p className="section-tag">contact</p>
          <p className="section-lead contact-intro">
            Hast du Fragen zu einer Lehrstelle oder möchtest du ein Projekt besprechen?
            Melde dich gerne — ich antworte so schnell wie möglich.
          </p>
          <div className="contact-grid">
            <a
              className="contact-item"
              href={`tel:${portfolioData.phone.replace(/\s+/g, '')}`}
            >
              <span className="contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5.5c0-1.1.9-2 2-2h1.1c.5 0 .9.3 1.1.7l1.2 2.4c.2.5.1 1-.3 1.3l-1.1.9c.8 1.6 2.1 2.9 3.7 3.7l.9-1.1c.3-.4.8-.5 1.3-.3l2.4 1.2c.4.2.7.6.7 1.1V19c0 1.1-.9 2-2 2h-.5C9.2 21 3 14.8 3 7.5V5.5z"
                  />
                </svg>
              </span>
              <span className="contact-body">
                <span className="contact-label">Telefon</span>
                <span className="contact-value">{portfolioData.phone}</span>
              </span>
              <span className="contact-arrow" aria-hidden="true">→</span>
            </a>

            <a className="contact-item" href={`mailto:${portfolioData.email}`}>
              <span className="contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6.5h16c.8 0 1.5.7 1.5 1.5v8c0 .8-.7 1.5-1.5 1.5H4c-.8 0-1.5-.7-1.5-1.5V8c0-.8.7-1.5 1.5-1.5z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 8 7 5 7-5" />
                </svg>
              </span>
              <span className="contact-body">
                <span className="contact-label">E-Mail</span>
                <span className="contact-value">{portfolioData.email}</span>
              </span>
              <span className="contact-arrow" aria-hidden="true">→</span>
            </a>

            <a
              className="contact-item"
              href={portfolioData.github}
              target="_blank"
              rel="noreferrer"
            >
              <span className="contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.17-1.11-1.48-1.11-1.48-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.36 1.11 2.94.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05A9.2 9.2 0 0 1 12 6.84c.85.004 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.48A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
                </svg>
              </span>
              <span className="contact-body">
                <span className="contact-label">GitHub</span>
                <span className="contact-value">
                  {portfolioData.github.replace(/^https?:\/\/github\.com\//, '')}
                </span>
              </span>
              <span className="contact-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
