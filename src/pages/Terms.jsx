import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import '../styles/Legal.css'

function Terms() {
    return (
        <div className="page">
            <div className="container py-8 legal-page">
                <Link to="/" className="legal-back">
                    <ArrowLeft size={18} /> Back
                </Link>

                <h1 className="legal-title">Terms &amp; Conditions</h1>
                <p className="legal-updated">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>

                <section className="legal-section">
                    <h2>1. Overview</h2>
                    <p>
                        Welcome to Fresh Squeeze ("we", "our", "us"). By using our website and services at freshsqueeze.in,
                        you agree to these Terms &amp; Conditions. Please read them carefully before placing an order or
                        subscribing.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>2. Services</h2>
                    <p>
                        Fresh Squeeze provides cold-pressed juice delivery on a one-time or subscription basis.
                        Availability, pricing, and menu items may change without prior notice.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>3. Orders &amp; Payments</h2>
                    <ul>
                        <li>All prices are listed in Indian Rupees (₹) and include applicable taxes.</li>
                        <li>We reserve the right to cancel orders due to stock or delivery constraints.</li>
                        <li>Payment is collected at the time of order or subscription confirmation.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>4. Subscriptions</h2>
                    <ul>
                        <li>Subscriptions auto-renew unless cancelled before the next billing cycle.</li>
                        <li>You can cancel your subscription at any time from the Dashboard.</li>
                        <li>Refunds for unused days will be processed within 5-7 business days.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>5. Delivery</h2>
                    <p>
                        We deliver within our serviceable areas. Delivery times are estimates and may vary
                        due to weather, traffic, or other factors beyond our control.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>6. Limitation of Liability</h2>
                    <p>
                        Fresh Squeeze is not liable for any indirect, incidental, or consequential damages
                        arising from the use of our services. Our total liability shall not exceed the
                        amount paid for the specific order in question.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>7. Changes to Terms</h2>
                    <p>
                        We may update these terms from time to time. Continued use of our services after
                        changes constitutes acceptance of the revised terms.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>8. Contact Us</h2>
                    <p>
                        For questions about these Terms, reach us at <strong>support@freshsqueeze.in</strong>.
                    </p>
                </section>
            </div>
        </div>
    )
}

export default Terms
