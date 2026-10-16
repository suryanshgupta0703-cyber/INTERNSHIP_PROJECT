/**
 * Sample Data Service
 */

import { getElement } from '../utils/dom.ts';
import { updateCharCounter } from '../utils/dom.ts';
import type { SamplesCollection, SampleCategory, SampleType, SampleData } from '../types';

/**
 * Immutable sample data organized by category
 */
export const SAMPLES: SamplesCollection = {
    tech: {
        resume: {
            title: 'Senior Software Engineer',
            content: `John Doe
Senior Software Engineer
(123) 456-7890 | john.doe@email.com | linkedin.com/in/johndoe | github.com/johndoe

Summary
Senior Software Engineer with 8+ years developing distributed systems using React, Node.js, and TypeScript. Expert in JavaScript frameworks, microservices architectures, and container orchestration. Specializes in building high-throughput APIs, database query optimization, and event-driven systems. Deep expertise in AWS infrastructure provisioning, Kubernetes cluster management, and automated deployment pipelines. Focused on code quality, unit testing, and software architecture patterns.

Technical Skills
- Programming Languages: JavaScript ES6+, TypeScript, Python 3.x, Go
- Frontend Frameworks: React 18, Next.js, Redux Toolkit, Vue.js 3
- Backend Technologies: Node.js, Express.js, NestJS, RESTful APIs, GraphQL
- Database Systems: PostgreSQL, MongoDB, Redis, Elasticsearch
- Cloud Platforms: AWS (EC2, S3, Lambda, RDS, CloudFormation), Docker, Kubernetes
- DevOps Tools: Jenkins, GitHub Actions, Terraform, Ansible
- Testing Frameworks: Jest, Cypress, React Testing Library, Playwright
- Architecture Patterns: Microservices, Event-driven architecture, CQRS

Professional Experience
Senior Software Engineer | TechFlow Systems | 2018 - Present
- Architect and develop scalable microservices using Node.js, TypeScript, and Docker containers
- Lead React frontend development for SaaS platform serving 100K+ daily active users
- Design and implement RESTful APIs and GraphQL endpoints for mobile and web clients
- Optimize PostgreSQL database queries and implement Redis caching strategies
- Build comprehensive test suites using Jest and Cypress achieving 95% code coverage
- Deploy applications to AWS using Kubernetes clusters and Lambda serverless functions
- Implement CI/CD pipelines with GitHub Actions reducing deployment time by 80%
- Code review and technical mentoring for junior software engineers

Software Engineer | CodeCraft Solutions | 2015 - 2018
- Built full-stack applications using React, Node.js, and MongoDB
- Developed responsive web interfaces with JavaScript ES6+ and CSS3
- Created automated unit tests using Jest and React Testing Library
- Containerized applications with Docker for deployment consistency
- Participated in software development lifecycle and sprint iterations

Education & Certifications
Bachelor of Science in Computer Science | Georgia Institute of Technology | 2015
AWS Certified Solutions Architect | 2020
Certified Kubernetes Administrator (CKA) | 2021`,
            description: 'Experienced senior software engineer with full-stack development skills'
        },
        job: {
            title: 'Senior Software Engineer (Remote)',
            content: `Senior Software Engineer (Remote)
Company: TechFlow Systems
Location: United States (Remote)
Salary: $140,000 - $180,000

We are seeking an experienced Senior Software Engineer with 8+ years of professional software development experience to join our distributed engineering team. You will architect and develop our flagship SaaS platform serving 100,000+ users using cutting-edge technologies.

Key Responsibilities:
- Architect and develop scalable microservices using Node.js, TypeScript, and Docker containers
- Lead React frontend development with modern JavaScript ES6+ and TypeScript
- Design and implement RESTful APIs and GraphQL endpoints for web and mobile clients
- Optimize PostgreSQL database performance and implement Redis caching strategies
- Build comprehensive test suites using Jest and Cypress with 95%+ code coverage requirements
- Deploy applications to AWS using Kubernetes clusters and Lambda serverless functions
- Implement robust CI/CD pipelines with GitHub Actions and automated deployment workflows
- Code review and technical mentoring for software engineering best practices
- Participate in software development lifecycle and technical architecture discussions

Required Qualifications:
- 8+ years of professional software development experience
- Expert proficiency in JavaScript ES6+, TypeScript, and modern JavaScript frameworks
- Strong experience with React 18, Node.js, and building scalable web applications
- Hands-on experience with AWS cloud services (EC2, S3, Lambda, RDS)
- Proficiency with PostgreSQL, MongoDB, and Redis database systems
- Experience with Docker containerization and Kubernetes orchestration
- Knowledge of CI/CD tools including GitHub Actions or Jenkins
- Bachelor's degree in Computer Science, Software Engineering, or related field
- Experience with testing frameworks (Jest, Cypress, React Testing Library)
- Understanding of microservices architecture and event-driven design patterns

Preferred Qualifications:
- AWS Certified Solutions Architect or similar cloud certifications
- Experience with GraphQL and API design best practices
- Knowledge of Terraform for infrastructure as code
- Familiarity with monitoring tools (DataDog, New Relic)
- Previous experience in SaaS product development`,
            description: 'Remote senior software engineer position at fast-growing SaaS company'
        }
    },

    finance: {
        resume: {
            title: 'FP&A Manager',
            content: `Jane Smith, CFA, CPA
Financial Planning & Analysis Manager
(987) 654-3210 | jane.smith@email.com | linkedin.com/in/janesmith

Professional Summary
Senior FP&A Manager with 7+ years of corporate finance experience specializing in financial planning, budgeting, and variance analysis. CFA and CPA certified with deep expertise in DCF valuation models, capital structure optimization, and financial statement preparation. Expert in budget variance analysis, cash flow forecasting, and SEC financial reporting. Specializes in merger models, LBO analysis, and investment committee presentations.

Core Competencies
- Financial Planning & Analysis: Annual budget cycles, rolling forecasts, long-range strategic planning
- Financial Modeling: DCF valuation models, LBO analysis, merger models, sensitivity analysis
- Budgeting & Forecasting: Operating budgets, capital expenditure planning, cash flow forecasting
- Financial Reporting: Monthly/quarterly closes, variance analysis, management reporting packages
- Corporate Finance: Capital structure optimization, cost of capital analysis, investment evaluation
- Financial Software: SAP ECC, Oracle Hyperion, Adaptive Insights, Tableau, Bloomberg Terminal
- Excel Expertise: Advanced financial modeling, VBA macros, pivot tables, scenario analysis
- Regulatory Knowledge: SOX compliance, GAAP accounting, SEC reporting requirements

Professional Experience
Senior FP&A Manager | Goldman Sachs Asset Management | 2020 - Present
- Execute annual budget preparation and quarterly financial forecasts for $2.8B AUM division
- Create monthly financial reports including P&L variance analysis and balance sheet reconciliation
- Construct DCF valuation models and LBO analyses for private equity transactions totaling $500M+
- Execute month-end close procedures ensuring GAAP compliance and SOX internal controls
- Deliver quarterly earnings presentations to Managing Directors and Investment Committee
- Build capital allocation models and IRR calculations for investment decisions
- Deploy statistical forecasting models improving budget accuracy by 35%

FP&A Manager | JPMorgan Chase Corporate Finance | 2018 - 2020
- Managed annual operating budget process for Commercial Banking division ($1.2B revenue)
- Created detailed financial models for M&A transactions and capital structure optimization
- Led quarterly earnings preparation including variance commentary and investor materials
- Collaborated with Treasury on cash flow forecasting and liquidity management
- Implemented SAP Hyperion planning system reducing budget cycle time by 40%

Senior Financial Analyst | Morgan Stanley Wealth Management | 2016 - 2018
- Performed financial planning and analysis for wealth management division
- Built comprehensive 3-statement financial models for business unit strategic planning
- Prepared monthly management reporting packages with detailed variance analysis
- Led implementation of Tableau dashboards for real-time financial performance monitoring

Education & Certifications
Master of Business Administration (Finance) | Wharton School, University of Pennsylvania | 2016
Bachelor of Science in Finance | New York University Stern School of Business | 2014
Chartered Financial Analyst (CFA) | CFA Institute | 2017
Certified Public Accountant (CPA) | New York State | 2016`,
            description: 'CFA and CPA certified FP&A manager with investment banking experience'
        },
        job: {
            title: 'Financial Planning & Analysis (FP&A) Manager',
            content: `Senior Financial Planning & Analysis (FP&A) Manager
Company: Goldman Sachs Asset Management
Location: New York, NY
Salary: $150,000 - $200,000 + Bonus

We are seeking an experienced Senior FP&A Manager to lead financial planning, budgeting, and analysis for our $2.8B asset management division. This role is critical for driving strategic financial decision-making and supporting our continued growth in institutional and retail investment management.

Key Responsibilities:
- Execute annual budget preparation and quarterly forecasts for asset management division
- Create monthly financial reports including P&L variance analysis and balance sheet reporting
- Construct DCF valuation models and LBO analyses for private equity investments and capital decisions
- Complete month-end close procedures ensuring GAAP compliance and SOX internal controls
- Deliver quarterly earnings presentations and financial analysis to Managing Directors and Investment Committee
- Build capital allocation models and IRR calculations for strategic business investments
- Support Treasury operations with cash flow forecasting and liquidity analysis
- Deploy statistical forecasting models and financial planning software systems
- Complete M&A due diligence and merger integration financial modeling

Required Qualifications:
- 7+ years of progressive experience in corporate finance, FP&A, or investment banking
- Bachelor's degree in Finance, Accounting, Economics, or related field; MBA strongly preferred
- CFA and/or CPA certification required
- Expert-level proficiency in financial modeling and advanced Excel (VBA, pivot tables, scenario analysis)
- Extensive experience with financial planning software (SAP ECC, Oracle Hyperion, Adaptive Insights)
- Strong knowledge of GAAP accounting principles and SOX compliance requirements
- Experience with Bloomberg Terminal and financial data analysis
- Proven track record managing annual budgets exceeding $500M
- Deep understanding of capital markets, investment valuation, and corporate finance principles

Preferred Qualifications:
- Investment banking or asset management industry experience
- Advanced degree in Finance or related quantitative field
- Experience with Tableau or similar business intelligence tools
- Knowledge of regulatory requirements in asset management (SEC, FINRA)
- Previous experience presenting to C-level executives and board members`,
            description: 'Senior FP&A manager role at major investment bank'
        }
    },

    healthcare: {
        resume: {
            title: 'Registered Nurse - Critical Care',
            content: `Maria Garcia, RN, BSN
Registered Nurse
(555) 123-4567 | maria.garcia@email.com | linkedin.com/in/mariagarciarn

Summary
Compassionate and dedicated Registered Nurse with 10 years of experience providing high-quality patient care in fast-paced critical care and emergency room environments. Certified in Advanced Cardiac Life Support (ACLS) and Pediatric Advanced Life Support (PALS). Adept at patient assessment, critical thinking, and collaborating with multidisciplinary healthcare teams.

Skills
- Critical Care Nursing: Ventilator management, hemodynamic monitoring, titration of vasoactive drips
- Emergency Response: Triage, trauma care, code blue response
- Patient Assessment & Advocacy
- EMR/EHR Systems: Epic, Cerner
- Certifications: RN (State of California), BSN, CCRN, ACLS, PALS

Experience
Critical Care RN | City General Hospital | 2017 - Present
- Manage care for a diverse patient population in a 24-bed medical-surgical ICU.
- Serve as a preceptor for new graduate nurses, providing training and mentorship.
- Act as charge nurse, overseeing unit staffing, patient assignments, and workflow.

Emergency Room RN | County Medical Center | 2013 - 2017
- Provided immediate care to patients in a high-volume Level I Trauma Center.
- Triaged patients efficiently based on the severity of their condition.

Education
Bachelor of Science in Nursing (BSN) | Johns Hopkins University School of Nursing | 2013`,
            description: 'Experienced critical care and emergency room nurse'
        },
        job: {
            title: 'Clinical Nurse Manager - ICU',
            content: `Clinical Nurse Manager - ICU
Institution: Bayview Medical Center
Location: San Francisco, CA

Bayview Medical Center is hiring a dynamic and experienced Clinical Nurse Manager to lead our state-of-the-art Intensive Care Unit (ICU).

Responsibilities:
- Provide leadership and direction for the ICU nursing staff, promoting a culture of patient safety and clinical excellence.
- Oversee daily unit operations, including staffing, scheduling, and patient flow.
- Ensure compliance with all regulatory standards and hospital policies.
- Foster the professional development of staff through coaching, mentoring, and performance management.
- Collaborate with physicians and other department leaders to ensure high-quality patient outcomes.

Qualifications:
- Active Registered Nurse (RN) license in the state of California.
- Bachelor of Science in Nursing (BSN) required; Master's degree preferred.
- Minimum of 5 years of recent clinical experience in a critical care setting.
- At least 2 years of nursing leadership experience (e.g., Charge Nurse, Supervisor).
- Current ACLS and BLS certifications.
- CCRN certification is highly preferred.`,
            description: 'ICU nursing manager position at major medical center'
        }
    },

    marketing: {
        resume: {
            title: 'Digital Marketing Manager',
            content: `Sarah Johnson
Digital Marketing Manager
(555) 987-6543 | sarah.johnson@email.com | linkedin.com/in/sarahjohnson

Summary
Digital Marketing Manager with 4+ years executing multi-channel marketing campaigns. Specializes in search engine optimization, paid advertising, and email marketing automation. Expert in marketing funnel development, conversion tracking, and campaign performance measurement. Focused on brand positioning, audience targeting, and customer acquisition through digital channels.

Skills
- Digital Channels: SEO, SEM, social media, content marketing, email marketing
- Analytics: Google Analytics, Google Ads, HubSpot, Mailchimp, marketing attribution
- Automation: Marketing workflows, lead nurturing campaigns, email sequences
- Optimization: A/B testing, conversion rate optimization, ROI analysis
- Technical: Content management systems, basic HTML/CSS, marketing automation
- Collaboration: Cross-functional teamwork with product and sales

Experience
Digital Marketing Manager | GrowthTech Solutions | 2020 - Present
- Developed multi-channel marketing campaigns across search, social media, and email platforms
- Execute marketing automation sequences for lead capture and customer nurturing
- Monitor campaign metrics and optimize advertising spend for maximum marketing ROI
- Create marketing content including blog posts, social media content, and email newsletters
- Conduct split testing on ad creative and landing pages - improved conversion rates by 45%
- Increased website organic traffic 200% through SEO keyword optimization and content creation

Marketing Specialist | TechFlow Inc | 2018 - 2020
- Launched targeted advertising campaigns across Google Ads and social media platforms
- Utilized Google Analytics, Google Ads, and HubSpot for campaign tracking and reporting
- Built email marketing sequences and automated drip campaigns improving lead nurturing by 60%
- Created marketing attribution models to track customer acquisition costs and revenue attribution

Education
Bachelor of Arts in Marketing | University of Texas at Austin | 2018`,
            description: 'B2B SaaS digital marketing professional with growth focus'
        },
        job: {
            title: 'Digital Marketing Manager',
            content: `Digital Marketing Manager
Company: GrowthTech Solutions
Location: Austin, TX (Remote Friendly)

We are seeking a creative and data-driven Digital Marketing Manager to join our fast-growing SaaS company. You'll lead our digital marketing efforts and drive customer acquisition across multiple channels.

Responsibilities:
- Execute digital marketing campaigns across search engines, social media, and content platforms
- Create marketing automation workflows and email sequences for customer nurturing
- Monitor advertising performance and optimize campaign budgets for marketing ROI
- Develop marketing content including advertisements, social posts, and email newsletters
- Conduct split testing on marketing materials to improve click-through rates and conversions

Qualifications:
- Bachelor's degree in Marketing, Business, or related field
- 4+ years of experience in digital marketing, preferably in B2B SaaS
- Proficiency with marketing tools: Google Analytics, Google Ads, HubSpot, Mailchimp
- Strong analytical skills and experience with marketing attribution and ROI measurement
- Experience with content management systems and basic HTML/CSS knowledge preferred`,
            description: 'Digital marketing manager role at SaaS company'
        }
    },

    education: {
        resume: {
            title: 'High School Mathematics Teacher',
            content: `Michael Chen, M.Ed.
High School Mathematics Teacher
(555) 234-5678 | michael.chen@email.com | linkedin.com/in/michaelchen

Educational Professional Summary
Dedicated Mathematics Teacher with 8+ years of classroom instruction in Algebra, Geometry, Pre-Calculus, and Advanced Placement Statistics. Licensed educator with Master's in Mathematics Education specializing in curriculum development and student assessment. Expert in lesson planning, grade book management, and educational software implementation. Committed to standards-based instruction and student academic achievement.

Teaching Credentials & Certifications
- California Clear Teaching Credential - Single Subject Mathematics (Valid through 2026)
- Master of Education in Mathematics Education
- Advanced Placement Statistics Certification - College Board
- Google for Education Certified Trainer
- Positive Behavior Interventions and Supports (PBIS) Certified
- CPR/First Aid Certified - American Red Cross

Mathematics Subject Matter Expertise
- Algebra I & II: Linear equations, quadratic functions, polynomial operations, factoring
- Geometry: Euclidean geometry, geometric proofs, trigonometric ratios, coordinate geometry
- Pre-Calculus: Functions, logarithms, trigonometry, sequences and series, limits
- AP Statistics: Descriptive statistics, probability distributions, hypothesis testing, regression analysis
- Calculus: Derivatives, integrals, applications of calculus in real-world contexts
- Mathematical Modeling: Real-world problem solving, mathematical reasoning, proof techniques

Educational Technology & Instructional Tools
- Learning Management Systems: Google Classroom, Canvas, Schoology
- Mathematics Software: Desmos Graphing Calculator, GeoGebra, Khan Academy, IXL Math
- Assessment Platforms: Kahoot, Quizizz, Illuminate Education, ALEKS
- Interactive Whiteboards: SMART Board, Promethean ActivPanel
- Student Information Systems: PowerSchool, Infinite Campus
- Data Analysis: Excel, Google Sheets for grade tracking and student progress monitoring

Professional Teaching Experience
Mathematics Department Chair | Roosevelt High School | 2021 - Present
- Chair 12-member mathematics department serving 1,800+ students in comprehensive high school
- Instruct Advanced Placement Statistics, Pre-Calculus, and Algebra II to 180 students annually
- Align curriculum with Common Core State Standards and district pacing guides
- Review standardized test scores and design remediation programs for underperforming students
- Improved AP Statistics pass rates from 65% to 89% through targeted instruction methods
- Train new mathematics teachers and provide curriculum guidance on lesson planning
- Oversee department budget of $45,000 for mathematics textbooks, calculators, and educational materials

Mathematics Teacher | Lincoln High School | 2018 - 2021
- Taught Geometry, Algebra II, and Pre-Calculus to diverse student populations
- Implemented project-based learning activities connecting mathematics to real-world applications
- Utilized formative assessment strategies and data analysis to guide instructional decisions
- Collaborated with special education teachers to provide accommodations for IEP students
- Sponsored Mathematics Honor Society and coordinated regional math competitions
- Participated in Professional Learning Communities (PLCs) focused on student achievement

Mathematics Teacher | Washington Middle School | 2016 - 2018
- Taught 8th grade Algebra I and Pre-Algebra to 150+ students annually
- Developed intervention curriculum for students below grade level in mathematical skills
- Integrated educational technology including Khan Academy and IXL for personalized learning
- Conducted parent-teacher conferences and maintained regular communication with families
- Achieved 15% increase in state mathematics assessment scores through targeted instruction

Education & Professional Development
Master of Education in Mathematics Education | Stanford University | 2016
Bachelor of Science in Mathematics | University of California, Berkeley | 2015
Additional Coursework: Educational Psychology, Classroom Management, Assessment and Evaluation

Ongoing Professional Development:
- National Council of Teachers of Mathematics (NCTM) Annual Conference Attendee
- California Mathematics Council (CMC) Professional Development Workshops
- Differentiated Instruction Training - Solution Tree
- Trauma-Informed Teaching Practices Certification`,
            description: 'Experienced mathematics teacher and department chair with advanced credentials'
        },
        job: {
            title: 'High School Mathematics Teacher',
            content: `Mathematics Department Chair / High School Mathematics Teacher
School District: Roosevelt High School District
Location: Sacramento, CA
Salary: $65,000 - $85,000 (based on experience and education)

Roosevelt High School is seeking an experienced Mathematics Teacher to serve as Department Chair and lead our comprehensive mathematics program. This position requires a licensed educator with advanced credentials to teach AP Statistics, Pre-Calculus, and Algebra II while providing instructional leadership for our 12-member mathematics department.

Teaching Responsibilities:
- Instruct Advanced Placement Statistics, Pre-Calculus, and Algebra II courses to 180+ students annually
- Create standards-aligned lesson plans following Common Core State Standards for Mathematics
- Apply differentiated instruction methods to accommodate varied learning styles and academic levels
- Integrate educational technology including Desmos Graphing Calculator, GeoGebra, and Khan Academy
- Administer formative and summative assessments with score analysis to inform instruction
- Deliver accommodations and modifications for students with Individual Education Plans (IEPs)
- Record student grades using PowerSchool student information system
- Conduct parent-teacher conferences and send progress reports for academic communication

Department Leadership Responsibilities:
- Lead 12-member mathematics department serving 1,800+ students in grades 9-12
- Coordinate curriculum alignment and pacing guides across all mathematics courses
- Analyze standardized test data and implement targeted interventions for student improvement
- Mentor new mathematics teachers and provide instructional coaching
- Manage department budget for textbooks, technology, and supplemental instructional materials
- Collaborate with administration on scheduling, staffing, and professional development planning

Required Qualifications:
- California Clear Teaching Credential - Single Subject Mathematics
- Master's degree in Mathematics Education, Mathematics, or related field
- 8+ years of high school mathematics teaching experience
- Advanced Placement Statistics certification through College Board
- Demonstrated success improving student achievement on standardized assessments
- Experience with educational technology and learning management systems (Google Classroom, Canvas)
- Strong knowledge of Common Core State Standards for Mathematics
- Excellent communication and collaboration skills for working with students, parents, and colleagues

Preferred Qualifications:
- Department chair or instructional leadership experience
- Google for Education Certified Trainer status
- PBIS (Positive Behavior Interventions and Supports) certification
- Experience with data analysis and school improvement initiatives
- Professional development training in differentiated instruction
- Bilingual Spanish language skills

Additional Expectations:
- Participate in Professional Learning Communities (PLCs) and ongoing professional development
- Sponsor mathematics-related extracurricular activities (Math Honor Society, competitions)
- Attend NCTM and CMC professional conferences for continued learning
- Maintain current knowledge of mathematics education research and best practices`,
            description: 'Mathematics department chair position at comprehensive high school'
        }
    },

    sales: {
        resume: {
            title: 'Senior Sales Representative',
            content: `David Wilson
Senior Enterprise Sales Representative
(555) 345-6789 | david.wilson@email.com | linkedin.com/in/davidwilson

Sales Professional Summary
Senior Enterprise Sales Representative with 8+ years of B2B software sales specializing in enterprise technology solutions. Consistently exceed annual sales quotas by 130%+ with $12M+ in total sales revenue. Expert in cold calling, lead qualification, and contract negotiation. Specializes in Salesforce CRM management, pipeline forecasting, and quota attainment.

Core Sales Competencies
- Enterprise Sales: Complex B2B sales cycles, multi-stakeholder decision processes, enterprise procurement
- Account Management: Strategic account planning, territory management, customer retention, upselling
- Sales Process: Lead qualification (BANT/MEDDIC), needs assessment, solution selling, contract negotiation
- CRM Expertise: Salesforce administration, pipeline management, sales forecasting, activity tracking
- Presentation Skills: C-level presentations, product demonstrations, RFP responses, proposal development
- Sales Analytics: Revenue forecasting, conversion rate optimization, sales metrics analysis
- Industry Specialization: Enterprise software, SaaS platforms, cloud infrastructure, cybersecurity solutions

Sales Technology Stack
- CRM Platforms: Salesforce Sales Cloud, HubSpot CRM, Microsoft Dynamics 365
- Sales Enablement: Outreach.io, SalesLoft, Gong.io, Chorus for call recording and analysis
- Prospecting Tools: LinkedIn Sales Navigator, ZoomInfo, Salesforce Prospector
- Presentation Software: Salesforce CPQ, PandaDoc, DocuSign for contract management
- Communication: Zoom, Microsoft Teams, Slack for client engagement

Professional Sales Experience
Senior Enterprise Sales Representative | Salesforce | 2020 - Present
- Handle enterprise territory of 75+ Fortune 1000 accounts with $3.5M annual sales quota
- Achieve 135%+ of sales quota through prospecting and client acquisition activities
- Execute complex sales cycles averaging 12-18 months with deal sizes from $100K to $2M annually
- Deliver C-level presentations and software demonstrations to CIO, CTO, and VP-level buyers
- Coordinate with solutions engineers and implementation specialists for technical sales support
- Apply MEDDIC sales methodology for lead qualification and pipeline tracking
- Close $4.7M in annual recurring revenue through new client acquisition and account upselling
- Train 3 junior account executives on enterprise sales techniques and Salesforce CRM usage

Enterprise Sales Representative | Oracle | 2018 - 2020
- Managed mid-market territory of 125+ accounts with $2.2M annual sales target
- Exceeded quota by 125% for 8 consecutive quarters through disciplined pipeline management
- Prospected and qualified new opportunities using LinkedIn Sales Navigator and ZoomInfo
- Built comprehensive territory plans including account mapping and competitive analysis
- Negotiated enterprise software contracts ranging from $50K to $500K annual contract value
- Collaborated with channel partners and solution providers for complex deal coordination
- Achieved 98% customer retention rate through exceptional account management and customer service

Sales Representative | HubSpot | 2016 - 2018
- Generated $1.9M in new business revenue through inbound lead conversion and outbound prospecting
- Built and maintained sales pipeline of 250+ qualified prospects using HubSpot CRM
- Achieved 120% of quota for 6 consecutive quarters in highly competitive SaaS market
- Developed expertise in inbound sales methodology and content-driven lead nurturing
- Conducted over 500 product demonstrations and sales presentations annually
- Participated in trade shows, webinars, and industry conferences for lead generation

Education & Professional Development
Bachelor of Business Administration (Marketing) | Arizona State University | 2016
Salesforce Certified Sales Cloud Consultant | 2021
MEDDIC Sales Training Certification | 2020
Miller Heiman Strategic Selling Certification | 2019
Challenger Sale Methodology Training | 2018`,
            description: 'Elite enterprise software sales professional with proven quota attainment'
        },
        job: {
            title: 'Senior Sales Representative - Enterprise Software',
            content: `Senior Enterprise Sales Representative - SaaS
Company: Salesforce
Location: San Francisco, CA (Remote Flexible)
Salary: $120,000 - $150,000 base + $180,000 OTE

We are seeking an elite Senior Enterprise Sales Representative to join our high-performing enterprise sales organization. You will manage Fortune 1000 accounts and drive new business growth for our leading CRM and cloud computing platform with multi-million dollar revenue targets.

Key Sales Responsibilities:
- Handle enterprise territory of 75+ Fortune 1000 accounts with $3.5M annual sales quota
- Execute B2B software sales cycles averaging 12-18 months with deal sizes from $100K to $2M ARR
- Deliver C-level presentations and software demonstrations to CIO, CTO, and VP-level decision makers
- Execute account planning and territory coverage using sales methodologies
- Coordinate with solutions engineers and implementation specialists for technical sales support
- Apply MEDDIC sales qualification framework for lead assessment and pipeline tracking
- Close new client acquisition and account expansion revenue through consultative selling techniques
- Negotiate enterprise software contracts and procurement processes
- Update sales forecasting and pipeline reporting in Salesforce CRM

Required Qualifications:
- Bachelor's degree in Business, Marketing, or related field
- 8+ years of proven success in enterprise B2B software sales with SaaS experience
- Consistent track record of exceeding annual quotas by 125%+ in competitive markets
- Expert proficiency with Salesforce CRM for pipeline management and sales forecasting
- Experience managing complex sales cycles with multiple stakeholders and decision makers
- Strong presentation skills with ability to engage C-level executives and technical audiences
- Deep understanding of enterprise sales methodologies (MEDDIC, Challenger, Strategic Selling)
- Proven ability to manage territory of $2M+ annual revenue responsibility
- Experience with sales enablement tools (Outreach.io, SalesLoft, LinkedIn Sales Navigator)

Preferred Qualifications:
- Salesforce Certified Sales Cloud Consultant certification
- Previous experience selling CRM, cloud infrastructure, or enterprise software solutions
- Track record of $10M+ in career sales revenue achievement
- Experience with channel partners and complex deal coordination
- MEDDIC or Miller Heiman sales training certification
- Industry knowledge of digital transformation and cloud computing trends

Compensation & Benefits:
- Competitive base salary: $120,000 - $150,000
- On-target earnings (OTE): $300,000+
- Accelerated commission structure with no caps
- Equity participation and stock options
- Presidents Club and sales achievement recognition programs
- Comprehensive benefits including health, dental, vision, and 401(k) matching`,
            description: 'Elite enterprise SaaS sales role at market-leading technology company'
        }
    },

    design: {
        resume: {
            title: 'Senior UX/UI Designer',
            content: `Emily Rodriguez
Senior UX/UI Product Designer
(555) 345-6789 | emily.rodriguez@email.com | portfolio.emilyrodriguez.com | linkedin.com/in/emilyrodriguez

Design Professional Summary
Senior UX/UI Product Designer with 7+ years of experience creating digital interfaces for web and mobile applications. Expert in wireframing, prototyping, and visual design. Specializes in user interface design, user experience research, and interaction design patterns. Strong expertise in design systems, accessibility standards (WCAG 2.1), and responsive design layouts for multi-device experiences.

Design Expertise & Core Competencies
- UX Design: User research, persona development, journey mapping, information architecture, wireframing
- UI Design: Visual design, interaction design, micro-interactions, design systems, component libraries
- Prototyping: Interactive prototypes, user testing, rapid iteration, design validation
- Design Tools: Figma (advanced), Sketch, Adobe Creative Suite (Photoshop, Illustrator, XD), InVision
- User Research: User interviews, usability testing, A/B testing, heuristic evaluation, analytics analysis
- Front-end Collaboration: HTML/CSS knowledge, JavaScript basics, design-to-development handoffs
- Design Systems: Atomic design principles, component documentation, design token management
- Accessibility: WCAG 2.1 compliance, inclusive design, screen reader optimization

Design Technology Stack
- Design Platforms: Figma, Sketch, Adobe Creative Cloud, InVision, Marvel, Principle
- Prototyping Tools: Figma prototyping, InVision, Framer, Adobe XD, Axure RP
- User Testing: UserTesting.com, Maze, Hotjar, Lookback, UsabilityHub
- Analytics: Google Analytics, Mixpanel, Amplitude, Hotjar heatmaps
- Collaboration: Slack, Notion, Miro, Confluence, Jira for agile workflows
- Development: HTML5, CSS3, Sass, basic JavaScript, Git version control

Professional Design Experience
Senior Product Designer | Airbnb | 2021 - Present
- Design end-to-end product interfaces for host onboarding experience serving 4M+ global users
- Execute user research including interviews, surveys, and usability testing sessions
- Create and maintain component library in Figma serving 15+ product teams across organization
- Partner with product managers and engineers on interface design and development handoffs
- Apply accessibility standards achieving WCAG 2.1 AA compliance across all product features
- Build high-fidelity prototypes and interaction designs for iOS, Android, and responsive web
- Execute design system initiative reducing design-to-development time by 40% through standardized components
- Guide 3 junior designers and conduct design critiques and portfolio reviews

Senior UX/UI Designer | Uber | 2019 - 2021
- Designed rider and driver mobile app experiences for transportation marketplace platform
- Led user research initiatives including field studies, journey mapping, and persona development
- Created wireframes, user flows, and interactive prototypes for complex multi-step user journeys
- Collaborated with cross-functional teams including product, engineering, and user research
- Implemented responsive design solutions for web dashboard and mobile applications
- Conducted A/B testing resulting in 25% improvement in user conversion rates
- Developed design guidelines and UI patterns for consistent cross-platform experiences

UX/UI Designer | IDEO | 2017 - 2019
- Led human-centered design projects for Fortune 500 clients across healthcare, finance, and technology sectors
- Facilitated design thinking workshops and stakeholder alignment sessions
- Created comprehensive design deliverables including journey maps, service blueprints, and prototype systems
- Conducted ethnographic research and user interviews to understand customer needs and pain points
- Designed digital products and services from concept through launch and post-launch optimization
- Collaborated with multidisciplinary teams including strategists, researchers, and engineers

Education & Professional Development
Master of Fine Arts in Interaction Design | Art Center College of Design | 2017
Bachelor of Arts in Graphic Design | University of California, Los Angeles | 2015

Professional Certifications:
- Google UX Design Certificate | 2020
- Nielsen Norman Group UX Certification | 2019
- Certified Usability Analyst (CUA) | Human Factors International | 2018`,
            description: 'Senior product designer with expertise in user research and design systems'
        },
        job: {
            title: 'Senior UX/UI Designer',
            content: `Senior Product Designer
Company: Airbnb
Location: San Francisco, CA (Hybrid)
Salary: $130,000 - $170,000 + Equity

We are seeking a Senior Product Designer to execute end-to-end interface design for our host platform serving 4+ million global users. You will execute user-centered design initiatives, conduct user research, and coordinate with cross-functional teams to create digital experiences.

Key Design Responsibilities:
- Execute user-centered design process from research and ideation through prototyping and usability testing
- Build design deliverables including wireframes, user flows, interactive prototypes, and high-fidelity mockups
- Conduct user research initiatives including interviews, surveys, journey mapping, and persona development
- Build and maintain component library in Figma serving multiple product teams across organization
- Apply accessibility improvements ensuring WCAG 2.1 AA compliance across all product features
- Build responsive design solutions for iOS, Android, and web platforms with consistent user interfaces
- Partner with product managers and engineers on interface design and development handoffs
- Execute A/B testing initiatives and analyze user behavior data to inform design decisions
- Guide junior designers and conduct design critiques and portfolio reviews
- Run design thinking workshops and stakeholder alignment sessions

Required Qualifications:
- Bachelor's or Master's degree in Design, HCI, Interaction Design, or related field
- 7+ years of professional experience in UX/UI design for digital products and platforms
- Expert proficiency in Figma (advanced features), Sketch, Adobe Creative Suite, and prototyping tools
- Strong portfolio demonstrating user-centered design process, design thinking methodology, and problem-solving abilities
- Extensive experience with user research methods including interviews, usability testing, and analytics analysis
- Deep knowledge of design systems, component libraries, and atomic design principles
- Understanding of accessibility standards (WCAG 2.1) and inclusive design practices
- Knowledge of front-end development (HTML5, CSS3, JavaScript basics) for effective design-to-development collaboration
- Experience with responsive design and multi-platform design considerations
- Proven track record working in agile development environments with cross-functional teams

Preferred Qualifications:
- Google UX Design Certificate or Nielsen Norman Group UX Certification
- Experience with design systems at scale serving multiple product teams
- Background in user research with experience conducting field studies and ethnographic research
- Knowledge of design tools including InVision, Framer, or Principle for advanced prototyping
- Experience with user testing platforms (UserTesting.com, Maze, Hotjar)
- Understanding of product metrics and ability to measure design impact through data analysis
- Previous experience in marketplace, e-commerce, or two-sided platform products`,
            description: 'Senior product designer role at leading technology platform company'
        }
    },

    management: {
        resume: {
            title: 'Senior Project Manager',
            content: `Lisa Chen, PMP, CSM
Senior Project Manager - Technology
(555) 456-7890 | lisa.chen@email.com | linkedin.com/in/lisachen

Project Management Professional Summary
Senior Project Manager with 10+ years of experience executing complex technology initiatives and software development projects. PMP and Certified Scrum Master with expertise in Agile, Waterfall, and hybrid project methodologies. Specializes in managing enterprise-level projects with budgets exceeding $10M and technical teams of 50+ members. Expert in project scheduling, risk mitigation, and project portfolio tracking.

Core Project Management Competencies
- Project Methodologies: Agile/Scrum, Waterfall, Hybrid, Lean, Kanban, SAFe (Scaled Agile Framework)
- Project Leadership: Team management, stakeholder engagement, executive communication, change management
- Budget Management: Financial planning, cost control, resource allocation, ROI analysis
- Risk Management: Risk identification, mitigation planning, issue resolution, contingency planning
- Quality Assurance: Process improvement, quality control, deliverable validation, compliance management
- Vendor Management: Contract negotiation, supplier relationships, procurement oversight

Project Management Technology Stack
- Project Management Tools: Microsoft Project, Smartsheet, Monday.com, Asana, Wrike
- Agile Tools: Jira, Azure DevOps, Rally, VersionOne, Confluence
- Collaboration Platforms: Slack, Microsoft Teams, SharePoint, Google Workspace
- Analytics & Reporting: Tableau, Power BI, Excel advanced analytics, project dashboards
- Documentation: Confluence, SharePoint, Notion for project documentation and knowledge management

Professional Certifications
- Project Management Professional (PMP) - Project Management Institute
- Certified Scrum Master (CSM) - Scrum Alliance
- SAFe Program Consultant (SPC) - Scaled Agile Framework
- Change Management Certification - Prosci
- Six Sigma Green Belt - American Society for Quality

Professional Project Management Experience
Senior Program Manager | Microsoft | 2021 - Present
- Execute enterprise digital transformation initiatives with budgets ranging from $5M to $15M
- Handle program portfolio of 8 concurrent projects with technical teams totaling 75+ members
- Coordinate with C-level executives and business unit leaders on project alignment
- Deploy SAFe methodology resulting in 45% improvement in delivery predictability
- Track project budgets totaling $40M annually with variance control within 3% of planned costs
- Execute change management initiatives affecting 2,000+ employees across multiple business units
- Create project governance framework and PMO standards
- Train 6 junior project managers and conduct PMP certification preparation

Senior Project Manager | Amazon Web Services | 2019 - 2021
- Managed cloud infrastructure migration projects for Fortune 500 enterprise clients
- Led Agile development teams of 25+ members including developers, architects, and DevOps engineers
- Coordinated with vendor partners and third-party integration specialists for complex implementations
- Achieved 98% on-time project delivery rate through effective risk management and resource planning
- Implemented automated project reporting dashboards reducing administrative overhead by 35%
- Managed project budgets ranging from $2M to $8M with full P&L responsibility
- Conducted post-implementation reviews and captured best practices for organizational knowledge base

Project Manager | Google Cloud | 2017 - 2019
- Delivered 30+ cloud adoption projects for mid-market and enterprise customers
- Managed cross-functional project teams including technical specialists, business analysts, and QA testers
- Implemented hybrid Agile-Waterfall methodology for regulated industry compliance requirements
- Led stakeholder communication and executive briefings for project status and milestone reporting
- Developed risk mitigation strategies reducing project delays by 40% compared to industry benchmarks
- Coordinated multi-vendor engagements and managed complex procurement processes

Associate Project Manager | Salesforce | 2014 - 2017
- Supported enterprise CRM implementation projects for Fortune 1000 clients
- Assisted in project planning, resource allocation, and timeline management
- Facilitated daily standups, sprint planning, and retrospective meetings
- Created project documentation including requirements gathering and status reporting
- Supported change management activities and end-user training coordination

Education & Professional Development
Master of Business Administration (Project Management) | Stanford Graduate School of Business | 2017
Bachelor of Science in Industrial Engineering | University of California, Berkeley | 2014

Ongoing Professional Development:
- PMI Global Conference Annual Attendee
- Agile Alliance Community of Practice Member
- Lean Six Sigma Continuous Improvement Training`,
            description: 'Senior technology project manager with enterprise experience and advanced certifications'
        },
        job: {
            title: 'Senior Project Manager - Technology',
            content: `Senior Program Manager - Digital Transformation
Company: Microsoft
Location: Redmond, WA (Hybrid)
Salary: $130,000 - $160,000 + Bonus + Equity

We are seeking an experienced Senior Program Manager to execute enterprise digital transformation initiatives and complex technology programs. You will handle multi-million dollar budgets and coordinate technical teams to deliver software development outcomes for our enterprise customers.

Key Project Management Responsibilities:
- Execute enterprise digital transformation initiatives with budgets ranging from $5M to $15M
- Handle program portfolio of 8+ concurrent projects with technical teams totaling 75+ members
- Coordinate with C-level executives and business unit leaders on project alignment and governance
- Deploy SAFe (Scaled Agile Framework) methodology for large-scale agile program execution
- Track project budgets totaling $40M+ annually with variance control and cost tracking
- Execute change management initiatives affecting 2,000+ employees across multiple business units
- Create project governance frameworks and PMO standards for organizational consistency
- Train junior project managers and conduct PMP certification preparation and professional development
- Handle stakeholder communication and executive briefings for project status and milestone reporting

Required Qualifications:
- Bachelor's degree in Engineering, Computer Science, Business Administration, or related technical field
- 10+ years of progressive project management experience in technology environments
- Project Management Professional (PMP) certification required
- Certified Scrum Master (CSM) and SAFe Program Consultant (SPC) certifications strongly preferred
- Expert knowledge of Agile/Scrum, Waterfall, and hybrid project methodologies
- Extensive experience with project management tools (Microsoft Project, Jira, Azure DevOps, Smartsheet)
- Proven track record managing enterprise projects with budgets exceeding $5M
- Experience leading cross-functional teams of 25+ members including developers, architects, and business stakeholders
- Strong financial management skills including budget planning, cost control, and ROI analysis
- Excellent stakeholder management and executive communication skills

Preferred Qualifications:
- Master's degree in Business Administration (MBA) or related advanced degree
- Change Management certification (Prosci) or equivalent
- Six Sigma Green Belt or Black Belt certification
- Experience with cloud infrastructure projects (Azure, AWS, Google Cloud)
- Knowledge of enterprise software development lifecycle and DevOps practices
- Previous experience in digital transformation or organizational change initiatives
- Vendor management and contract negotiation experience
- Experience with project portfolio management and PMO operations

Technical Environment:
- Project management using Microsoft Project, Azure DevOps, and Power BI
- Agile project delivery with Jira and Confluence
- Stakeholder collaboration through Microsoft Teams and SharePoint
- Financial tracking and reporting with advanced Excel and Tableau
- Documentation and knowledge management using Confluence and SharePoint`,
            description: 'Senior program manager role leading enterprise digital transformation initiatives'
        }
    }
} as const;

/**
 * Character counter function type for better type safety
 */
type CharCounterFunction = (textarea: HTMLTextAreaElement) => void;

/**
 * Load sample resume data with comprehensive error handling
 * @param category - Sample category to load
 * @param updateCounterFn - Function to update character counter
 */
export const loadSampleResume = (
    category: SampleCategory,
    updateCounterFn: CharCounterFunction = updateCharCounter
): void => {
    try {
        const textarea = getElement<HTMLTextAreaElement>('resume');
        const sampleData = SAMPLES[category]?.resume;

        if (!textarea) {
            console.warn('Resume textarea not found');
            return;
        }

        if (!sampleData) {
            console.warn(`No resume sample found for category: ${category}`);
            return;
        }

        // Load the sample content
        textarea.value = sampleData.content;
        textarea.scrollTop = 0;

        // Update character counter
        updateCounterFn(textarea);

        // Update button selection highlighting
        updateButtonSelection(category, 'resume');

    } catch (error) {
        console.error('Error loading sample resume:', error);
    }
};

/**
 * Load sample job description data with comprehensive error handling
 * @param category - Sample category to load
 * @param updateCounterFn - Function to update character counter
 */
export const loadSampleJob = (
    category: SampleCategory,
    updateCounterFn: CharCounterFunction = updateCharCounter
): void => {
    try {
        const textarea = getElement<HTMLTextAreaElement>('jobDescription');
        const sampleData = SAMPLES[category]?.job;

        if (!textarea) {
            console.warn('Job description textarea not found');
            return;
        }

        if (!sampleData) {
            console.warn(`No job sample found for category: ${category}`);
            return;
        }

        // Load the sample content
        textarea.value = sampleData.content;
        textarea.scrollTop = 0;

        // Update character counter
        updateCounterFn(textarea);

        // Update button selection highlighting
        updateButtonSelection(category, 'job');

    } catch (error) {
        console.error('Error loading sample job:', error);
    }
};

/**
 * Update button selection highlighting
 */
const updateButtonSelection = (category: SampleCategory, type: SampleType): void => {
    try {
        // Clear all existing selections for this type
        const allButtons = document.querySelectorAll<HTMLButtonElement>(`[data-type="${type}"]`);
        allButtons.forEach(btn => btn.classList.remove('selected'));

        // Add selection to the specific button
        const selectedButton = document.querySelector<HTMLButtonElement>(
            `[data-category="${category}"][data-type="${type}"]`
        );
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
    } catch (error) {
        console.warn('Error updating button selection:', error);
    }
};

/**
 * Clear sample selection when user manually edits content
 * @param type - Type of sample to clear ('resume' or 'job')
 */
export const clearSampleSelection = (type: SampleType): void => {
    try {
        const buttons = document.querySelectorAll<HTMLButtonElement>(`[data-type="${type}"]`);
        buttons.forEach(btn => btn.classList.remove('selected'));
    } catch (error) {
        console.warn('Error clearing sample selection:', error);
    }
};

/**
 * Get sample data by category and type
 * @param category - Sample category
 * @param type - Sample type
 * @returns Sample data or null if not found
 */
export const getSampleData = (category: SampleCategory, type: SampleType): SampleData | null => {
    try {
        return SAMPLES[category]?.[type] || null;
    } catch (error) {
        console.warn('Error getting sample data:', error);
        return null;
    }
};

/**
 * Get all available sample categories
 * @returns Array of available categories
 */
export const getAvailableCategories = (): readonly SampleCategory[] => {
    return Object.keys(SAMPLES) as SampleCategory[];
};

/**
 * Check if a category has both resume and job samples
 * @param category - Category to check
 * @returns True if category has both sample types
 */
export const isCategoryComplete = (category: SampleCategory): boolean => {
    const categoryData = SAMPLES[category];
    return !!(categoryData?.resume && categoryData?.job);
};

/**
 * Get sample titles for display in UI
 * @param category - Sample category
 * @returns Object with resume and job titles
 */
export const getSampleTitles = (category: SampleCategory): {
    resume?: string;
    job?: string;
} => {
    const categoryData = SAMPLES[category];
    return {
        resume: categoryData?.resume?.title,
        job: categoryData?.job?.title
    };
};

/**
 * Validate if a string is a valid sample category
 * @param value - Value to check
 * @returns True if valid category
 */
export const isValidCategory = (value: unknown): value is SampleCategory => {
    return typeof value === 'string' && value in SAMPLES;
};

/**
 * Validate if a string is a valid sample type
 * @param value - Value to check
 * @returns True if valid type
 */
export const isValidSampleType = (value: unknown): value is SampleType => {
    return value === 'resume' || value === 'job';
};

// Default export for compatibility
export default {
    SAMPLES,
    loadSampleResume,
    loadSampleJob,
    clearSampleSelection,
    getSampleData,
    getAvailableCategories,
    isCategoryComplete,
    getSampleTitles,
    isValidCategory,
    isValidSampleType
} as const;