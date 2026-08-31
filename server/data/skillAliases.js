// careers.js deliberately uses the Coursera dataset's own abstract skill
// vocabulary (e.g. "Full-Stack Web Development", "Front-End Web Development")
// so course recommendations always resolve. But that's not how real
// students/resumes describe their skills — they say "React.js", "Node.js",
// "Express.js", "MongoDB". Those two vocabularies never overlap by exact
// string match, so a genuinely full-stack student would always show
// "Full-Stack Web Development" as missing.
//
// This map bridges that gap: each specific technology (key, lowercase)
// points at the Coursera-vocabulary categories it counts as evidence for.
// Values must be spelled exactly as they appear in careers.js / the course
// dataset's Skills column, since careerMatchingService normalizes+compares
// against those exact strings.
export const SKILL_ALIASES = {
  // Languages
  javascript: ["Javascript"],
  js: ["Javascript"],
  typescript: ["Javascript"],
  python: ["Python Programming"],
  java: ["Computer Programming"],
  c: ["Computer Programming"],
  "c++": ["Computer Programming"],
  "c#": ["Computer Programming"],

  // Frontend
  html: ["HTML and CSS"],
  html5: ["HTML and CSS"],
  css: ["HTML and CSS"],
  css3: ["HTML and CSS"],
  react: ["Front-End Web Development", "Javascript"],
  "react.js": ["Front-End Web Development", "Javascript"],
  reactjs: ["Front-End Web Development", "Javascript"],
  angular: ["Front-End Web Development"],
  "angular.js": ["Front-End Web Development"],
  vue: ["Front-End Web Development"],
  "vue.js": ["Front-End Web Development"],
  "next.js": ["Front-End Web Development"],
  tailwind: ["Front-End Web Development", "Web Design"],
  "tailwind css": ["Front-End Web Development", "Web Design"],

  // Backend
  "node.js": ["Back-End Web Development"],
  node: ["Back-End Web Development"],
  nodejs: ["Back-End Web Development"],
  "express.js": ["Back-End Web Development"],
  express: ["Back-End Web Development"],
  django: ["Back-End Web Development"],
  flask: ["Back-End Web Development"],
  "spring boot": ["Back-End Web Development"],
  php: ["Back-End Web Development"],
  "ruby on rails": ["Back-End Web Development"],

  // Databases
  mongodb: ["Databases"],
  mysql: ["Databases", "SQL"],
  postgresql: ["Databases", "SQL"],
  postgres: ["Databases", "SQL"],
  sqlite: ["Databases"],
  oracle: ["Databases"],
  dbms: ["Databases"],
  database: ["Databases"],

  // Core CS
  "object-oriented programming(oop)": ["Computer Programming", "Programming Principles"],
  "object oriented programming": ["Computer Programming", "Programming Principles"],
  oop: ["Computer Programming", "Programming Principles"],
  "data structures & algorithms": ["Data Structures", "Algorithms"],
  dsa: ["Data Structures", "Algorithms"],
  "data structures": ["Data Structures"],
  algorithms: ["Algorithms"],
  "operating systems": ["Computer Programming"],
  git: ["Software Engineering"],
  github: ["Software Engineering"],

  // Cloud / DevOps
  docker: ["Cloud Infrastructure", "Cloud Computing"],
  kubernetes: ["Kubernetes", "Cloud Infrastructure"],
  aws: ["Cloud Computing", "Cloud Platforms"],
  azure: ["Cloud Computing", "Cloud Platforms"],
  gcp: ["Cloud Computing", "Google Cloud Platform"],
  "google cloud": ["Cloud Computing", "Google Cloud Platform"],

  // Data / ML
  pandas: ["Data Analysis", "Python Programming"],
  numpy: ["Data Analysis", "Python Programming"],
  tensorflow: ["Machine Learning", "Deep Learning"],
  pytorch: ["Machine Learning", "Deep Learning"],
  "scikit-learn": ["Machine Learning"],
  "power bi": ["Data Visualization"],
  excel: ["Microsoft Excel"],
  tableau: ["Tableau Software"],

  // Design
  figma: ["User Experience Design", "Web Design"],
  "adobe xd": ["User Experience Design", "Web Design"],

  // Full stack bundles — students commonly type the acronym itself rather
  // than spelling out each technology. Map the acronym directly to every
  // category it implies so it works even without the individual pieces.
  mern: ["Front-End Web Development", "Back-End Web Development", "Javascript", "Databases"],
  "mern stack": ["Front-End Web Development", "Back-End Web Development", "Javascript", "Databases"],
  mean: ["Front-End Web Development", "Back-End Web Development", "Javascript", "Databases"],
  "mean stack": ["Front-End Web Development", "Back-End Web Development", "Javascript", "Databases"],
  mevn: ["Front-End Web Development", "Back-End Web Development", "Javascript", "Databases"],
  "full stack": ["Front-End Web Development", "Back-End Web Development"],
  "full-stack": ["Front-End Web Development", "Back-End Web Development"],
  "full stack development": ["Front-End Web Development", "Back-End Web Development"],
  fullstack: ["Front-End Web Development", "Back-End Web Development"],
};

// Composite rules: some category skills are really just "you clearly have
// both of these other categories" rather than something a student would
// ever type in verbatim. Checked AFTER individual aliases are applied.
// Each rule: if `all` of these normalized categories are present, add `implies`.
export const COMPOSITE_SKILL_RULES = [
  {
    all: ["front-end web development", "back-end web development"],
    implies: ["Full-Stack Web Development", "Web Development"],
  },
];
