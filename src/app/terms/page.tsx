'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, Home, Copyright, Scale, XCircle, RefreshCw, MessageCircle, Lock, DollarSign, Server, Gavel, Menu } from 'lucide-react'

export default function TermsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('overview')
  const [showMobileNav, setShowMobileNav] = useState(false)

  const sections = [
    { id: 'overview', title: 'Overview', icon: FileText },
    { id: 'eligibility', title: 'Eligibility', icon: Shield },
    { id: 'accounts', title: 'Accounts & Security', icon: Lock },
    { id: 'conduct', title: 'Community Conduct', icon: Users },
    { id: 'content', title: 'User Content & IP', icon: Copyright },
    { id: 'privacy', title: 'Privacy & Data', icon: Shield },
    { id: 'premium', title: 'Premium Features', icon: DollarSign },
    { id: 'service', title: 'Service Availability', icon: Server },
    { id: 'termination', title: 'Termination', icon: XCircle },
    { id: 'disclaimers', title: 'Disclaimers', icon: AlertTriangle },
    { id: 'liability', title: 'Limitation of Liability', icon: Gavel },
    { id: 'law', title: 'Governing Law', icon: Scale },
    { id: 'changes', title: 'Changes to Terms', icon: RefreshCw },
    { id: 'contact', title: 'Contact', icon: MessageCircle },
  ]

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
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
                {sections.find(s => s.id === activeSection)?.title}
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
                        <Icon className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                          activeSection === section.id ? 'text-primary-400' : ''
                        }`} />
                        <span className="flex-1 text-left truncate">{section.title}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Quick Actions */}
              <div className="glass rounded-xl p-4 border border-white/10 space-y-2">
                <Link href="/privacy" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </Link>
                <Link href="/" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
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
                <FileText className="h-10 w-10 text-primary-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                Terms of Service
              </h1>
              <p className="text-gray-400 mb-6">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-lg text-sm text-primary-300">
                <Shield className="h-4 w-4" />
                Your rights and responsibilities when using AnimeSenpai
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
              {/* Section 1: Overview */}
              <div id="overview" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      1. Overview
                </h2>
                <p className="text-gray-300 leading-relaxed">
                      AnimeSenpai is a community-driven platform for discovering, discussing, and recommending anime. You can browse anime recommendations, follow other users, and participate in community features such as posts, comments, and chats (some of which may be introduced in future updates).
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Eligibility */}
              <div id="eligibility" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      2. Eligibility
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                      You must be at least <strong className="text-white">13 years old</strong> to use AnimeSenpai. If you are under the age of 18, you must have the consent of a parent or guardian to use the Service.
                    </p>
                    <p className="text-gray-300 leading-relaxed mb-3">By using AnimeSenpai, you confirm that:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">You can form a legally binding agreement in your country of residence</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">You are not prohibited from using the Service under any applicable laws</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Accounts and Security */}
              <div id="accounts" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      3. Accounts and Security
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      To access certain features, you must create an AnimeSenpai account. You agree to:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">Provide accurate, current, and complete information during registration</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">Keep your login credentials secure and confidential</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">Be responsible for any activity that occurs under your account</p>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed mt-4">
                      We reserve the right to suspend or terminate accounts that violate these Terms or are used in ways that harm the community.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Community Conduct */}
              <div id="conduct" className="scroll-mt-24 bg-warning-500/5 border border-warning-500/20 rounded-xl p-6 hover:border-warning-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-warning-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-warning-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      4. Community Conduct
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                      AnimeSenpai is built around respect, positivity, and a shared love for anime. To maintain a safe environment, you agree not to:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-warning-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300 text-sm">Post or share any content that is illegal, discriminatory, explicit, or otherwise harmful</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-warning-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300 text-sm">Harass, impersonate, or threaten others</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-warning-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300 text-sm">Use AnimeSenpai for commercial spam or self-promotion</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-warning-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300 text-sm">Interfere with the security, performance, or integrity of the platform</p>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed mt-4">
                      We may remove or moderate content that violates these guidelines at our discretion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 5: User Content and Intellectual Property */}
              <div id="content" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <Copyright className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      5. User Content and Intellectual Property
                </h2>
                    <h3 className="text-base font-semibold text-white mb-2">Your Rights</h3>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      You own the content you create or share on AnimeSenpai ("User Content"). By posting or uploading content, you grant AnimeSenpai a <strong className="text-white">non-exclusive, worldwide, royalty-free license</strong> to host, display, and distribute your content as necessary to operate and promote the Service.
                    </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                      You can delete your content at any time. However, copies of your content may remain in backup systems for a limited period.
                    </p>
                    <h3 className="text-base font-semibold text-white mb-2">Our Rights</h3>
                    <p className="text-gray-300 leading-relaxed">
                      All other materials on AnimeSenpai (including design, code, logo, and branding) are owned or licensed by AnimeSenpai and protected under applicable copyright and trademark laws.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 6: Privacy and Data */}
              <div id="privacy" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      6. Privacy and Data
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      AnimeSenpai collects limited user data such as account information, preferences, and analytics to operate and improve the Service.
                    </p>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      By using AnimeSenpai, you consent to our data collection and processing practices as described in our Privacy Policy.
                    </p>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      We do not sell or rent personal data to third parties.
                    </p>
                    <Link href="/privacy" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                      View Privacy Policy
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Section 7: Premium Features and Payments */}
              <div id="premium" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      7. Premium Features and Payments
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      AnimeSenpai is currently <strong className="text-white">free to use</strong>. In the future, we may introduce optional premium features or support options to help maintain and improve the Service.
                </p>
                <p className="text-gray-300 leading-relaxed">
                      If we introduce paid services, we will clearly explain the pricing, billing, and refund policies at that time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 8: Service Availability and Modifications */}
              <div id="service" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <Server className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      8. Service Availability and Modifications
                </h2>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      We are continuously improving AnimeSenpai. We may update, change, or temporarily suspend parts of the Service from time to time.
                    </p>
                <p className="text-gray-300 leading-relaxed">
                      We are not liable for any downtime, loss of data, or other issues resulting from maintenance or updates — though we'll always aim to keep the community informed of major changes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 9: Termination */}
              <div id="termination" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      9. Termination
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      You may stop using AnimeSenpai at any time by deleting your account.
                    </p>
                    <p className="text-gray-300 leading-relaxed mb-3">We may suspend or terminate your account if:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">You violate these Terms or any applicable laws</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">Your use harms other users or the platform</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">We are required to do so by law or regulation</p>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed mt-4">
                      Upon termination, you lose access to your account and its content. Some obligations (like intellectual property rights and limitations of liability) will continue to apply even after termination.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 10: Disclaimers */}
              <div id="disclaimers" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      10. Disclaimers
                </h2>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      AnimeSenpai is provided <strong className="text-white">"as is"</strong> without warranties of any kind, express or implied. We do not guarantee uninterrupted service, accuracy of recommendations, or the availability of any specific features.
                    </p>
                <p className="text-gray-300 leading-relaxed">
                      You use AnimeSenpai at your own risk.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 11: Limitation of Liability */}
              <div id="liability" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <Gavel className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      11. Limitation of Liability
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      To the maximum extent permitted by law, AnimeSenpai (and its individual operator) will not be liable for:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">Any indirect, incidental, or consequential damages arising from your use of the Service</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">Loss of data, reputation, or profits</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">Content posted by other users</p>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed mt-3 text-sm">
                      Some jurisdictions do not allow such limitations, so parts of this section may not apply to you.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 12: Governing Law */}
              <div id="law" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <Scale className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      12. Governing Law
                </h2>
                <p className="text-gray-300 leading-relaxed">
                      These Terms are governed by the laws of <strong className="text-white">Denmark</strong>, without regard to conflict-of-law principles. You agree to submit to the exclusive jurisdiction of the courts located in Denmark for any dispute arising under these Terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 13: Changes to Terms */}
              <div id="changes" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      13. Changes to These Terms
                </h2>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      We may update these Terms periodically to reflect changes in our features or legal obligations. When we make significant updates, we will post a notice on our website or notify you via your account.
                    </p>
                <p className="text-gray-300 leading-relaxed">
                      The continued use of AnimeSenpai after changes means you accept the revised Terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 14: Contact */}
              <div id="contact" className="scroll-mt-24 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      14. Contact
                </h2>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      If you have any questions about these Terms of Service, please contact:
                    </p>
                    <a href="mailto:legal@animesenpai.app" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-lg text-primary-300 hover:bg-primary-500/20 hover:border-primary-500/30 transition-all text-sm font-medium">
                      <MessageCircle className="h-4 w-4" />
                      legal@animesenpai.app
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
                  Together, we're building a respectful, passionate, and creative space for anime fans around the world.
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
                <Link href="/privacy">
                <Button
                  variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 hover:border-white/20 px-6 py-2.5 gap-2"
                >
                    <Shield className="h-4 w-4" />
                    Privacy Policy
                </Button>
                </Link>
              </div>
              <p className="text-center text-gray-500 text-sm mt-6">
                Questions? Contact us at <a href="mailto:contact@animesenpai.app" className="text-primary-400 hover:text-primary-300 transition-colors">legal@animesenpai.app</a>
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}