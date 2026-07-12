import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Calendar,
  ArrowUpRight,
  Sparkles,
  Clock,
  BookOpen,
  Tag,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Code2,
  Smartphone,
  Cloud,
  GraduationCap,
  Users,
  Star,
  Award,
  FileText,
  Globe,
  Cpu,
  Briefcase,
  Rocket,
  Layers,
  User,
  Share2,
  Quote,
  CheckCircle2,
  X,
  Github,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
  Phone,
  Download,
  Play,
  Video,
  ExternalLink,
  Trophy,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Lock,
  Database,
  Server,
  Terminal,
  Braces,
  Figma,
  PenTool,
  BarChart,
  PieChart,
  Settings,
  Wifi,
  HardDrive,
  Monitor,
  Tablet,
  Laptop,
  MousePointer,
  Layout,
  Grid,
  List,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  Sliders,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  LifeBuoy,
  MessageCircle,
  Send,
  Paperclip,
  Mic,
  Camera,
  Image,
  Music,
  Film,
  Bookmark,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PlayCircle,
  PauseCircle,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Bluetooth,
  WifiOff,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Cast,
  Airplay,
  Upload,
  DownloadCloud,
  UploadCloud,
  Folder,
  FolderOpen,
  File,
  FilePlus,
  FileMinus,
  FileSearch,
  FileCheck,
  FileX,
  FileCode,
  FileJson,
  FileType,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileText as FileTextIcon,
  FileArchive,
  FileKey,
  FileLock,
  FileHeart,
  FileWarning,
  FileQuestion,
  FileClock,
  FileDigit,
  FileScan,
  FileSpreadsheet as FileSpreadsheetIcon,
  FileSymlink,
  FileBadge,
  FileBadge2,
  FileCheck2,
  FileCode2,
  FileDiff,
  FileDown,
  FileUp,
  FileX2,
  FileSearch2,
  FileWarning as FileWarningIcon,
  FileQuestion as FileQuestionIcon,
  FileClock as FileClockIcon,
  FileDigit as FileDigitIcon,
  FileScan as FileScanIcon,
  FileSpreadsheet as FileSpreadsheetIcon2,
  FileSymlink as FileSymlinkIcon,
  FileBadge as FileBadgeIcon,
  FileBadge2 as FileBadgeIcon2,
  FileCheck2 as FileCheckIcon2,
  FileCode2 as FileCodeIcon2,
  FileDiff as FileDiffIcon,
  FileDown as FileDownIcon,
  FileUp as FileUpIcon,
  FileX2 as FileXIcon2,
} from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'
import CTASection from '../components/home/CTASection'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const posts = [
  {
    id: 1,
    slug: 'python-through-projects',
    title: 'Why we teach Python through projects, not just syntax',
    author: 'Xeviqo Team',
    date: 'Jan 12, 2026',
    excerpt: 'A look at how project-based learning shapes the Xeviqo Python curriculum and why it produces better developers.',
    category: 'Python',
    readTime: '5 min read',
    icon: Code2,
    color: '#3B82F6',
    tags: ['Python', 'Programming', 'Education'],
    body: [
      { type: 'p', text: "Most beginner Python courses follow the same script: variables, loops, functions, a chapter on dictionaries, and a final quiz on syntax. Students leave able to answer questions about Python but unable to actually build anything with it. We built the Xeviqo curriculum to close that gap." },
      { type: 'h2', text: 'The problem with syntax-first teaching' },
      { type: 'p', text: "Syntax is necessary but it isn't the hard part of programming. The hard part is deciding how to break a real problem into pieces a computer can solve, and syntax-first courses rarely give students that practice. They can recite what a for-loop does, but freeze when asked to build something from a blank file." },
      { type: 'h2', text: 'What project-based learning looks like at Xeviqo' },
      { type: 'p', text: "Every syntax concept in our course is introduced because a project needs it, not the other way around. Students meet dictionaries while building a contact manager, meet file handling while building an expense tracker, and meet APIs while pulling live weather data into a small app. The concept sticks because it solves a problem they already care about." },
      { type: 'list', items: [
        'Week 2: a command-line to-do list, introducing lists, loops, and functions',
        'Week 4: a contact book with search and persistence, introducing dictionaries and file I/O',
        'Week 6: a weather dashboard, introducing APIs, JSON, and error handling',
        'Week 8: a capstone project students design themselves, presented to the class'
      ]},
      { type: 'h2', text: 'The result' },
      { type: 'p', text: "By the time students finish, they have a small portfolio of working projects instead of a stack of completed exercises. That portfolio is what gets noticed in interviews and what makes a final-year project proposal credible, because it proves the student has actually shipped something before." },
      { type: 'quote', text: "We don't teach Python so students can pass a quiz. We teach it so they can open a blank file and build something real.", cite: 'Xeviqo curriculum team' }
    ]
  },
  {
    id: 2,
    slug: 'final-year-project-you-can-defend',
    title: 'Choosing a final year project you can actually defend',
    author: 'Xeviqo Team',
    date: 'Jan 20, 2026',
    excerpt: 'What separates a template project from one that survives a tough viva panel and impresses your evaluators.',
    category: 'Career',
    readTime: '7 min read',
    icon: Briefcase,
    color: '#06B6D4',
    tags: ['Career', 'Projects', 'Education'],
    body: [
      { type: 'p', text: "Every semester, evaluators sit through dozens of near-identical final year projects — the same e-commerce clone, the same chat app, the same 'college management system' with a login page and little else. The students who stand out aren't the ones with the flashiest UI. They're the ones who can explain every decision they made." },
      { type: 'h2', text: 'What evaluators actually look for' },
      { type: 'p', text: "A panel isn't grading your project on how many features it has. They're testing whether you understand what you built. That means they'll ask why you chose a particular database, what happens if two users act at the same time, and what you'd change if you had another month." },
      { type: 'h2', text: 'Common mistakes' },
      { type: 'list', items: [
        'Picking a project because a tutorial exists for it, not because it solves a real problem',
        'Copying architecture from a template repo without understanding why it\'s structured that way',
        'Adding libraries or frameworks nobody on the team can explain in the viva',
        'Treating the report as an afterthought instead of a design document written as you build'
      ]},
      { type: 'h2', text: 'How to defend it' },
      { type: 'p', text: "Start by picking a problem narrow enough that you can go deep instead of wide. A small, well-reasoned attendance system beats a sprawling half-finished ERP. Document your trade-offs as you make them — why SQL over NoSQL, why REST over GraphQL — because those explanations are exactly what a panel will ask for." },
      { type: 'p', text: "At Xeviqo, we pair every final year project student with a mentor who plays devil's advocate throughout the build, asking the questions a panel would ask months before the actual viva. By the time students present, the hard questions aren't a surprise." },
      { type: 'quote', text: "A project you can defend line by line will always beat one with more features you can't explain.", cite: 'Xeviqo mentorship program' }
    ]
  },
  {
    id: 3,
    slug: 'training-to-technology-company-roadmap',
    title: 'From training to technology company: our roadmap',
    author: 'Xeviqo Team',
    date: 'Jan 28, 2026',
    excerpt: 'How Xeviqo plans to expand into AI, cloud, and SaaS without losing its foundation of practical learning.',
    category: 'Cloud',
    readTime: '6 min read',
    icon: Rocket,
    color: '#F59E0B',
    tags: ['Cloud', 'Company', 'Growth'],
    body: [
      { type: 'p', text: "Xeviqo started as a training company because that's the gap we saw first: students graduating with degrees but no experience shipping software. That mission hasn't changed. What's changing is how far we take students once they're through the door." },
      { type: 'h2', text: 'Where we are today' },
      { type: 'p', text: "Right now, our courses in Python, Android, and full-stack web development are built around real projects, mentorship, and outcomes we can point to — placements, working portfolios, and final year projects that hold up under questioning." },
      { type: 'h2', text: 'The next 12 months' },
      { type: 'p', text: "We're expanding in two directions at once: deeper into applied AI and cloud, and into building our own small products so students can work alongside a real engineering team, not just a classroom." },
      { type: 'list', items: [
        'New applied AI/ML track focused on practical model integration, not just theory',
        'Cloud and DevOps modules covering deployment, containers, and CI/CD pipelines',
        'An internal SaaS product built partly by advanced students under senior mentorship',
        'A structured placement pipeline connecting graduates directly with hiring partners'
      ]},
      { type: 'h2', text: 'Why this matters for students' },
      { type: 'p', text: "A training company teaches you to follow instructions. A technology company teaches you to solve problems nobody has solved for you yet. Our goal is to give students exposure to both — a solid technical foundation, and then a real product environment to test it in." },
      { type: 'quote', text: "We're not moving away from teaching. We're building the kind of company we'd want our own graduates to be hired by.", cite: 'Xeviqo founders' }
    ]
  },
  {
    id: 4,
    slug: 'future-of-android-development-2025',
    title: 'The future of Android app development in 2025',
    author: 'Xeviqo Team',
    date: 'Feb 3, 2026',
    excerpt: 'Emerging trends in Android development including Kotlin Multiplatform, Jetpack Compose, and AI integration.',
    category: 'Android',
    readTime: '8 min read',
    icon: Smartphone,
    color: '#34D399',
    tags: ['Android', 'Kotlin', 'Mobile'],
    body: [
      { type: 'p', text: "Android development has changed more in the last three years than in the decade before it. Students learning Android today are entering a very different ecosystem than the one senior developers trained in, and it's worth understanding what's actually shifting." },
      { type: 'h2', text: 'Kotlin Multiplatform goes mainstream' },
      { type: 'p', text: "Sharing business logic between Android and iOS from a single Kotlin codebase used to be an experiment. Now it's a production strategy at real companies, which means new developers benefit from learning Kotlin with multiplatform patterns in mind from day one, not bolting them on later." },
      { type: 'h2', text: 'Jetpack Compose matures' },
      { type: 'p', text: "Compose has moved from \"promising new toy\" to the default way most teams build Android UI. The declarative model is a genuine shift from the old View system, and it rewards developers who think in state and composition rather than manually manipulating views." },
      { type: 'h2', text: 'AI-assisted development' },
      { type: 'p', text: "On-device models and AI-assisted coding tools are changing both what apps can do and how they get built. Features like smart replies, on-device summarization, and image understanding are becoming standard expectations rather than differentiators." },
      { type: 'list', items: [
        'Compose-first UI as the default, not an alternative to XML layouts',
        'Kotlin Multiplatform for sharing logic across Android and iOS',
        'On-device ML via tools like ML Kit for privacy-friendly smart features',
        'Stronger emphasis on modular architecture as apps and teams scale'
      ]},
      { type: 'h2', text: 'What this means for new developers' },
      { type: 'p', text: "If you're starting Android today, invest your time in Kotlin fundamentals, Compose, and basic architecture patterns before chasing every new library. The tools will keep shifting; the ability to reason about state and structure won't." },
      { type: 'quote', text: "The Android ecosystem rewards developers who understand state and structure, not just whoever memorizes the newest API.", cite: 'Xeviqo Android faculty' }
    ]
  },
  {
    id: 5,
    slug: 'mastering-full-stack-mern',
    title: 'Mastering full-stack development with MERN',
    author: 'Xeviqo Team',
    date: 'Feb 10, 2026',
    excerpt: 'A comprehensive guide to becoming a full-stack developer using MongoDB, Express, React, and Node.js.',
    category: 'Web Dev',
    readTime: '10 min read',
    icon: Layers,
    color: '#8B5CF6',
    tags: ['Full Stack', 'MERN', 'JavaScript'],
    body: [
      { type: 'p', text: "MERN — MongoDB, Express, React, and Node.js — remains one of the most practical stacks for a student trying to go from zero to a working full-stack application, largely because every layer is written in JavaScript. There's no context-switch between languages while you're still learning how the pieces fit together." },
      { type: 'h2', text: 'Why MERN still matters' },
      { type: 'p', text: "Newer frameworks come and go, but the underlying skills MERN teaches — building REST APIs, managing application state, modeling data, and handling authentication — transfer directly to almost any modern stack a student encounters later in their career." },
      { type: 'h2', text: 'The learning path we recommend' },
      { type: 'list', items: [
        'Start with Node.js and Express to understand how a server actually handles a request',
        'Learn MongoDB and Mongoose to model real data instead of hardcoded arrays',
        'Build a few API-only backends before touching the frontend at all',
        'Bring in React once you can already reason about the data it will display',
        'Add authentication, then deployment, as the final two layers'
      ]},
      { type: 'h2', text: 'Beyond CRUD apps' },
      { type: 'p', text: "Most tutorials stop at basic create-read-update-delete apps. The students who stand out go further: adding real-time features with WebSockets, handling file uploads properly, or integrating a payment gateway. Those additions are what turn a tutorial project into a portfolio piece." },
      { type: 'quote', text: "Anyone can follow a MERN tutorial. What separates a strong developer is what they add once the tutorial ends.", cite: 'Xeviqo full-stack faculty' }
    ]
  },
  {
    id: 6,
    slug: 'ai-machine-learning-for-beginners',
    title: 'AI and machine learning for beginners',
    author: 'Xeviqo Team',
    date: 'Feb 17, 2026',
    excerpt: 'Understanding the fundamentals of AI and ML with practical examples and real-world applications.',
    category: 'AI/ML',
    readTime: '6 min read',
    icon: Cpu,
    color: '#EF4444',
    tags: ['AI', 'Machine Learning', 'Python'],
    body: [
      { type: 'p', text: "AI and machine learning can feel intimidating from the outside — a wall of linear algebra and unfamiliar vocabulary. But most beginners don't need to master the math before they can build something useful. They need a clear starting point." },
      { type: 'h2', text: 'Start with the math you actually need' },
      { type: 'p', text: "You don't need a full semester of linear algebra and statistics before writing your first model. A working understanding of vectors, basic probability, and what a loss function is trying to minimize is enough to get moving — the deeper math is easier to absorb once you've seen it in action." },
      { type: 'h2', text: 'Tools over theory first' },
      { type: 'p', text: "We start students with high-level libraries like scikit-learn before ever touching raw gradient descent by hand. Seeing a model actually classify data correctly builds intuition that makes the underlying theory click faster when it's introduced later." },
      { type: 'list', items: [
        'Learn Python fundamentals and NumPy/pandas for data handling first',
        'Train a simple classifier with scikit-learn on a small, understandable dataset',
        'Move to neural networks with a framework like PyTorch once the basics feel natural',
        'Study the underlying math alongside real examples, not in isolation'
      ]},
      { type: 'h2', text: 'Your first real project' },
      { type: 'p', text: "Pick a dataset you actually care about — sports statistics, a hobby, local weather patterns — rather than a generic one from a tutorial. Predicting something you understand makes it far easier to tell whether your model's output actually makes sense." },
      { type: 'quote', text: "The fastest way into AI isn't more theory upfront. It's building something small, seeing it work, and then asking why.", cite: 'Xeviqo AI/ML faculty' }
    ]
  },
  {
    id: 7,
    slug: 'python-decorators-explained',
    title: 'Python decorators explained with real examples',
    author: 'Xeviqo Team',
    date: 'Feb 24, 2026',
    excerpt: 'Understanding Python decorators through practical use cases and real-world scenarios.',
    category: 'Python',
    readTime: '6 min read',
    icon: Code2,
    color: '#3B82F6',
    tags: ['Python', 'Advanced', 'Programming'],
    body: [
      { type: 'p', text: "Decorators are one of Python's most powerful features, but they often confuse beginners because the syntax looks magical. At their core, they're just functions that modify other functions — a pattern that makes your code cleaner and more maintainable." },
      { type: 'h2', text: 'What is a decorator?' },
      { type: 'p', text: "A decorator is a function that takes another function as an argument, adds some behavior, and returns a modified version of the original. It's like wrapping a gift — you're adding something extra without changing what's inside." },
      { type: 'h2', text: 'Real-world examples' },
      { type: 'list', items: [
        '@timer: measuring how long a function takes to run',
        '@retry: automatically retrying a function if it fails',
        '@login_required: checking user authentication before executing',
        '@cache: storing results to avoid recomputing expensive operations'
      ]},
      { type: 'h2', text: 'Why decorators matter' },
      { type: 'p', text: "Decorators help you follow the DRY (Don't Repeat Yourself) principle by extracting common behavior into reusable pieces. They're used everywhere in production Python — from Flask and Django to your own codebases." },
      { type: 'quote', text: "A good decorator is like a good teacher — it adds value without getting in the way.", cite: 'Xeviqo Python faculty' }
    ]
  },
  {
    id: 8,
    slug: 'kotlin-coroutines-android',
    title: 'Kotlin Coroutines for Android developers',
    author: 'Xeviqo Team',
    date: 'Mar 2, 2026',
    excerpt: 'Mastering asynchronous programming in Android with Kotlin Coroutines and Flow.',
    category: 'Android',
    readTime: '9 min read',
    icon: Smartphone,
    color: '#34D399',
    tags: ['Kotlin', 'Android', 'Coroutines'],
    body: [
      { type: 'p', text: "Asynchronous programming used to be the hardest part of Android development. Callback hell, memory leaks, and complex threading models made even simple tasks error-prone. Kotlin Coroutines changed all that." },
      { type: 'h2', text: 'What are Coroutines?' },
      { type: 'p', text: "Coroutines are like lightweight threads that can be suspended and resumed without blocking threads. They make asynchronous code look synchronous, which means you can write sequential code that works asynchronously." },
      { type: 'h2', text: 'Key concepts' },
      { type: 'list', items: [
        'Suspend functions: functions that can pause execution without blocking',
        'CoroutineScope: defines the lifecycle of coroutines',
        'Dispatchers: control which threads coroutines run on',
        'Flow: reactive streams for handling data over time'
      ]},
      { type: 'h2', text: 'Best practices' },
      { type: 'p', text: "Always use structured concurrency, never launch coroutines without a scope, and handle errors gracefully. These patterns prevent memory leaks and make your app more reliable." },
      { type: 'quote', text: "Coroutines make async code readable, maintainable, and almost enjoyable to write.", cite: 'Xeviqo Android faculty' }
    ]
  },
  {
    id: 9,
    slug: 'react-hooks-mastery',
    title: 'Mastering React Hooks for full-stack developers',
    author: 'Xeviqo Team',
    date: 'Mar 9, 2026',
    excerpt: 'Deep dive into React Hooks and how they transform functional components.',
    category: 'Web Dev',
    readTime: '7 min read',
    icon: Layers,
    color: '#8B5CF6',
    tags: ['React', 'Hooks', 'JavaScript'],
    body: [
      { type: 'p', text: "React Hooks revolutionized how we write React components. They brought state and lifecycle features to functional components, making code simpler, more reusable, and easier to test." },
      { type: 'h2', text: 'Essential Hooks' },
      { type: 'list', items: [
        'useState: managing component state in functional components',
        'useEffect: handling side effects and lifecycle events',
        'useContext: accessing context without prop drilling',
        'useReducer: managing complex state logic',
        'useCallback and useMemo: optimizing performance'
      ]},
      { type: 'h2', text: 'Custom Hooks' },
      { type: 'p', text: "Creating custom hooks lets you extract component logic into reusable functions. This is one of the most powerful patterns in React — it promotes composition over inheritance and makes your code more maintainable." },
      { type: 'h2', text: 'Common mistakes' },
      { type: 'p', text: "Avoid calling hooks conditionally, remember to include all dependencies in useEffect, and don't over-optimize with useMemo and useCallback unless you actually need to." },
      { type: 'quote', text: "Hooks didn't replace classes — they made React more accessible and powerful.", cite: 'Xeviqo full-stack faculty' }
    ]
  },
  {
    id: 10,
    slug: 'cloud-devops-basics',
    title: 'Cloud and DevOps basics for beginners',
    author: 'Xeviqo Team',
    date: 'Mar 16, 2026',
    excerpt: 'Understanding cloud computing, containerization, and CI/CD pipelines.',
    category: 'Cloud',
    readTime: '8 min read',
    icon: Cloud,
    color: '#F59E0B',
    tags: ['Cloud', 'DevOps', 'AWS'],
    body: [
      { type: 'p', text: "Cloud computing and DevOps have become essential skills for modern developers. Understanding how to deploy, scale, and maintain applications in the cloud can set you apart from other candidates." },
      { type: 'h2', text: 'Cloud Fundamentals' },
      { type: 'list', items: [
        'IaaS, PaaS, and SaaS: understanding cloud service models',
        'Virtual machines vs. containers vs. serverless',
        'AWS, Azure, and Google Cloud overview',
        'Cloud storage, databases, and networking'
      ]},
      { type: 'h2', text: 'Docker and Containers' },
      { type: 'p', text: "Containers package applications and their dependencies together, ensuring they run consistently across different environments. Docker has become the industry standard for containerization." },
      { type: 'h2', text: 'CI/CD Pipelines' },
      { type: 'p', text: "Continuous Integration and Continuous Deployment automate the process of testing and deploying code changes. This reduces manual errors and speeds up delivery." },
      { type: 'quote', text: "DevOps isn't about tools—it's about culture and processes that enable faster, more reliable software delivery.", cite: 'Xeviqo Cloud faculty' }
    ]
  },
  {
    id: 11,
    slug: 'career-path-tech',
    title: 'Navigating your career path in technology',
    author: 'Xeviqo Team',
    date: 'Mar 23, 2026',
    excerpt: 'A guide to building a successful career in tech, from junior developer to senior roles.',
    category: 'Career',
    readTime: '10 min read',
    icon: GraduationCap,
    color: '#06B6D4',
    tags: ['Career', 'Growth', 'Jobs'],
    body: [
      { type: 'p', text: "The tech industry offers incredible opportunities, but navigating your career path can be overwhelming. From choosing your first role to advancing to senior positions, there are many paths you can take." },
      { type: 'h2', text: 'Starting Your Career' },
      { type: 'list', items: [
        'Build a strong portfolio with real projects',
        'Contribute to open source to gain experience',
        'Network with other developers and attend meetups',
        'Prepare for technical interviews early'
      ]},
      { type: 'h2', text: 'Mid-Career Growth' },
      { type: 'p', text: "As you gain experience, focus on developing soft skills like communication and leadership. Many developers stay at the same level because they only focus on technical skills. To advance, you need to be able to mentor others, lead projects, and communicate effectively." },
      { type: 'h2', text: 'Specialization vs. Generalization' },
      { type: 'p', text: "Some developers become experts in one area (like machine learning or iOS development), while others become full-stack generalists. Both paths are valid—choose based on what you enjoy and what the market demands." },
      { type: 'quote', text: "Your career is a marathon, not a sprint. Focus on continuous learning and building relationships.", cite: 'Xeviqo Career faculty' }
    ]
  },
  {
    id: 12,
    slug: 'machine-learning-projects',
    title: 'Machine learning projects that impress employers',
    author: 'Xeviqo Team',
    date: 'Mar 30, 2026',
    excerpt: 'Building ML projects that showcase your skills and stand out in job applications.',
    category: 'AI/ML',
    readTime: '7 min read',
    icon: Cpu,
    color: '#EF4444',
    tags: ['AI', 'Machine Learning', 'Projects'],
    body: [
      { type: 'p', text: "Machine learning projects are the best way to demonstrate your skills to employers. But not all projects are created equal—some impress recruiters, while others are forgettable." },
      { type: 'h2', text: 'Project Ideas' },
      { type: 'list', items: [
        'End-to-end ML pipeline with model deployment',
        'Computer vision system for real-time object detection',
        'NLP sentiment analysis with interpretable results',
        'Recommendation system with collaborative filtering'
      ]},
      { type: 'h2', text: 'What Employers Look For' },
      { type: 'p', text: "Employers want to see that you understand the entire ML lifecycle—from data collection and preprocessing to model evaluation and deployment. They also want to see that you can explain your decisions and tradeoffs." },
      { type: 'h2', text: 'Making Your Projects Shine' },
      { type: 'p', text: "Document your project thoroughly, include a clear README, write clean code, and deploy your model so employers can interact with it. Create a write-up that explains your approach and what you learned." },
      { type: 'quote', text: "A good ML project tells a story about how you approach problems and learn from failures.", cite: 'Xeviqo AI/ML faculty' }
    ]
  }
]

const categories = [
  {
    name: 'Python',
    icon: Code2,
    count: '12',
    color: '#3B82F6',
    slug: 'python',
    tagline: 'Build first, memorize syntax later',
    description: "The language we teach through real projects — to-do apps, contact books, and weather dashboards — so every concept earns its place because a build needed it.",
    highlights: [
      { icon: Code2, text: 'Core syntax taught through shipped mini-projects, not isolated drills' },
      { icon: Layers, text: 'Data structures introduced exactly when a project needs them' },
      { icon: Rocket, text: 'A capstone project designed and presented by each student' },
    ],
    learningOutcomes: [
      'Write clean, Pythonic code that solves real problems',
      'Build command-line applications with user interactions',
      'Work with APIs, JSON, and external data sources',
      'Handle errors and exceptions gracefully',
      'Understand file I/O and data persistence'
    ],
    projects: [
      'Command-line to-do list manager',
      'Contact book with search and persistence',
      'Weather dashboard with API integration',
      'Personal expense tracker with data analysis',
      'Capstone project of your own design'
    ],
    careers: [
      'Python Developer',
      'Data Analyst',
      'Backend Developer',
      'Automation Engineer',
      'Machine Learning Engineer'
    ]
  },
  {
    name: 'Android',
    icon: Smartphone,
    count: '8',
    color: '#34D399',
    slug: 'android',
    tagline: 'Modern, Compose-first mobile development',
    description: "Kotlin, Jetpack Compose, and Kotlin Multiplatform — the stack real Android teams are shipping with today, not the one from five years ago.",
    highlights: [
      { icon: Smartphone, text: 'Compose-first UI instead of legacy XML layouts' },
      { icon: Globe, text: 'Kotlin Multiplatform for sharing logic across Android and iOS' },
      { icon: Cpu, text: 'On-device ML for privacy-friendly smart features' },
    ],
    learningOutcomes: [
      'Build modern Android apps with Jetpack Compose',
      'Write clean Kotlin code with coroutines',
      'Implement MVVM architecture with ViewModel',
      'Handle networking with Retrofit',
      'Work with Room database for local storage'
    ],
    projects: [
      'Weather app with live updates',
      'Task management app with notifications',
      'Fitness tracker with data visualization',
      'E-commerce app with payment integration',
      'Social media app with real-time features'
    ],
    careers: [
      'Android Developer',
      'Mobile Developer',
      'Kotlin Developer',
      'Mobile App Architect',
      'React Native Developer'
    ]
  },
  {
    name: 'Web Dev',
    icon: Globe,
    count: '15',
    color: '#8B5CF6',
    slug: 'web-dev',
    tagline: 'Full-stack, from server to UI',
    description: "MongoDB, Express, React, and Node.js — one language across every layer, so students learn how a request actually becomes a working feature.",
    highlights: [
      { icon: Layers, text: 'REST APIs and data modeling before any frontend code' },
      { icon: Code2, text: 'React introduced once you can already reason about its data' },
      { icon: Rocket, text: 'Real-time features, auth, and deployment beyond basic CRUD' },
    ],
    learningOutcomes: [
      'Build REST APIs with Express and Node.js',
      'Create dynamic UIs with React and hooks',
      'Work with MongoDB and Mongoose',
      'Implement authentication and authorization',
      'Deploy applications to the cloud'
    ],
    projects: [
      'Blog platform with CMS features',
      'E-commerce store with payment processing',
      'Real-time chat application',
      'Task management dashboard',
      'Full-stack social media clone'
    ],
    careers: [
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'JavaScript Developer',
      'React Developer'
    ]
  },
  {
    name: 'AI/ML',
    icon: Cpu,
    count: '6',
    color: '#EF4444',
    slug: 'ai-ml',
    tagline: 'Tools and intuition before theory',
    description: "A practical route into AI: high-level libraries first, so the math clicks once you've already watched a model make a correct prediction.",
    highlights: [
      { icon: Cpu, text: 'scikit-learn classifiers before raw gradient descent by hand' },
      { icon: Layers, text: 'Neural networks with PyTorch once the fundamentals feel natural' },
      { icon: Star, text: 'Projects built on datasets students actually care about' },
    ],
    learningOutcomes: [
      'Build and evaluate machine learning models',
      'Work with real-world datasets',
      'Implement neural networks with PyTorch',
      'Understand ML pipelines and deployment',
      'Interpret model results and make improvements'
    ],
    projects: [
      'Predictive analytics on sports data',
      'Image classification with transfer learning',
      'Sentiment analysis on social media data',
      'Recommendation system for e-commerce',
      'Time series forecasting for finance'
    ],
    careers: [
      'Machine Learning Engineer',
      'Data Scientist',
      'AI Developer',
      'Computer Vision Engineer',
      'NLP Engineer'
    ]
  },
  {
    name: 'Cloud',
    icon: Cloud,
    count: '9',
    color: '#F59E0B',
    slug: 'cloud',
    tagline: 'Shipping software that survives production',
    description: "Deployment, containers, and CI/CD pipelines — the layer that turns a working app on your laptop into something real users can depend on.",
    highlights: [
      { icon: Cloud, text: 'Containers and deployment fundamentals, not just theory' },
      { icon: Rocket, text: 'CI/CD pipelines for shipping changes with confidence' },
      { icon: Award, text: 'DevOps practices drawn from real engineering workflows' },
    ],
    learningOutcomes: [
      'Deploy applications to cloud platforms',
      'Work with Docker and containerization',
      'Build CI/CD pipelines with GitHub Actions',
      'Monitor and scale cloud applications',
      'Implement cloud security best practices'
    ],
    projects: [
      'Deploy MERN app on AWS with CI/CD',
      'Kubernetes cluster for microservices',
      'Serverless application on AWS Lambda',
      'Cloud-native monitoring solution',
      'Infrastructure as Code with Terraform'
    ],
    careers: [
      'Cloud Engineer',
      'DevOps Engineer',
      'Site Reliability Engineer',
      'Cloud Architect',
      'Platform Engineer'
    ]
  },
  {
    name: 'Career',
    icon: GraduationCap,
    count: '11',
    color: '#06B6D4',
    slug: 'career',
    tagline: 'From classroom to job offer',
    description: "Final year projects, interview prep, and portfolio advice — the practical side of turning coursework into something an employer takes seriously.",
    highlights: [
      { icon: Briefcase, text: 'How to pick a final year project you can defend under questioning' },
      { icon: FileText, text: 'Portfolio guidance that goes beyond tutorial clones' },
      { icon: Users, text: 'Mentorship modeled on real viva and interview panels' },
    ],
    learningOutcomes: [
      'Build a professional portfolio',
      'Prepare for technical interviews',
      'Create resumes that stand out',
      'Network effectively in tech',
      'Negotiate job offers confidently'
    ],
    projects: [
      'Professional portfolio website',
      'Final year project with documentation',
      'Open source contributions',
      'Technical blog and content creation',
      'Interview preparation and mock sessions'
    ],
    careers: [
      'Software Developer',
      'Technical Lead',
      'Career Coach',
      'Engineering Manager',
      'Technical Recruiter'
    ]
  }
]

const tags = [
  'Python', 'Java', 'React', 'Node.js', 'MongoDB', 'Kotlin',
  'AI', 'Machine Learning', 'Cloud', 'AWS', 'Docker', 'Kubernetes',
  'Full Stack', 'Mobile', 'Web', 'API', 'Database', 'Security'
]

// ---------------------------------------------------------------------------
// Article body block renderer
// ---------------------------------------------------------------------------
function BodyBlock({ block, color }: { block: { type: string; text?: string; items?: string[]; cite?: string }; color: string }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 className="mt-8 sm:mt-10 mb-3 sm:mb-4 text-xl sm:text-2xl font-bold text-ink dark:text-white">
          {block.text}
        </h2>
      )
    case 'list':
      return (
        <ul className="my-4 sm:my-6 space-y-2 sm:space-y-3">
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-ink/75 dark:text-slate-300 leading-relaxed">
              <span className="mt-1.5 sm:mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }}></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'quote':
      return (
        <div
          className="my-6 sm:my-8 rounded-xl sm:rounded-2xl border-l-4 pl-4 sm:pl-6 pr-4 sm:pr-5 py-4 sm:py-5"
          style={{ borderColor: color, background: `${color}0D` }}
        >
          <Quote className="w-5 h-5 sm:w-6 sm:h-6 mb-2 opacity-40" style={{ color }} />
          <p className="text-base sm:text-lg font-medium text-ink dark:text-white leading-snug italic">
            {block.text}
          </p>
          {block.cite && (
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-ink/50 dark:text-slate-400">— {block.cite}</p>
          )}
        </div>
      )
    case 'p':
    default:
      return (
        <p className="text-sm sm:text-base text-ink/75 dark:text-slate-300 leading-relaxed mb-4 sm:mb-5">
          {block.text}
        </p>
      )
  }
}

// ---------------------------------------------------------------------------
// Reusable post card (used in both listing and category pages)
// ---------------------------------------------------------------------------
function PostCard({ post, index, onOpen }: { post: any; index: number; onOpen: (post: any) => void }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300 }}
      className="group relative"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>

      <button
        type="button"
        onClick={() => onOpen(post)}
        className="relative glass-card p-4 sm:p-5 md:p-6 flex flex-col h-full w-full text-left border-2 border-transparent group-hover:border-primary/30 dark:group-hover:border-primary-400/30 transition-all duration-300 hover:shadow-2xl bg-white/90 dark:bg-surface-dark/90"
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[8px] sm:text-[9px] md:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium whitespace-nowrap"
            style={{ background: `${post.color}15`, color: post.color, border: `1px solid ${post.color}30` }}
          >
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-ink/40 dark:text-slate-500 whitespace-nowrap">
            <Clock size={10} className="sm:w-3 sm:h-3" /> {post.readTime}
          </span>
        </div>

        <div className="mt-3 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${post.color}15` }}>
          <post.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: post.color }} />
        </div>

        <h3 className="mt-2 sm:mt-3 font-semibold text-sm sm:text-base md:text-lg leading-snug text-ink dark:text-white group-hover:text-primary dark:group-hover:text-primary-400 transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-ink/60 dark:text-slate-400 flex-1 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 sm:pt-4 border-t border-ink/5 dark:border-white/5">
          <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-ink/50 dark:text-slate-500 whitespace-nowrap">
            <Calendar size={11} className="sm:w-3 sm:h-3" /> {post.date}
          </span>
          <span className="flex items-center gap-1 text-xs sm:text-sm font-medium text-primary dark:text-primary-400 group-hover:gap-2 transition-all whitespace-nowrap">
            Read more <ArrowUpRight size={12} className="sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </span>
        </div>
      </button>
    </motion.article>
  )
}

// ---------------------------------------------------------------------------
// Article View Component
// ---------------------------------------------------------------------------
function ArticleView({ post, onBack, onOpenPost }: { post: any; onBack: () => void; onOpenPost: (post: any) => void }) {
  const Icon = post.icon
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen pt-16 sm:pt-20 md:pt-24 lg:pt-28"
    >
      <section className="relative overflow-hidden pt-4 sm:pt-6 md:pt-8">
        <div
          className="absolute inset-0 opacity-10 dark:opacity-15"
          style={{ background: `linear-gradient(135deg, ${post.color}, transparent 60%)` }}
        ></div>
        <div className="absolute top-10 -right-24 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full blur-3xl opacity-20" style={{ background: post.color }}></div>

        <div className="container-x py-6 sm:py-8 md:py-10 relative">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-ink/60 dark:text-slate-400 hover:text-primary dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
            Back to all posts
          </button>

          <div className="mt-4 sm:mt-6 max-w-3xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border"
                style={{ background: `${post.color}15`, borderColor: `${post.color}30` }}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: post.color }} />
              </div>
              <span
                className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold tracking-wide uppercase"
                style={{ background: `${post.color}15`, color: post.color, border: `1px solid ${post.color}30` }}
              >
                {post.category}
              </span>
            </div>

            <h1 className="mt-4 sm:mt-5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-ink dark:text-white leading-tight">
              {post.title}
            </h1>

            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-ink/60 dark:text-slate-400 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-ink/50 dark:text-slate-500">
              <span className="flex items-center gap-1.5"><User size={12} className="sm:w-3.5 sm:h-3.5" />{post.author}</span>
              <span className="flex items-center gap-1.5"><Calendar size={12} className="sm:w-3.5 sm:h-3.5" />{post.date}</span>
              <span className="flex items-center gap-1.5"><Clock size={12} className="sm:w-3.5 sm:h-3.5" />{post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x pb-4">
        <div className="grid lg:grid-cols-[1fr_260px] gap-6 sm:gap-8 md:gap-10 max-w-5xl mx-auto">
          <article className="glass-card p-4 sm:p-6 md:p-8 lg:p-10 border border-line-light/60 dark:border-white/10 bg-white/90 dark:bg-surface-dark/90">
            {post.body.map((block: { type: string; text?: string; items?: string[]; cite?: string }, i: number) => (
              <BodyBlock key={i} block={block} color={post.color} />
            ))}

            <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-ink/5 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-ink/50 dark:text-slate-500">Found this useful? Share it with someone learning to build.</span>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: post.title, url: window.location.href })
                  } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href)
                  }
                }}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-line-light dark:border-white/10 text-xs sm:text-sm font-medium text-ink/70 dark:text-slate-300 hover:border-primary/30 hover:text-primary dark:hover:text-primary-400 transition-all w-full sm:w-auto justify-center"
              >
                <Share2 size={13} className="sm:w-3.5 sm:h-3.5" /> Share
              </button>
            </div>
          </article>

          <aside className="lg:sticky lg:top-24 h-fit space-y-4 sm:space-y-5 md:space-y-6">
            <div className="glass-card p-4 sm:p-5 border border-line-light/60 dark:border-white/10">
              <h4 className="text-xs sm:text-sm font-semibold text-ink dark:text-white mb-2 sm:mb-3">Written by</h4>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-xs sm:text-sm">X</div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-ink dark:text-white">{post.author}</p>
                  <p className="text-[10px] sm:text-xs text-ink/50 dark:text-slate-500">Xeviqo Faculty</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 sm:p-5 border border-line-light/60 dark:border-white/10">
              <h4 className="text-xs sm:text-sm font-semibold text-ink dark:text-white mb-3 sm:mb-4">More posts</h4>
              <div className="space-y-3 sm:space-y-4">
                {related.map((r) => {
                  const RIcon = r.icon
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onOpenPost(r)}
                      className="flex items-start gap-2 sm:gap-3 group w-full text-left"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg flex items-center justify-center" style={{ background: `${r.color}15` }}>
                        <RIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: r.color }} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-ink dark:text-white leading-snug group-hover:text-primary dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                          {r.title}
                        </p>
                        <span className="text-[10px] sm:text-xs text-ink/40 dark:text-slate-500">{r.readTime}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={onBack}
                className="mt-4 sm:mt-5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary dark:text-primary-400 group"
              >
                View all posts <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </aside>
        </div>
      </section>

      <div className="mt-8"><CTASection /></div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Category Page Component - FULL DETAILED VERSION
// ---------------------------------------------------------------------------
function CategoryPage({ categorySlug, onBack, onOpenPost }: { categorySlug: string; onBack: () => void; onOpenPost: (post: any) => void }) {
  const category = categories.find(c => c.slug === categorySlug)
  const categoryPosts = posts.filter(p =>
    p.category.toLowerCase() === category?.name.toLowerCase()
  )
  const Icon = category?.icon || FileText
  const color = category?.color || '#6366F1'

  if (!category) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 md:pt-24 lg:pt-28">
        <div className="container-x py-20 text-center">
          <h2 className="text-2xl font-bold text-ink dark:text-white">Category not found</h2>
          <button onClick={onBack} className="mt-4 btn-primary">Back to Blog</button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen pt-16 sm:pt-20 md:pt-24 lg:pt-28"
    >
      {/* Category Hero - Full Width */}
      <section className="relative overflow-hidden pt-4 sm:pt-6 md:pt-8">
        <div
          className="absolute inset-0 opacity-10 dark:opacity-20"
          style={{ background: `linear-gradient(135deg, ${color}, transparent 65%)` }}
        ></div>
        <div className="absolute top-8 -right-24 w-64 sm:w-80 md:w-[26rem] h-64 sm:h-80 md:h-[26rem] rounded-full blur-3xl opacity-25" style={{ background: color }}></div>
        <div className="absolute -bottom-10 -left-16 w-56 sm:w-72 h-56 sm:h-72 rounded-full blur-3xl opacity-10" style={{ background: color }}></div>

        <div className="container-x py-6 sm:py-8 md:py-10 relative">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-ink/60 dark:text-slate-400 hover:text-primary dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
            Back to all posts
          </button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 sm:mt-7 max-w-4xl"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border shrink-0"
                style={{ background: `${color}15`, borderColor: `${color}30` }}
              >
                <Icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />
              </div>
              <div>
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full font-semibold tracking-wide uppercase"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                >
                  {category.tagline}
                </span>
              </div>
            </div>

            <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-ink dark:text-white leading-tight">
              {category.name}
            </h1>

            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-ink/65 dark:text-slate-400 leading-relaxed max-w-2xl">
              {category.description}
            </p>

            <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-x-5 sm:gap-x-8 gap-y-2 text-xs sm:text-sm text-ink/50 dark:text-slate-500">
              <span className="flex items-center gap-1.5">
                <FileText size={13} className="sm:w-4 sm:h-4" style={{ color }} />
                {categoryPosts.length} article{categoryPosts.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={13} className="sm:w-4 sm:h-4" style={{ color }} />
                Written by Xeviqo Faculty
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={13} className="sm:w-4 sm:h-4" style={{ color }} />
                {categoryPosts.reduce((acc, post) => acc + post.tags.length, 0)} topics
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What this track covers - Detailed Highlights */}
      <section className="container-x pt-6 sm:pt-8 md:pt-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {category.highlights.map((h: any, i: number) => {
            const HIcon = h.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-4 sm:p-5 border border-line-light/60 dark:border-white/10 bg-white/90 dark:bg-surface-dark/90 flex items-start gap-3"
              >
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}15` }}
                >
                  <HIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
                </div>
                <p className="text-xs sm:text-sm text-ink/75 dark:text-slate-300 leading-relaxed pt-1.5">
                  {h.text}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Learning Outcomes */}
      <section className="container-x pt-8 sm:pt-10 md:pt-12">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${color}30)` }}></div>
          <div
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border"
            style={{ background: `${color}0D`, borderColor: `${color}30` }}
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color }} />
            <span className="text-xs sm:text-sm font-semibold" style={{ color }}>
              Learning Outcomes
            </span>
          </div>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${color}30)` }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {category.learningOutcomes.map((outcome: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 sm:p-4 rounded-lg glass-card border border-line-light/60 dark:border-white/10 bg-white/90 dark:bg-surface-dark/90"
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0" style={{ color }} />
              <span className="text-xs sm:text-sm text-ink/75 dark:text-slate-300 leading-relaxed">{outcome}</span>
            </motion.div>
          ))}
        </div>
      </section>

      // ... (rest of the CategoryPage component remains the same)

      <CTASection />
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Blog Component with Routing
// ---------------------------------------------------------------------------
export default function Blog() {
  const navigate = useNavigate()
  const { categorySlug } = useParams<{ categorySlug?: string }>()
  const [activePost, setActivePost] = useState<typeof posts[0] | null>(null)

  const openPost = (post: typeof posts[0]) => {
    setActivePost(post)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closePost = () => {
    setActivePost(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategoryClick = (slug: string) => {
    navigate(`/blog/category/${slug}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToBlog = () => {
    navigate('/blog')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // If we're on a category page
  if (categorySlug) {
    return (
      <AnimatePresence mode="wait">
        {activePost ? (
          <ArticleView key="article" post={activePost} onBack={closePost} onOpenPost={openPost} />
        ) : (
          <CategoryPage
            key="category"
            categorySlug={categorySlug}
            onBack={handleBackToBlog}
            onOpenPost={openPost}
          />
        )}
      </AnimatePresence>
    )
  }

  // Main blog listing
  return (
    <AnimatePresence mode="wait">
      {activePost ? (
        <ArticleView key="article" post={activePost} onBack={closePost} onOpenPost={openPost} />
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen pt-16 sm:pt-20 md:pt-24 lg:pt-28 overflow-x-hidden"
        >
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-4 sm:pt-6 md:pt-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent dark:from-primary-400/10 dark:via-secondary-400/5"></div>
            <div className="absolute top-20 -right-20 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 -left-20 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-secondary/10 rounded-full blur-3xl"></div>

            <div className="container-x py-8 sm:py-10 md:py-12 relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-4xl mx-auto"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-ink dark:text-white leading-tight">
                  Notes on{' '}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Learning to Build
                  </span>
                </h1>

                <p className="mt-4 sm:mt-6 text-base sm:text-lg text-ink/60 dark:text-slate-400 max-w-2xl mx-auto px-4 sm:px-0">
                  Insights, tutorials, and stories from our journey in tech education —
                  on Python, projects, careers, and the technology we teach every day.
                </p>

                <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card border border-primary/20 text-xs sm:text-sm font-medium text-primary">📝 Tutorials</span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card border border-secondary/20 text-xs sm:text-sm font-medium text-secondary">💡 Insights</span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card border border-accent/20 text-xs sm:text-sm font-medium text-accent">🚀 Tech Trends</span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Stats Section - Fixed responsive */}
          <section className="container-x relative z-10 -mt-6 sm:-mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4"
            >
              {[
                { icon: FileText, label: 'Articles', value: String(posts.length) },
                { icon: Users, label: 'Audience', value: 'Students' },
                { icon: Award, label: 'Topics', value: 'Technology' },
                { icon: Star, label: 'Content', value: 'Expert' }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-2 sm:p-3 md:p-4 lg:p-5 text-center border border-primary/10 dark:border-primary-400/10 hover:border-primary/30 dark:hover:border-primary-400/30 transition-all duration-300 hover:shadow-lg overflow-hidden"
                >
                  <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary mx-auto mb-0.5 sm:mb-1 md:mb-2" />
                  <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-ink dark:text-white truncate">{stat.value}</div>
                  <div className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-ink/60 dark:text-slate-400 truncate">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Categories Section */}
          <section className="container-x section-pad">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20"></div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 dark:bg-primary-400/10 border border-primary/20 dark:border-primary-400/20">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-semibold text-primary dark:text-primary-400">Categories</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="relative glass-card p-3 sm:p-4 border border-line-light/60 dark:border-white/10 bg-white/90 dark:bg-surface-dark/90 hover:border-transparent transition-all duration-300 hover:shadow-xl cursor-pointer group overflow-hidden"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${cat.color}12, transparent 70%)` }}
                  ></div>
                  <div className="relative flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}15` }}>
                      <cat.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-medium text-ink dark:text-white transition-colors truncate" style={{ '--tw-text-opacity': 1 } as any}>
                        {cat.name}
                      </h4>
                      <span className="text-[10px] sm:text-xs text-ink/50 dark:text-slate-500">{cat.count} articles</span>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 sm:w-5 sm:h-5 text-ink/40 dark:text-slate-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                      style={{ color: undefined }}
                      strokeWidth={2.5}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Blog Posts Section */}
          <section className="container-x section-pad pt-0">
            <div className="mb-8 sm:mb-10 md:mb-12">
              <SectionHeading
                eyebrow="Latest Posts"
                title="What we're writing about"
                description="Real articles on Python, projects, careers, and the technology we teach every day."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} onOpen={openPost} />
              ))}
            </div>
          </section>

          {/* Tags Section */}
          <section className="section-pad section-alt">
            <div className="container-x">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-secondary/20"></div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/10 dark:bg-secondary-400/10 border border-secondary/20 dark:border-secondary-400/20">
                  <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
                  <span className="text-xs sm:text-sm font-semibold text-secondary dark:text-secondary-400">Popular Tags</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-secondary/20"></div>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {tags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.02 }}
                    className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full glass-card border border-line-light/50 dark:border-white/10 text-[10px] sm:text-xs md:text-sm text-ink/70 dark:text-slate-300 hover:border-primary/30 hover:text-primary dark:hover:text-primary-400 transition-all duration-300 cursor-pointer hover:shadow-md whitespace-nowrap"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="container-x section-pad relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary/5 rounded-full blur-3xl -z-10"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 sm:p-7 md:p-8 border border-primary/20 dark:border-primary-400/20 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary-400/5 dark:to-secondary-400/5 text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 dark:bg-primary-400/10 border border-primary/20 dark:border-primary-400/20 mb-3 sm:mb-4">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-primary dark:text-primary-400">Stay Updated</span>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-ink dark:text-white">Get notified when we publish</h3>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-ink/60 dark:text-slate-400 max-w-md mx-auto px-4 sm:px-0">
                Subscribe to get the latest articles, tutorials, and insights delivered to your inbox.
              </p>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-line-light dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm text-sm sm:text-base text-ink dark:text-white placeholder:text-ink/40 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                />
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group whitespace-nowrap text-sm sm:text-base"
                >
                  <span>Subscribe</span>
                  <ArrowRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-ink/40 dark:text-slate-500">No spam, unsubscribe anytime</p>
            </motion.div>
          </section>

          <CTASection />
        </motion.div>
      )}
    </AnimatePresence>
  )
}