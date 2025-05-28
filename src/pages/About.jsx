import React from "react";
import { useTheme } from "../hooks/useTheme";

function About() {
  const { darkMode } = useTheme();
  const aboutRef = React.useRef(null);

  // Scroll to top when the component mounts
  React.useEffect(() => {
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div
      ref={aboutRef}
      className={`${
        darkMode ? "bg-dark-surface text-gray-200" : "bg-white text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1
            className={`text-4xl font-bold ${
              darkMode ? "text-gold" : "text-gray-900"
            } text-center mb-8`}
          >
            About Oromelo
          </h1>

          <div className="prose prose-lg mx-auto">
            <h2
              className={`text-2xl font-semibold ${
                darkMode ? "text-gold" : "text-gold"
              } mb-4`}
            >
              Our Story
            </h2>
            <p className="mb-6">
              Founded in 2025, Oromelo emerged from a simple vision: to create a
              more transparent, accessible, and fair platform for gold
              transactions in the Philippines. In a market often clouded by
              uncertainty and varying standards, we set out to build a platform
              where trust and value are paramount.
            </p>

            <div
              className={`my-12 ${
                darkMode ? "bg-dark-surface-2" : "bg-gray-50"
              } p-8 rounded-lg ${
                darkMode
                  ? "border-l-4 border-gold-400"
                  : "border-l-4 border-gold"
              }`}
            >
              <p
                className={`italic text-xl ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                "Our mission is to transform how people convert their gold
                assets into immediate value, offering fair market rates and a
                process built on transparency, security, and respect."
              </p>
            </div>

            <h2
              className={`text-2xl font-semibold ${
                darkMode ? "text-gold" : "text-gold"
              } mb-4`}
            >
              Our Approach
            </h2>
            <p className="mb-6">
              At Oromelo, we understand that each gold item has both material
              and personal value. Whether you're looking to sell your gold
              outright or secure a short-term loan through our pawning service,
              we approach each transaction with the care and attention it
              deserves.
            </p>

            <p className="mb-6">
              Our evaluation process combines industry-standard testing methods
              with fair market pricing, ensuring you receive the true value of
              your gold items. We've eliminated unnecessary middlemen and
              standardized our processes to offer you the best possible rates in
              the market.
            </p>

            <h2
              className={`text-2xl font-semibold ${
                darkMode ? "text-gold" : "text-gold"
              } mb-4`}
            >
              The Oromelo Difference
            </h2>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div
                className={`${
                  darkMode
                    ? "bg-dark-surface-3 border-dark-surface-5"
                    : "bg-white border-gray-100"
                } p-6 rounded-lg shadow-sm border`}
              >
                <h3 className="font-bold text-xl mb-2">Transparency</h3>
                <p>
                  Our pricing and evaluation methods are fully disclosed. You'll
                  always understand exactly how we value your items.
                </p>
              </div>

              <div
                className={`${
                  darkMode
                    ? "bg-dark-surface-3 border-dark-surface-5"
                    : "bg-white border-gray-100"
                } p-6 rounded-lg shadow-sm border`}
              >
                <h3 className="font-bold text-xl mb-2">Security</h3>
                <p>
                  Your transactions and personal information are protected with
                  bank-level security and encryption.
                </p>
              </div>

              <div
                className={`${
                  darkMode
                    ? "bg-dark-surface-3 border-dark-surface-5"
                    : "bg-white border-gray-100"
                } p-6 rounded-lg shadow-sm border`}
              >
                <h3 className="font-bold text-xl mb-2">Convenience</h3>
                <p>
                  Our platform makes it easy to sell or pawn your gold items
                  within NCR / Metro Manila.
                </p>
              </div>

              <div
                className={`${
                  darkMode
                    ? "bg-dark-surface-3 border-dark-surface-5"
                    : "bg-white border-gray-100"
                } p-6 rounded-lg shadow-sm border`}
              >
                <h3 className="font-bold text-xl mb-2">Fair Value</h3>
                <p>
                  We consistently offer rates that reflect the true market value
                  of your gold, with no hidden fees.
                </p>
              </div>
            </div>

            <h2
              className={`text-2xl font-semibold ${
                darkMode ? "text-gold" : "text-gold"
              } mb-4`}
            >
              Our Business Model
            </h2>
            <p className="mb-6">
              Oromelo has reimagined the traditional pawning experience to
              create a more client-friendly, transparent, and flexible service.
              Our business model addresses the common pain points of traditional
              pawnshops while maintaining security and trust.
            </p>

            <div className={`overflow-x-auto my-8`}>
              <table
                className={`min-w-full ${
                  darkMode ? "text-gray-200" : "text-gray-900"
                } border-collapse`}
              >
                <thead>
                  <tr
                    className={`${
                      darkMode ? "bg-dark-surface-3" : "bg-gray-100"
                    } border-b ${
                      darkMode ? "border-dark-surface-5" : "border-gray-200"
                    }`}
                  >
                    <th className="py-3 px-4 text-left font-medium">Aspect</th>
                    <th className="py-3 px-4 text-left font-medium">
                      Traditional Pawnshops
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      OroMelo Model
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    className={`${
                      darkMode ? "bg-dark-surface-2" : "bg-white"
                    } border-b ${
                      darkMode ? "border-dark-surface-5" : "border-gray-200"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">Interest Rate</td>
                    <td className="py-3 px-4">
                      3% to 4% per month (flat, constant)
                    </td>
                    <td className="py-3 px-4">
                      Starts at <span className="text-gold">3.6%</span> (first 3
                      months), <span className="text-gold">3.9%</span> (months
                      4-6)
                    </td>
                  </tr>
                  <tr
                    className={`${
                      darkMode ? "bg-dark-surface-2" : "bg-white"
                    } border-b ${
                      darkMode ? "border-dark-surface-5" : "border-gray-200"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">Grace Period</td>
                    <td className="py-3 px-4">
                      Usually 1 month + renewal fees
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gold">No upfront charge</span>, more
                      client flexibility
                    </td>
                  </tr>
                  <tr
                    className={`${
                      darkMode ? "bg-dark-surface-2" : "bg-white"
                    } border-b ${
                      darkMode ? "border-dark-surface-5" : "border-gray-200"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">Storage</td>
                    <td className="py-3 px-4">Stored in pawnshop premises</td>
                    <td className="py-3 px-4">
                      Secured in{" "}
                      <span className="text-gold">
                        Safe Deposit Box (SDB) vault
                      </span>{" "}
                      for premium protection
                    </td>
                  </tr>
                  <tr
                    className={`${
                      darkMode ? "bg-dark-surface-2" : "bg-white"
                    } border-b ${
                      darkMode ? "border-dark-surface-5" : "border-gray-200"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">
                      Redemption Deadline
                    </td>
                    <td className="py-3 px-4">Often renewable with fees</td>
                    <td className="py-3 px-4">
                      Max of <span className="text-gold">6 months</span>, after
                      which item is acquired by OroMelo
                    </td>
                  </tr>
                  <tr
                    className={`${
                      darkMode ? "bg-dark-surface-2" : "bg-white"
                    } border-b ${
                      darkMode ? "border-dark-surface-5" : "border-gray-200"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">Transparency</td>
                    <td className="py-3 px-4">
                      Itemized fees (interest, service fee, doc stamp) upfront
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gold">No charges upfront</span>,
                      clearer net proceeds to client
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mb-6">
              Our model is designed to provide you with maximum value,
              transparency, and flexibility. By streamlining the process and
              eliminating hidden charges, we ensure that you receive the best
              possible service when pawning your gold items.
            </p>

            <h2
              className={`text-2xl font-semibold ${
                darkMode ? "text-gold" : "text-gold"
              } mb-4`}
            >
              Our Commitment
            </h2>
            <p className="mb-6">
              Oromelo is committed to revolutionizing the gold market in the
              Philippines by providing a service that combines technological
              innovation with personalized care. We believe in building
              long-term relationships with our clients based on mutual trust and
              respect.
            </p>

            <p className="mb-6">
              Every transaction at Oromelo is more than just a business
              exchange—it's an opportunity to demonstrate our dedication to
              excellence and customer satisfaction. We continuously refine our
              processes based on your feedback to ensure we're meeting and
              exceeding your expectations.
            </p>

            <div
              className={`${
                darkMode ? "bg-gold bg-opacity-10" : "bg-gold bg-opacity-10"
              } p-8 rounded-lg my-10`}
            >
              <h3
                className={`text-2xl font-semibold mb-4 text-center ${
                  darkMode ? "text-gold" : ""
                }`}
              >
                Experience the Oromelo difference today
              </h3>
              <p
                className={`text-center text-lg mb-0 ${
                  darkMode ? "text-gray-200" : ""
                }`}
              >
                Whether you're looking to sell your gold items or secure a loan
                through pawning, we're here to provide a seamless, transparent,
                and rewarding experience.
              </p>
            </div>

            <div className="text-center mt-12">
              <p
                className={`text-lg ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Have questions about our services?
              </p>
              <a
                href="/faq"
                className={`inline-flex items-center mt-2 font-medium ${
                  darkMode
                    ? "text-gold hover:text-gold-300"
                    : "text-gold hover:text-gold-600"
                }`}
              >
                Visit our FAQ page
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
