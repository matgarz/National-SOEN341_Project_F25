import { useState } from "react";
import { X, CreditCard, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  amount: number;
  onPaymentComplete: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  eventTitle,
  amount,
  onPaymentComplete,
}: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"form" | "processing" | "success">("form");

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      alert("Please fill in all fields");
      return;
    }
    setStep("processing");
    setProcessing(true);
    setTimeout(() => {
      setStep("success");
      setProcessing(false);
      setTimeout(() => {
        onPaymentComplete();
        onClose();
        resetForm();
      }, 1500);
    }, 2000);
  };

  const resetForm = () => {
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setCardName("");
    setStep("form");
  };

  const handleClose = () => {
    if (!processing) {
      onClose();
      resetForm();
    }
  };

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
            className="relative z-10 w-full max-w-md"
          >
            <Card className="border-0 shadow-2xl bg-white">
              <CardHeader className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                {!processing && (
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock className="h-6 w-6" />
                  Secure Payment
                </CardTitle>
                <p className="text-sm text-white/90 mt-2">
                  Complete your ticket purchase for:
                </p>
                <p className="font-semibold mt-1">{eventTitle}</p>
              </CardHeader>

              <CardContent className="pt-6 bg-white">
                {step === "form" && (
                  <form onSubmit={handlePayment} className="space-y-5">
                    <div className="text-center mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${amount.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="cardName"
                        className="text-gray-700 font-semibold"
                      >
                        Cardholder Name
                      </Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="border-gray-300 focus:border-blue-500 bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="cardNumber"
                        className="text-gray-700 font-semibold"
                      >
                        Card Number
                      </Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(
                              e.target.value.replace(/\s/g, "").slice(0, 16),
                            );
                            setCardNumber(formatted);
                          }}
                          maxLength={19}
                          className="border-gray-300 focus:border-blue-500 pr-12 bg-white"
                          required
                        />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="expiryDate"
                          className="text-gray-700 font-semibold"
                        >
                          Expiry Date
                        </Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value);
                            setExpiryDate(formatted);
                          }}
                          maxLength={5}
                          className="border-gray-300 focus:border-blue-500 bg-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="cvv"
                          className="text-gray-700 font-semibold"
                        >
                          CVV
                        </Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(
                              e.target.value.replace(/\D/g, "").slice(0, 3),
                            )
                          }
                          maxLength={3}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        size="lg"
                      >
                        Pay ${amount.toFixed(2)}
                      </Button>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                      <p className="text-xs text-center text-yellow-800 font-medium">
                        🔒 This is a mock payment system for demonstration
                        purposes only
                      </p>
                    </div>
                  </form>
                )}

                {step === "processing" && (
                  <div className="py-16 text-center bg-white">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="inline-block"
                    >
                      <CreditCard className="h-20 w-20 text-blue-600" />
                    </motion.div>
                    <p className="mt-6 text-xl font-semibold text-gray-900">
                      Processing Payment...
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Please don't close this window
                    </p>
                  </div>
                )}

                {step === "success" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="py-16 text-center bg-white"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                    >
                      <div className="text-5xl">✓</div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-green-600">
                      Payment Successful!
                    </h3>
                    <p className="text-gray-600 mt-3 text-lg">
                      Your ticket has been confirmed
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
