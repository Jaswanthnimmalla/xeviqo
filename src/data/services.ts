import {
  Code2, Coffee, GraduationCap, Smartphone, Globe, Brain,
  Users, Boxes, Palette, Cloud, Building2, type LucideIcon,
} from 'lucide-react'

export interface Service {
  id: string
  title: string
  description: string
  icon: LucideIcon
  status: 'live' | 'coming-soon'
}

export const services: Service[] = [
  {
    id: 'python-training',
    title: 'Python Training',
    description: 'Live, mentor-led Python programs that take you from fundamentals to shipped projects.',
    icon: Code2,
    status: 'live',
  },
  {
    id: 'java-training',
    title: 'Java Training',
    description: 'Enterprise-grade Java training with real backend and Spring Boot practice.',
    icon: Coffee,
    status: 'live',
  },
  {
    id: 'academic-projects',
    title: 'Final Year Projects',
    description: 'Guided academic projects across Python, Java, AI, IoT, and mobile — built, not templated.',
    icon: GraduationCap,
    status: 'live',
  },
  {
    id: 'software-projects',
    title: 'Custom Software Projects',
    description: 'End-to-end software builds for startups and businesses — scoped, priced, and delivered budget-friendly.',
    icon: Code2,
    status: 'live',
  },
  {
    id: 'mobile-apps',
    title: 'Android App Development',
    description: 'Native Android and cross-platform apps built on Flutter, delivered at a budget-friendly price for growing businesses.',
    icon: Smartphone,
    status: 'live',
  },
  {
    id: 'web-development',
    title: 'Website Development',
    description: 'Fast, modern, responsive websites built with React — professional results at a budget-friendly cost.',
    icon: Globe,
    status: 'live',
  },
  {
    id: 'ai-solutions',
    title: 'AI Solutions',
    description: 'Applied AI features — from automation to intelligent search — built into real products.',
    icon: Brain,
    status: 'coming-soon',
  },
  {
    id: 'internship-programs',
    title: 'Internship Programs',
    description: 'Structured internships that turn classroom learners into industry-ready engineers.',
    icon: Users,
    status: 'coming-soon',
  },
  {
    id: 'saas-products',
    title: 'SaaS Products',
    description: 'End-to-end SaaS builds — from architecture to billing — for early-stage teams.',
    icon: Boxes,
    status: 'coming-soon',
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    description: 'Interfaces designed around clarity and conversion, not just decoration.',
    icon: Palette,
    status: 'coming-soon',
  },
  {
    id: 'cloud-solutions',
    title: 'Cloud Solutions',
    description: 'Cloud architecture, deployment, and scaling support across AWS, GCP, and Azure.',
    icon: Cloud,
    status: 'coming-soon',
  },
  {
    id: 'enterprise-software',
    title: 'Enterprise Software',
    description: 'Custom ERP, CRM, and internal tools engineered around how your business runs.',
    icon: Building2,
    status: 'coming-soon',
  },
]
