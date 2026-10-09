export interface ResumeParsingFact {
  id: number;
  category: 'recruiter' | 'history' | 'protip';
  tag: string;
  icon: string;
  fact: string;
}

export const RESUME_PARSING_FACTS: ResumeParsingFact[] = [
  {
    id: 1,
    category: 'recruiter',
    tag: 'Recruiter Insight',
    icon: '⏱️',
    fact: 'Technical recruiters spend an average of only 6 to 7 seconds scanning an initial resume before deciding whether to interview a candidate.',
  },
  {
    id: 2,
    category: 'recruiter',
    tag: 'ATS Statistics',
    icon: '🤖',
    fact: 'Over 75% of developer resumes are pre-screened by Applicant Tracking Systems (ATS) before a human engineer ever reviews them.',
  },
  {
    id: 3,
    category: 'protip',
    tag: 'Impact Metrics',
    icon: '📈',
    fact: 'Resumes highlighting quantified results (e.g. "boosted query throughput by 42%") receive 140% more callbacks than those listing generic task lists.',
  },
  {
    id: 4,
    category: 'history',
    tag: 'Computer History',
    icon: '💡',
    fact: 'Ada Lovelace is recognized as the world\'s first computer programmer in 1843, having created the first machine algorithm for Charles Babbage’s Analytical Engine.',
  },
  {
    id: 5,
    category: 'recruiter',
    tag: 'Portfolio Power',
    icon: '🌐',
    fact: '84% of engineering hiring managers say a responsive, live portfolio website leaves a far stronger impression than a multi-page PDF.',
  },
  {
    id: 6,
    category: 'history',
    tag: 'Tech Trivia',
    icon: '🪲',
    fact: 'The term "computer bug" was popularized in 1947 when Grace Hopper extracted an actual moth trapped between relays in the Harvard Mark II computer.',
  },
  {
    id: 7,
    category: 'protip',
    tag: 'GitHub Advantage',
    icon: '🚀',
    fact: 'Developers who link active GitHub repositories with live demo URLs receive 3.4x more interview invitations than those with closed-source code alone.',
  },
  {
    id: 8,
    category: 'history',
    tag: 'JavaScript Trivia',
    icon: '⚡',
    fact: 'Brendan Eich created the initial version of JavaScript in just 10 days in May 1995 while working at Netscape Communications.',
  },
  {
    id: 9,
    category: 'protip',
    tag: 'Project Showcase',
    icon: '🎯',
    fact: 'Focusing on 2–3 deeply polished, production-grade independent projects creates a 5x stronger hiring impression than 10 half-finished tutorial apps.',
  },
  {
    id: 10,
    category: 'history',
    tag: 'Space Computing',
    icon: '🌕',
    fact: 'The Apollo 11 guidance computer that landed astronauts on the moon in 1969 operated on only 4 Kilobytes of physical RAM.',
  },
  {
    id: 11,
    category: 'protip',
    tag: 'Documentation',
    icon: '📝',
    fact: 'Including architecture diagrams and interactive demo GIFs in your GitHub project READMEs increases recruiter evaluation depth by over 80%.',
  },
  {
    id: 12,
    category: 'history',
    tag: 'Naming Trivia',
    icon: '🐍',
    fact: 'Guido van Rossum named Python after the British comedy television show "Monty Python\'s Flying Circus", not after the constrictor reptile.',
  },
];

export interface ParsingPhase {
  step: number;
  label: string;
  icon: string;
}

export const PARSING_PHASES: ParsingPhase[] = [
  { step: 1, label: 'Extracting text and structure from PDF', icon: '📄' },
  { step: 2, label: 'Identifying technical skills & tech stack', icon: '🧠' },
  { step: 3, label: 'Synthesizing projects, metrics & experience', icon: '⚡' },
  { step: 4, label: 'Structuring clean portfolio data models', icon: '✨' },
];
