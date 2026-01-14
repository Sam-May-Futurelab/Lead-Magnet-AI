import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export function PrivacyPolicyPage() {
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

                <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last updated: January 13, 2026</p>

                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
                        <p className="text-muted-foreground mb-4">
                            LeadMagnet AI ("we," "our," or "us") respects your privacy and is committed
                            to protecting your personal data. This privacy policy explains how we collect,
                            use, and safeguard your information when you use our mobile application.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>

                        <h3 className="text-lg font-medium mb-2">2.1 Account Information</h3>
                        <p className="text-muted-foreground mb-4">
                            When you create an account, we collect:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4">
                            <li>Email address</li>
                            <li>Name (if provided via social sign-in)</li>
                            <li>Profile photo (if provided via social sign-in)</li>
                        </ul>

                        <h3 className="text-lg font-medium mb-2">2.2 Content You Create</h3>
                        <p className="text-muted-foreground mb-4">
                            We store the lead magnets and content you create within the app, including:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4">
                            <li>Titles and descriptions</li>
                            <li>Generated content</li>
                            <li>Design preferences</li>
                        </ul>

                        <h3 className="text-lg font-medium mb-2">2.3 Usage Data</h3>
                        <p className="text-muted-foreground mb-4">
                            We automatically collect certain information about how you use the app:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4">
                            <li>Features used</li>
                            <li>Time spent in the app</li>
                            <li>Error logs and crash reports</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
                        <p className="text-muted-foreground mb-4">We use your information to:</p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4">
                            <li>Provide and maintain our service</li>
                            <li>Generate AI-powered content for your lead magnets</li>
                            <li>Process your subscription payments</li>
                            <li>Send you important updates about the service</li>
                            <li>Improve and optimize the app</li>
                            <li>Respond to your support requests</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">4. Data Storage and Security</h2>
                        <p className="text-muted-foreground mb-4">
                            Your data is stored securely using Google Firebase services. We implement
                            industry-standard security measures including:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4">
                            <li>Encryption in transit (HTTPS/TLS)</li>
                            <li>Encryption at rest</li>
                            <li>Secure authentication protocols</li>
                            <li>Regular security audits</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">5. Third-Party Services</h2>
                        <p className="text-muted-foreground mb-4">We use the following third-party services:</p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4">
                            <li><strong>Google Firebase</strong> - Authentication and data storage</li>
                            <li><strong>OpenAI</strong> - AI content generation</li>
                            <li><strong>Apple App Store</strong> - Payment processing</li>
                            <li><strong>RevenueCat</strong> - Subscription management</li>
                        </ul>
                        <p className="text-muted-foreground mb-4">
                            Each third-party service has its own privacy policy governing the use of your information.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
                        <p className="text-muted-foreground mb-4">You have the right to:</p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Export your data</li>
                            <li>Opt-out of marketing communications</li>
                        </ul>
                        <p className="text-muted-foreground mb-4">
                            To exercise these rights, contact us at hello@inkfluenceai.com.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
                        <p className="text-muted-foreground mb-4">
                            We retain your data for as long as your account is active. If you delete your
                            account, we will delete your personal data within 30 days, except where we are
                            required to retain it for legal purposes.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">8. Children's Privacy</h2>
                        <p className="text-muted-foreground mb-4">
                            Our service is not intended for children under 13 years of age. We do not
                            knowingly collect personal information from children under 13.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">9. Changes to This Policy</h2>
                        <p className="text-muted-foreground mb-4">
                            We may update this privacy policy from time to time. We will notify you of
                            any changes by posting the new policy on this page and updating the "Last
                            updated" date.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
                        <p className="text-muted-foreground mb-4">
                            If you have any questions about this Privacy Policy, please contact us at:
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
