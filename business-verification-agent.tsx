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
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "skipped":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: "High Trust", variant: "default" as const }
    if (score >= 60) return { text: "Medium Trust", variant: "secondary" as const }
    return { text: "Low Trust", variant: "destructive" as const }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Multi-Agent Business Verification System</h1>
          <p className="text-lg text-gray-600">Two AI agents working together: Business Verification & Purpose Analysis</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Verification Agent</span>
            </div>
            <Network className="h-5 w-5 text-gray-400" />
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Purpose Agent</span>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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

        {/* Agent Status Cards */}
        {verificationSteps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent, idx) => (
              <Card key={idx} className={`border-2 ${agent.status === "active" ? idx === 0 ? "border-blue-500 shadow-lg" : "border-purple-500 shadow-lg" : "border-gray-200"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {idx === 0 ? <Bot className="h-5 w-5 text-blue-600" /> : <Target className="h-5 w-5 text-purple-600" />}
                    {agent.name}
                    {agent.status === "active" && <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />}
                  </CardTitle>
                  <CardDescription>{agent.currentTask}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Status:</span>
                      <Badge variant={agent.status === "completed" ? "default" : agent.status === "active" ? "secondary" : "outline"}>
                        {agent.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{agent.progress}%</span>
                      </div>
                      <Progress value={agent.progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Verification Process */}
        {verificationSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Agent Workflow Steps
              </CardTitle>
              <CardDescription>Real-time view of both agents working together</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verificationSteps.map((step, index) => (
                  <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg ${step.agent === "verification" ? "bg-blue-50" : "bg-purple-50"}`}>
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{step.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {step.agent === "verification" ? "Verification Agent" : "Purpose Agent"}
                        </Badge>
                      </div>
                      {step.result && <div className="text-sm text-gray-600">{step.result}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {companyData && (
          <div className="space-y-6">
            {/* Legitimacy Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Legitimacy Assessment</span>
                  <Badge {...getScoreBadge(companyData.legitimacyScore)}>
                    {getScoreBadge(companyData.legitimacyScore).text}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getScoreColor(companyData.legitimacyScore)}`}>
                      {companyData.legitimacyScore}
                    </div>
                    <div className="text-lg text-gray-600">Legitimacy Score</div>
                  </div>

                  <Progress value={companyData.legitimacyScore} className="h-3" />

                  {companyData.riskFactors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Risk Factors:</h4>
                      <ul className="space-y-1">
                        {companyData.riskFactors.map((factor, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          {/* Company Details */}
          <Tabs defaultValue="summary" className="space-y-4">
            {/* Update TabsList to include sole trader, business purpose and compliance tabs */}
            <TabsList className={`grid w-full ${companyData.type === "Sole Trader" ? "grid-cols-7" : "grid-cols-6"}`}>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              {companyData.type === "Sole Trader" && <TabsTrigger value="soletrader">Sole Trader Analysis</TabsTrigger>}
              <TabsTrigger value="purpose">Business Purpose</TabsTrigger>
              <TabsTrigger value="details">Company Details</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary">
              <div className="space-y-6">
                {/* Overall Trust Score */}
                {companyData.businessPurpose && (
                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-6 w-6 text-blue-600" />
                        Comprehensive Trust Analysis
                      </CardTitle>
                      <CardDescription>Combined insights from both verification and purpose analysis agents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-white rounded-lg shadow">
                          <div className={`text-5xl font-bold mb-2 ${getScoreColor(companyData.legitimacyScore)}`}>
                            {companyData.legitimacyScore}
                          </div>
                          <div className="text-sm font-medium text-gray-600 mb-1">Legitimacy Score</div>
                          <Badge {...getScoreBadge(companyData.legitimacyScore)}>{getScoreBadge(companyData.legitimacyScore).children}</Badge>
                        </div>
                        <div className="text-center p-6 bg-white rounded-lg shadow">
                          <div className={`text-5xl font-bold mb-2 ${getScoreColor(companyData.businessPurpose.overallTrustScore)}`}>
                            {companyData.businessPurpose.overallTrustScore}
                          </div>
                          <div className="text-sm font-medium text-gray-600 mb-1">Trust Score</div>
                          <Badge {...getScoreBadge(companyData.businessPurpose.overallTrustScore)}>{getScoreBadge(companyData.businessPurpose.overallTrustScore).children}</Badge>
                        </div>
                        <div className="text-center p-6 bg-white rounded-lg shadow">
                          <div className={`text-5xl font-bold mb-2 ${getScoreColor(companyData.businessPurpose.industryAlignment)}`}>
                            {companyData.businessPurpose.industryAlignment}%
                          </div>
                          <div className="text-sm font-medium text-gray-600 mb-1">Industry Alignment</div>
                          <Badge variant="secondary">VERIFIED</Badge>
                        </div>
                      </div>

                      {/* Key Insights */}
                      <div className="mt-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          Key Business Insights
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          {companyData.businessPurpose.businessInsights.map((insight, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{insight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risk Factors */}
                      {companyData.riskFactors.length > 0 && companyData.riskFactors[0] !== "No major concerns identified" && (
                        <div className="mt-6">
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                            <ShieldAlert className="h-5 w-5" />
                            Risk Factors
                          </h3>
                          <div className="grid grid-cols-1 gap-3">
                            {companyData.riskFactors.map((risk, index) => (
                              <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{risk}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      <div className="mt-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Recommendations
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          {companyData.businessPurpose.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Business Purpose Tab */}
            {companyData.businessPurpose && (
              <TabsContent value="purpose">
                <div className="space-y-6">
                  {/* SIC Codes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        SIC Codes & Business Classification
                      </CardTitle>
                      <CardDescription>Standard Industrial Classification from Companies House</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {companyData.businessPurpose.sicCodes.map((sic, index) => (
                          <div key={index} className={`p-4 rounded-lg border-2 ${index === 0 ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Badge variant={index === 0 ? "default" : "secondary"} className="text-lg px-3 py-1">
                                  {sic.code}
                                </Badge>
                                {index === 0 && <Badge variant="outline">PRIMARY</Badge>}
                              </div>
                              <Badge variant="outline">Section {sic.section}</Badge>
                            </div>
                            <p className="font-medium text-lg">{sic.description}</p>
                            <p className="text-sm text-gray-600 mt-1">Division: {sic.division}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-semibold">Primary Business Activity</span>
                        </div>
                        <p className="text-lg">{companyData.businessPurpose.primaryActivity}</p>
                        
                        {companyData.businessPurpose.secondaryActivities.length > 0 && (
                          <div className="mt-4">
                            <span className="font-semibold text-sm">Secondary Activities:</span>
                            <ul className="mt-2 space-y-1">
                              {companyData.businessPurpose.secondaryActivities.map((activity, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <span className="text-green-600">•</span>
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trust Factors */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Trust Factor Analysis
                      </CardTitle>
                      <CardDescription>Weighted scoring based on multiple verification dimensions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {companyData.businessPurpose.trustFactors.map((factor, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{factor.factor}</span>
                                <Badge variant="outline" className="text-xs">
                                  Weight: {factor.weight}%
                                </Badge>
                              </div>
                              <span className={`text-xl font-bold ${getScoreColor(factor.score)}`}>{factor.score}/100</span>
                            </div>
                            <Progress value={factor.score} className="h-3" />
                            <p className="text-sm text-gray-600">{factor.details}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">Overall Trust Score</span>
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${getScoreColor(companyData.businessPurpose.overallTrustScore)}`}>
                              {companyData.businessPurpose.overallTrustScore}/100
                            </div>
                            <Badge {...getScoreBadge(companyData.businessPurpose.overallTrustScore)} className="mt-1">
                              {getScoreBadge(companyData.businessPurpose.overallTrustScore).children}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Industry Alignment */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Industry Alignment Score
                      </CardTitle>
                      <CardDescription>How well the business activities match registered classifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                          <div className={`text-6xl font-bold mb-2 ${getScoreColor(companyData.businessPurpose.industryAlignment)}`}>
                            {companyData.businessPurpose.industryAlignment}%
                          </div>
                          <p className="text-gray-600">Alignment Score</p>
                        </div>
                        <Progress value={companyData.businessPurpose.industryAlignment} className="h-4" />
                        <p className="text-sm text-gray-600 text-center">
                          This score reflects how closely the business's actual operations match its registered SIC codes and stated purpose.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {/* Sole Trader Verification Tab */}
            {companyData.type === "Sole Trader" && companyData.soleTraderVerification && (
              <TabsContent value="soletrader">
                <div className="space-y-6">
                  {/* Google Search Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileSearch className="h-5 w-5" />
                        Google Search Results
                      </CardTitle>
                      <CardDescription>
                        Found {companyData.soleTraderVerification.googleSearchResults.length} results across the web
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {companyData.soleTraderVerification.googleSearchResults.map((result, index) => (
                          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-blue-600">{result.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {result.source}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{result.snippet}</p>
                                <a
                                  href={result.link}
                                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {result.link}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* LLM Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI Credibility Analysis
                      </CardTitle>
                      <CardDescription>
                        Advanced AI analysis of business credibility and online presence
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Credibility Score */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Credibility Score</Label>
                            <span className={`text-2xl font-bold ${getScoreColor(companyData.soleTraderVerification.llmAnalysis.credibilityScore)}`}>
                              {companyData.soleTraderVerification.llmAnalysis.credibilityScore}/100
                            </span>
                          </div>
                          <Progress value={companyData.soleTraderVerification.llmAnalysis.credibilityScore} className="h-3" />
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                companyData.soleTraderVerification.llmAnalysis.sentiment === "positive"
                                  ? "default"
                                  : companyData.soleTraderVerification.llmAnalysis.sentiment === "neutral"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {companyData.soleTraderVerification.llmAnalysis.sentiment.toUpperCase()} SENTIMENT
                            </Badge>
                          </div>
                        </div>

                        {/* Insights */}
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Key Insights
                          </h4>
                          <ul className="space-y-2">
                            {companyData.soleTraderVerification.llmAnalysis.insights.map((insight, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Strengths */}
                        {companyData.soleTraderVerification.llmAnalysis.strengths.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3 text-green-700 flex items-center gap-2">
                              <ThumbsUp className="h-4 w-4" />
                              Strengths
                            </h4>
                            <ul className="space-y-2">
                              {companyData.soleTraderVerification.llmAnalysis.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Red Flags */}
                        {companyData.soleTraderVerification.llmAnalysis.redFlags.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3 text-red-700 flex items-center gap-2">
                              <ShieldAlert className="h-4 w-4" />
                              Red Flags
                            </h4>
                            <ul className="space-y-2">
                              {companyData.soleTraderVerification.llmAnalysis.redFlags.map((flag, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span>{flag}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Concerns */}
                        {companyData.soleTraderVerification.llmAnalysis.concerns.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3 text-yellow-700 flex items-center gap-2">
                              <ThumbsDown className="h-4 w-4" />
                              Concerns
                            </h4>
                            <ul className="space-y-2">
                              {companyData.soleTraderVerification.llmAnalysis.concerns.map((concern, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span>{concern}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Scam Check */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5" />
                        Scam & Fraud Check
                      </CardTitle>
                      <CardDescription>
                        Cross-referenced against scam databases and consumer complaint forums
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Status */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {companyData.soleTraderVerification.scamCheck.isScam ? (
                              <XCircle className="h-6 w-6 text-red-500" />
                            ) : (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            )}
                            <div>
                              <div className="font-medium">
                                {companyData.soleTraderVerification.scamCheck.isScam ? "Scam Detected" : "No Scam Reports"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Risk Level: <span className={`font-medium ${companyData.soleTraderVerification.scamCheck.riskLevel === "low" ? "text-green-600" : companyData.soleTraderVerification.scamCheck.riskLevel === "medium" ? "text-yellow-600" : "text-red-600"}`}>
                                  {companyData.soleTraderVerification.scamCheck.riskLevel.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              companyData.soleTraderVerification.scamCheck.riskLevel === "low"
                                ? "default"
                                : companyData.soleTraderVerification.scamCheck.riskLevel === "medium"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-lg px-4 py-2"
                          >
                            {companyData.soleTraderVerification.scamCheck.riskLevel.toUpperCase()} RISK
                          </Badge>
                        </div>

                        {/* Warnings */}
                        {companyData.soleTraderVerification.scamCheck.warnings.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Warnings & Recommendations</h4>
                            <ul className="space-y-2">
                              {companyData.soleTraderVerification.scamCheck.warnings.map((warning, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <span>{warning}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Scam Reports */}
                        {companyData.soleTraderVerification.scamCheck.scamReports.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 text-red-700">Reported Complaints</h4>
                            <div className="space-y-2">
                              {companyData.soleTraderVerification.scamCheck.scamReports.map((report, index) => (
                                <div key={index} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">{report.source}</span>
                                    <span className="text-xs text-gray-500">{report.date}</span>
                                  </div>
                                  <p className="text-sm">{report.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Review Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Deep Review Analysis
                      </CardTitle>
                      <CardDescription>
                        Comprehensive sentiment analysis and review trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Overall Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600">
                              {companyData.soleTraderVerification.reviewAnalysis.overallRating}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              Average Rating
                            </div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600">
                              {companyData.soleTraderVerification.reviewAnalysis.totalReviews}
                            </div>
                            <div className="text-sm text-gray-600">Total Reviews</div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold capitalize text-blue-600">
                              {companyData.soleTraderVerification.reviewAnalysis.recentTrend}
                            </div>
                            <div className="text-sm text-gray-600">Recent Trend</div>
                          </div>
                        </div>

                        {/* Sentiment Breakdown */}
                        <div>
                          <h4 className="font-medium mb-3">Sentiment Distribution</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm flex items-center gap-2">
                                  <ThumbsUp className="h-4 w-4 text-green-500" />
                                  Positive
                                </span>
                                <span className="text-sm font-medium">
                                  {companyData.soleTraderVerification.reviewAnalysis.sentiment.positive}%
                                </span>
                              </div>
                              <Progress
                                value={companyData.soleTraderVerification.reviewAnalysis.sentiment.positive}
                                className="h-2"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm flex items-center gap-2">
                                  <div className="h-4 w-4 rounded bg-gray-400" />
                                  Neutral
                                </span>
                                <span className="text-sm font-medium">
                                  {companyData.soleTraderVerification.reviewAnalysis.sentiment.neutral}%
                                </span>
                              </div>
                              <Progress
                                value={companyData.soleTraderVerification.reviewAnalysis.sentiment.neutral}
                                className="h-2"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm flex items-center gap-2">
                                  <ThumbsDown className="h-4 w-4 text-red-500" />
                                  Negative
                                </span>
                                <span className="text-sm font-medium">
                                  {companyData.soleTraderVerification.reviewAnalysis.sentiment.negative}%
                                </span>
                              </div>
                              <Progress
                                value={companyData.soleTraderVerification.reviewAnalysis.sentiment.negative}
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Common Themes */}
                        <div>
                          <h4 className="font-medium mb-3">Common Themes in Reviews</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {companyData.soleTraderVerification.reviewAnalysis.commonThemes.map((theme, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border ${theme.sentiment === "positive" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{theme.theme}</span>
                                  {theme.sentiment === "positive" ? (
                                    <ThumbsUp className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <ThumbsDown className="h-4 w-4 text-red-600" />
                                  )}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">Mentioned {theme.frequency} times</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Detailed Reviews */}
                        <div>
                          <h4 className="font-medium mb-3">Recent Reviews</h4>
                          <div className="space-y-3">
                            {companyData.soleTraderVerification.reviewAnalysis.detailedReviews.map((review, index) => (
                              <div
                                key={index}
                                className={`p-4 rounded-lg border ${review.sentiment === "positive" ? "bg-green-50 border-green-200" : review.sentiment === "neutral" ? "bg-gray-50 border-gray-200" : "bg-red-50 border-red-200"}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{review.source}</Badge>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      <span className="font-medium">{review.rating}</span>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500">{review.date}</span>
                                </div>
                                <p className="text-sm">{review.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Online Presence */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Online Presence Analysis
                      </CardTitle>
                      <CardDescription>
                        Website, social media, and directory listings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Website Status */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {companyData.soleTraderVerification.onlinePresence.hasWebsite ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">Website</div>
                            <div className="text-sm text-gray-600">
                              {companyData.soleTraderVerification.onlinePresence.hasWebsite
                                ? "Active professional website found"
                                : "No website found"}
                            </div>
                          </div>
                        </div>

                        {/* Social Media */}
                        <div>
                          <h4 className="font-medium mb-2">Social Media Presence</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {companyData.soleTraderVerification.onlinePresence.socialMedia.map((platform, index) => (
                              <div key={index} className="p-2 border rounded flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{platform}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Directory Listings */}
                        <div>
                          <h4 className="font-medium mb-2">Directory Listings</h4>
                          <div className="flex flex-wrap gap-2">
                            {companyData.soleTraderVerification.onlinePresence.directoryListings.map((directory, index) => (
                              <Badge key={index} variant="secondary">
                                {directory}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Trusted Platform Listings */}
                        <div>
                          <h4 className="font-medium mb-2 text-green-700">Listed on Trusted Platforms</h4>
                          <div className="space-y-2">
                            {companyData.soleTraderVerification.onlinePresence.goodSites.map((site, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">{site}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Suspicious Listings */}
                        {companyData.soleTraderVerification.onlinePresence.suspiciousSites.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 text-red-700">Suspicious Listings Found</h4>
                            <div className="space-y-2">
                              {companyData.soleTraderVerification.onlinePresence.suspiciousSites.map((site, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded border-l-4 border-red-500">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  <span className="text-sm">{site}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Company Name</Label>
                        <div className="font-medium">{companyData.name}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Business Type</Label>
                        <div className="font-medium">{companyData.type}</div>
                      </div>
                      {companyData.registrationNumber && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Registration Number</Label>
                          <div className="font-medium">{companyData.registrationNumber}</div>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Address</Label>
                        <div className="font-medium flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {companyData.address}
                        </div>
                      </div>
                      {companyData.phone && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Phone</Label>
                          <div className="font-medium flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {companyData.phone}
                          </div>
                        </div>
                      )}
                      {companyData.email && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Email</Label>
                          <div className="font-medium flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {companyData.email}
                          </div>
                        </div>
                      )}
                    </div>

                    {companyData.website && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Website</Label>
                        <div className="font-medium flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <a
                            href={companyData.website}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {companyData.website}
                          </a>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Description</Label>
                      <div className="text-sm text-gray-700">{companyData.description}</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Add new TabsContent for compliance */}
              <TabsContent value="compliance">
                <div className="space-y-6">
                  {/* Compliance Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Regulatory Compliance Overview</span>
                        <Badge
                          variant={
                            companyData.regulatoryCompliance!.overallComplianceScore >= 80
                              ? "default"
                              : companyData.regulatoryCompliance!.overallComplianceScore >= 60
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {companyData.regulatoryCompliance!.overallComplianceScore}% Compliant
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div
                            className={`text-4xl font-bold ${getScoreColor(companyData.regulatoryCompliance!.overallComplianceScore)}`}
                          >
                            {companyData.regulatoryCompliance!.overallComplianceScore}%
                          </div>
                          <div className="text-lg text-gray-600">Compliance Score</div>
                        </div>

                        <Progress value={companyData.regulatoryCompliance!.overallComplianceScore} className="h-3" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-green-600">
                              {
                                companyData.regulatoryCompliance!.requirements.filter((r) => r.status === "compliant")
                                  .length
                              }
                            </div>
                            <div className="text-gray-600">Compliant</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-yellow-600">
                              {
                                companyData.regulatoryCompliance!.requirements.filter((r) => r.status === "pending")
                                  .length
                              }
                            </div>
                            <div className="text-gray-600">Pending</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-red-600">
                              {
                                companyData.regulatoryCompliance!.requirements.filter(
                                  (r) => r.status === "non-compliant" || r.status === "expired",
                                ).length
                              }
                            </div>
                            <div className="text-gray-600">Non-Compliant</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Industry</Label>
                            <div className="font-medium capitalize">{companyData.regulatoryCompliance!.industry}</div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Last Checked</Label>
                            <div className="font-medium">{companyData.regulatoryCompliance!.lastChecked}</div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Next Review</Label>
                            <div className="font-medium">{companyData.regulatoryCompliance!.nextReview}</div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Regulatory Bodies</Label>
                            <div className="font-medium">
                              {companyData.regulatoryCompliance!.regulatoryBodies.length} bodies
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Requirements */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance Requirements</CardTitle>
                      <CardDescription>Detailed breakdown of regulatory requirements for this industry</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {companyData.regulatoryCompliance!.requirements.map((requirement, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {getComplianceStatusIcon(requirement.status)}
                                <div>
                                  <div className="font-medium">{requirement.name}</div>
                                  <div className="text-sm text-gray-600">{requirement.regulatoryBody}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {requirement.required && (
                                  <Badge variant="outline" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                                <Badge
                                  variant={
                                    requirement.status === "compliant"
                                      ? "default"
                                      : requirement.status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {requirement.status.replace("-", " ").toUpperCase()}
                                </Badge>
                              </div>
                            </div>

                            <div className="text-sm text-gray-700 mb-2">{requirement.details}</div>

                            <div className="text-xs text-gray-500">
                              <strong>Required Document:</strong> {requirement.documentRequired}
                            </div>

                            {requirement.expiryDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                <strong>Expires:</strong> {requirement.expiryDate}
                              </div>
                            )}

                            {requirement.renewalRequired && (
                              <div className="text-xs text-red-600 mt-1">
                                <strong>⚠️ Renewal Required</strong>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Regulatory Bodies */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Regulatory Bodies</CardTitle>
                      <CardDescription>Relevant regulatory authorities for this industry</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {companyData.regulatoryCompliance!.regulatoryBodies.map((body, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                            <Building2 className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{body}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Reviews & Ratings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {companyData.reviews.map((review, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="font-medium">{review.source}</div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{review.rating}</span>
                              <span className="text-gray-500">({review.count} reviews)</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={review.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="verification">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {companyData.verificationSources.map((source, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          {source.status === "verified" && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {source.status === "warning" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                          {source.status === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
                          <div className="flex-1">
                            <div className="font-medium">{source.name}</div>
                            <div className="text-sm text-gray-600">{source.details}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="industry">
                <Card>
                  <CardHeader>
                    <CardTitle>Industry-Specific Verification Links</CardTitle>
                    <CardDescription>
                      Specialized verification sources based on business type and industry detection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Detected Industry */}
                      {companyData && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Auto-Detected Industry</Badge>
                          </div>
                          <div className="font-medium capitalize mb-2">
                            {getIndustryFromBusinessType(companyData.name, companyData.type)
                              .replace(/([A-Z])/g, " $1")
                              .trim()}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {industrySpecificSources[
                              getIndustryFromBusinessType(
                                companyData.name,
                                companyData.type,
                              ) as keyof typeof industrySpecificSources
                            ]?.map((source) => (
                              <Button key={source} variant="outline" size="sm" className="justify-start text-xs bg-transparent">
                                <ExternalLink className="h-3 w-3 mr-2" />
                                {source}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* All Industries */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-lg">All Industry Categories</h4>

                        <div className="grid gap-4">
                          {Object.entries(industrySpecificSources).map(([industry, sources]) => (
                            <div key={industry} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Label className="font-medium capitalize text-base">
                                  {industry === "ecommerce"
                                    ? "E-commerce"
                                    : industry === "realestate"
                                      ? "Real Estate"
                                      : industry.replace(/([A-Z])/g, " $1").trim()}
                                </Label>
                                <Badge variant="outline" className="text-xs">
                                  {sources.length} sources
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {sources.map((source) => (
                                  <Button key={source} variant="ghost" size="sm" className="justify-start text-xs h-8">
                                    <ExternalLink className="h-3 w-3 mr-2" />
                                    {source}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
