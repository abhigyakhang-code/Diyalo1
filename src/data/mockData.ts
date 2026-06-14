import type { 
  Job, Training, Graduate, InterviewTrack, InterviewQuestion 
} from "../types";

export const MOCK_JOBS: Job[] = [
  {
    id: "j1",
    title: "Delivery Rider",
    company: "Foodmandu",
    location: "Kathmandu, New Baneshwor",
    wageDaily: 1200,
    wageWeekly: 7200,
    wageMonthly: 28000,
    paymentFreq: "roj",
    description: "Deliver food orders across Kathmandu valley using company motorbike. Valid driving license required.",
    phone: "9801234567",
    imageUrl: "https://img.magnific.com/free-photo/food-delivery-boy-delivering-food-scooter_1303-27695.jpg?semt=ais_hybrid&w=740&q=80"
  },
  {
    id: "j2",
    title: "Security Guard",
    company: "Civil Mall",
    location: "Kathmandu, Sundhara",
    wageDaily: 1000,
    wageWeekly: 6000,
    wageMonthly: 24000,
    paymentFreq: "hapta",
    description: "Monitor mall premises, check visitor bags, and ensure customer safety during operating hours.",
    phone: "9812345678",
    imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&h=300&fit=crop"
  },
  {
    id: "j3",
    title: "Cashier",
    company: "Bhatbhateni Supermarket",
    location: "Lalitpur, Pulchowk",
    wageDaily: 900,
    wageWeekly: 5400,
    wageMonthly: 22000,
    paymentFreq: "mahina",
    description: "Handle customer checkout, process payments in cash and digital, maintain till accuracy.",
    phone: "9823456789",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
  },
  {
    id: "j4",
    title: "Kitchen Staff",
    company: "Bakery Cafe",
    location: "Kathmandu, Lazimpat",
    wageDaily: 800,
    wageWeekly: 4800,
    wageMonthly: 19000,
    paymentFreq: "roj",
    description: "Assist in food preparation, maintain kitchen cleanliness, wash utensils, and help with inventory.",
    phone: "9834567890",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=300&fit=crop"
  },
  {
    id: "j5",
    title: "Construction Laborer",
    company: "Nepal Housing Developers",
    location: "Bhaktapur, Suryabinayak",
    wageDaily: 1100,
    wageWeekly: 6600,
    wageMonthly: 26000,
    paymentFreq: "hapta",
    description: "Carry materials, mix cement, assist masons and carpenters on building construction sites.",
    phone: "9845678901",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop"
  },
  {
    id: "j6",
    title: "Cleaner",
    company: "Hotel Yak & Yeti",
    location: "Kathmandu, Durbar Marg",
    wageDaily: 850,
    wageWeekly: 5100,
    wageMonthly: 20000,
    paymentFreq: "mahina",
    description: "Clean hotel rooms, corridors, lobby areas, and maintain hygiene standards across the property.",
    phone: "9856789012",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop"
  }
];

export const MOCK_TRAININGS: Training[] = [
  {
    id: "t1",
    title: "Basic Plumbing Course",
    category: "plumbing",
    provider: "Balaju Technical School",
    duration: "3 Months",
    authority: "CTEVT Verified",
    location: "Kathmandu, Balaju",
    seats: 24,
    description: "Learn pipe fitting, leak repair, fixture installation, and basic water system maintenance."
  },
  {
    id: "t2",
    title: "House Wiring & Electrical",
    category: "electrician",
    provider: "CTEVT Training Center",
    duration: "4 Months",
    authority: "CTEVT Verified",
    location: "Lalitpur, Jwagal",
    seats: 18,
    description: "Master residential wiring, switchboard installation, circuit protection, and electrical safety standards."
  },
  {
    id: "t3",
    title: "Light Vehicle Driving",
    category: "driving",
    provider: "Nepal Driving Institute",
    duration: "3 Months",
    authority: "Department of Labor Approved",
    location: "Kathmandu, Chabahil",
    seats: 30,
    description: "Complete driving training with license preparation, road safety, and vehicle maintenance basics."
  },
  {
    id: "t4",
    title: "Tailoring & Garment Making",
    category: "tailoring",
    provider: "Mahila Bikas Kendra",
    duration: "2 Months",
    authority: "Ward Office Authorized",
    location: "Kathmandu, Kirtipur",
    seats: 15,
    description: "Learn sewing machine operation, pattern making, measurement techniques, and garment assembly."
  },
  {
    id: "t5",
    title: "Advanced Plumbing",
    category: "plumbing",
    provider: "Ward 16 Vocational Center",
    duration: "6 Months",
    authority: "Ward Office Authorized",
    location: "Kathmandu, Kalimati",
    seats: 12,
    description: "Advanced training in commercial plumbing, drainage systems, water heater installation, and blueprint reading."
  },
  {
    id: "t6",
    title: "Heavy Vehicle Driving",
    category: "driving",
    provider: "Nepal Driving Institute",
    duration: "4 Months",
    authority: "Department of Labor Approved",
    location: "Bhaktapur, Sallaghari",
    seats: 20,
    description: "Heavy vehicle handling, cargo loading, long-distance driving protocols, and mechanical troubleshooting."
  }
];

export const MOCK_GRADUATES: Graduate[] = [
  { 
    id: "g1", 
    name: "Ram Bahadur Tamang", 
    skill: "Plumbing", 
    course: "Basic Plumbing Course", 
    certificateId: "CTEVT-BP-2025-089", 
    phone: "9868000001", 
    location: "Kathmandu", 
    verifiedAt: "2025-03-15" 
  },
  { 
    id: "g2", 
    name: "Sita Devi Chaudhary", 
    skill: "Tailoring", 
    course: "Tailoring & Garment Making", 
    certificateId: "WO-TG-2025-034", 
    phone: "9868000002", 
    location: "Lalitpur", 
    verifiedAt: "2025-04-02" 
  },
  { 
    id: "g3", 
    name: "Hari Prasad Shrestha", 
    skill: "Driving", 
    course: "Light Vehicle Driving", 
    certificateId: "DOL-LVD-2025-156", 
    phone: "9868000003", 
    location: "Bhaktapur", 
    verifiedAt: "2025-02-28" 
  },
  { 
    id: "g4", 
    name: "Mina Kumari Maharjan", 
    skill: "Electrician", 
    course: "House Wiring & Electrical", 
    certificateId: "CTEVT-HW-2025-221", 
    phone: "9868000004", 
    location: "Kathmandu", 
    verifiedAt: "2025-05-10" 
  }
];

export const INTERVIEW_TRACKS: Record<InterviewTrack, { 
  label: string; 
  questions: InterviewQuestion[] 
}> = {
  security: {
    label: "Security Guard Focus",
    questions: [
      { 
        q: "What would you do if you spot a suspicious person entering the premises?", 
        hint: "Mention observation, reporting, and calm approach." 
      },
      { 
        q: "How do you handle a conflict between two visitors?", 
        hint: "Describe de-escalation techniques." 
      },
      { 
        q: "Are you comfortable standing for long shifts? How do you stay alert?", 
        hint: "Show physical readiness and mental strategies." 
      },
      { 
        q: "What security equipment have you used or are willing to learn?", 
        hint: "List CCTV, metal detectors, radio sets." 
      },
      { 
        q: "Why do you want to work as a security guard?", 
        hint: "Express responsibility and service mindset." 
      }
    ]
  },
  cashier: {
    label: "Retail Cashier Prep",
    questions: [
      { 
        q: "How do you handle a customer who claims they gave you a larger bill?", 
        hint: "Describe till reconciliation and calm communication." 
      },
      { 
        q: "Can you count change quickly and accurately?", 
        hint: "Show confidence with basic math." 
      },
      { 
        q: "Describe a time you worked in a fast-paced environment.", 
        hint: "Mention multitasking and staying organized." 
      },
      { 
        q: "How do you ensure accuracy at the end of your shift?", 
        hint: "Discuss double counting and reporting." 
      },
      { 
        q: "Why should we hire you as a cashier?", 
        hint: "Express honesty, speed, and customer-friendliness." 
      }
    ]
  },
  driver: {
    label: "Driver Position Prep",
    questions: [
      { 
        q: "What is your experience with different vehicle types?", 
        hint: "List bikes, cars, vans, or heavy vehicles." 
      },
      { 
        q: "How do you handle road rage or aggressive drivers?", 
        hint: "Show patience and defensive driving approach." 
      },
      { 
        q: "What do you check before starting a long trip?", 
        hint: "Mention fuel, tires, oil, brakes, documents." 
      },
      { 
        q: "Do you know basic vehicle repair and maintenance?", 
        hint: "Describe tire change, oil check, fuse replacement." 
      },
      { 
        q: "Why do you enjoy being a driver?", 
        hint: "Express reliability, freedom, and customer service." 
      }
    ]
  },
  cleaner: {
    label: "Cleaner/Housekeeping Prep",
    questions: [
      { 
        q: "What cleaning products and tools are you familiar with?", 
        hint: "List floor cleaners, disinfectants, vacuum, mop types." 
      },
      { 
        q: "How do you prioritize cleaning tasks in a large building?", 
        hint: "Describe high-traffic areas first approach." 
      },
      { 
        q: "How do you handle chemical safety and mixing of products?", 
        hint: "Show awareness of labels, ventilation, and PPE." 
      },
      { 
        q: "Can you work early morning or late night shifts?", 
        hint: "Show flexibility and reliability." 
      },
      { 
        q: "What makes you a great cleaner/housekeeper?", 
        hint: "Express attention to detail and pride in work." 
      }
    ]
  }
};

export const SKILL_SUGGESTIONS: Record<string, string[]> = {
  plumbing: ["Leak isolation", "Hydrostatic testing", "Route optimization", "Pipe threading", "Fixture mounting"],
  driving: ["Route optimization", "Defensive driving", "Vehicle maintenance", "GPS navigation", "Cargo handling"],
  electrician: ["Circuit diagnostics", "Load balancing", "Ground fault detection", "Panel wiring", "Conduit bending"],
  tailoring: ["Pattern drafting", "Overlock stitching", "Fabric cutting", "Measurement precision", "Garment finishing"]
};

export const ROADMAP_DATA = [
  { 
    step: 1, 
    title: "3-Month Free Driving Course", 
    duration: "3 Months", 
    detail: "Enroll at Nepal Driving Institute, Chabahil. Learn vehicle control, traffic rules, and road safety.",
    icon: "🚗"
  },
  { 
    step: 2, 
    title: "License Procurement", 
    duration: "1 Month", 
    detail: "Pass the written and practical driving test at Yatayat Office. Receive your official Light Vehicle Driving License.",
    icon: "📋"
  },
  { 
    step: 3, 
    title: "Smart Delivery Job Alignment", 
    duration: "Ongoing", 
    detail: "Get matched with Foodmandu, Pathao, or Indrive. Flexible hours with digital payment integration.",
    icon: "📦"
  }
];
