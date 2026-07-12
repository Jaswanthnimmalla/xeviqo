export interface Course {
  slug: string
  name: string
  tagline: string
  duration: string
  mode: string
  level: string
  color: 'primary' | 'secondary' | 'accent'
  topics: string[]
  projects: string[]
}

export const courses: Course[] = [
  {
    slug: 'python',
    name: 'Python Training',
    tagline: 'From syntax to shipped projects.',
    duration: '8 weeks',
    mode: 'Live Online',
    level: 'Beginner friendly',
    color: 'primary',
    topics: [
      'Core Python & data structures',
      'OOP and file handling',
      'Web development with Django/Flask',
      'Data handling with Pandas & NumPy',
      'APIs and automation scripting',
    ],
    projects: ['Expense tracker CLI', 'Weather dashboard', 'REST API with Flask'],
  },
  {
    slug: 'java',
    name: 'Java Training',
    tagline: 'Enterprise-grade fundamentals.',
    duration: '8 weeks',
    mode: 'Live Online',
    level: 'Beginner friendly',
    color: 'secondary',
    topics: [
      'Core Java & OOP principles',
      'Collections & exception handling',
      'JDBC and database integration',
      'Spring Boot fundamentals',
      'Multithreading basics',
    ],
    projects: ['Library management system', 'Student portal', 'Spring Boot REST service'],
  },
]
