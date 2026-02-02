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
  result?: any
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

// Update CompanyData interface to include compliance
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
}

export default function BusinessVerificationAgent() {
  const [companyName, setCompanyName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([])
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [showSettings, setShowSettings] = useState(false)

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

    // Update the verification steps to include compliance checking
    const steps: VerificationStep[] = [
      { id: "input-validation", name: "Validating Input Data", status: "pending" },
      { id: "business-type-check", name: "Checking Business Type", status: "pending" },
      { id: "companies-house", name: "Searching Companies House", status: "pending" },
      { id: "regulatory-compliance", name: "Checking Regulatory Compliance", status: "pending" },
      { id: "google-search", name: "Google Business Search", status: "pending" },
      { id: "maps-verification", name: "Address Verification via Maps", status: "pending" },
      { id: "reviews-analysis", name: "Analyzing Reviews & Ratings", status: "pending" },
      { id: "legitimacy-scoring", name: "Calculating Legitimacy Score", status: "pending" },
    ]

    setVerificationSteps(steps)

    // Simulate step-by-step processing
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      steps[i].status = "processing"
      setVerificationSteps([...steps])

      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Skip Companies House for sole traders
      if (steps[i].id === "companies-house" && businessType === "Sole Trader") {
        steps[i].status = "skipped"
        steps[i].result = "Skipped - Sole Trader business type"
      } else {
        steps[i].status = "completed"
      }

      setVerificationSteps([...steps])
    }

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

    // Update mockData generation to include compliance
    const detectedIndustry = getIndustryFromBusinessType(companyName, businessType)
    const complianceData = generateComplianceData(detectedIndustry)

    const mockData: CompanyData = {
      name: companyName,
      type: businessType,
      registrationNumber: businessType !== "Sole Trader" ? "12345678" : undefined,
      address: "123 Business Street, London, SW1A 1AA",
      phone: "+44 20 7123 4567",
      email: "info@" + companyName.toLowerCase().replace(/\s+/g, "") + ".co.uk",
      website: "https://www." + companyName.toLowerCase().replace(/\s+/g, "") + ".co.uk",
      description: `${companyName} is a ${businessType.toLowerCase()} operating in the UK market, providing professional services to customers.`,
      reviews: [
        { source: "Google Reviews", rating: 4.2, count: 127, link: "#" },
        { source: "Trustpilot", rating: 4.0, count: 89, link: "#" },
        { source: "Yelp", rating: 3.8, count: 45, link: "#" },
      ],
      legitimacyScore: Math.floor(Math.random() * 30) + 70, // 70-100
      riskFactors: ["Recent incorporation (less than 2 years)", "Limited online presence"],
      verificationSources: [
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
          <h1 className="text-4xl font-bold text-gray-900">Business Verification Agent</h1>
          <p className="text-lg text-gray-600">AI-powered business legitimacy verification and risk assessment</p>
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

        {/* Verification Process */}
        {verificationSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className={`h-5 w-5 ${isVerifying ? "animate-spin" : ""}`} />
                Verification Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verificationSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <div className="font-medium">{step.name}</div>
                      {step.result && <div className="text-sm text-gray-600">{step.result}</div>}
                    </div>
                    {step.status === "processing" && <div className="text-sm text-blue-600">Processing...</div>}
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
            <Tabs defaultValue="details" className="space-y-4">
              {/* Update TabsList to include compliance tab */}
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="details">Company Details</TabsTrigger>
                <TabsTrigger value="compliance">Regulatory Compliance</TabsTrigger>
                <TabsTrigger value="reviews">Reviews & Ratings</TabsTrigger>
                <TabsTrigger value="verification">Verification Sources</TabsTrigger>
                <TabsTrigger value="industry">Industry Links</TabsTrigger>
              </TabsList>

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
                              <Button key={source} variant="outline" size="sm" className="justify-start text-xs">
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
