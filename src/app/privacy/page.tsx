'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Shield, Eye, Database, Lock, Mail, Settings, AlertCircle, Home, FileText } from 'lucide-react'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </div>

          {/* Privacy Content */}
          <div className="glass rounded-2xl p-8 md:p-12 border border-white/10">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/10">
                <Shield className="h-10 w-10 text-primary-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                Privacy Policy
              </h1>
              <p className="text-gray-400">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Eye className="h-6 w-6 text-primary-400" />
                  1. Information We Collect
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                </p>
                <div className="bg-white/5 rounded-xl p-6 mb-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Personal Information:</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Name and email address</li>
                    <li>• Account preferences and settings</li>
                    <li>• Watch history and favorites</li>
                    <li>• Communication preferences</li>
                  </ul>
                </div>
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Usage Information:</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Device information and browser type</li>
                    <li>• IP address and location data</li>
                    <li>• Pages visited and time spent</li>
                    <li>• Search queries and interactions</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Database className="h-6 w-6 text-primary-400" />
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use the information we collect to provide, maintain, and improve our services:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• To provide and maintain our service</li>
                  <li>• To notify you about changes to our service</li>
                  <li>• To allow you to participate in interactive features</li>
                  <li>• To provide customer support</li>
                  <li>• To gather analysis or valuable information</li>
                  <li>• To monitor the usage of our service</li>
                  <li>• To detect, prevent and address technical issues</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary-400" />
                  3. Information Security
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <div className="bg-success-500/10 border border-success-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-success-400 mb-3">Security Measures:</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Encryption of data in transit and at rest</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Access controls and authentication</li>
                    <li>• Secure data storage and backup</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Settings className="h-6 w-6 text-primary-400" />
                  4. Your Rights and Choices
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Access and update your personal information</li>
                  <li>• Delete your account and associated data</li>
                  <li>• Opt-out of marketing communications</li>
                  <li>• Request a copy of your data</li>
                  <li>• Object to certain processing activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Mail className="h-6 w-6 text-primary-400" />
                  5. Cookies and Tracking
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information.
                </p>
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Types of Cookies:</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Essential cookies (required for service functionality)</li>
                    <li>• Analytics cookies (help us understand usage)</li>
                    <li>• Preference cookies (remember your settings)</li>
                    <li>• Marketing cookies (personalized content)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-primary-400" />
                  6. Third-Party Services
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We may use third-party services to help us provide and improve our service. These services may have their own privacy policies.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  7. Data Retention
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  8. Children's Privacy
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  9. Changes to This Policy
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  10. Contact Us
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at privacy@animesenpai.app
                </p>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="mt-12 pt-8 border-t border-white/10">
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
                Questions? Contact us at <a href="mailto:privacy@animesenpai.app" className="text-primary-400 hover:text-primary-300 transition-colors">privacy@animesenpai.app</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
