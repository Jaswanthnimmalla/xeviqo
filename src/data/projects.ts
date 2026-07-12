export interface ProjectItem {
  id: string
  title: string
  category: 'Python' | 'Java' | 'Flutter' | 'React' | 'AI' | 'Machine Learning' | 'IoT' | 'Android'
  description: string
  features: string[]
}

export const projectCategories = [
  'All',
  'Python',
  'Java',
  'Flutter',
  'React',
  'AI',
  'Machine Learning',
  'IoT',
  'Android',
] as const

export const projects: ProjectItem[] = [
  {
    id: 'p1',
    title: 'Smart Attendance System',
    category: 'Python',
    description: 'Facial-recognition attendance tracker with an admin dashboard and exportable reports.',
    features: ['Face recognition with OpenCV', 'Admin dashboard', 'Automated report export'],
  },
  {
    id: 'p2',
    title: 'Hospital Management System',
    category: 'Java',
    description: 'A full-stack patient, appointment, and billing management platform for clinics.',
    features: ['Role-based access', 'Appointment scheduling', 'Billing & invoicing'],
  },
  {
    id: 'p3',
    title: 'Campus Connect App',
    category: 'Flutter',
    description: 'Cross-platform mobile app for campus announcements, events, and clubs.',
    features: ['Push notifications', 'Event RSVP', 'Offline-first caching'],
  },
  {
    id: 'p4',
    title: 'Freelance Marketplace',
    category: 'React',
    description: 'A two-sided marketplace connecting freelancers with clients, with escrow-style payments.',
    features: ['Real-time chat', 'Stripe test payments', 'Rating system'],
  },
  {
    id: 'p5',
    title: 'AI Resume Screener',
    category: 'AI',
    description: 'NLP-powered tool that ranks resumes against a job description automatically.',
    features: ['NLP keyword matching', 'Scoring dashboard', 'Bulk resume upload'],
  },
  {
    id: 'p6',
    title: 'Crop Yield Predictor',
    category: 'Machine Learning',
    description: 'Regression model predicting crop yield from soil and weather datasets.',
    features: ['Scikit-learn pipeline', 'Interactive prediction UI', 'Data visualization'],
  },
  {
    id: 'p7',
    title: 'Smart Home Automation',
    category: 'IoT',
    description: 'ESP32-based home automation system controllable from a mobile app.',
    features: ['ESP32 + sensors', 'Mobile app control', 'Voice command support'],
  },
  {
    id: 'p8',
    title: 'Fitness Tracker App',
    category: 'Android',
    description: 'Native Android app tracking workouts, steps, and nutrition with weekly insights.',
    features: ['Step counter integration', 'Nutrition log', 'Weekly insight charts'],
  },
]
