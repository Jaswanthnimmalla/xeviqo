export interface Testimonial {
  id: string
  name: string
  course: string
  review: string
  rating: number
  initials: string
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Vamsi Krishna',
    course: 'Python Training',
    review:
      'The live sessions felt nothing like a coaching class. My mentor pushed me to actually build things, and I shipped my first API in week five.',
    rating: 5,
    initials: 'VK',
  },
  {
    id: 't2',
    name: 'Rahul',
    course: 'Final Year Project — AI',
    review:
      'Xeviqo helped me build a resume screener that actually worked, not a copy-pasted template. My review panel asked how I built the scoring logic — great sign.',
    rating: 5,
    initials: 'R',
  },
  {
    id: 't3',
    name: 'Sneha',
    course: 'Java Training',
    review:
      'Assignments were tough but fair, and the Spring Boot module alone made me job-ready. Support was quick every single time I got stuck.',
    rating: 4,
    initials: 'S',
  },
  {
    id: 't4',
    name: 'Vikram',
    course: 'Final Year Project — IoT',
    review:
      "From ESP32 wiring to the mobile app control, everything was explained clearly. It's the first time a project felt like mine, not a template.",
    rating: 5,
    initials: 'V',
  },
]
