import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import '../styles/Legal.css'

function Privacy() {
    return (
        <div className="page">
            <div className="container py-8 legal-page">
                <Link to="/" className="legal-back">
                    <ArrowLeft size={18} /> Back
                </Link>

                <h1 className="legal-title">Privacy Policy</h1>
                <p className="legal-updated">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>

                <section className="legal-section">
                    <h2>1. Information We Collect</h2>
                    <p>When you use Fresh Squeeze, we may collect:</p>
                    <ul>
                        <li><strong>Account info:</strong> Name, phone number, and delivery address.</li>
                        <li><strong>Order data:</strong> Items ordered, delivery preferences, and payment details.</li>
                        <li><strong>Device info:</strong> Browser type, OS, and IP address for analytics.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>2. How We Use Your Information</h2>
                    <ul>
                        <li>To process and deliver your orders and subscriptions.</li>
                        <li>To send order confirmations and delivery updates via SMS.</li>
                        <li>To improve our products, services, and user experience.</li>
                        <li>To comply with legal obligations.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>3. Data Sharing</h2>
                    <p>
                        We do not sell your personal information. We may share data with:
                    </p>
                    <ul>
                        <li>Delivery partners to fulfill your orders.</li>
                        <li>Payment processors to handle transactions securely.</li>
                        <li>Analytics providers (anonymized data only).</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>4. Data Security</h2>
                    <p>
                        We use industry-standard encryption (TLS/SSL) and secure storage practices
                        to protect your data. Access to personal information is restricted to
                        authorized personnel only.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>5. Your Rights</h2>
                    <ul>
                        <li>Access and download your personal data.</li>
                        <li>Request correction of inaccurate information.</li>
                        <li>Request deletion of your account and associated data.</li>
                        <li>Opt out of promotional communications.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>6. Cookies</h2>
                    <p>
                        We use essential cookies for authentication and session management.
                        No third-party tracking cookies are used.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>7. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy periodically. We will notify you of
                        significant changes via the app or email.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>8. Contact Us</h2>
                    <p>
                        For privacy-related inquiries, email us at <strong>privacy@freshsqueeze.in</strong>.
                    </p>
                </section>
            </div>
        </div>
    )
}

export default Privacy
