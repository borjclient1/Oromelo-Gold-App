import React, { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { ADMIN_EMAILS } from "../config/constants";

function Contact() {
  const { darkMode } = useTheme();
  const contactRef = React.useRef(null);

  // Scroll to top when the component mounts
  React.useEffect(() => {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }


      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again later.");
      console.error("Error sending contact form:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={contactRef}
      className={`min-h-screen ${
        darkMode ? "bg-dark-surface text-gray-200" : "bg-gray-50 text-gray-900"
      } pt-20 pb-12`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1
            className={`text-4xl font-bold ${
              darkMode ? "text-gold" : "text-gray-900"
            } text-center mb-8`}
          >
            Contact Us
          </h1>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="prose prose-lg">
                <h2
                  className={`text-2xl font-semibold ${
                    darkMode ? "text-gold" : "text-gold"
                  } mb-4`}
                >
                  Get in Touch
                </h2>
                <p className="mb-6">
                  Have questions about selling or pawning your gold items? Our
                  team is here to help. Reach out to us using the contact form
                  or through any of our contact channels.
                </p>
              </div>

              <div className="mt-8">
                <h3
                  className={`text-xl font-medium ${
                    darkMode ? "text-gray-200" : "text-gray-900"
                  } mb-4`}
                >
                  Our Office
                </h3>
                <address className="not-italic">
                  <p className="flex items-center mb-3">
                    <svg
                      className={`w-5 h-5 ${
                        darkMode ? "text-gold" : "text-gold"
                      } mr-3`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      East Tower, The Vantage, Brgy. Kapitolyo, Pasig City,
                      Philippines 1603
                    </span>
                  </p>
                  <p className="flex items-center mb-3">
                    <svg
                      className={`w-5 h-5 ${
                        darkMode ? "text-gold " : "text-gold"
                      } mr-3`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>(+63) 906-278-8480 / (+63) 954-308-2038</span>
                  </p>
                  <p className="flex items-center mb-3">
                    <svg
                      className={`w-5 h-5 ${
                        darkMode ? "text-gold " : "text-gold"
                      } mr-3`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span>ermpolicarpio@gmail.com</span>
                  </p>
                </address>
              </div>

              <div className="mt-8">
                <h3
                  className={`text-xl font-medium ${
                    darkMode ? "text-gray-200" : "text-gray-900"
                  } mb-4`}
                >
                  Business Hours
                </h3>
                <ul
                  className={`space-y-2 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <li className="flex justify-between">
                    <span>Monday - Sunday:</span>
                    <span>9:00 AM - 9:00 PM</span>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className={`${
                darkMode
                  ? "bg-dark-surface-2 border-dark-surface-4"
                  : "bg-white border-gray-200"
              } p-8 shadow-md rounded-lg border`}
            >
              {submitted ? (
                <div className="text-center py-8">
                  <svg
                    className={`w-16 h-16 ${
                      darkMode ? "text-green-400" : "text-green-500"
                    } mx-auto mb-4`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <h3
                    className={`text-2xl font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    } mb-2`}
                  >
                    Thank You!
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-6`}
                  >
                    Your message has been received. We'll get back to you as
                    soon as possible.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-gold hover:bg-yellow-500 text-white font-medium py-2 px-6 rounded-md transition duration-150 ease-in-out"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h2
                    className={`text-xl font-semibold ${
                      darkMode ? "text-gold" : "text-gray-900"
                    } mb-6`}
                  >
                    Send Us a Message
                  </h2>

                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-1`}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        darkMode
                          ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                          : "border-gray-300 focus:ring-gold focus:border-gold"
                      } rounded-md`}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-1`}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        darkMode
                          ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                          : "border-gray-300 focus:ring-gold focus:border-gold"
                      } rounded-md`}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="phone"
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-1`}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        darkMode
                          ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                          : "border-gray-300 focus:ring-gold focus:border-gold"
                      } rounded-md`}
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="message"
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-1`}
                    >
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        darkMode
                          ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                          : "border-gray-300 focus:ring-gold focus:border-gold"
                      } rounded-md`}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-gold hover:bg-yellow-500 text-white font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>

                  {error && (
                    <p className="mt-2 text-red-500 text-sm text-center">
                      {error}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
