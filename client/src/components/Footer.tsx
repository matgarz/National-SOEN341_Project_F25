import { Github, Mail, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols md:grid-cols-4 ">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-xl text-gray-900">
              Campus Events Platform
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Your one-stop platform for discovering and booking campus events
              at Concordia University. Built by students, for students, as part
              of SOEN 341 Fall 2025.
            </p>
            <div className="pt-2">
              <p className="text-xs text-gray-600 font-semibold">
                Team Nationals:
              </p>
              <p className="text-xs text-gray-600">
                Software Engineering Students - SOEN 341 Project
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-xl text-gray-900">Get in Touch</h3>
            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Email Support
                  </p>
                  <a
                    href="mailto:support@campusevents.ca"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    support@campusevents.ca
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Github className="h-5 w-5 text-gray-700 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Project Repository
                  </p>
                  <a
                    href="https://github.com/matgarz/National-SOEN341_Project_F25"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Office Hours:</strong> Monday - Friday, 9 AM - 5 PM EST
                <br />
                <strong>Location:</strong> Concordia University, Montreal, QC
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>
              © {currentYear} Campus Events Platform. SOEN 341 - Fall 2025.
            </p>
            <p className="flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" />{" "}
              by Team Nationals
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
