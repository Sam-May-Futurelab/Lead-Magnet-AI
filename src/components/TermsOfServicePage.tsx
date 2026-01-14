import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export function TermsOfServicePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back
                </Button>

                <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
                <p className="text-muted-foreground mb-8">Last updated: January 13, 2026</p>

                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground mb-4">
                            By accessing or using LeadMagnet AI ("the App"), you agree to be bound by
                            these Terms of Service. If you do not agree to these terms, do not use the App.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
                        <p className="text-muted-foreground mb-4">
                            LeadMagnet AI is an AI-powered application that helps users create lead magnets
                            including ebooks, checklists, guides, and other marketing materials. The service
                            uses artificial intelligence to generate content based on your inputs.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">3. Account Registration</h2>
                        <p className="text-muted-foreground mb-4">
                            To use certain features of the App, you must create an account. You agree to:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Accept responsibility for all activities under your account</li>
                            <li>Notify us immediately of any unauthorized use</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">4. Subscription and Payments</h2>

                        <h3 className="text-lg font-medium mb-2">4.1 Free Plan</h3>
                        <p className="text-muted-foreground mb-4">
                            The free plan allows you to create 1 lead magnet with basic features.
                            Exports will include a watermark.
                        </p>

                        <h3 className="text-lg font-medium mb-2">4.2 Pro Plan</h3>
                        <p className="text-muted-foreground mb-4">
                            The Pro plan is a monthly subscription at $9.99/month (or equivalent in your
                            local currency). It includes 10 lead magnets, watermark-free exports, and
                            premium features.
                        </p>

                        <h3 className="text-lg font-medium mb-2">4.3 Unlimited Plan</h3>
                        <p className="text-muted-foreground mb-4">
                            The Unlimited plan is a one-time purchase of $29.99 providing lifetime access
                            to all features with unlimited lead magnets.
                        </p>

                        <h3 className="text-lg font-medium mb-2">4.4 Payment Processing</h3>
                        <p className="text-muted-foreground mb-4">
                            All payments are processed through Apple's App Store. Subscriptions
                            automatically renew unless cancelled at least 24 hours before the end of
                            the current period.
                        </p>

                        <h3 className="text-lg font-medium mb-2">4.5 Refunds</h3>
                        <p className="text-muted-foreground mb-4">
                            Refund requests must be submitted through Apple's App Store. We do not
                            process refunds directly.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">5. User Content</h2>

                        <h3 className="text-lg font-medium mb-2">5.1 Ownership</h3>
                        <p className="text-muted-foreground mb-4">
                            You retain ownership of the content you create using the App. By using our
                            service, you grant us a limited license to store and process your content
                            solely to provide the service.
                        </p>

                        <h3 className="text-lg font-medium mb-2">5.2 AI-Generated Content</h3>
                        <p className="text-muted-foreground mb-4">
                            Content generated by our AI is provided "as is." You are responsible for
                            reviewing and editing AI-generated content before use. We do not guarantee
                            the accuracy, completeness, or suitability of AI-generated content.
                        </p>

                        <h3 className="text-lg font-medium mb-2">5.3 Prohibited Content</h3>
                        <p className="text-muted-foreground mb-4">You agree not to create content that:</p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4">
                            <li>Is illegal, harmful, or fraudulent</li>
                            <li>Infringes on intellectual property rights</li>
                            <li>Contains hate speech or promotes violence</li>
                            <li>Is sexually explicit or pornographic</li>
                            <li>Violates any applicable laws or regulations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
                        <p className="text-muted-foreground mb-4">
                            The App, including its design, features, and code, is owned by LeadMagnet AI
                            and protected by intellectual property laws. You may not copy, modify,
                            distribute, or reverse engineer any part of the App.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
                        <p className="text-muted-foreground mb-4">
                            THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
                            OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE,
                            OR SECURE. USE OF THE APP IS AT YOUR OWN RISK.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
                        <p className="text-muted-foreground mb-4">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY
                            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING
                            FROM YOUR USE OF THE APP. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT
                            YOU PAID US IN THE PAST 12 MONTHS.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">9. Termination</h2>
                        <p className="text-muted-foreground mb-4">
                            We may terminate or suspend your account at any time for violation of these
                            terms. Upon termination, your right to use the App will immediately cease.
                            You may also delete your account at any time through the App settings.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">10. Changes to Terms</h2>
                        <p className="text-muted-foreground mb-4">
                            We reserve the right to modify these terms at any time. We will notify you
                            of significant changes through the App or via email. Continued use of the
                            App after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">11. Governing Law</h2>
                        <p className="text-muted-foreground mb-4">
                            These terms shall be governed by and construed in accordance with the laws
                            of the United States, without regard to conflict of law principles.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">12. Contact Information</h2>
                        <p className="text-muted-foreground mb-4">
                            For questions about these Terms of Service, please contact us at:
                        </p>
                        <p className="text-muted-foreground mb-4">
                            <a href="mailto:hello@inkfluenceai.com" className="text-primary hover:underline">hello@inkfluenceai.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
