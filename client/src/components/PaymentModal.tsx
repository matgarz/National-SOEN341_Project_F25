import { useState } from "react";
import { X, CreditCard, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
            <Card className="border-0 shadow-2xl">
              <CardHeader className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {!processing && (
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Secure Payment
                </CardTitle>
                <p className="text-sm text-white/90 mt-1">
                  Complete your ticket purchase for:
                </p>
                <p className="font-semibold mt-1">{eventTitle}</p>
              </CardHeader>

              <CardContent className="pt-6">
                {step === "form" && (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-2xl font-bold text-gray-900">
                        ${amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">Total Amount</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(
                              e.target.value.replace(/\s/g, "").slice(0, 16)
                            );
                            setCardNumber(formatted);
                          }}
                          maxLength={19}
                          required
                        />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value);
                            setExpiryDate(formatted);
                          }}
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                          }
                          maxLength={3}
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

                    <p className="text-xs text-center text-gray-500 mt-3">
                      🔒 This is a mock payment system for demonstration purposes
                    </p>
                  </form>
                )}

                {step === "processing" && (
                  <div className="py-12 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      <CreditCard className="h-16 w-16 text-blue-600" />
                    </motion.div>
                    <p className="mt-4 text-lg font-semibold">Processing Payment...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Please don't close this window
                    </p>
                  </div>
                )}

                {step === "success" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="py-12 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
                    >
                      <div className="text-4xl">✓</div>
                    </motion.div>
                    <h3 className="text-xl font-bold text-green-600">
                      Payment Successful!
                    </h3>
                    <p className="text-gray-600 mt-2">
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