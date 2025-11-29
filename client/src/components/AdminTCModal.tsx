import { useState } from "react";
import { X, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";

interface AdminTCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  type: "event" | "user";
  itemName: string;
}

export function AdminTCModal({
  isOpen,
  onClose,
  onAccept,
  type,
  itemName,
}: AdminTCModalProps) {
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);
  const [acceptedCompliance, setAcceptedCompliance] = useState(false);

  const canProceed = acceptedPolicy && acceptedGuidelines && acceptedCompliance;

  const handleAccept = () => {
    if (canProceed) {
      onAccept();
      handleClose();
    }
  };

  const handleClose = () => {
    setAcceptedPolicy(false);
    setAcceptedGuidelines(false);
    setAcceptedCompliance(false);
    onClose();
  };

  const eventTerms = [
    {
      id: "policy",
      title: "Content Policy Compliance",
      description:
        "I confirm that this event complies with university content policies, contains no inappropriate material, and does not violate any codes of conduct.",
      checked: acceptedPolicy,
      setter: setAcceptedPolicy,
    },
    {
      id: "guidelines",
      title: "Safety & Accessibility Guidelines",
      description:
        "I verify that this event meets safety standards, provides appropriate accessibility accommodations, and follows all university guidelines for student gatherings.",
      checked: acceptedGuidelines,
      setter: setAcceptedGuidelines,
    },
    {
      id: "compliance",
      title: "Legal & Insurance Compliance",
      description:
        "I acknowledge that this event has proper insurance coverage (if required), complies with local regulations, and the organizers have necessary permits.",
      checked: acceptedCompliance,
      setter: setAcceptedCompliance,
    },
  ];

  const userTerms = [
    {
      id: "policy",
      title: "Identity Verification",
      description:
        "I confirm that this user's identity has been verified through official university channels and their credentials are legitimate.",
      checked: acceptedPolicy,
      setter: setAcceptedPolicy,
    },
    {
      id: "guidelines",
      title: "Role Responsibility",
      description:
        "I verify that this user understands their role responsibilities and has been briefed on platform guidelines and acceptable use policies.",
      checked: acceptedGuidelines,
      setter: setAcceptedGuidelines,
    },
    {
      id: "compliance",
      title: "Account Security",
      description:
        "I acknowledge that proper security measures are in place for this account and the user has completed required training for their role.",
      checked: acceptedCompliance,
      setter: setAcceptedCompliance,
    },
  ];

  const terms = type === "event" ? eventTerms : userTerms;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="border-0 shadow-2xl bg-white">
              <CardHeader className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <AlertTriangle className="h-7 w-7" />
                  Administrator Approval Confirmation
                </CardTitle>
                <p className="text-sm text-white/95 mt-2 font-medium">
                  Review and confirm compliance before approving:{" "}
                  <span className="font-bold text-white">{itemName}</span>
                </p>
              </CardHeader>

              <CardContent className="pt-6 space-y-6 bg-white">
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                  <p className="text-sm text-orange-900 font-semibold leading-relaxed">
                    <strong className="text-orange-800">⚠️ Important:</strong>{" "}
                    By approving this {type === "event" ? "event" : "user"}, you
                    are confirming that all necessary checks have been completed
                    and the {type === "event" ? "event" : "user"} meets all
                    platform requirements.
                  </p>
                </div>

                <div className="space-y-4">
                  {terms.map((term, index) => (
                    <motion.div
                      key={term.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`border-2 rounded-lg p-5 transition-all ${
                        term.checked
                          ? "border-green-400 bg-green-50 shadow-md"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          id={term.id}
                          checked={term.checked}
                          onCheckedChange={(checked) => {
                            term.setter(checked as boolean);
                          }}
                          className="mt-1 h-6 w-6 border-2"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={term.id}
                            className="font-bold text-base cursor-pointer flex items-center gap-2 text-gray-900 mb-2"
                          >
                            {term.title}
                            {term.checked && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </label>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {term.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAccept}
                    disabled={!canProceed}
                    className={`flex-1 font-semibold py-3 text-base ${
                      canProceed
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {canProceed ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2 inline" />
                        Approve {type === "event" ? "Event" : "User"}
                      </>
                    ) : (
                      "Accept All Terms to Continue"
                    )}
                  </Button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-center text-blue-900 font-medium">
                    ℹ️ All approvals are logged for auditing purposes
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
