import Image from 'next/image';
import ProfileImageLightbox from './components/ProfileImageLightbox';
import ProjectCard from './components/ProjectCard';
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
              <ProjectCard key={project.title} project={project} />
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
