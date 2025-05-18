import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Effective Date: 17th May 2025</p>

      <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
      <p className="mb-4">
        This Privacy Policy explains how Pilotype collects, uses, and protects
        your information when you use our AI text completion tool. By using our
        service, you agree to the collection and use of information as outlined
        in this policy.
      </p>

      <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
      <p className="mb-4">
        We may collect information such as your email address, user preferences,
        and usage data to improve our service. We also use Clerk for
        authentication, which may collect personal data necessary for login and
        account management.
      </p>

      <h2 className="text-2xl font-semibold mb-2">
        3. How We Use Your Information
      </h2>
      <p className="mb-4">
        We use the collected information to personalize your experience, improve
        our product, and manage user accounts. We do not share your personal
        information with third parties, except as required for authentication or
        data processing.
      </p>

      <h2 className="text-2xl font-semibold mb-2">4. Cookies and Tracking</h2>
      <p className="mb-4">
        We use cookies to enhance your experience and store session data. These
        cookies are necessary for the proper functioning of our application.
      </p>

      <h2 className="text-2xl font-semibold mb-2">5. Third-Party Services</h2>
      <p className="mb-4">
        {`We use third-party services like Clerk for authentication. These
        services may collect personal data according to their privacy policies.
        We recommend reviewing Clerk’s Privacy Policy for more information.`}
      </p>

      <h2 className="text-2xl font-semibold mb-2">6. Data Security</h2>
      <p className="mb-4">
        We take data security seriously and implement various measures to
        protect your information. However, no system is completely secure, and
        we cannot guarantee absolute security.
      </p>

      <h2 className="text-2xl font-semibold mb-2">7. Your Rights</h2>
      <p className="mb-4">
        You have the right to access, update, or delete your personal
        information at any time. Please contact us at{" "}
        <a href="mailto:hello@pilotype.com">support@pilotype.com</a> for
        assistance.
      </p>

      <h2 className="text-2xl font-semibold mb-2">
        8. Changes to This Privacy Policy
      </h2>
      <p className="mb-4">
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new policy on this page.
      </p>

      <h2 className="text-2xl font-semibold mb-2">9. Contact Us</h2>
      <p className="mb-4">
        If you have any questions or concerns about this Privacy Policy, please
        contact us at{" "}
        <a href="mailto:hello@pilotype.com">support@pilotype.com</a>.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
