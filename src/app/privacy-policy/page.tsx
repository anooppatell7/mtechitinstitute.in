
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export const metadata: Metadata = {
  title: "Privacy Policy - MTech IT Institute",
  description: "Read the Privacy Policy for MTech IT Institute. We are committed to protecting your personal information and your right to privacy.",
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background">
      <div className="container py-16 sm:py-24">
        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-headline prose-headings:text-primary">
          <h1>Privacy Policy</h1>
          <p>Last updated: January 5, 2026</p>

          <p>
            MTech IT Institute ("we," "our," or "us") is committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at mtechitinstitute@gmail.com.
          </p>

          <p>
            This privacy notice describes how we might use your information if you visit our website at <a href={siteUrl}>{siteUrl}</a>, use our mobile application, or otherwise engage with us.
          </p>

          <h2>1. WHAT INFORMATION DO WE COLLECT?</h2>
          <p>
            <strong>Personal Information:</strong> We collect names, phone numbers, and email addresses when you register for courses or create an account.
          </p>
          <p>
            <strong>Device Access (App Specific):</strong> Our mobile app may request access to your device's Camera and Storage.
          </p>
          <ul>
            <li><strong>Camera:</strong> To enable future features like uploading a profile photo directly from your device.</li>
            <li><strong>Storage:</strong> Required to download and save course certificates and study materials to your device.</li>
          </ul>
           <p>
            <strong>Automatic Collection:</strong> We automatically collect certain information when you visit, use or navigate our services. This information may include device and usage information, such as your IP address, browser and device characteristics, and operating system. We use this for security and analytics purposes.
          </p>


          <h2>2. HOW DO WE USE YOUR INFORMATION?</h2>
          <p>
            We use personal information collected via our services for a variety of business purposes described below.
          </p>
          <ul>
            <li>To manage student accounts and course enrollments.</li>
            <li><strong>Push Notifications:</strong> We use your device information to send important course updates, results, and institute notices via notifications.</li>
            <li>To facilitate the login process and protect our services.</li>
            <li>To send administrative information to you.</li>
          </ul>

          <h2>3. WILL YOUR INFORMATION BE SHARED WITH ANYONE?</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal data to third parties.
          </p>

          <h2>4. DATA SAFETY & SECURITY</h2>
          <p>
            We have implemented appropriate technical and organizational security measures, such as encryption, designed to protect the security of any personal information we process.
          </p>
           <p>
            <strong>Data Deletion:</strong> Users can request to delete their account and associated personal data by sending an email to mtechitinstitute@gmail.com with the subject "Account Deletion Request". We will process the request in accordance with applicable laws.
          </p>
          
          <h2>5. DO WE COLLECT INFORMATION FROM MINORS?</h2>
          <p>
            We do not knowingly solicit data from or market to children under 18 years of age.
          </p>
          
          <h2>6. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
          <p>
            If you have questions or comments about this notice, you may email us at mtechitinstitute@gmail.com or by post to:
          </p>
          <p>
            MTech IT Institute<br/>
            Patti Pratapgarh, 230135, Uttar Pradesh.
          </p>
        </div>
      </div>
    </div>
  );
}
