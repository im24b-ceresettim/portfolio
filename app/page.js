import Image from 'next/image';
import { portfolioData, projects } from './portfolioData';

export default function Home() {
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
          <div className="profile-placeholder" aria-label="Profilbild">
            <Image
              className="profile-placeholder-image"
              src={portfolioData.profileImage}
              alt="Profilbild"
              width={220}
              height={220}
            />
          </div>
        </div>
      </section>

      <section id="projects" className="page-section">
        <div className="section-inner">
          <p className="section-tag">Projects</p>
          <div className="project-grid">
            {projects.map((project) => {
              const hasGh = project.gh && project.gh !== '#';
              const hasUrl = project.url && project.url !== '#';
              const techTags = project.stack ? project.stack.split(',').map(s => s.trim()) : [];

              return (
                <article className="project-card" key={project.title}>
                  <div className="project-content">
                    <h3>{project.title}</h3>
                    <p className="project-desc">{project.description}</p>
                    <div className="project-tags">
                      {techTags.map(tag => (
                        <span key={tag} className="tech-tag">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {(hasGh || hasUrl) && (
                    <div className="project-actions">
                      {hasGh && (
                        <a href={project.gh} target="_blank" rel="noreferrer" className="project-btn github-btn">
                          <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                          Github
                        </a>
                      )}
                      {hasUrl && (
                        <a href={project.url} target="_blank" rel="noreferrer" className="project-btn live-btn">
                          <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          Live ansehen
                        </a>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
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
