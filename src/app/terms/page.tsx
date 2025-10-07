'use client'

import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { ArrowLeft, FileText, Shield, Users, AlertTriangle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              href="/auth/signup"
              className="inline-flex items-center text-gray-300 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign Up
            </Link>
          </div>

          {/* Terms Content */}
          <div className="glass rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-primary-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Terms of Service
              </h1>
              <p className="text-gray-300 text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary-400" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing and using AnimeSenpai ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary-400" />
                  2. User Accounts
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• You must be at least 13 years old to use this service</li>
                  <li>• You are responsible for maintaining the confidentiality of your account</li>
                  <li>• You must notify us immediately of any unauthorized use of your account</li>
                  <li>• You may not use another person's account without permission</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-primary-400" />
                  3. Prohibited Uses
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You may not use our service:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>• To submit false or misleading information</li>
                  <li>• To upload or transmit viruses or any other type of malicious code</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  4. Content and Intellectual Property
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The service and its original content, features, and functionality are and will remain the exclusive property of AnimeSenpai and its licensors. The service is protected by copyright, trademark, and other laws.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We respect the intellectual property rights of others and expect our users to do the same. If you believe that your intellectual property rights have been violated, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  5. Privacy Policy
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  6. Termination
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  7. Disclaimer
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  The information on this service is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms relating to our service and the use of this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  8. Governing Law
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  These Terms shall be interpreted and governed by the laws of the jurisdiction in which AnimeSenpai operates, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  9. Changes to Terms
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  10. Contact Information
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at legal@animesenpai.app
                </p>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = '/auth/signup'}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-primary-500/25"
                >
                  Back to Sign Up
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/privacy'}
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-3"
                >
                  View Privacy Policy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
