'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import {
  ArrowLeft,
  Shield,
  Eye,
  Database,
  Lock,
  Settings,
  AlertCircle,
  Home,
  FileText,
  Cookie,
  Users,
  Globe,
  DollarSign,
  RefreshCw,
  MessageCircle,
  Building,
  Menu,
  CheckCircle,
} from 'lucide-react'

export default function PrivacyPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('who-we-are')
  const [showMobileNav, setShowMobileNav] = useState(false)

  const sections = [
    { id: 'who-we-are', title: 'Who We Are', icon: Building },
    { id: 'information', title: 'Information We Collect', icon: Eye },
    { id: 'usage', title: 'How We Use Your Info', icon: Database },
    { id: 'legal-basis', title: 'Legal Basis (EU)', icon: CheckCircle },
    { id: 'cookies', title: 'Cookies & Tracking', icon: Cookie },
    { id: 'security', title: 'Data Storage & Security', icon: Lock },
    { id: 'retention', title: 'Data Retention', icon: Settings },
    { id: 'rights', title: 'Your Rights (GDPR)', icon: Shield },
    { id: 'sharing', title: 'Data Sharing', icon: Users },
    { id: 'children', title: "Children's Privacy", icon: AlertCircle },
    { id: 'transfers', title: 'International Transfers', icon: Globe },
    { id: 'payments', title: 'Premium Features', icon: DollarSign },
    { id: 'changes', title: 'Policy Changes', icon: RefreshCw },
    { id: 'contact', title: 'Contact Us', icon: MessageCircle },
  ]

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
      setActiveSection(id)
      setShowMobileNav(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150

      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Back Button - Fixed */}
          <div className="fixed top-20 left-4 z-20">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm group shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </div>

          {/* Mobile TOC Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                Table of Contents
              </span>
              <span className="text-sm text-gray-400">
                {sections.find((s) => s.id === activeSection)?.title}
              </span>
            </button>

            {showMobileNav && (
              <div className="mt-2 bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                {sections.map((section, index) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        activeSection === section.id
                          ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xs text-gray-500 w-4">{index + 1}</span>
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{section.title}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Fixed Sidebar - Desktop Only */}
          <aside className="hidden lg:block">
            <div className="fixed top-32 left-8 w-64 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
              <div className="glass rounded-xl p-4 border border-white/10">
                <h2 className="text-sm font-semibold text-white mb-4 px-2">Table of Contents</h2>
                <nav className="space-y-1">
                  {sections.map((section, index) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                          activeSection === section.id
                            ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="text-xs text-gray-500 w-4">{index + 1}</span>
                        <Icon
                          className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                            activeSection === section.id ? 'text-primary-400' : ''
                          }`}
                        />
                        <span className="flex-1 text-left truncate">{section.title}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Quick Actions */}
              <div className="glass rounded-xl p-4 border border-white/10 space-y-2">
                <Link
                  href="/terms"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </Link>
                <Link
                  href="/"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content with left margin for sidebar */}
          <div className="lg:ml-72">
            <div className="glass rounded-2xl p-6 md:p-10 border border-white/10">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/10">
                  <Shield className="h-10 w-10 text-primary-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                Privacy Policy
              </h1>
                <p className="text-gray-400 mb-6">Last updated: October 2025</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-lg text-sm text-primary-300">
                  <Shield className="h-4 w-4" />
                  Your privacy matters to us - GDPR compliant
                </div>
            </div>

            {/* Content */}
              <div className="space-y-8">
                {/* Section 1: Who We Are */}
                <div
                  id="who-we-are"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <Building className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">1. Who We Are</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        AnimeSenpai is an anime community and recommendation platform operated by an
                        individual developer based in Denmark.
                      </p>
                      <div className="bg-white/5 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-300">
                          <strong className="text-white">Operator:</strong> AnimeSenpai (operated by
                          an individual developer)
                        </p>
                        <p className="text-sm text-gray-300">
                          <strong className="text-white">Contact Email:</strong>{' '}
                          <a
                            href="mailto:contact@animesenpai.app"
                            className="text-primary-400 hover:text-primary-300"
                          >
                            contact@animesenpai.app
                          </a>
                        </p>
                        <p className="text-sm text-gray-300">
                          <strong className="text-white">Website:</strong>{' '}
                          <a
                            href="https://animesenpai.app"
                            className="text-primary-400 hover:text-primary-300"
                          >
                            https://animesenpai.app
                          </a>
                        </p>
                      </div>
                      <p className="text-gray-300 leading-relaxed mt-4">
                        We process your data in accordance with the{' '}
                        <strong className="text-white">
                          General Data Protection Regulation (GDPR)
                        </strong>{' '}
                        and applicable Danish data protection laws.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Information We Collect */}
                <div
                  id="information"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">
                        2. Information We Collect
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                        We collect and process information to provide, improve, and secure our
                        services. This includes:
                      </p>

                      <h3 className="text-base font-semibold text-white mb-2">
                        Account Information
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">Email address</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">Username / display name</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">Securely hashed password</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">Avatar or profile image</p>
                        </div>
                      </div>

                      <h3 className="text-base font-semibold text-white mb-2">
                        User Preferences & Activity
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            Anime preferences (favorites, ratings, recommendations)
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            Usage analytics (such as which anime pages or features are used)
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            Cookies (for login sessions and analytics)
                          </p>
                        </div>
                      </div>

                      <h3 className="text-base font-semibold text-white mb-2">
                        User-Generated Content
                      </h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Messages, posts, and comments you create or share on AnimeSenpai
                      </p>

                      <h3 className="text-base font-semibold text-white mb-2">
                        Technical Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">Device type and browser</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            IP address (used for security and system integrity)
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            Logs generated by our hosting provider (Vercel)
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-300 leading-relaxed mt-4">
                        We only collect information that is necessary for the operation and
                        improvement of the Service.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: How We Use Your Information */}
                <div
                  id="usage"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <Database className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">
                        3. How We Use Your Information
                      </h2>
                      <p className="text-gray-300 leading-relaxed mb-3">
                        We use your data for the following purposes:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">To create and manage your account</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            To provide personalized anime recommendations
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            To enable community features (e.g., friends, follows, posts, comments)
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            To communicate with you about your account or updates
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            To monitor and improve performance and security
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            To understand how users interact with our platform (analytics)
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">To comply with legal obligations</p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed mt-4">
                        We do <strong className="text-white">not</strong> sell or rent your personal
                        data to third parties.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Legal Basis for Processing */}
                <div
                  id="legal-basis"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">
                        4. Legal Basis for Processing (EU Users)
                      </h2>
                      <p className="text-gray-300 leading-relaxed mb-3">
                        Under GDPR, we process personal data based on the following legal grounds:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">Performance of a contract:</strong> to
                            provide you with the Service and maintain your account
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">Legitimate interests:</strong> to improve
                            our platform, ensure security, and prevent misuse
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">Consent:</strong> for non-essential
                            cookies or optional analytics (if applicable)
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">Legal obligations:</strong> to comply
                            with applicable laws and regulations
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5: Cookies and Tracking Technologies */}
                <div
                  id="cookies"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <Cookie className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">
                        5. Cookies and Tracking Technologies
                </h2>
                      <p className="text-gray-300 leading-relaxed mb-3">
                        AnimeSenpai uses cookies and similar technologies to:
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">Keep you logged in</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">Remember preferences</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            Analyze site traffic and usage patterns
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        You can control or delete cookies through your browser settings. If you
                        disable cookies, some features of AnimeSenpai may not function properly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 6: Data Storage and Security */}
                <div
                  id="security"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">
                        6. Data Storage and Security
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                        Your data is securely stored in a{' '}
                        <strong className="text-white">Prisma-managed database</strong> hosted in{' '}
                        <strong className="text-white">Germany (EU)</strong>. Hosting and
                        infrastructure services are provided by{' '}
                        <strong className="text-white">Vercel</strong>, which adheres to high
                        security and GDPR standards.
                      </p>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        We take appropriate technical and organizational measures to protect your
                        personal data against unauthorized access, loss, or misuse.
                      </p>
                      <p className="text-gray-300 leading-relaxed text-sm">
                        However, no system is completely secure, and we cannot guarantee absolute
                        security.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 7: Data Retention */}
                <div
                  id="retention"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <Settings className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">7. Data Retention</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                        We retain your data only as long as necessary to provide the Service or
                        comply with legal obligations. When your account is deleted, your personal
                        data and content are permanently removed or anonymized, except where
                        retention is required by law.
                      </p>
                      <p className="text-gray-300 leading-relaxed">
                        Backups may retain deleted data for a limited time before being
                        automatically purged.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 8: Your Rights (Under GDPR) */}
                <div
                  id="rights"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">
                        8. Your Rights (Under GDPR)
                </h2>
                      <p className="text-gray-300 leading-relaxed mb-3">
                        If you reside in the European Union, you have the following rights:
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">Right to access:</strong> Request a copy
                            of the data we hold about you
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">Right to rectification:</strong> Request
                            correction of inaccurate data
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">
                              Right to erasure ("Right to be forgotten"):
                            </strong>{' '}
                            Request deletion of your account and data
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">Right to data portability:</strong>{' '}
                            Request an export of your data in a portable format
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">
                              Right to restriction or objection:
                            </strong>{' '}
                            Limit or object to how your data is processed
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">Right to withdraw consent:</strong>{' '}
                            Withdraw consent for optional data processing (like analytics or
                            cookies)
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        To exercise your rights, contact us at{' '}
                        <a
                          href="mailto:contact@animesenpai.app"
                          className="text-primary-400 hover:text-primary-300"
                        >
                          contact@animesenpai.app
                        </a>
                        . We may need to verify your identity before processing requests.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 9: Data Sharing and Third-Party Services */}
                <div
                  id="sharing"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">
                        9. Data Sharing and Third-Party Services
                </h2>
                      <p className="text-gray-300 leading-relaxed mb-3">
                        We only share information with third parties that help us operate the
                        Service. These include:
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">Vercel (Hosting & Analytics):</strong> to
                            host and analyze the website's performance
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">
                            <strong className="text-white">Prisma (Database Provider):</strong> to
                            securely manage and store data
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        All third-party partners comply with GDPR and use appropriate safeguards to
                        protect user data. We do not share data for advertising or marketing
                        purposes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 10: Children's Privacy */}
                <div
                  id="children"
                  className="scroll-mt-24 bg-warning-500/5 border border-warning-500/20 rounded-xl p-6 hover:border-warning-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-warning-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-warning-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">10. Children's Privacy</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                        AnimeSenpai is not directed toward children under 13. If you are under 13,
                        you may not create an account or provide personal information.
                </p>
                <p className="text-gray-300 leading-relaxed">
                        If we discover that we have collected data from a child under 13 without
                        consent, we will delete it promptly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 11: International Data Transfers */}
                <div
                  id="transfers"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">
                        11. International Data Transfers
                </h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        All personal data is stored in{' '}
                        <strong className="text-white">Germany (EU)</strong> and processed under
                        GDPR standards.
                      </p>
                <p className="text-gray-300 leading-relaxed">
                        If any data is transferred outside the European Economic Area (EEA) in the
                        future, we will ensure adequate safeguards are in place (e.g., EU Standard
                        Contractual Clauses).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 12: Future Premium Features and Payments */}
                <div
                  id="payments"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">
                        12. Future Premium Features and Payments
                </h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        If AnimeSenpai introduces premium or paid features, payment processing will
                        be handled by third-party payment providers. We will never store your
                        payment details on our servers.
                      </p>
                <p className="text-gray-300 leading-relaxed">
                        Any future updates to payment-related data handling will be reflected in
                        this Privacy Policy.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 13: Changes to This Privacy Policy */}
                <div
                  id="changes"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">
                        13. Changes to This Privacy Policy
                </h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        We may update this Privacy Policy periodically to reflect new features,
                        laws, or operational changes. If we make significant updates, we will notify
                        users through the website or by email.
                      </p>
                <p className="text-gray-300 leading-relaxed">
                        The date at the top indicates the latest revision.
                </p>
                    </div>
                  </div>
            </div>

                {/* Section 14: Contact Us */}
                <div
                  id="contact"
                  className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3">14. Contact Us</h2>
                      <p className="text-gray-300 leading-relaxed mb-3">
                        If you have any questions, concerns, or privacy requests, please contact us:
                      </p>
                      <a
                        href="mailto:contact@animesenpai.app"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-lg text-primary-300 hover:bg-primary-500/20 hover:border-primary-500/30 transition-all text-sm font-medium"
                      >
                        <MessageCircle className="h-4 w-4" />
                        contact@animesenpai.app
                      </a>
                    </div>
                  </div>
                </div>

                {/* Thank You Message */}
                <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-xl p-6 text-center">
                  <p className="text-white font-medium mb-2">
                    Thank you for being part of the AnimeSenpai community!
                  </p>
                  <p className="text-gray-300 text-sm">
                    We respect your privacy and are committed to keeping your data safe and secure.
                  </p>
                </div>
              </div>

              {/* Footer Actions - Mobile Only */}
              <div className="lg:hidden mt-12 pt-8 border-t border-white/10">
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5 hover:border-white/20 px-6 py-2.5 gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Home
                </Button>
                  </Link>
                  <Link href="/terms">
                <Button
                  variant="outline"
                      className="border-white/10 text-white hover:bg-white/5 hover:border-white/20 px-6 py-2.5 gap-2"
                >
                      <FileText className="h-4 w-4" />
                      Terms of Service
                </Button>
                  </Link>
                </div>
                <p className="text-center text-gray-500 text-sm mt-6">
                  Questions? Contact us at{' '}
                  <a
                    href="mailto:contact@animesenpai.app"
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    contact@animesenpai.app
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
