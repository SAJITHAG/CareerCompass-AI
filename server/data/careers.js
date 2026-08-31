// Static career knowledge base. Kept as plain data (not hardcoded logic) so
// new careers can be added later just by appending an object here.
//
// IMPORTANT: requiredSkills/optionalSkills are deliberately written to match
// the actual skill vocabulary found in the Coursera dataset (server/data/coursera.csv),
// not generic industry skill names. This dataset skews toward cloud/data/business
// skills and does not contain terms like "Node.js", "Express.js", "MongoDB", or
// "Git" at all — so career skill lists were verified against the real 328-term
// vocabulary first. This keeps Step 5's course recommendations (which search by
// missing skill name) from silently returning zero results for common careers.
const careersData = [
  {
    name: "Frontend Developer",
    description:
      "Builds the user-facing part of websites and web apps — layout, interactivity, and visual design in the browser.",
    requiredSkills: ["Javascript", "HTML and CSS", "Front-End Web Development"],
    optionalSkills: ["Web Design", "User Experience Design", "Web Development"],
    relatedInterests: ["Web Design", "Creativity", "Visual Design"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["HTML and CSS", "Javascript", "Front-End Web Development", "Web Design"],
  },
  {
    name: "Backend Developer",
    description:
      "Builds the server-side logic, APIs, and database interactions that power applications behind the scenes.",
    requiredSkills: ["Back-End Web Development", "Databases", "Computer Programming"],
    optionalSkills: ["Cloud Computing", "Software Engineering", "Data Management"],
    relatedInterests: ["Problem Solving", "Databases", "Software Engineering"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: [
      "Computer Programming",
      "Databases",
      "Back-End Web Development",
      "Cloud Computing",
    ],
  },
  {
    name: "Full Stack Developer",
    description:
      "Works across both frontend and backend — building complete, end-to-end web applications.",
    requiredSkills: ["Full-Stack Web Development", "Javascript", "Front-End Web Development", "Back-End Web Development"],
    optionalSkills: ["Web Development", "Databases", "Cloud Computing"],
    relatedInterests: ["Web Design", "Problem Solving", "Software Engineering"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: [
      "HTML and CSS",
      "Javascript",
      "Front-End Web Development",
      "Back-End Web Development",
      "Full-Stack Web Development",
      "Databases",
    ],
  },
  {
    name: "Software Developer",
    description:
      "Designs, writes, and maintains software applications across a range of platforms and languages.",
    requiredSkills: ["Computer Programming", "Data Structures", "Algorithms", "Programming Principles"],
    optionalSkills: ["Software Engineering", "Software Testing"],
    relatedInterests: ["Problem Solving", "Software Engineering"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: [
      "Programming Principles",
      "Computer Programming",
      "Data Structures",
      "Algorithms",
      "Software Testing",
    ],
  },
  {
    name: "Data Analyst",
    description:
      "Collects, cleans, and analyzes data to help organizations make informed business decisions.",
    requiredSkills: ["SQL", "Data Analysis", "Microsoft Excel", "Data Visualization"],
    optionalSkills: ["Tableau Software", "Python Programming", "General Statistics"],
    relatedInterests: ["Statistics", "Business Analysis", "Problem Solving"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: [
      "Data Analysis",
      "Microsoft Excel",
      "SQL",
      "Data Visualization",
      "Tableau Software",
    ],
  },
  {
    name: "Data Scientist",
    description:
      "Uses statistics, machine learning, and programming to extract insights and build predictive models from data.",
    requiredSkills: ["Python Programming", "Data Science", "Machine Learning", "General Statistics"],
    optionalSkills: ["Deep Learning", "SQL", "Data Visualization"],
    relatedInterests: ["Mathematics", "Statistical Analysis", "Machine Learning"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: [
      "Python Programming",
      "General Statistics",
      "Data Analysis",
      "Machine Learning",
      "Deep Learning",
    ],
  },
  {
    name: "Machine Learning Engineer",
    description:
      "Designs, builds, and deploys machine learning models and the systems that serve them in production.",
    requiredSkills: ["Python Programming", "Machine Learning", "Deep Learning", "Algorithms"],
    optionalSkills: ["Machine Learning Algorithms", "Cloud Computing", "Data Structures"],
    relatedInterests: ["Machine Learning", "Mathematics", "Problem Solving"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: [
      "Python Programming",
      "Algorithms",
      "Machine Learning",
      "Machine Learning Algorithms",
      "Deep Learning",
      "Cloud Computing",
    ],
  },
  {
    name: "UI/UX Designer",
    description:
      "Designs intuitive, visually engaging user interfaces and researches user needs to shape product experience.",
    requiredSkills: ["User Experience Design", "Web Design", "Visual Design"],
    optionalSkills: ["Product Design", "Front-End Web Development"],
    relatedInterests: ["Visual Design", "Creativity", "Web Design"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["Web Design", "Visual Design", "User Experience Design", "Product Design"],
  },
  {
    name: "Cloud Engineer",
    description:
      "Builds and manages cloud infrastructure, deployment pipelines, and scalable systems on platforms like AWS/GCP.",
    requiredSkills: ["Cloud Computing", "Linux", "Cloud Infrastructure"],
    optionalSkills: ["Cloud Platforms", "Google Cloud Platform", "Computer Networking"],
    relatedInterests: ["Cloud Infrastructure", "Problem Solving", "Software Engineering"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Linux", "Cloud Computing", "Cloud Infrastructure", "Cloud Platforms"],
  },
  {
    name: "Cybersecurity Analyst",
    description:
      "Monitors, detects, and responds to security threats, and helps organizations protect their systems and data.",
    requiredSkills: ["Network Security", "Computer Security Incident Management", "Risk Management"],
    optionalSkills: ["Cryptography", "Linux", "Cloud Computing", "Audit"],
    relatedInterests: ["Network Security", "Problem Solving", "Risk Management"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: [
      "Network Security",
      "Linux",
      "Cryptography",
      "Risk Management",
      "Computer Security Incident Management",
    ],
  },
  {
    name: "DevOps Engineer",
    description:
      "Bridges development and operations — automating deployment, monitoring, and infrastructure management.",
    requiredSkills: ["Cloud Computing", "Cloud Infrastructure", "Linux"],
    optionalSkills: ["Kubernetes", "Computer Networking", "Cloud Platforms"],
    relatedInterests: ["Cloud Infrastructure", "Problem Solving", "Software Engineering"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: ["Linux", "Cloud Computing", "Cloud Infrastructure", "Kubernetes"],
  },
  {
    name: "Business Analyst",
    description:
      "Analyzes business processes and data to recommend improvements and bridge business needs with technical solutions.",
    requiredSkills: ["Business Analysis", "Data Analysis", "Communication", "Strategy"],
    optionalSkills: ["SQL", "Microsoft Excel", "Business Communication"],
    relatedInterests: ["Strategy", "Communication", "Data Analysis"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["Business Analysis", "Communication", "Data Analysis", "Microsoft Excel", "SQL"],
  },

  // --- Added on request: expanded from 12 to cover more of the dataset's
  // real skill vocabulary. Every skill below was checked against the same
  // 328-term Skills vocabulary as the original 12 (server/data/coursera.csv)
  // before being added — nothing here is a generic industry skill name that
  // won't actually resolve to a course. Two candidates from the original
  // ask were deliberately folded together rather than added as separate,
  // near-duplicate entries:
  //   - "Software Tester" was merged into "QA Engineer" below — the dataset
  //     has one relevant skill ("Software Testing") for both, so a separate
  //     entry would have had an almost identical skill list.
  // "AI Engineer" and "Systems Administrator" were kept distinct from the
  // existing "Machine Learning Engineer" / "Cloud Engineer" / "DevOps
  // Engineer" entries by deliberately weighting their required skills
  // toward a different part of the vocabulary (applied neural-net
  // specializations for AI Engineer; on-prem Linux/networking generalist
  // skills for Systems Administrator) so they don't just duplicate an
  // existing career under a new name.
  {
    name: "Mobile Developer",
    description:
      "Builds native or cross-platform mobile applications for iOS and Android devices.",
    requiredSkills: ["Mobile Development", "Android Development", "iOS Development"],
    optionalSkills: ["Cross Platform Development", "Mobile Development Tools", "Mobile Security"],
    relatedInterests: ["Mobile Development", "Problem Solving", "Software Engineering"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: [
      "Computer Programming",
      "Mobile Development",
      "Android Development",
      "iOS Development",
      "Cross Platform Development",
    ],
  },
  {
    name: "QA Engineer",
    description:
      "Designs and runs test plans to catch bugs and verify software quality before release. Covers what's often also called a 'Software Tester' role — same core skill set in this dataset.",
    requiredSkills: ["Software Testing", "Computer Programming", "Agile Software Development"],
    optionalSkills: ["Software Engineering", "Software Engineering Tools", "Databases"],
    relatedInterests: ["Problem Solving", "Software Engineering", "Software Testing"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: [
      "Computer Programming",
      "Software Testing",
      "Agile Software Development",
      "Software Engineering Tools",
    ],
  },
  {
    name: "Database Administrator",
    description:
      "Installs, configures, secures, and maintains database systems to keep an organization's data available and performant.",
    requiredSkills: ["Database Administration", "Databases", "SQL"],
    optionalSkills: ["Database Design", "Data Management", "Database Theory"],
    relatedInterests: ["Databases", "Problem Solving", "Data Management"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Databases", "SQL", "Database Design", "Database Administration", "Database Theory"],
  },
  {
    name: "Product Manager",
    description:
      "Defines product vision and roadmap, prioritizing features by balancing user needs, business goals, and technical constraints.",
    requiredSkills: ["Product Management", "Product Strategy", "Market Research"],
    optionalSkills: ["Product Development", "Business Analysis", "Product Lifecycle"],
    relatedInterests: ["Strategy", "Business Analysis", "Product Design"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: [
      "Market Research",
      "Product Management",
      "Product Strategy",
      "Product Development",
      "Product Lifecycle",
    ],
  },
  {
    name: "Data Engineer",
    description:
      "Builds and maintains the pipelines and infrastructure that move, store, and prepare data for analysts and data scientists.",
    requiredSkills: ["Data Engineering", "Big Data", "SQL", "Data Warehousing"],
    optionalSkills: ["Cloud Computing", "Python Programming", "Data Architecture"],
    relatedInterests: ["Data Management", "Databases", "Cloud Infrastructure"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: [
      "SQL",
      "Databases",
      "Data Warehousing",
      "Big Data",
      "Data Engineering",
      "Cloud Computing",
    ],
  },
  {
    name: "Network Engineer",
    description:
      "Designs, builds, and maintains the networks that connect an organization's systems, devices, and data centers.",
    requiredSkills: ["Computer Networking", "Network Architecture", "Networking Hardware"],
    optionalSkills: ["Network Security", "Software-Defined Networking", "Cloud Infrastructure"],
    relatedInterests: ["Network Security", "Problem Solving", "Cloud Infrastructure"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: [
      "Computer Networking",
      "Networking Hardware",
      "Network Architecture",
      "Network Security",
      "Software-Defined Networking",
    ],
  },
  {
    name: "Systems Administrator",
    description:
      "Keeps servers, operating systems, and internal IT infrastructure running reliably — installs, configures, monitors, and troubleshoots.",
    requiredSkills: ["Linux", "System Software", "Computer Networking"],
    optionalSkills: ["Cloud Computing", "Network Security", "System Security"],
    relatedInterests: ["Problem Solving", "Cloud Infrastructure", "Network Security"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Linux", "System Software", "Computer Networking", "System Security", "Cloud Computing"],
  },
  {
    name: "Solutions Architect",
    description:
      "Designs high-level technical solutions that satisfy business requirements, translating strategy into system architecture across teams.",
    requiredSkills: ["Software Architecture", "Systems Design", "Cloud Computing"],
    optionalSkills: ["Cloud Infrastructure", "Business Analysis", "Strategy"],
    relatedInterests: ["Software Engineering", "Strategy", "Cloud Infrastructure"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: [
      "Systems Design",
      "Software Architecture",
      "Cloud Computing",
      "Cloud Infrastructure",
      "Strategy",
    ],
  },
  {
    name: "AI Engineer",
    description:
      "Builds and applies deep learning and generative AI models — from neural network design to real-world NLP and computer vision applications.",
    requiredSkills: ["Artificial Neural Networks", "Deep Learning", "Natural Language Processing"],
    optionalSkills: ["Computer Vision", "Reinforcement Learning", "Machine Learning Algorithms"],
    relatedInterests: ["Machine Learning", "Mathematics", "Problem Solving"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: [
      "Machine Learning",
      "Artificial Neural Networks",
      "Deep Learning",
      "Natural Language Processing",
      "Computer Vision",
    ],
  },

  // --- Second expansion batch, mined from the rest of the 328-term
  // vocabulary that the first batch (Mobile Developer -> AI Engineer above)
  // didn't touch: finance/accounting, marketing/sales, HR, supply chain/
  // retail, statistics/health-data, and a handful of niche technical
  // clusters (blockchain, IoT, graphics/VR). Same rule as before: every
  // skill checked against the real vocabulary first, and anything that
  // would've just duplicated a career already in this file was merged in
  // or dropped rather than added:
  //   - "Recruiter / Talent Acquisition Specialist" folded into "Human
  //     Resources Specialist" below — Recruitment + Talent Management are
  //     already core to that entry, a separate one would repeat them.
  //   - "Actuary" skipped — the vocabulary has no dedicated actuarial-
  //     science term; its closest real cluster (Underwriting, Risk
  //     Management, Probability & Statistics) is the same one already used
  //     for "Insurance Underwriter" below, so a second entry would be the
  //     same skill list under a different title.
  //   - "Game Developer" is the one entry here where the dataset has no
  //     literal "game development" skill — it's built from the closest real
  //     cluster (Computer Graphics, Virtual Reality, Graphics Software), so
  //     treat it as a graphics/VR-programming role more than a literal
  //     match to "game dev" as an industry term.
  {
    name: "Financial Analyst",
    description:
      "Evaluates financial data, market trends, and company performance to guide investment and budgeting decisions.",
    requiredSkills: ["Financial Analysis", "Financial Accounting", "Finance"],
    optionalSkills: ["Financial Management", "Market Analysis", "General Statistics"],
    relatedInterests: ["Finance", "Data Analysis", "Strategy"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Finance", "Financial Accounting", "Financial Analysis", "Financial Management", "Market Analysis"],
  },
  {
    name: "Accountant",
    description:
      "Prepares, reviews, and maintains financial records, ensuring accuracy and compliance with accounting standards.",
    requiredSkills: ["Accounting", "Financial Accounting", "General Accounting"],
    optionalSkills: ["Accounts Payable and Receivable", "Taxes", "Generally Accepted Accounting Principles (GAAP)"],
    relatedInterests: ["Finance", "Accounting"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["Accounting", "General Accounting", "Financial Accounting", "Taxes", "Accounts Payable and Receivable"],
  },
  {
    name: "Digital Marketing Specialist",
    description:
      "Plans and runs online marketing campaigns across search, social, and other digital channels to drive growth.",
    requiredSkills: ["Digital Marketing", "Social Media", "Search Engine Optimization"],
    optionalSkills: ["Marketing", "Advertising", "Brand Management"],
    relatedInterests: ["Marketing", "Social Media", "Creativity"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["Marketing", "Digital Marketing", "Social Media", "Search Engine Optimization", "Advertising"],
  },
  {
    name: "Marketing Manager",
    description:
      "Sets marketing strategy and oversees campaigns, brand positioning, and market research to grow a product or company.",
    requiredSkills: ["Marketing Management", "Marketing", "Market Research"],
    optionalSkills: ["Brand Management", "Marketing Psychology", "Product Marketing"],
    relatedInterests: ["Strategy", "Marketing", "Communication"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Marketing", "Market Research", "Marketing Management", "Brand Management", "Product Marketing"],
  },
  {
    name: "Sales Manager",
    description:
      "Leads sales efforts — building client relationships, negotiating deals, and managing a sales pipeline or team.",
    requiredSkills: ["Sales", "B2B Sales", "Negotiation"],
    optionalSkills: ["Salesforce", "Customer Relationship Management", "Account Management"],
    relatedInterests: ["Communication", "Sales", "Negotiation"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["Sales", "Negotiation", "B2B Sales", "Customer Relationship Management", "Salesforce"],
  },
  {
    name: "Human Resources Specialist",
    description:
      "Manages recruitment, employee relations, and talent development to support an organization's workforce. Covers what's often also called a 'Talent Acquisition Specialist' or 'Recruiter' role — same core skills in this dataset.",
    requiredSkills: ["Human Resources", "Recruitment", "Talent Management"],
    optionalSkills: ["Human Resources Operations", "Compensation", "Benefits"],
    relatedInterests: ["Communication", "Human Resources", "Leadership and Management"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["Human Resources", "Recruitment", "Talent Management", "Human Resources Operations", "Compensation"],
  },
  {
    name: "Supply Chain Analyst",
    description:
      "Analyzes and optimizes the flow of goods and materials — from procurement through warehousing to delivery.",
    requiredSkills: ["Supply Chain and Logistics", "Supply Chain Systems", "Inventory Management"],
    optionalSkills: ["Procurement", "Warehouse Management", "Data Analysis"],
    relatedInterests: ["Operations Management", "Data Analysis", "Problem Solving"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Supply Chain and Logistics", "Inventory Management", "Procurement", "Warehouse Management", "Supply Chain Systems"],
  },
  {
    name: "Customer Success Manager",
    description:
      "Helps customers get ongoing value from a product, driving retention and satisfaction after the initial sale.",
    requiredSkills: ["Customer Success", "Customer Relationship Management", "Customer Support"],
    optionalSkills: ["Communication", "Customer Analysis", "Salesforce"],
    relatedInterests: ["Communication", "Problem Solving", "Customer Analysis"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["Customer Support", "Customer Relationship Management", "Customer Success", "Customer Analysis"],
  },
  {
    name: "Insurance Underwriter",
    description:
      "Evaluates and prices insurance risk, deciding coverage terms based on applicant and policy data.",
    requiredSkills: ["Underwriting", "Insurance Sales", "Risk Management"],
    optionalSkills: ["Banking", "Finance", "Audit"],
    relatedInterests: ["Risk Management", "Finance", "Data Analysis"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Risk Management", "Insurance Sales", "Underwriting", "Finance", "Audit"],
  },
  {
    name: "Biostatistician",
    description:
      "Applies statistical methods to health, clinical, and biological data to support medical and public-health research.",
    requiredSkills: ["Biostatistics", "General Statistics", "Bioinformatics"],
    optionalSkills: ["Epidemiology", "R Programming", "Statistical Analysis"],
    relatedInterests: ["Mathematics", "Statistical Analysis", "Health"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: ["General Statistics", "Biostatistics", "Epidemiology", "Bioinformatics", "R Programming"],
  },
  {
    name: "Statistician",
    description:
      "Designs studies and models to analyze data and quantify uncertainty, across business, research, or policy settings.",
    requiredSkills: ["General Statistics", "Probability & Statistics", "Statistical Analysis"],
    optionalSkills: ["Statistical Programming", "Bayesian Statistics", "Econometrics"],
    relatedInterests: ["Mathematics", "Statistical Analysis", "Problem Solving"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: ["Probability & Statistics", "General Statistics", "Statistical Analysis", "Statistical Programming", "Bayesian Statistics"],
  },
  {
    name: "GIS Analyst",
    description:
      "Works with geographic and spatial data — mapping, analyzing, and visualizing location-based information.",
    requiredSkills: ["GIS Software", "ArcGIS", "Spatial Analysis"],
    optionalSkills: ["Geovisualization", "Geostatistics", "Data Visualization"],
    relatedInterests: ["Data Analysis", "Mathematics", "Problem Solving"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["GIS Software", "ArcGIS", "Spatial Analysis", "Geovisualization", "Geostatistics"],
  },
  {
    name: "UX Researcher",
    description:
      "Studies user behavior and needs through interviews, surveys, and testing to inform product and design decisions.",
    requiredSkills: ["User Research", "User Experience", "Persona Research"],
    optionalSkills: ["User Experience Design", "Market Research", "Survey Creation"],
    relatedInterests: ["Visual Design", "Problem Solving", "Communication"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["User Experience", "User Research", "Persona Research", "Survey Creation", "User Experience Design"],
  },
  {
    name: "Content Writer",
    description:
      "Writes and edits articles, marketing copy, or journalistic content for print or digital publication.",
    requiredSkills: ["Writing", "Journalism", "Communication"],
    optionalSkills: ["Public Relations", "Social Media", "Marketing"],
    relatedInterests: ["Writing", "Communication", "Creativity"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["Writing", "Communication", "Journalism", "Social Media", "Public Relations"],
  },
  {
    name: "Public Relations Specialist",
    description:
      "Manages an organization's public image and media presence, and plans communications for major announcements.",
    requiredSkills: ["Public Relations", "Media Strategy & Planning", "Communication"],
    optionalSkills: ["Journalism", "Social Media", "Brand Management"],
    relatedInterests: ["Communication", "Writing", "Strategy"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["Communication", "Public Relations", "Media Strategy & Planning", "Social Media", "Brand Management"],
  },
  {
    name: "Blockchain Developer",
    description:
      "Builds decentralized applications and smart contracts, working with blockchain protocols and cryptographic systems.",
    requiredSkills: ["BlockChain", "Computer Programming", "Cryptography"],
    optionalSkills: ["Software Engineering", "Distributed Computing Architecture", "Cloud Infrastructure"],
    relatedInterests: ["Problem Solving", "Software Engineering", "Cryptography"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: ["Computer Programming", "Cryptography", "BlockChain", "Distributed Computing Architecture", "Software Engineering"],
  },
  {
    name: "Game Developer",
    description:
      "Builds interactive graphics and virtual environments for games and simulations. The dataset has no single 'game development' skill tag, so this is grounded in its closest real cluster: computer graphics and VR programming.",
    requiredSkills: ["Computer Graphics", "Computer Programming", "Virtual Reality"],
    optionalSkills: ["Computer Graphic Techniques", "Graphics Software", "Software Engineering"],
    relatedInterests: ["Creativity", "Problem Solving", "Visual Design"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: ["Computer Programming", "Computer Graphics", "Computer Graphic Techniques", "Graphics Software", "Virtual Reality"],
  },
  {
    name: "IoT Engineer",
    description:
      "Designs and builds connected-device systems — the hardware, networking, and software behind the Internet of Things.",
    requiredSkills: ["Internet Of Things", "Computer Networking", "Computer Programming"],
    optionalSkills: ["Cloud Computing", "System Software", "Networking Hardware"],
    relatedInterests: ["Problem Solving", "Cloud Infrastructure", "Network Security"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: ["Computer Programming", "Computer Networking", "Internet Of Things", "Networking Hardware", "Cloud Computing"],
  },
  {
    name: "E-Commerce Manager",
    description:
      "Runs an online storefront end-to-end — digital marketing, product listings, customer experience, and fulfillment logistics.",
    requiredSkills: ["E-Commerce", "Digital Marketing", "Retail Sales"],
    optionalSkills: ["Customer Analysis", "Supply Chain and Logistics", "Marketing"],
    relatedInterests: ["Marketing", "Strategy", "Data Analysis"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Retail Sales", "E-Commerce", "Digital Marketing", "Customer Analysis", "Supply Chain and Logistics"],
  },
  {
    name: "Retail Store Manager",
    description:
      "Runs day-to-day store operations — staffing, inventory, and customer service — for a physical retail location.",
    requiredSkills: ["Retail Store Operations", "Retail Sales", "Inventory Management"],
    optionalSkills: ["Customer Support", "Warehouse Management", "Sales"],
    relatedInterests: ["Operations Management", "Communication", "Sales"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["Retail Sales", "Retail Store Operations", "Inventory Management", "Customer Support", "Warehouse Management"],
  },

  // --- Third batch. After this pass, 178 of the 328 vocabulary terms were
  // still unused, but most of what's left doesn't map to a standalone
  // career — it maps to a skill WITHIN a career that already exists here.
  // Three groups were deliberately left out of this file, with the
  // reasoning documented here rather than force-fitting them into new
  // entries just to shrink the "unused" count:
  //   1. Language/tool/platform variants — Java Programming, C++
  //      Programming, Swift Programming, React (web framework), Django
  //      (Web Framework), Amazon Web Services, Microsoft Azure, Google App
  //      Engine, IBM Cloud, PostgreSQL, NoSQL, Docker (Software), etc. These
  //      are specific technologies within a career that's already curated
  //      (Software Developer, Cloud Engineer, Backend Developer, ...) — a
  //      separate "AWS Engineer" career next to "Cloud Engineer" would be
  //      the same job with a vendor name attached, not a different one.
  //   2. Pure academic/math subjects — Algebra, Calculus, Linear Algebra,
  //      Differential Equations, Graph Theory, Probability Distribution,
  //      Regression, etc. These are course topics that feed INTO careers
  //      like Data Scientist, AI Engineer, and Statistician, not careers of
  //      their own.
  //   3. Generic soft skills — Adaptability, Collaboration, Creativity,
  //      Critical Thinking, Decision Making, Emotional Intelligence,
  //      Resilience, Storytelling, etc. These describe how someone works,
  //      not what role they're in — every career here already draws on
  //      relatedInterests/optionalSkills from this pool where relevant.
  //
  // What follows are the clusters from that remaining 178 that DO support a
  // genuinely distinct, real-world job title with its own core skill set.
  {
    name: "Project Manager",
    description:
      "Plans, schedules, and coordinates the people, budget, and timeline needed to deliver a project.",
    requiredSkills: ["Project Management", "Planning", "Scrum (Software Development)"],
    optionalSkills: ["Change Management", "Contract Management", "Estimation"],
    relatedInterests: ["Strategy", "Communication", "Leadership and Management"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Planning", "Project Management", "Scrum (Software Development)", "Change Management", "Estimation"],
  },
  {
    name: "Operations Manager",
    description:
      "Oversees the day-to-day processes that keep a business running efficiently, and improves them over time.",
    requiredSkills: ["Operations Management", "Operations Research", "Process Analysis"],
    optionalSkills: ["Business Process Management", "Strategy and Operations", "Operational Analysis"],
    relatedInterests: ["Strategy", "Problem Solving", "Data Analysis"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Process Analysis", "Operations Management", "Operational Analysis", "Business Process Management", "Operations Research"],
  },
  {
    name: "Investment Analyst",
    description:
      "Researches securities and markets to guide investment decisions and portfolio strategy.",
    requiredSkills: ["Investment Management", "Securities Trading", "Financial Analysis"],
    optionalSkills: ["Securities Sales", "Mergers & Acquisitions", "FinTech"],
    relatedInterests: ["Finance", "Data Analysis", "Strategy"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: ["Financial Analysis", "Investment Management", "Securities Trading", "Securities Sales", "Mergers & Acquisitions"],
  },
  {
    name: "Security Engineer",
    description:
      "Designs and builds secure systems and software, rather than monitoring them after deployment — the build side of security work.",
    requiredSkills: ["Security Engineering", "Software Security", "Computer Security Models"],
    optionalSkills: ["Security Software", "Security Strategy", "Cyberattacks"],
    relatedInterests: ["Network Security", "Problem Solving", "Software Engineering"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: ["Computer Security Models", "Software Security", "Security Engineering", "Security Software", "Security Strategy"],
  },
  {
    name: "Learning & Development Specialist",
    description:
      "Designs and delivers training programs that build employee skills and support career growth within an organization.",
    requiredSkills: ["Leadership Development", "People Development", "Training"],
    optionalSkills: ["Professional Development", "Organizational Development", "Performance Management"],
    relatedInterests: ["Communication", "Human Resources", "Leadership and Management"],
    difficultyLevel: "Beginner",
    recommendedLearningSequence: ["Training", "People Development", "Leadership Development", "Professional Development", "Organizational Development"],
  },
  {
    name: "Business Intelligence Analyst",
    description:
      "Builds dashboards and reports that turn business data into decisions for non-technical stakeholders.",
    requiredSkills: ["Business Intelligence", "Power BI", "Data Visualization"],
    optionalSkills: ["SQL", "Business Research", "Business Process Management"],
    relatedInterests: ["Data Analysis", "Strategy", "Business Analysis"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Data Visualization", "Power BI", "Business Intelligence", "SQL", "Business Research"],
  },
  {
    name: "Embedded Systems Engineer",
    description:
      "Writes low-level software that runs directly on hardware — firmware, device drivers, and resource-constrained systems.",
    requiredSkills: ["Hardware Design", "Computer Architecture", "System Programming"],
    optionalSkills: ["Microarchitecture", "Operating Systems", "Internet Of Things"],
    relatedInterests: ["Problem Solving", "Software Engineering", "Computer Programming"],
    difficultyLevel: "Advanced",
    recommendedLearningSequence: ["Computer Architecture", "System Programming", "Hardware Design", "Microarchitecture", "Operating Systems"],
  },
  {
    name: "Logistics Manager",
    description:
      "Plans and coordinates the physical movement of goods — transportation, receiving, and supplier relationships.",
    requiredSkills: ["Transportation Operations Management", "Shipping and Receiving", "Material Handling"],
    optionalSkills: ["Supplier Relationship Management", "Warehouse Management", "Store Management"],
    relatedInterests: ["Operations Management", "Problem Solving", "Communication"],
    difficultyLevel: "Intermediate",
    recommendedLearningSequence: ["Shipping and Receiving", "Material Handling", "Transportation Operations Management", "Supplier Relationship Management", "Warehouse Management"],
  },
];

export default careersData;
