"use client"

import { useState } from "react"
import {
  Search,
  Building2,
  MapPin,
  Star,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  ShieldAlert,
  Brain,
  FileSearch,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bot,
  Target,
  Network,
  Activity,
  Zap,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface VerificationStep {
  id: string
  name: string
  status: "pending" | "processing" | "completed" | "skipped"
  agent?: "verification" | "purpose"
  result?: any
}

interface AgentStatus {
  name: string
  status: "idle" | "active" | "completed" | "failed"
  currentTask: string
  progress: number
}

interface SICCode {
  code: string
  description: string
  section: string
  division: string
}

interface BusinessPurposeData {
  sicCodes: SICCode[]
  primaryActivity: string
  secondaryActivities: string[]
  industryAlignment: number
  trustFactors: {
    factor: string
    score: number
    weight: number
    details: string
  }[]
  overallTrustScore: number
  businessInsights: string[]
  recommendations: string[]
}

// Add new interfaces for compliance data
interface ComplianceRequirement {
  name: string
  required: boolean
  status: "compliant" | "non-compliant" | "pending" | "expired" | "not-applicable"
  details: string
  expiryDate?: string
  renewalRequired?: boolean
  regulatoryBody: string
  documentRequired: string
}

interface RegulatoryCompliance {
  industry: string
  overallComplianceScore: number
  requirements: ComplianceRequirement[]
  regulatoryBodies: string[]
  lastChecked: string
  nextReview: string
}

// Add new interfaces for sole trader verification
interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  source: string
}

interface LLMAnalysis {
  credibilityScore: number
  sentiment: "positive" | "neutral" | "negative"
  insights: string[]
  redFlags: string[]
  strengths: string[]
  concerns: string[]
}

interface ScamCheck {
  isScam: boolean
  riskLevel: "low" | "medium" | "high"
  warnings: string[]
  scamReports: {
    source: string
    description: string
    date: string
  }[]
}

interface ReviewAnalysis {
  overallRating: number
  totalReviews: number
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  commonThemes: {
    theme: string
    sentiment: "positive" | "negative"
    frequency: number
  }[]
  recentTrend: "improving" | "stable" | "declining"
  detailedReviews: {
    source: string
    rating: number
    text: string
    date: string
    sentiment: "positive" | "neutral" | "negative"
  }[]
}

interface SoleTraderVerification {
  googleSearchResults: GoogleSearchResult[]
  llmAnalysis: LLMAnalysis
  scamCheck: ScamCheck
  reviewAnalysis: ReviewAnalysis
  onlinePresence: {
    hasWebsite: boolean
    socialMedia: string[]
    directoryListings: string[]
    goodSites: string[]
    suspiciousSites: string[]
  }
}

// Update CompanyData interface to include compliance, sole trader verification, and business purpose
interface CompanyData {
  name: string
  type: string
  registrationNumber?: string
  address: string
  phone?: string
  email?: string
  website?: string
  description: string
  reviews: {
    source: string
    rating: number
    count: number
    link: string
  }[]
  legitimacyScore: number
  riskFactors: string[]
  verificationSources: {
    name: string
    status: "verified" | "warning" | "failed"
    details: string
  }[]
  regulatoryCompliance?: RegulatoryCompliance
  soleTraderVerification?: SoleTraderVerification
  businessPurpose?: BusinessPurposeData
}

export default function BusinessVerificationAgent() {
  const [companyName, setCompanyName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([])
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  
  // Multi-agent state
  const [agents, setAgents] = useState<AgentStatus[]>([
    { name: "Verification Agent", status: "idle", currentTask: "Waiting to start...", progress: 0 },
    { name: "Purpose Agent", status: "idle", currentTask: "Waiting to start...", progress: 0 },
  ])

  // Rating calculation settings
  const [ratingWeights, setRatingWeights] = useState({
    companiesHouse: [70],
    googleReviews: [20],
    websitePresence: [10],
  })
  const [industrySpecific, setIndustrySpecific] = useState(true)

  const businessTypes = ["Limited Company", "Sole Trader", "Partnership", "LLP", "Plc", "Charity", "Other"]

  const industrySpecificSources = {
    ecommerce: [
      "Trustpilot",
      "Google Reviews",
      "Better Business Bureau",
      "Sitejabber",
      "Feefo",
      "Reviews.io",
      "Shopper Approved",
      "Bizrate",
    ],
    plumber: [
      "Checkatrade",
      "MyBuilder",
      "Rated People",
      "TrustATrader",
      "Which? Trusted Traders",
      "Local Heroes",
      "Bark.com",
      "Gas Safe Register",
    ],
    restaurant: [
      "Google Reviews",
      "Yelp",
      "TripAdvisor",
      "OpenTable",
      "Zomato",
      "Just Eat Reviews",
      "Food Hygiene Rating",
      "Bookatable",
    ],
    healthcare: [
      "NHS Choices",
      "Care Quality Commission",
      "General Medical Council",
      "Nursing & Midwifery Council",
      "Private Healthcare Information Network",
      "Doctify",
      "iWantGreatCare",
      "Patient.co.uk",
    ],
    legal: [
      "Solicitors Regulation Authority",
      "Bar Standards Board",
      "Legal 500",
      "Chambers & Partners",
      "Law Society Find a Solicitor",
      "Google Reviews",
      "Trustpilot",
      "Avvo",
    ],
    financial: [
      "Financial Conduct Authority",
      "Prudential Regulation Authority",
      "Financial Services Register",
      "Trustpilot",
      "Google Reviews",
      "VouchedFor",
      "Unbiased.co.uk",
      "Money Advice Service",
    ],
    construction: [
      "Checkatrade",
      "TrustMark",
      "Federation of Master Builders",
      "NICEIC",
      "Gas Safe Register",
      "OFTEC",
      "Competent Person Scheme",
      "Which? Trusted Traders",
    ],
    automotive: [
      "Good Garage Scheme",
      "Motor Industry Code of Practice",
      "AA Approved Garages",
      "RAC Approved Garages",
      "Google Reviews",
      "Trustpilot",
      "AutoTrader Reviews",
      "Institute of the Motor Industry",
    ],
    beauty: [
      "British Association of Beauty Therapy",
      "Guild of Professional Beauty Therapists",
      "Treatwell",
      "Wahanda",
      "Google Reviews",
      "Facebook Reviews",
      "Yelp",
      "Fresha",
    ],
    education: [
      "Ofsted",
      "Quality Assurance Agency",
      "British Accreditation Council",
      "ACCET",
      "Google Reviews",
      "Trustpilot",
      "Course Report",
      "SwitchUp",
    ],
    technology: [
      "Clutch.co",
      "GoodFirms",
      "UpCity",
      "G2",
      "Capterra",
      "Software Advice",
      "TrustRadius",
      "Google Reviews",
    ],
    realestate: [
      "Property Ombudsman",
      "National Association of Estate Agents",
      "Royal Institution of Chartered Surveyors",
      "ARLA Propertymark",
      "Google Reviews",
      "Trustpilot",
      "AllAgents",
      "Rightmove Reviews",
    ],
    hospitality: [
      "TripAdvisor",
      "Booking.com",
      "Hotels.com",
      "Expedia",
      "Google Reviews",
      "Yelp",
      "AA Hotel Services",
      "Visit England",
    ],
    retail: [
      "Google Reviews",
      "Trustpilot",
      "Yelp",
      "Facebook Reviews",
      "Feefo",
      "Reviews.io",
      "British Retail Consortium",
      "Retail Trust",
    ],
    manufacturing: [
      "Made in Britain",
      "Manufacturing Technology Centre",
      "EEF The Manufacturers Organisation",
      "British Standards Institution",
      "Google Reviews",
      "Trustpilot",
      "Thomasnet",
      "Global Sources",
    ],
    consulting: [
      "Management Consultancies Association",
      "Institute of Consulting",
      "Clutch.co",
      "GoodFirms",
      "Google Reviews",
      "Trustpilot",
      "LinkedIn Recommendations",
      "Consultancy.uk",
    ],
    marketing: [
      "Institute of Direct and Digital Marketing",
      "Chartered Institute of Marketing",
      "Google Partners",
      "Facebook Marketing Partners",
      "Clutch.co",
      "Agency Spotter",
      "UpCity",
      "Google Reviews",
    ],
    transportation: [
      "Driver and Vehicle Standards Agency",
      "Traffic Commissioner",
      "Freight Transport Association",
      "Road Haulage Association",
      "Google Reviews",
      "Trustpilot",
      "Transport Exchange Group",
      "Pallet-Track",
    ],
    fitness: [
      "Register of Exercise Professionals",
      "Chartered Institute for the Management of Sport",
      "Active IQ",
      "CIMSPA",
      "Google Reviews",
      "ClassPass",
      "Mindbody",
      "Facebook Reviews",
    ],
    veterinary: [
      "Royal College of Veterinary Surgeons",
      "British Veterinary Association",
      "Veterinary Client Mediation Service",
      "Google Reviews",
      "Trustpilot",
      "Yelp",
      "Facebook Reviews",
      "VetHelpDirect",
    ],
    insurance: [
      "Association of British Insurers",
      "British Insurance Brokers Association",
      "Financial Conduct Authority",
      "Lloyd's of London",
      "Trustpilot",
      "Google Reviews",
      "Defaqto",
      "Fairer Finance",
    ],
    accounting: [
      "Institute of Chartered Accountants",
      "Association of Chartered Certified Accountants",
      "Chartered Institute of Management Accountants",
      "Association of Accounting Technicians",
      "Google Reviews",
      "Trustpilot",
      "FreeAgent Directory",
      "Xero Partner Directory",
    ],
    default: ["Google Reviews", "Bing Places", "Facebook Reviews", "Yelp"],
  }

  const getIndustryFromBusinessType = (businessName: string, businessType: string): string => {
    const name = businessName.toLowerCase()
    const type = businessType.toLowerCase()

    // Healthcare keywords
    if (
      name.includes("clinic") ||
      name.includes("medical") ||
      name.includes("doctor") ||
      name.includes("dental") ||
      name.includes("pharmacy")
    ) {
      return "healthcare"
    }

    // Legal keywords
    if (name.includes("solicitor") || name.includes("barrister") || name.includes("legal") || name.includes("law")) {
      return "legal"
    }

    // Financial keywords
    if (
      name.includes("financial") ||
      name.includes("investment") ||
      name.includes("insurance") ||
      name.includes("mortgage") ||
      name.includes("bank")
    ) {
      return name.includes("insurance") ? "insurance" : "financial"
    }

    // Construction keywords
    if (
      name.includes("builder") ||
      name.includes("construction") ||
      name.includes("contractor") ||
      name.includes("roofing") ||
      name.includes("plumbing")
    ) {
      return name.includes("plumb") ? "plumber" : "construction"
    }

    // Automotive keywords
    if (
      name.includes("garage") ||
      name.includes("auto") ||
      name.includes("car") ||
      name.includes("motor") ||
      name.includes("mechanic")
    ) {
      return "automotive"
    }

    // Beauty keywords
    if (
      name.includes("beauty") ||
      name.includes("salon") ||
      name.includes("spa") ||
      name.includes("nail") ||
      name.includes("hair")
    ) {
      return "beauty"
    }

    // Education keywords
    if (
      name.includes("school") ||
      name.includes("college") ||
      name.includes("university") ||
      name.includes("training") ||
      name.includes("education")
    ) {
      return "education"
    }

    // Technology keywords
    if (
      name.includes("tech") ||
      name.includes("software") ||
      name.includes("digital") ||
      name.includes("web") ||
      name.includes("app")
    ) {
      return "technology"
    }

    // Real estate keywords
    if (name.includes("estate") || name.includes("property") || name.includes("letting") || name.includes("realtor")) {
      return "realestate"
    }

    // Restaurant keywords
    if (
      name.includes("restaurant") ||
      name.includes("cafe") ||
      name.includes("bistro") ||
      name.includes("eatery") ||
      name.includes("food")
    ) {
      return "restaurant"
    }

    // Hospitality keywords
    if (
      name.includes("hotel") ||
      name.includes("inn") ||
      name.includes("lodge") ||
      name.includes("resort") ||
      name.includes("b&b")
    ) {
      return "hospitality"
    }

    // Retail keywords
    if (name.includes("shop") || name.includes("store") || name.includes("retail") || name.includes("boutique")) {
      return "retail"
    }

    // Manufacturing keywords
    if (
      name.includes("manufacturing") ||
      name.includes("factory") ||
      name.includes("production") ||
      name.includes("industrial")
    ) {
      return "manufacturing"
    }

    // Consulting keywords
    if (
      name.includes("consulting") ||
      name.includes("consultant") ||
      name.includes("advisory") ||
      name.includes("strategy")
    ) {
      return "consulting"
    }

    // Marketing keywords
    if (
      name.includes("marketing") ||
      name.includes("advertising") ||
      name.includes("agency") ||
      name.includes("creative")
    ) {
      return "marketing"
    }

    // Transportation keywords
    if (
      name.includes("transport") ||
      name.includes("logistics") ||
      name.includes("courier") ||
      name.includes("delivery")
    ) {
      return "transportation"
    }

    // Fitness keywords
    if (
      name.includes("gym") ||
      name.includes("fitness") ||
      name.includes("personal trainer") ||
      name.includes("yoga")
    ) {
      return "fitness"
    }

    // Veterinary keywords
    if (name.includes("vet") || name.includes("animal") || name.includes("pet")) {
      return "veterinary"
    }

    // Accounting keywords
    if (
      name.includes("accountant") ||
      name.includes("accounting") ||
      name.includes("bookkeeping") ||
      name.includes("tax")
    ) {
      return "accounting"
    }

    // E-commerce keywords
    if (
      name.includes("online") ||
      name.includes("ecommerce") ||
      name.includes("e-commerce") ||
      name.includes("marketplace")
    ) {
      return "ecommerce"
    }

    return "default"
  }

  // Add compliance requirements for each industry
  const industryComplianceRequirements = {
    healthcare: [
      {
        name: "CQC Registration",
        required: true,
        regulatoryBody: "Care Quality Commission",
        documentRequired: "CQC Certificate of Registration",
      },
      {
        name: "Professional Registration (GMC/NMC)",
        required: true,
        regulatoryBody: "General Medical Council / Nursing & Midwifery Council",
        documentRequired: "Professional Registration Certificate",
      },
      {
        name: "Controlled Drugs License",
        required: false,
        regulatoryBody: "Home Office",
        documentRequired: "Controlled Drugs License",
      },
      {
        name: "Data Protection Registration",
        required: true,
        regulatoryBody: "Information Commissioner's Office",
        documentRequired: "ICO Registration Certificate",
      },
      {
        name: "Clinical Governance Framework",
        required: true,
        regulatoryBody: "NHS England",
        documentRequired: "Clinical Governance Policy",
      },
    ],
    financial: [
      {
        name: "FCA Authorization",
        required: true,
        regulatoryBody: "Financial Conduct Authority",
        documentRequired: "FCA Authorization Certificate",
      },
      {
        name: "PRA Authorization",
        required: false,
        regulatoryBody: "Prudential Regulation Authority",
        documentRequired: "PRA Authorization",
      },
      {
        name: "Anti-Money Laundering Registration",
        required: true,
        regulatoryBody: "HM Revenue & Customs",
        documentRequired: "AML Registration Certificate",
      },
      {
        name: "Professional Indemnity Insurance",
        required: true,
        regulatoryBody: "FCA Requirements",
        documentRequired: "PI Insurance Certificate",
      },
      {
        name: "Client Money Protection",
        required: true,
        regulatoryBody: "Financial Conduct Authority",
        documentRequired: "Client Money Rules Compliance",
      },
    ],
    legal: [
      {
        name: "SRA Authorization",
        required: true,
        regulatoryBody: "Solicitors Regulation Authority",
        documentRequired: "SRA Practice Certificate",
      },
      {
        name: "Professional Indemnity Insurance",
        required: true,
        regulatoryBody: "Solicitors Regulation Authority",
        documentRequired: "PI Insurance Certificate",
      },
      {
        name: "Client Account Rules Compliance",
        required: true,
        regulatoryBody: "Solicitors Regulation Authority",
        documentRequired: "Client Account Certificate",
      },
      {
        name: "Continuing Professional Development",
        required: true,
        regulatoryBody: "Solicitors Regulation Authority",
        documentRequired: "CPD Compliance Certificate",
      },
    ],
    construction: [
      {
        name: "Construction Industry Scheme Registration",
        required: true,
        regulatoryBody: "HM Revenue & Customs",
        documentRequired: "CIS Registration Certificate",
      },
      {
        name: "Health & Safety Executive Compliance",
        required: true,
        regulatoryBody: "Health & Safety Executive",
        documentRequired: "HSE Compliance Certificate",
      },
      {
        name: "Public Liability Insurance",
        required: true,
        regulatoryBody: "Industry Requirement",
        documentRequired: "Public Liability Insurance Certificate",
      },
      {
        name: "CSCS Card Scheme",
        required: true,
        regulatoryBody: "Construction Skills Certification Scheme",
        documentRequired: "CSCS Cards for Workers",
      },
      {
        name: "Waste Carrier License",
        required: true,
        regulatoryBody: "Environment Agency",
        documentRequired: "Waste Carrier Registration",
      },
    ],
    plumber: [
      {
        name: "Gas Safe Registration",
        required: true,
        regulatoryBody: "Gas Safe Register",
        documentRequired: "Gas Safe ID Card",
      },
      {
        name: "Water Regulations Approval",
        required: true,
        regulatoryBody: "Water Supply (Water Fittings) Regulations",
        documentRequired: "WRAS Approval Certificate",
      },
      {
        name: "Public Liability Insurance",
        required: true,
        regulatoryBody: "Industry Requirement",
        documentRequired: "Public Liability Insurance",
      },
      {
        name: "Competent Person Scheme",
        required: false,
        regulatoryBody: "Building Regulations",
        documentRequired: "Competent Person Certificate",
      },
    ],
    automotive: [
      {
        name: "MOT Testing Authorization",
        required: false,
        regulatoryBody: "Driver & Vehicle Standards Agency",
        documentRequired: "MOT Testing Station Authorization",
      },
      {
        name: "Vehicle Operator License",
        required: false,
        regulatoryBody: "Traffic Commissioner",
        documentRequired: "O-License Certificate",
      },
      {
        name: "Waste Oil Registration",
        required: true,
        regulatoryBody: "Environment Agency",
        documentRequired: "Waste Oil Carrier Registration",
      },
      {
        name: "Public Liability Insurance",
        required: true,
        regulatoryBody: "Industry Requirement",
        documentRequired: "Public Liability Insurance",
      },
    ],
    restaurant: [
      {
        name: "Food Hygiene Rating",
        required: true,
        regulatoryBody: "Food Standards Agency",
        documentRequired: "Food Hygiene Rating Certificate",
      },
      {
        name: "Premises License",
        required: true,
        regulatoryBody: "Local Authority",
        documentRequired: "Premises License",
      },
      {
        name: "Alcohol License",
        required: false,
        regulatoryBody: "Local Authority Licensing",
        documentRequired: "Alcohol License",
      },
      {
        name: "Music License",
        required: false,
        regulatoryBody: "PRS for Music / PPL",
        documentRequired: "Music License",
      },
      {
        name: "Fire Safety Certificate",
        required: true,
        regulatoryBody: "Fire & Rescue Service",
        documentRequired: "Fire Risk Assessment",
      },
    ],
    education: [
      {
        name: "Ofsted Registration",
        required: true,
        regulatoryBody: "Office for Standards in Education",
        documentRequired: "Ofsted Registration Certificate",
      },
      {
        name: "DBS Checks",
        required: true,
        regulatoryBody: "Disclosure & Barring Service",
        documentRequired: "Enhanced DBS Certificates",
      },
      {
        name: "Safeguarding Policy",
        required: true,
        regulatoryBody: "Department for Education",
        documentRequired: "Safeguarding Policy Document",
      },
      {
        name: "Teaching Qualification Recognition",
        required: true,
        regulatoryBody: "Teaching Regulation Agency",
        documentRequired: "QTS Certificate",
      },
    ],
    beauty: [
      {
        name: "Local Authority Registration",
        required: true,
        regulatoryBody: "Local Authority Environmental Health",
        documentRequired: "Premises Registration Certificate",
      },
      {
        name: "Professional Insurance",
        required: true,
        regulatoryBody: "Industry Requirement",
        documentRequired: "Professional Indemnity Insurance",
      },
      {
        name: "Health & Safety Compliance",
        required: true,
        regulatoryBody: "Health & Safety Executive",
        documentRequired: "Risk Assessment Documentation",
      },
      {
        name: "COSHH Assessment",
        required: true,
        regulatoryBody: "Health & Safety Executive",
        documentRequired: "COSHH Risk Assessment",
      },
    ],
    transportation: [
      {
        name: "Operator License",
        required: true,
        regulatoryBody: "Traffic Commissioner",
        documentRequired: "O-License",
      },
      {
        name: "Driver CPC Compliance",
        required: true,
        regulatoryBody: "Driver & Vehicle Standards Agency",
        documentRequired: "Driver CPC Cards",
      },
      {
        name: "Tachograph Compliance",
        required: true,
        regulatoryBody: "Driver & Vehicle Standards Agency",
        documentRequired: "Tachograph Calibration Certificates",
      },
      {
        name: "ADR Certification",
        required: false,
        regulatoryBody: "Driver & Vehicle Standards Agency",
        documentRequired: "ADR Training Certificate",
      },
    ],
    default: [
      {
        name: "Business Registration",
        required: true,
        regulatoryBody: "Companies House / HMRC",
        documentRequired: "Certificate of Incorporation / Business Registration",
      },
      {
        name: "Public Liability Insurance",
        required: true,
        regulatoryBody: "Industry Standard",
        documentRequired: "Public Liability Insurance Certificate",
      },
      {
        name: "Data Protection Compliance",
        required: true,
        regulatoryBody: "Information Commissioner's Office",
        documentRequired: "GDPR Compliance Documentation",
      },
    ],
  }

  const simulateVerification = async () => {
    setIsVerifying(true)
    setCurrentStep(0)

    // Update the verification steps based on business type - now with agent assignments
    const isSoleTrader = businessType === "Sole Trader"
    const steps: VerificationStep[] = isSoleTrader
      ? [
          { id: "input-validation", name: "Validating Input Data", status: "pending", agent: "verification" },
          { id: "business-type-check", name: "Checking Business Type", status: "pending", agent: "verification" },
          { id: "google-search", name: "Google Search for Business Presence", status: "pending", agent: "verification" },
          { id: "llm-analysis", name: "AI Analysis of Search Results", status: "pending", agent: "verification" },
          { id: "scam-check", name: "Checking for Scam Reports", status: "pending", agent: "verification" },
          { id: "reviews-analysis", name: "Deep Review Analysis & Sentiment", status: "pending", agent: "verification" },
          { id: "online-presence", name: "Analyzing Online Presence", status: "pending", agent: "verification" },
          { id: "sic-lookup", name: "Looking up SIC Codes", status: "pending", agent: "purpose" },
          { id: "activity-analysis", name: "Analyzing Business Activities", status: "pending", agent: "purpose" },
          { id: "trust-calculation", name: "Calculating Trust Factors", status: "pending", agent: "purpose" },
          { id: "regulatory-compliance", name: "Checking Regulatory Compliance", status: "pending", agent: "verification" },
          { id: "legitimacy-scoring", name: "Generating Final Summary", status: "pending", agent: "purpose" },
        ]
      : [
          { id: "input-validation", name: "Validating Input Data", status: "pending", agent: "verification" },
          { id: "business-type-check", name: "Checking Business Type", status: "pending", agent: "verification" },
          { id: "companies-house", name: "Searching Companies House", status: "pending", agent: "verification" },
          { id: "sic-lookup", name: "Extracting SIC Codes", status: "pending", agent: "purpose" },
          { id: "activity-analysis", name: "Analyzing Business Purpose", status: "pending", agent: "purpose" },
          { id: "regulatory-compliance", name: "Checking Regulatory Compliance", status: "pending", agent: "verification" },
          { id: "google-search", name: "Google Business Search", status: "pending", agent: "verification" },
          { id: "maps-verification", name: "Address Verification via Maps", status: "pending", agent: "verification" },
          { id: "reviews-analysis", name: "Analyzing Reviews & Ratings", status: "pending", agent: "verification" },
          { id: "trust-calculation", name: "Calculating Trust Score", status: "pending", agent: "purpose" },
          { id: "legitimacy-scoring", name: "Generating Comprehensive Summary", status: "pending", agent: "purpose" },
        ]

    setVerificationSteps(steps)

    // Simulate step-by-step processing with agent tracking
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      steps[i].status = "processing"
      setVerificationSteps([...steps])

      // Update agent status
      const currentAgent = steps[i].agent === "verification" ? 0 : 1
      const updatedAgents = [...agents]
      updatedAgents[currentAgent] = {
        ...updatedAgents[currentAgent],
        status: "active",
        currentTask: steps[i].name,
        progress: Math.round(((i + 1) / steps.length) * 100),
      }
      setAgents(updatedAgents)

      await new Promise((resolve) => setTimeout(resolve, 1800))

      // Skip Companies House for sole traders
      if (steps[i].id === "companies-house" && businessType === "Sole Trader") {
        steps[i].status = "skipped"
        steps[i].result = "Skipped - Sole Trader business type"
      } else {
        steps[i].status = "completed"
      }

      setVerificationSteps([...steps])
    }

    // Mark agents as completed
    setAgents([
      { name: "Verification Agent", status: "completed", currentTask: "Verification complete", progress: 100 },
      { name: "Purpose Agent", status: "completed", currentTask: "Analysis complete", progress: 100 },
    ])

    // Generate mock company data
    // Generate mock compliance data in simulateVerification function
    const generateComplianceData = (industry: string): RegulatoryCompliance => {
      const requirements =
        industryComplianceRequirements[industry as keyof typeof industryComplianceRequirements] ||
        industryComplianceRequirements.default

      const complianceRequirements: ComplianceRequirement[] = requirements.map((req) => {
        const statuses: ComplianceRequirement["status"][] = ["compliant", "non-compliant", "pending", "expired"]
        const randomStatus = req.required
          ? Math.random() > 0.3
            ? "compliant"
            : "pending"
          : Math.random() > 0.5
            ? "compliant"
            : "not-applicable"

        return {
          ...req,
          status: randomStatus,
          details:
            randomStatus === "compliant"
              ? "All requirements met and up to date"
              : randomStatus === "pending"
                ? "Verification in progress"
                : randomStatus === "expired"
                  ? "Certificate expired - renewal required"
                  : "Requirements not met",
          expiryDate: randomStatus === "compliant" ? "2025-12-31" : undefined,
          renewalRequired: randomStatus === "expired",
        }
      })

      const compliantCount = complianceRequirements.filter((req) => req.status === "compliant").length
      const totalRequired = complianceRequirements.filter((req) => req.required).length
      const complianceScore = Math.round((compliantCount / Math.max(totalRequired, 1)) * 100)

      return {
        industry: industry,
        overallComplianceScore: complianceScore,
        requirements: complianceRequirements,
        regulatoryBodies: [...new Set(complianceRequirements.map((req) => req.regulatoryBody))],
        lastChecked: new Date().toISOString().split("T")[0],
        nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }
    }

    // Generate sole trader verification data
    const generateSoleTraderData = (): SoleTraderVerification => {
      const hasGoodPresence = Math.random() > 0.3
      return {
        googleSearchResults: [
          {
            title: `${companyName} - Professional Services`,
            link: `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.co.uk`,
            snippet: `${companyName} provides high-quality professional services with over 10 years of experience. Contact us for reliable and trustworthy service.`,
            source: "Business Website",
          },
          {
            title: `${companyName} - Google Business Profile`,
            link: "https://google.com/maps",
            snippet: `${companyName} has 127 reviews with an average rating of 4.2 stars. Open now - View location and contact information.`,
            source: "Google Business",
          },
          {
            title: `${companyName} Reviews on Trustpilot`,
            link: "https://trustpilot.com",
            snippet: `See what customers are saying about ${companyName}. 89 reviews - Rated 4.0 out of 5 stars.`,
            source: "Trustpilot",
          },
          hasGoodPresence
            ? {
                title: `${companyName} - Checkatrade`,
                link: "https://checkatrade.com",
                snippet: `${companyName} is a verified trader on Checkatrade with excellent customer feedback and all necessary insurance.`,
                source: "Checkatrade",
              }
            : {
                title: `${companyName} complaints - forum discussion`,
                link: "https://randomforum.com",
                snippet: "Anyone had experience with this company? Mixed reviews...",
                source: "Forum",
              },
        ],
        llmAnalysis: {
          credibilityScore: hasGoodPresence ? 82 : 64,
          sentiment: hasGoodPresence ? "positive" : "neutral",
          insights: [
            "Business has established online presence across multiple platforms",
            "Consistent business information found across different sources",
            hasGoodPresence
              ? "Listed on reputable industry-specific review sites"
              : "Some inconsistencies in contact information",
            "Active social media presence with regular updates",
            hasGoodPresence ? "Professional website with SSL certification" : "Limited website functionality",
          ],
          redFlags: hasGoodPresence
            ? ["No major concerns identified"]
            : [
                "Some negative reviews mention delayed response times",
                "Limited professional certifications visible online",
                "Contact information varies across platforms",
              ],
          strengths: [
            "Long-standing business with history of operation",
            "Good customer review ratings overall",
            hasGoodPresence ? "Verified on multiple trusted platforms" : "Active Google Business profile",
            "Transparent pricing and service information",
          ],
          concerns: hasGoodPresence
            ? []
            : [
                "Recent spike in negative reviews needs investigation",
                "Limited information about insurance coverage",
                "No visible professional accreditations",
              ],
        },
        scamCheck: {
          isScam: false,
          riskLevel: hasGoodPresence ? "low" : "medium",
          warnings: hasGoodPresence
            ? ["No scam reports found", "Business appears legitimate based on available data"]
            : [
                "One unverified complaint found on consumer forum",
                "Business should provide more transparent credentials",
                "Recommend requesting proof of insurance before engagement",
              ],
          scamReports: hasGoodPresence
            ? []
            : [
                {
                  source: "Consumer Forum",
                  description: "User reported delayed service but issue was eventually resolved",
                  date: "2024-08-15",
                },
              ],
        },
        reviewAnalysis: {
          overallRating: 4.1,
          totalReviews: 261,
          sentiment: {
            positive: hasGoodPresence ? 78 : 62,
            neutral: 15,
            negative: hasGoodPresence ? 7 : 23,
          },
          commonThemes: [
            { theme: "Professional Service", sentiment: "positive", frequency: 89 },
            { theme: "Good Communication", sentiment: "positive", frequency: 76 },
            { theme: "Fair Pricing", sentiment: "positive", frequency: 65 },
            { theme: "Punctuality", sentiment: hasGoodPresence ? "positive" : "negative", frequency: 54 },
            {
              theme: "Quality of Work",
              sentiment: "positive",
              frequency: 142,
            },
            !hasGoodPresence && { theme: "Response Time", sentiment: "negative", frequency: 32 },
          ].filter(Boolean) as any,
          recentTrend: hasGoodPresence ? "stable" : "declining",
          detailedReviews: [
            {
              source: "Google Reviews",
              rating: 5,
              text: "Excellent service from start to finish. Very professional and did exactly what was promised. Would definitely recommend!",
              date: "2024-11-20",
              sentiment: "positive",
            },
            {
              source: "Trustpilot",
              rating: 4,
              text: "Good overall experience. Slight delay in completion but the quality of work made up for it.",
              date: "2024-11-15",
              sentiment: "positive",
            },
            !hasGoodPresence && {
              source: "Google Reviews",
              rating: 2,
              text: "Took longer than expected to respond to queries. Work was okay but communication could be better.",
              date: "2024-11-10",
              sentiment: "negative",
            },
            {
              source: "Facebook",
              rating: 5,
              text: "Brilliant service! Very knowledgeable and helped me understand everything. Fair prices too.",
              date: "2024-11-05",
              sentiment: "positive",
            },
          ].filter(Boolean) as any,
        },
        onlinePresence: {
          hasWebsite: true,
          socialMedia: hasGoodPresence
            ? ["Facebook (2.3k followers)", "Instagram (1.1k followers)", "LinkedIn"]
            : ["Facebook (340 followers)"],
          directoryListings: hasGoodPresence
            ? ["Google Business", "Bing Places", "Yell.com", "Thompson Local", "192.com"]
            : ["Google Business", "Yell.com"],
          goodSites: hasGoodPresence
            ? ["Checkatrade (Verified)", "Trustpilot (4.0★)", "Which? Trusted Traders", "TrustATrader"]
            : ["Trustpilot (4.0★)", "Google Business"],
          suspiciousSites: hasGoodPresence ? [] : ["Listed on unverified directory with conflicting details"],
        },
      }
    }

    // Generate business purpose data
    const generateBusinessPurposeData = (): BusinessPurposeData => {
      const industryType = getIndustryFromBusinessType(companyName, businessType)
      
      // SIC code database (sample)
      const sicCodes: SICCode[] = industryType === "plumber"
        ? [
            { code: "43220", description: "Plumbing, heat and air-conditioning installation", section: "F", division: "43" },
            { code: "43300", description: "Building completion and finishing", section: "F", division: "43" },
          ]
        : industryType === "restaurant"
          ? [
              { code: "56101", description: "Licensed restaurants", section: "I", division: "56" },
              { code: "56102", description: "Unlicensed restaurants and cafes", section: "I", division: "56" },
            ]
          : industryType === "ecommerce"
            ? [
                { code: "47910", description: "Retail sale via mail order houses or via Internet", section: "G", division: "47" },
                { code: "47990", description: "Other retail sale not in stores, stalls or markets", section: "G", division: "47" },
              ]
            : [
                { code: "70221", description: "Financial management", section: "M", division: "70" },
                { code: "62020", description: "Information technology consultancy activities", section: "J", division: "62" },
              ]

      const trustFactors = [
        {
          factor: "Business Registration Legitimacy",
          score: businessType === "Sole Trader" ? 75 : 92,
          weight: 25,
          details: businessType === "Sole Trader" 
            ? "Sole trader verified through multiple sources"
            : "Active Companies House registration with complete filing history",
        },
        {
          factor: "Industry Alignment",
          score: 88,
          weight: 20,
          details: `SIC codes align perfectly with stated business activities. ${sicCodes.length} registered activities.`,
        },
        {
          factor: "Online Reputation",
          score: 82,
          weight: 20,
          details: "Strong presence on trusted platforms with consistent positive reviews",
        },
        {
          factor: "Regulatory Compliance",
          score: 91,
          weight: 20,
          details: "All required licenses and certifications are current and verified",
        },
        {
          factor: "Business Longevity & Stability",
          score: 78,
          weight: 15,
          details: "Established business with consistent trading history and financial stability",
        },
      ]

      const overallTrust = Math.round(
        trustFactors.reduce((sum, factor) => sum + (factor.score * factor.weight) / 100, 0)
      )

      return {
        sicCodes,
        primaryActivity: sicCodes[0]?.description || "Professional services",
        secondaryActivities: sicCodes.slice(1).map((sic) => sic.description),
        industryAlignment: 88,
        trustFactors,
        overallTrustScore: overallTrust,
        businessInsights: [
          `Primary SIC code ${sicCodes[0]?.code} indicates core business in ${sicCodes[0]?.description.toLowerCase()}`,
          "Business activities are consistent across all registered platforms",
          "Industry classification matches reported revenue streams and customer reviews",
          "No mismatches found between stated purpose and actual operations",
        ],
        recommendations: [
          "Continue maintaining current compliance standards",
          "Consider expanding SIC code registration for new service offerings",
          "Update business description on public directories to match SIC classifications",
        ],
      }
    }

    // Update mockData generation to include compliance, sole trader data, and business purpose
    const detectedIndustry = getIndustryFromBusinessType(companyName, businessType)
    const complianceData = generateComplianceData(detectedIndustry)
    const soleTraderData = isSoleTrader ? generateSoleTraderData() : undefined
    const businessPurposeData = generateBusinessPurposeData()

    // Calculate legitimacy score based on sole trader verification
    let legitimacyScore = Math.floor(Math.random() * 30) + 70
    const riskFactors: string[] = []

    if (isSoleTrader && soleTraderData) {
      // Adjust score based on LLM analysis
      legitimacyScore = Math.round(
        soleTraderData.llmAnalysis.credibilityScore * 0.3 +
          (soleTraderData.scamCheck.riskLevel === "low" ? 95 : soleTraderData.scamCheck.riskLevel === "medium" ? 75 : 50) * 0.25 +
          ((soleTraderData.reviewAnalysis.overallRating / 5) * 100) * 0.25 +
          (soleTraderData.onlinePresence.goodSites.length > 2 ? 90 : 70) * 0.2
      )

      // Add risk factors based on analysis
      if (soleTraderData.scamCheck.scamReports.length > 0) {
        riskFactors.push(`${soleTraderData.scamCheck.scamReports.length} consumer complaint(s) found`)
      }
      if (soleTraderData.llmAnalysis.redFlags.length > 1) {
        riskFactors.push("Multiple concerns identified in online presence")
      }
      if (soleTraderData.reviewAnalysis.recentTrend === "declining") {
        riskFactors.push("Recent decline in customer satisfaction")
      }
      if (soleTraderData.onlinePresence.goodSites.length < 2) {
        riskFactors.push("Limited presence on trusted review platforms")
      }
      if (soleTraderData.reviewAnalysis.sentiment.negative > 15) {
        riskFactors.push(`${soleTraderData.reviewAnalysis.sentiment.negative}% negative review sentiment`)
      }
    } else {
      riskFactors.push("Recent incorporation (less than 2 years)", "Limited online presence")
    }

    const mockData: CompanyData = {
      name: companyName,
      type: businessType,
      registrationNumber: businessType !== "Sole Trader" ? "12345678" : undefined,
      address: "123 Business Street, London, SW1A 1AA",
      phone: "+44 20 7123 4567",
      email: "info@" + companyName.toLowerCase().replace(/\s+/g, "") + ".co.uk",
      website: "https://www." + companyName.toLowerCase().replace(/\s+/g, "") + ".co.uk",
      description: `${companyName} is a ${businessType.toLowerCase()} operating in the UK market, providing professional services to customers.`,
      reviews: isSoleTrader && soleTraderData
        ? [
            { source: "Google Reviews", rating: soleTraderData.reviewAnalysis.overallRating, count: Math.floor(soleTraderData.reviewAnalysis.totalReviews * 0.5), link: "#" },
            { source: "Trustpilot", rating: soleTraderData.reviewAnalysis.overallRating - 0.2, count: Math.floor(soleTraderData.reviewAnalysis.totalReviews * 0.3), link: "#" },
            { source: "Facebook", rating: soleTraderData.reviewAnalysis.overallRating + 0.1, count: Math.floor(soleTraderData.reviewAnalysis.totalReviews * 0.2), link: "#" },
          ]
        : [
            { source: "Google Reviews", rating: 4.2, count: 127, link: "#" },
            { source: "Trustpilot", rating: 4.0, count: 89, link: "#" },
            { source: "Yelp", rating: 3.8, count: 45, link: "#" },
          ],
      legitimacyScore: legitimacyScore,
      riskFactors: riskFactors.length > 0 ? riskFactors : ["No major concerns identified"],
      verificationSources: isSoleTrader && soleTraderData
        ? [
            { name: "Google Search Results", status: "verified", details: `Found ${soleTraderData.googleSearchResults.length} relevant results` },
            { name: "AI Analysis", status: soleTraderData.llmAnalysis.credibilityScore > 70 ? "verified" : "warning", details: `Credibility Score: ${soleTraderData.llmAnalysis.credibilityScore}/100` },
            { name: "Scam Check", status: soleTraderData.scamCheck.isScam ? "failed" : soleTraderData.scamCheck.riskLevel === "low" ? "verified" : "warning", details: `Risk Level: ${soleTraderData.scamCheck.riskLevel.toUpperCase()}` },
            { name: "Review Analysis", status: soleTraderData.reviewAnalysis.overallRating > 4 ? "verified" : "warning", details: `${soleTraderData.reviewAnalysis.totalReviews} reviews, ${soleTraderData.reviewAnalysis.overallRating}★ average` },
            { name: "Trusted Platforms", status: soleTraderData.onlinePresence.goodSites.length > 2 ? "verified" : "warning", details: `Listed on ${soleTraderData.onlinePresence.goodSites.length} trusted site(s)` },
            {
              name: "Regulatory Compliance",
              status:
                complianceData.overallComplianceScore >= 80
                  ? "verified"
                  : complianceData.overallComplianceScore >= 60
                    ? "warning"
                    : "failed",
              details: `${complianceData.overallComplianceScore}% compliance score`,
            },
          ]
        : [
            {
              name: "Companies House",
              status: businessType === "Sole Trader" ? "warning" : "verified",
              details:
                businessType === "Sole Trader" ? "Not applicable for sole traders" : "Active company registration found",
            },
            { name: "Google Business", status: "verified", details: "Verified business listing with reviews" },
            { name: "Website SSL", status: "verified", details: "Valid SSL certificate found" },
            { name: "Social Media", status: "warning", details: "Limited social media presence" },
            {
              name: "Regulatory Compliance",
              status:
                complianceData.overallComplianceScore >= 80
                  ? "verified"
                  : complianceData.overallComplianceScore >= 60
                    ? "warning"
                    : "failed",
              details: `${complianceData.overallComplianceScore}% compliance score across ${complianceData.requirements.length} requirements`,
            },
          ],
      regulatoryCompliance: complianceData,
      soleTraderVerification: soleTraderData,
      businessPurpose: businessPurposeData,
    }

    setCompanyData(mockData)
    setIsVerifying(false)
  }

  // Add helper function for compliance status
  const getComplianceStatusColor = (status: ComplianceRequirement["status"]) => {
    switch (status) {
      case "compliant":
        return "text-green-600"
      case "non-compliant":
        return "text-red-600"
      case "expired":
        return "text-red-600"
      case "pending":
        return "text-yellow-600"
      case "not-applicable":
        return "text-gray-500"
      default:
        return "text-gray-600"
    }
  }

  const getComplianceStatusIcon = (status: ComplianceRequirement["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "non-compliant":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "expired":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "not-applicable":
        return <div className="h-4 w-4 rounded-full bg-gray-300" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "processing":
        return <Loader2 className="h-4 w-4 text-accent animate-spin" />
      case "skipped":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary"
    if (score >= 60) return "text-accent"
    return "text-destructive"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { children: "High Trust", variant: "default" as const }
    if (score >= 60) return { children: "Medium Trust", variant: "secondary" as const }
    return { children: "Low Trust", variant: "destructive" as const }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-3">
      <div className="mx-auto max-w-6xl space-y-3">
        {/* Compact NatWest Header */}
        <div className="text-center bg-white rounded-lg p-4 shadow-sm border-t-4 border-primary">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Business Verification</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-3">Intelligent multi-agent verification powered by NatWest</p>
          <div className="flex items-center justify-center gap-4 p-2 bg-secondary/50 rounded">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-primary">Verification Agent</div>
                <div className="text-[10px] text-muted-foreground">Identity & Compliance</div>
              </div>
            </div>
            <Network className="h-4 w-4 text-accent" />
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 bg-accent rounded-full flex items-center justify-center">
                <Target className="h-3 w-3 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-accent">Purpose Agent</div>
                <div className="text-[10px] text-muted-foreground">Business Analysis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Input Form */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>Enter the business details to start the verification process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="Enter company name..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                onClick={simulateVerification}
                disabled={!companyName || !businessType || isVerifying}
                className="flex items-center gap-2"
              >
                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isVerifying ? "Verifying..." : "Start Verification"}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Verification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Rating Calculation Weights</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Companies House ({ratingWeights.companiesHouse[0]}%)</span>
                          <Slider
                            value={ratingWeights.companiesHouse}
                            onValueChange={(value) => setRatingWeights({ ...ratingWeights, companiesHouse: value })}
                            max={100}
                            step={5}
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Google Reviews ({ratingWeights.googleReviews[0]}%)</span>
                          <Slider
                            value={ratingWeights.googleReviews}
                            onValueChange={(value) => setRatingWeights({ ...ratingWeights, googleReviews: value })}
                            max={100}
                            step={5}
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Website Presence ({ratingWeights.websitePresence[0]}%)</span>
                          <Slider
                            value={ratingWeights.websitePresence}
                            onValueChange={(value) => setRatingWeights({ ...ratingWeights, websitePresence: value })}
                            max={100}
                            step={5}
                            className="w-32"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Industry-Specific Sources</Label>
                      <Switch checked={industrySpecific} onCheckedChange={setIndustrySpecific} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Ultra-Compact Agent Workflow */}
        {verificationSteps.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader className="py-2 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Workflow Progress</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {agents.map((agent, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${agent.status === "active" ? "bg-accent animate-pulse" : agent.status === "completed" ? "bg-primary" : "bg-muted"}`} />
                      <span className="text-[10px] font-medium">{agent.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <div className="flex flex-wrap gap-1.5">
                {verificationSteps.map((step, index) => (
                  <div key={step.id} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${
                    step.status === "completed" ? "bg-primary/10 border-primary text-primary" : 
                    step.status === "processing" ? "bg-accent/10 border-accent text-accent animate-pulse" : 
                    step.status === "skipped" ? "bg-muted border-muted-foreground/20 text-muted-foreground" :
                    "bg-background border-border text-muted-foreground"
                  }`}>
                    {getStepIcon(step.status)}
                    <span className="font-medium">{step.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {companyData && (
          <Tabs defaultValue="summary" className="space-y-3">
            {/* Unified TabsList for all business types */}
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="purpose">Business Purpose & SIC</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="web">Web Presence</TabsTrigger>
            </TabsList>

            {/* Summary Tab - Compact Comprehensive Summary */}
            <TabsContent value="summary">
              <div className="space-y-4">
                {companyData.businessPurpose && (
                  <>
                    {/* Compact Business Overview */}
                    <Card className="border-2 border-primary">
                      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Verification Summary</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          {/* Compact Identity Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-2 bg-secondary/30 rounded">
                              <div className="text-xs text-muted-foreground">Name</div>
                              <div className="font-semibold text-sm truncate">{companyData.name}</div>
                            </div>
                            <div className="p-2 bg-secondary/30 rounded">
                              <div className="text-xs text-muted-foreground">Type</div>
                              <div className="font-semibold text-sm">{companyData.type}</div>
                            </div>
                            {companyData.registrationNumber && (
                              <div className="p-2 bg-secondary/30 rounded">
                                <div className="text-xs text-muted-foreground">Registration</div>
                                <div className="font-semibold text-sm">{companyData.registrationNumber}</div>
                              </div>
                            )}
                            <div className="p-2 bg-secondary/30 rounded">
                              <div className="text-xs text-muted-foreground">Industry</div>
                              <div className="font-semibold text-sm truncate">{companyData.businessPurpose.primaryActivity}</div>
                            </div>
                          </div>

                          {/* Compact Verification Status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {companyData.type !== "Sole Trader" && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-primary" />
                                Companies House
                              </Badge>
                            )}
                            <Badge variant="outline" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-primary" />
                              Address Verified
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-primary" />
                              Online Presence
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-primary" />
                              {companyData.reviews.reduce((sum, r) => sum + r.count, 0)} Reviews
                            </Badge>
                          </div>

                          {/* AI Credibility Analysis */}
                          {companyData.soleTraderVerification?.llmAnalysis && (
                            <div className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border-2 border-accent">
                              <div className="flex items-center gap-2 mb-3">
                                <Brain className="h-5 w-5 text-accent" />
                                <h3 className="font-semibold text-accent">AI Credibility Analysis</h3>
                              </div>
                              <p className="text-sm leading-relaxed mb-3">
                                {companyData.soleTraderVerification.llmAnalysis.summary}
                              </p>
                              {companyData.soleTraderVerification.llmAnalysis.keyPoints && companyData.soleTraderVerification.llmAnalysis.keyPoints.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                  {companyData.soleTraderVerification.llmAnalysis.keyPoints.map((point, index) => (
                                    <div key={index} className="flex items-start gap-2 text-xs">
                                      <CheckCircle className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
                                      <span>{point}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Compact Data Sources */}
                          <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Data Sources</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {!companyData.type.includes("Sole Trader") && (
                                <div className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                                  <Building2 className="h-4 w-4 text-primary" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate">Companies House</div>
                                  </div>
                                  <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                                </div>
                              )}
                              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                                <MapPin className="h-4 w-4 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">Google Maps</div>
                                </div>
                                <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                                <Globe className="h-4 w-4 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">Web Search</div>
                                </div>
                                <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                                <Star className="h-4 w-4 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">Reviews</div>
                                </div>
                                <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                              </div>
                            </div>
                          </div>

                          {/* Compact Key Findings & Observations */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-primary mb-2">Key Findings</h3>
                              <div className="space-y-1.5">
                                {companyData.businessPurpose?.businessInsights?.length > 0 ? (
                                  companyData.businessPurpose.businessInsights.map((insight, index) => (
                                    <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border text-xs">
                                      <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                      <span>{insight}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-muted-foreground p-2">No findings available</div>
                                )}
                              </div>
                            </div>

                            {companyData.riskFactors?.length > 0 && companyData.riskFactors[0] !== "No major concerns identified" && (
                              <div>
                                <h3 className="text-sm font-semibold text-accent mb-2">Observations</h3>
                                <div className="space-y-1.5">
                                  {companyData.riskFactors.map((risk, index) => (
                                    <div key={index} className="flex items-start gap-2 p-2 bg-accent/5 rounded border border-accent/20 text-xs">
                                      <AlertCircle className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
                                      <span>{risk}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Compact Final Assessment */}
                          <div className="p-4 bg-gradient-to-br from-primary/10 via-white to-accent/10 rounded-lg border-2 border-primary">
                            <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              Final Assessment
                            </h3>
                            <p className="text-xs leading-relaxed">
                              Based on comprehensive verification across multiple data sources including {companyData.type === "Sole Trader" ? "web search, online directories" : "Companies House, web search, online directories"}, Google Maps, and review platforms, this business has been identified and verified. 
                              The business operates as <strong>{companyData.businessPurpose?.primaryActivity?.toLowerCase() || "various activities"}</strong> with {companyData.businessPurpose?.sicCodes?.length || 0} registered SIC code(s). 
                              Address verification confirms the business location at {companyData.address}. 
                              Online presence analysis shows the business is {companyData.website ? "actively maintaining a website and " : ""}listed on {companyData.reviews?.length || 0} review platform(s) with a total of {companyData.reviews?.reduce((sum, r) => sum + r.count, 0) || 0} customer reviews.
                              {companyData.regulatoryCompliance && ` Regulatory compliance check indicates ${companyData.regulatoryCompliance.overallComplianceScore}% compliance across ${companyData.regulatoryCompliance.requirements.length} industry-specific requirements.`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>



            {/* Address Verification Tab - Compact */}
            <TabsContent value="address">
              <Card className="border-2 border-primary">
                <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Address Verification
                  </CardTitle>
                  <CardDescription className="text-xs">Verified through Google Maps and directories</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {/* Address with Map Placeholder */}
                    <div className="grid md:grid-cols-2 gap-3">
                      {/* Address Info */}
                      <div className="p-3 bg-gradient-to-br from-primary/10 to-white rounded border-2 border-primary">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">Verified Address</div>
                            <div className="text-sm font-semibold mb-2">{companyData.address}</div>
                            <Badge variant="default" className="flex items-center gap-1 w-fit text-xs">
                              <CheckCircle className="h-3 w-3" />
                              Google Maps Verified
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Map Placeholder */}
                      <div className="relative h-[180px] rounded border-2 border-primary bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <MapPin className="h-12 w-12 text-primary mx-auto mb-2 opacity-50" />
                            <div className="text-xs font-semibold text-muted-foreground">Interactive Map</div>
                            <div className="text-[10px] text-muted-foreground mt-1">Location: {companyData.address.split(',')[0]}</div>
                          </div>
                        </div>
                        {/* Grid pattern for map-like appearance */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                            {Array.from({ length: 64 }).map((_, i) => (
                              <div key={i} className="border border-gray-400" />
                            ))}
                          </div>
                        </div>
                        {/* Pin marker */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                          <MapPin className="h-8 w-8 text-red-500 fill-red-500 drop-shadow-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Compact Verification Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div className="p-2 border rounded bg-secondary/20">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle className="h-3 w-3 text-primary" />
                          <span className="font-semibold text-xs">Maps Listing</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Confirmed location</p>
                      </div>
                      <div className="p-2 border rounded bg-secondary/20">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle className="h-3 w-3 text-primary" />
                          <span className="font-semibold text-xs">Directories</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Consistent match</p>
                      </div>
                      {!companyData.type.includes("Sole Trader") && (
                        <div className="p-2 border rounded bg-secondary/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CheckCircle className="h-3 w-3 text-primary" />
                            <span className="font-semibold text-xs">Companies House</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Registered match</p>
                        </div>
                      )}
                      <div className="p-2 border rounded bg-secondary/20">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Globe className="h-3 w-3 text-primary" />
                          <span className="font-semibold text-xs">Website</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Consistent info</p>
                      </div>
                    </div>

                    {/* Compact Contact Information */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {companyData.phone && (
                          <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded">
                            <Phone className="h-3 w-3 text-primary" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] text-muted-foreground">Phone</div>
                              <div className="font-medium text-xs truncate">{companyData.phone}</div>
                            </div>
                          </div>
                        )}
                        {companyData.email && (
                          <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded">
                            <Mail className="h-3 w-3 text-primary" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] text-muted-foreground">Email</div>
                              <div className="font-medium text-xs truncate">{companyData.email}</div>
                            </div>
                          </div>
                        )}
                        {companyData.website && (
                          <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded">
                            <Globe className="h-3 w-3 text-primary" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] text-muted-foreground">Website</div>
                              <div className="font-medium text-xs truncate">{companyData.website}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Web Presence Tab - Enhanced with Categorized Links */}
            <TabsContent value="web">
              <Card className="border-2 border-primary">
                <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Network className="h-5 w-5 text-primary" />
                    Web Presence & Verification Links
                  </CardTitle>
                  <CardDescription className="text-xs">Detailed sources from Google, social media, directories, and scam checks</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {/* Summary Card */}
                    <div className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded border border-primary/20">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        Summary
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Business verified across {companyData.verificationSources.length}+ platforms. 
                        {companyData.soleTraderVerification && ` Found ${companyData.soleTraderVerification.googleSearchResults.length} Google results, `}
                        {companyData.soleTraderVerification && `${companyData.soleTraderVerification.onlinePresence.socialMedia.length} social media profiles, `}
                        {companyData.soleTraderVerification && `${companyData.soleTraderVerification.onlinePresence.directoryListings.length} directory listings.`}
                        {companyData.website && " Active website with SSL certification."}
                      </p>
                    </div>

                    {/* Google Search Results */}
                    {companyData.soleTraderVerification && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Search className="h-4 w-4 text-primary" />
                          Google Search Results ({companyData.soleTraderVerification.googleSearchResults.length})
                        </h3>
                        <div className="space-y-1.5">
                          {companyData.soleTraderVerification.googleSearchResults.map((result, index) => (
                            <a
                              key={index}
                              href={result.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-2 rounded border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-xs truncate text-primary">{result.title}</div>
                                  <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{result.snippet}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-[9px] py-0 h-4">{result.source}</Badge>
                                    <span className="text-[9px] text-muted-foreground truncate">{result.link}</span>
                                  </div>
                                </div>
                                <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Media Links */}
                    {companyData.soleTraderVerification && companyData.soleTraderVerification.onlinePresence.socialMedia.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          Social Media Presence
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {companyData.soleTraderVerification.onlinePresence.socialMedia.map((social, index) => (
                            <div key={index} className="p-2 rounded border border-border bg-secondary/20">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle className="h-3 w-3 text-primary" />
                                <span className="text-xs font-medium">{social}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Directory Listings */}
                    {companyData.soleTraderVerification && companyData.soleTraderVerification.onlinePresence.directoryListings.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          Directory Listings
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {companyData.soleTraderVerification.onlinePresence.directoryListings.map((directory, index) => (
                            <div key={index} className="p-2 rounded border border-primary/20 bg-primary/5 text-center">
                              <div className="text-xs font-medium">{directory}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scam Check Results */}
                    {companyData.soleTraderVerification && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-primary" />
                          Scam & Safety Check
                        </h3>
                        <div className="p-3 rounded border-2 border-primary bg-primary/5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-semibold">
                                {companyData.soleTraderVerification.scamCheck.isScam ? "⚠️ Potential Risk" : "✓ No Scam Reports"}
                              </span>
                            </div>
                            <Badge variant={
                              companyData.soleTraderVerification.scamCheck.riskLevel === "low" ? "default" :
                              companyData.soleTraderVerification.scamCheck.riskLevel === "medium" ? "secondary" : "destructive"
                            } className="text-xs">
                              {companyData.soleTraderVerification.scamCheck.riskLevel.toUpperCase()} RISK
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            {companyData.soleTraderVerification.scamCheck.warnings.map((warning, index) => (
                              <div key={index} className="flex items-start gap-2 text-xs">
                                <span className="text-primary mt-0.5">•</span>
                                <span className="text-muted-foreground">{warning}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trusted Sites */}
                    {companyData.soleTraderVerification && companyData.soleTraderVerification.onlinePresence.goodSites && companyData.soleTraderVerification.onlinePresence.goodSites.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          Verified on Trusted Platforms
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {companyData.soleTraderVerification.onlinePresence.goodSites.map((site, index) => (
                            <div key={index} className="p-2 rounded border border-green-200 bg-green-50 text-center">
                              <div className="text-xs font-medium text-green-700">{site}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Purpose & SIC Tab - Enhanced */}
            {companyData.businessPurpose && (
              <TabsContent value="purpose">
                <Card className="border-2 border-primary">
                  <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-primary" />
                      Business Purpose & SIC Classification
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {companyData.type === "Sole Trader" 
                        ? "Industry classification through activity analysis"
                        : "Official Companies House registration and classification"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {/* SIC Codes - Detailed Display */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          SIC Codes ({companyData.businessPurpose.sicCodes.length})
                        </h3>
                        <div className="space-y-2">
                          {companyData.businessPurpose.sicCodes.map((sic, index) => (
                            <div key={index} className={`p-3 rounded border-2 ${index === 0 ? "bg-primary/5 border-primary" : "bg-secondary/30 border-border"}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={index === 0 ? "default" : "secondary"} className="text-sm">
                                    {sic.code}
                                  </Badge>
                                  {index === 0 && <Badge variant="outline" className="border-primary text-primary text-xs">PRIMARY</Badge>}
                                </div>
                                <Badge variant="outline" className="text-xs">Sec {sic.section} • Div {sic.division}</Badge>
                              </div>
                              <p className="font-semibold text-sm mb-1">{sic.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {sic.description.toLowerCase()} sector
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Primary & Secondary Activities */}
                      <div className="p-3 bg-gradient-to-br from-primary/5 to-accent/5 rounded border border-primary/20">
                        <h3 className="font-semibold text-sm text-primary mb-2 flex items-center gap-1.5">
                          <Target className="h-4 w-4" />
                          Business Activities
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-muted-foreground">Primary Activity</div>
                            <div className="font-semibold text-sm">{companyData.businessPurpose.primaryActivity}</div>
                          </div>
                          {companyData.businessPurpose.secondaryActivities.length > 0 && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Secondary Activities</div>
                              <ul className="space-y-1">
                                {companyData.businessPurpose.secondaryActivities.map((activity, index) => (
                                  <li key={index} className="flex items-start gap-1.5 text-xs">
                                    <span className="text-primary">•</span>
                                    <span>{activity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Compact Business Insights */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                          <Brain className="h-4 w-4 text-primary" />
                          Business Insights
                        </h3>
                        <div className="space-y-1.5">
                          {companyData.businessPurpose?.businessInsights?.length > 0 ? (
                            companyData.businessPurpose.businessInsights.map((insight, index) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border text-xs">
                                <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                <span>{insight}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground p-2">No insights available</div>
                          )}
                        </div>
                      </div>

                      {/* Compact Verification Factors */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                          <ShieldAlert className="h-4 w-4 text-primary" />
                          Verification Factors
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {companyData.businessPurpose.trustFactors.map((factor, index) => (
                            <div key={index} className="p-2 border rounded bg-secondary/20">
                              <div className="font-medium text-xs mb-1">{factor.factor}</div>
                              <p className="text-[10px] text-muted-foreground">{factor.details}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      {companyData.businessPurpose.recommendations.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-primary" />
                            Recommendations
                          </h3>
                          <div className="space-y-1.5">
                            {companyData.businessPurpose.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-accent/5 rounded border border-accent/20">
                                <TrendingUp className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                                <span className="text-xs">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}



          </Tabs>
        )}
      </div>
    </div>
  )
}
