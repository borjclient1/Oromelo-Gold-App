import React from "react";
import { useTheme } from "../hooks/useTheme";

function Privacy() {
  const { darkMode } = useTheme();
  const privacyRef = React.useRef(null);

  // Scroll to top when the component mounts
  React.useEffect(() => {
    if (privacyRef.current) {
      privacyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div
      ref={privacyRef}
      className={`min-h-screen pt-20 pb-12 ${
        darkMode ? "bg-dark-surface text-gray-200" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`rounded-lg shadow-lg overflow-hidden ${
            darkMode ? "bg-dark-surface-2" : "bg-white"
          }`}
        >
          {/* Header */}
          <div
            className={`px-6 py-8 border-b ${
              darkMode ? "border-gray-700 bg-dark-surface-3" : "border-gray-200"
            }`}
          >
            <h1
              className={`text-3xl font-bold ${
                darkMode ? "text-gold" : "text-gray-900"
              }`}
            >
              Privacy Policy
            </h1>
            <p
              className={`mt-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Last updated: May 1, 2025
            </p>
          </div>

          {/* Privacy Content */}
          <div className="px-6 py-8">
            <div className="space-y-8">
              <div>
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  Introduction
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  At OroMelo, we respect your privacy and are committed to
                  protecting your personal data. This Privacy Policy explains
                  how we collect, use, and safeguard your information when you
                  use our gold pawn and selling platform.
                </p>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  Information We Collect
                </h2>
                <div
                  className={`mt-3 space-y-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <p>We may collect the following types of information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Personal Information:</strong> Name, email
                      address, phone number, and identification details
                      necessary for pawn transactions.
                    </li>
                    <li>
                      <strong>Transaction Information:</strong> Details about
                      your gold items, pawn requests, sell requests, and
                      transaction history.
                    </li>
                    <li>
                      <strong>Payment Information:</strong> We store only the
                      minimum payment information required to process
                      transactions.
                    </li>
                    <li>
                      <strong>Usage Data:</strong> Information about how you
                      interact with our platform, including device information
                      and browsing activity.
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  How We Use Your Information
                </h2>
                <div
                  className={`mt-3 space-y-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <p>We use your information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      To facilitate and manage pawn and sell transactions of
                      gold items
                    </li>
                    <li>
                      To verify your identity and maintain security of
                      transactions
                    </li>
                    <li>
                      To communicate with you about your account and
                      transactions
                    </li>
                    <li>
                      To provide customer support and respond to your inquiries
                    </li>
                    <li>
                      To improve our platform and develop new features based on
                      user feedback
                    </li>
                    <li>
                      To comply with legal obligations and prevent fraudulent
                      activity
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  Data Security
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  We implement appropriate security measures to protect your
                  personal information from unauthorized access, alteration,
                  disclosure, or destruction. This includes encryption, secure
                  storage, and regular security assessments. While we take all
                  reasonable steps to protect your data, no method of
                  transmission over the internet is 100% secure.
                </p>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  Data Retention
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  We retain your personal information only for as long as
                  necessary to fulfill the purposes for which it was collected,
                  including legal, accounting, or reporting requirements.
                  Transaction records are maintained for at least 7 years to
                  comply with financial regulations.
                </p>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  Your Rights
                </h2>
                <div
                  className={`mt-3 space-y-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <p>
                    Depending on your location, you may have the following
                    rights regarding your personal information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access to your personal data</li>
                    <li>Correction of inaccurate data</li>
                    <li>
                      Deletion of your data (subject to legal requirements)
                    </li>
                    <li>Restriction of processing</li>
                    <li>Data portability</li>
                    <li>Objection to processing</li>
                  </ul>
                  <p>
                    To exercise any of these rights, please contact us at{" "}
                    <a
                      href="mailto:admin@oromelo.ph"
                      className="text-gold hover:underline"
                    >
                      admin@oromelo.ph
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  Cookies and Similar Technologies
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  We use cookies and similar tracking technologies to enhance
                  your experience on our platform. These technologies help us
                  understand how you use our services, remember your
                  preferences, and improve our platform. You can manage your
                  cookie preferences through your browser settings.
                </p>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  Third-Party Services
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Our platform may use third-party services for various
                  functions, including payment processing, authentication, and
                  analytics. These services have their own privacy policies, and
                  we recommend reviewing them to understand how they handle your
                  information.
                </p>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  Changes to This Privacy Policy
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  We may update this Privacy Policy periodically to reflect
                  changes in our practices or legal requirements. We will notify
                  you of any significant changes through the platform or via
                  email. We encourage you to review this policy regularly.
                </p>
              </div>
            </div>

            {/* Gold accent element */}
            <div className="mt-12 pt-8 border-t border-dashed border-gold">
              <div
                className={`p-5 rounded-lg ${
                  darkMode
                    ? "bg-amber-900 bg-opacity-20"
                    : "bg-amber-50 border border-amber-200"
                }`}
              >
                <h3
                  className={`text-lg font-medium mb-2 ${
                    darkMode ? "text-gold" : "text-amber-800"
                  }`}
                >
                  Contact Information
                </h3>
                <p
                  className={`${darkMode ? "text-gray-300" : "text-amber-700"}`}
                >
                  If you have questions or concerns about our Privacy Policy or
                  data practices, please contact our Privacy Officer at{" "}
                  <a
                    href="mailto:admin@oromelo.ph"
                    className="text-gold hover:underline font-medium"
                  >
                    admin@oromelo.ph
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
