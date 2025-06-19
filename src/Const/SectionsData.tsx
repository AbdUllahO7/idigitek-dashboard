import {
  LayoutTemplate,
  MessageSquare,
  Users,
  Bookmark,
  RefreshCw,
  Settings,
  Zap,
  Star,
  Grid3X3,
  Phone
} from "lucide-react"
import { PredefinedSection, SectionCategory } from "../api/types/management/SectionManagement.type"

export const PREDEFINED_SECTIONS: PredefinedSection[] = [
  {
    nameKey: "Dashboard_sideBar.nav.header", 
    subName: "Header",
    descriptionKey: "sectionManagement.description1",
    image: "/assets/sections/header.png",
    icon: <LayoutTemplate className="h-8 w-8" />,
    category: "layout",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.hero",
    subName: "Hero", 
    descriptionKey: "sectionManagement.sections.hero.description",
    image: "/assets/sections/hero.png",
    icon: <Zap className="h-8 w-8" />,
    category: "layout",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.services",
    subName: "Services",
    descriptionKey: "sectionManagement.sections.services.description",
    image: "/assets/sections/services.png",
    icon: <Settings className="h-8 w-8" />,
    category: "content",
    color: "from-emerald-500 to-teal-500",
    bgColor: "from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.news",
    subName: "News",
    descriptionKey: "sectionManagement.sections.news.description",
    image: "/assets/sections/news.png",
    icon: <MessageSquare className="h-8 w-8" />,
    category: "content",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.industrySolutions",
    subName: "IndustrySolutions",
    descriptionKey: "sectionManagement.sections.industrySolutions.description",
    image: "/assets/sections/solutions.png",
    icon: <Bookmark className="h-8 w-8" />,
    category: "content",
    color: "from-indigo-500 to-purple-500",
    bgColor: "from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.whyChooseUs",
    subName: "whyChooseUs",
    descriptionKey: "sectionManagement.sections.whyChooseUs.description",
    image: "/assets/sections/choose-us.png",
    icon: <Star className="h-8 w-8" />,
    category: "content",
    color: "from-yellow-500 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.projects",
    subName: "Projects",
    descriptionKey: "sectionManagement.sections.projects.description",
    image: "/assets/sections/projects.png",
    icon: <Grid3X3 className="h-8 w-8" />,
    category: "content",
    color: "from-rose-500 to-pink-500",
    bgColor: "from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.ourProcess",
    subName: "OurProcess",
    descriptionKey: "sectionManagement.sections.ourProcess.description",
    image: "/assets/sections/process.png",
    icon: <RefreshCw className="h-8 w-8" />,
    category: "content",
    color: "from-cyan-500 to-blue-500",
    bgColor: "from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.team",
    subName: "Team",
    descriptionKey: "sectionManagement.sections.team.description",
    image: "/assets/sections/team.png",
    icon: <Users className="h-8 w-8" />,
    category: "content",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.clientComments",
    subName: "ClientComments",
    descriptionKey: "sectionManagement.sections.clientComments.description",
    image: "/assets/sections/testimonials.png",
    icon: <MessageSquare className="h-8 w-8" />,
    category: "content",
    color: "from-violet-500 to-purple-500",
    bgColor: "from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.partners",
    subName: "Partners",
    descriptionKey: "sectionManagement.sections.partners.description",
    image: "/assets/sections/partners.png",
    icon: <Users className="h-8 w-8" />,
    category: "content",
    color: "from-teal-500 to-cyan-500",
    bgColor: "from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.faq",
    subName: "FAQ",
    descriptionKey: "sectionManagement.sections.faq.description",
    image: "/assets/sections/faq.png", 
    icon: <MessageSquare className="h-8 w-8" />,
    category: "content",
    color: "from-amber-500 to-yellow-500",
    bgColor: "from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.blog",
    subName: "Blog",
    descriptionKey: "sectionManagement.sections.blog.description",
    image: "/assets/sections/blog.png",
    icon: <MessageSquare className="h-8 w-8" />,
    category: "content",
    color: "from-pink-500 to-rose-500",
    bgColor: "from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.contact",
    subName: "Contact",
    descriptionKey: "sectionManagement.sections.contact.description",
    image: "/assets/sections/contact.png",
    icon: <Phone className="h-8 w-8" />,
    category: "content",
    color: "from-red-500 to-pink-500",
    bgColor: "from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.footer",
    subName: "Footer",
    descriptionKey: "sectionManagement.sections.footer.description",
    image: "/assets/sections/footer.png",
    icon: <LayoutTemplate className="h-8 w-8" />,
    category: "layout",
    color: "from-slate-500 to-gray-500",
    bgColor: "from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50"
  },
]

export const SECTION_CATEGORIES: SectionCategory[] = [
  { value: "all", labelKey: "sectionManagement.categories.all" },
  { value: "layout", labelKey: "sectionManagement.categories.layout" },
  { value: "content", labelKey: "sectionManagement.categories.content" },
]