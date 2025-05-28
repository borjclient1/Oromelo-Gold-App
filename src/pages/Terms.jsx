import React from "react";
import { useTheme } from "../hooks/useTheme";

function Terms() {
  const { darkMode } = useTheme();
  const termsRef = React.useRef(null);

  // Scroll to top when the component mounts
  React.useEffect(() => {
    if (termsRef.current) {
      termsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div
      ref={termsRef}
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
              Terms and Conditions
            </h1>
            <p
              className={`mt-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Last updated: May 1, 2025
            </p>
          </div>

          {/* Terms Content */}
          <div className="px-6 py-8">
            <div className="space-y-8">
              <div>
                <h2
                  className={`text-xl font-semibold flex items-center ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm ${
                      darkMode
                        ? "bg-amber-900 text-gold"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    1
                  </span>
                  Collateral Security
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  The pawned item will be securely stored by OroMelo for the
                  duration of the loan. Reasonable precautions will be taken to
                  ensure the safety and protection of all pawned items.
                </p>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold flex items-center ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm ${
                      darkMode
                        ? "bg-amber-900 text-gold"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    2
                  </span>
                  Compensation for Loss
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  In the rare event of loss or damage, compensation will be
                  provided at 120% of the prevailing market value of the pawned
                  item, considering gold karat and weight, referenced through
                  publicly available gold market data.
                </p>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold flex items-center ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm ${
                      darkMode
                        ? "bg-amber-900 text-gold"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    3
                  </span>
                  Interest Rates
                </h2>
                <div className="space-y-4 mt-3">
                  <div className="flex items-start">
                    <span className="mr-3 text-xl flex-shrink-0 text-gold">
                      •
                    </span>
                    <div>
                      <p className="font-medium">First Three Months:</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        An interest rate of 3.6% per month applies for the first
                        three (3) months of the loan term.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-xl flex-shrink-0 text-gold">
                      •
                    </span>
                    <div>
                      <p className="font-medium">Fourth to Sixth Months:</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        An interest rate of 3.9% per month applies from the
                        fourth (4th) to sixth (6th) month of the loan term.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold flex items-center ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm ${
                      darkMode
                        ? "bg-amber-900 text-gold"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    4
                  </span>
                  Fees and Redemption
                </h2>
                <div className="space-y-4 mt-3">
                  <div className="flex items-start">
                    <span className="mr-3 text-xl flex-shrink-0 text-gold">
                      •
                    </span>
                    <div>
                      <p className="font-medium">No Upfront Fees:</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        No upfront fees are collected at the time of pawning.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-xl flex-shrink-0 text-gold">
                      •
                    </span>
                    <div>
                      <p className="font-medium">Redemption Terms:</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        Clients may redeem their pledged items at any time
                        within the six (6) month term by settling the
                        outstanding interest and principal.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-xl flex-shrink-0 text-gold">
                      •
                    </span>
                    <div>
                      <p className="font-medium">Post-Term Acquisition:</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        If the pledged item remains unredeemed after the six (6)
                        month term, it will be considered acquired by OroMelo,
                        without any additional penalties or charges to the
                        client.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold flex items-center ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm ${
                      darkMode
                        ? "bg-amber-900 text-gold"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    5
                  </span>
                  Item Storage
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  All pledged items are securely stored in a private safety
                  deposit box at BDO for the duration of the loan term.
                </p>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold flex items-center ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm ${
                      darkMode
                        ? "bg-amber-900 text-gold"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    3
                  </span>
                  Gold Price Monitoring
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  OroMelo supports transparency. The value of gold can be
                  monitored by clients through reputable sources such as{" "}
                  <a
                    href="https://www.livepriceofgold.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    livepriceofgold.com
                  </a>{" "}
                  or other credible gold pricing sites.
                </p>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold flex items-center ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm ${
                      darkMode
                        ? "bg-amber-900 text-gold"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    4
                  </span>
                  Loan Redemption and Default
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  The pawner must repay the principal, interest, and any
                  applicable penalties to redeem the item. Failure to settle the
                  loan after the maturity date may result in the forfeiture of
                  the pawned item without further notice.
                </p>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold flex items-center ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm ${
                      darkMode
                        ? "bg-amber-900 text-gold"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    5
                  </span>
                  Partial Payments
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Partial payments towards interest and principal may be
                  accepted, subject to prior agreement with OroMelo.
                </p>
              </div>

              <div>
                <h2
                  className={`text-xl font-semibold flex items-center ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm ${
                      darkMode
                        ? "bg-amber-900 text-gold"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    6
                  </span>
                  Disclaimer
                </h2>
                <p
                  className={`mt-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  OroMelo is currently in its early operational phase while
                  preparing for full regulatory compliance. Despite being in the
                  startup stage, OroMelo is committed to maintaining
                  professional service standards, ensuring secure handling of
                  all transactions, and upholding transparency and integrity
                  with every client.
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
                  Have questions about our terms?
                </h3>
                <p
                  className={`${darkMode ? "text-gray-300" : "text-amber-700"}`}
                >
                  Contact us at{" "}
                  <a
                    href="mailto:admin@oromelo.ph"
                    className="text-gold hover:underline font-medium"
                  >
                    admin@oromelo.ph
                  </a>{" "}
                  or visit our{" "}
                  <a
                    href="/contact"
                    className="text-gold hover:underline font-medium"
                  >
                    contact page
                  </a>{" "}
                  for more information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;
