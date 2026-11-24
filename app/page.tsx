"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight, BriefcaseBusiness, Building2, CheckCircle2, ChevronDown,
  Globe2, Heart, MapPin, Search, ShieldCheck, SlidersHorizontal,
  Sparkles, Users, Wallet
} from "lucide-react";

type Job = {
  id: number; title: string; company: string; country: string; city: string;
  type: string; salary: string; category: string; visa: string; posted: string;
  description: string; initials: string; color: string;
};

const jobs: Job[] = [
  { id: 1, title: "Warehouse Associate", company: "Nordic Logistics Group", country: "Finland", city: "Helsinki", type: "Full-time", salary: "€2,100–2,500 / month", category: "Warehouse", visa: "Ask employer", posted: "2 days ago", description: "Order preparation, packing and basic warehouse operations. Training provided.", initials: "NL", color: "mint" },
  { id: 2, title: "Production Worker", company: "Baltic Food Industries", country: "Lithuania", city: "Kaunas", type: "Full-time", salary: "€1,400–1,800 / month", category: "Factory", visa: "Not confirmed", posted: "3 days ago", description: "Food production line work, packaging and quality checks in a shift-based team.", initials: "BF", color: "blue" },
  { id: 3, title: "Hotel Housekeeping Assistant", company: "Alpine Hospitality", country: "Austria", city: "Innsbruck", type: "Seasonal", salary: "€1,850–2,200 / month", category: "Hospitality", visa: "Ask employer", posted: "4 days ago", description: "Guest-room cleaning and shared-area upkeep. Seasonal accommodation may be available.", initials: "AH", color: "peach" },
  { id: 4, title: "Construction Labourer", company: "NorthBuild Services", country: "Sweden", city: "Gothenburg", type: "Full-time", salary: "SEK  establecer / month", category: "Construction", visa: "Not confirmed", posted: "5 days ago", description: "General site assistance, material handling and maintaining a safe work area.", initials: "NB", color: "lavender" },
  { id: 5, title: "Farm & Greenhouse Worker", company: "GreenFields Co-op", country: "Netherlands", city: "Westland", type: "Seasonal", salary: "€14–16 / hour", category: "Agriculture", visa: "Not confirmed", posted: "1 week ago", description: "Harvesting, sorting and greenhouse maintenance. Previous experience is helpful.", initials: "GF", color: "yellow" },
  { id: 6, title: "Dishwasher / Kitchen Porter", company: "Harbor View Hotel", country: "Ireland", city: "Cork", type: "Full-time", salary: "€13.50–15 / hour", category: "Hospitality", visa: "Ask employer", posted: "1 week ago", description: "Kitchen cleaning, dishwashing and support for the kitchen team during service.", initials: "HV", color: "rose" }
];

const countries = ["All countries", "Finland", "Lithuania", "Austria", "Sweden", "Netherlands", "Ireland"];
const categories = ["All categories", "Warehouse", "Factory", "Hospitality", "Construction", "Agriculture"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All countries");
  const [category, setCategory] = useState("All categories");
  const [saved, setSaved] = useState<number[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const filtered = useMemo(() => jobs.filter(job => {
    const text = `${job.title} ${job.company} ${job.city} ${job.country} ${job.description}`.toLowerCase();
    return text.includes(query.toLowerCase()) &&
      (country === "All countries" || job.country === country) &&
      (category === "All categories" || job.category === category) &&
      (!showSaved || saved.includes(job.id));
  }), [query, country, category, saved, showSaved]);

  const toggleSaved = (id: number) => setSaved(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark"><Globe2 size={21} /></span><span>global<span className="brand-light">jobfinder</span></span></a>
        <nav className="desktop-nav"><a className="active" href="#jobs">Find jobs</a><a href="#how">How it works</a><a href="#about">About</a></nav>
        <div className="top-actions"><button className="signin" onClick={() => alert("Account sign-in will be available after authentication is connected.")}>Sign in</button><button className="join" onClick={() => alert("Account registration will be available after authentication is connected.")}>Create account <ArrowUpRight size={15}/></button></div>
      </header>

      <section className="hero">
        <div className="hero-glow glow-one" /><div className="hero-glow glow-two" />
        <div className="hero-inner">
          <div className="eyebrow"><Sparkles size={14}/> INTERNATIONAL CAREER OPPORTUNITIES</div>
          <h1>Your next opportunity<br/><span>has no borders.</span></h1>
          <p className="hero-copy">Explore jobs around the world. Compare opportunities, understand work-permit requirements, and take your next step with confidence.</p>
          <div className="search-panel">
            <div className="search-field"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Job title, company or keyword" aria-label="Search jobs"/></div>
            <div className="search-divider"/>
            <div className="select-field"><MapPin size={18}/><select value={country} onChange={e => setCountry(e.target.value)} aria-label="Choose country">{countries.map(c => <option key={c}>{c}</option>)}</select><ChevronDown size={15}/></div>
            <button className="search-button" onClick={() => document.getElementById("jobs")?.scrollIntoView({behavior:"smooth"})}>Search jobs <ArrowUpRight size={16}/></button>
          </div>
          <div className="hero-foot"><span><CheckCircle2 size={15}/> Opportunities from multiple countries</span><span><ShieldCheck size={15}/> Clear source and visa-status labels</span></div>
        </div>
      </section>

      <section className="trust-strip"><div><BriefcaseBusiness/><strong>Global opportunities</strong><span>Across industries and countries</span></div><div><ShieldCheck/><strong>Transparent information</strong><span>Know what is verified</span></div><div><Users/><strong>Applicant-first</strong><span>Your search, your decisions</span></div></section>

      <section className="jobs-section" id="jobs">
        <div className="section-heading"><div><div className="eyebrow dark-eyebrow">EXPLORE OPPORTUNITIES</div><h2>Find a role that moves you forward.</h2><p>Browse sample listings while the live vacancy sources are being connected.</p></div><button className={showSaved ? "saved-filter selected" : "saved-filter"} onClick={() => setShowSaved(!showSaved)}><Heart size={16} fill={showSaved ? "currentColor" : "none"}/> Saved jobs ({saved.length})</button></div>
        <div className="filter-row"><div className="filter-label"><SlidersHorizontal size={17}/> Filter by</div><select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category">{categories.map(c => <option key={c}>{c}</option>)}</select><button className="clear-filter" onClick={() => {setQuery("");setCountry("All countries");setCategory("All categories");setShowSaved(false)}}>Clear filters</button><span className="results-count">{filtered.length} opportunities</span></div>
        <div className="job-grid">
          {filtered.map(job => <article className="job-card" key={job.id}>
            <div className="job-card-top"><div className={`company-logo ${job.color}`}>{job.initials}</div><button className={saved.includes(job.id) ? "heart-btn is-saved" : "heart-btn"} onClick={() => toggleSaved(job.id)} aria-label={saved.includes(job.id) ? "Remove saved job" : "Save job"}><Heart size={18} fill={saved.includes(job.id) ? "currentColor" : "none"}/></button></div>
            <div className="job-company">{job.company}</div><h3>{job.title}</h3><div className="job-location"><MapPin size={14}/>{job.city}, {job.country}</div>
            <p className="job-description">{job.description}</p>
            <div className="job-tags"><span>{job.type}</span><span>{job.category}</span></div>
            <div className="job-bottom"><div><small>Indicative pay</small><strong><Wallet size={14}/>{job.salary}</strong></div><span className="visa-status"><ShieldCheck size={13}/>{job.visa}</span></div>
            <div className="job-card-footer"><span>{job.posted}</span><button onClick={() => alert("This is sample listing data. Verified employer links and application details will be added when live sources are integrated.")}>View details <ArrowUpRight size={15}/></button></div>
          </article>)}
          {filtered.length === 0 && <div className="empty-state"><Search size={26}/><h3>No matching opportunities</h3><p>Try changing your search or clearing the filters.</p><button onClick={() => {setQuery("");setCountry("All countries");setCategory("All categories");setShowSaved(false)}}>Clear all filters</button></div>}
        </div>
        <p className="demo-note"><ShieldCheck size={15}/> <strong>Important:</strong> These are demonstration listings, not verified live vacancies. Salary and visa labels are illustrative. Always confirm details directly with the employer and relevant authorities.</p>
      </section>

      <section className="how-section" id="how"><div className="eyebrow dark-eyebrow">A CLEARER WAY TO SEARCH</div><h2>From searching to your next step.</h2><div className="steps"><div><span>01</span><h3>Discover</h3><p>Search across countries and industries using practical filters.</p></div><div><span>02</span><h3>Check requirements</h3><p>Review employer sources and whether work-permit support is confirmed.</p></div><div><span>03</span><h3>Apply with control</h3><p>Prepare your application and decide when and where to send it.</p></div></div></section>

      <footer id="about"><a className="brand footer-brand" href="#"><span className="brand-mark"><Globe2 size={19}/></span><span>global<span className="brand-light">jobfinder</span></span></a><p>Making international job searching clearer.</p><div className="footer-bottom"><span>© 2026 Global Job Finder</span><span>Information tool · Not a recruitment or visa provider</span></div></footer>
    </main>
  );
}
