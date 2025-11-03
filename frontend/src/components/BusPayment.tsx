import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Wallet, Building, CheckCircle, Clock, MapPin, Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { generateBusTicket, generateBusReceipt } from "@/utils/pdfGenerator";

interface BusRoute {
  id: number;
  routeName: string;
  duration: string;
  buses: Array<{
    operator: string;
    from: string;
  }>;
  price?: number;
  departureTime?: string;
  arrivalTime?: string;
}

interface BusPaymentProps {
  selectedRoute: BusRoute | null;
  onBack: () => void;
  onPaymentSuccess: () => void;
}

const BusPayment = ({ selectedRoute, onBack, onPaymentSuccess }: BusPaymentProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    upiId: "",
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setPaymentComplete(true);
  };

  if (!selectedRoute) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No route selected</p>
      </div>
    );
  }

  if (paymentComplete) {
    const bookingId = `BUS${Date.now()}`;
    const basePrice = selectedRoute.price || 450;
    const taxes = 50;
    const totalPrice = basePrice + taxes;

    const handleDownloadTicket = () => {
      generateBusTicket({
        bookingId,
        routeName: selectedRoute.routeName,
        operator: selectedRoute.buses[0]?.operator || "Bus Operator",
        from: selectedRoute.buses[0]?.from || "Departure Point",
        to: "Destination",
        departureTime: selectedRoute.departureTime || "08:00 AM",
        arrivalTime: selectedRoute.arrivalTime || "02:00 PM",
        duration: selectedRoute.duration,
        date: "2025-11-17",
        passengers: "1",
        price: basePrice,
        taxes,
        total: totalPrice
      });
    };

    const handleDownloadReceipt = () => {
      generateBusReceipt({
        bookingId,
        routeName: selectedRoute.routeName,
        operator: selectedRoute.buses[0]?.operator || "Bus Operator",
        from: selectedRoute.buses[0]?.from || "Departure Point",
        to: "Destination",
        departureTime: selectedRoute.departureTime || "08:00 AM",
        arrivalTime: selectedRoute.arrivalTime || "02:00 PM",
        duration: selectedRoute.duration,
        date: "2025-11-17",
        passengers: "1",
        price: basePrice,
        taxes,
        total: totalPrice
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground mb-4">Your bus ticket has been booked successfully</p>
        <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto mb-6">
          <p className="text-sm"><strong>Route:</strong> {selectedRoute.routeName}</p>
          <p className="text-sm"><strong>Duration:</strong> {selectedRoute.duration}</p>
          <p className="text-sm"><strong>Booking ID:</strong> {bookingId}</p>
        </div>
        
        {/* Download Buttons */}
        <div className="flex gap-4 justify-center mb-4">
          <Button onClick={handleDownloadTicket} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Ticket
          </Button>
          <Button onClick={handleDownloadReceipt} variant="outline" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Download Receipt
          </Button>
        </div>
        
        {/* Close Button */}
        <Button onClick={onPaymentSuccess} variant="outline" className="w-full">
          Close
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Complete Your Booking</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Booking Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">{selectedRoute.routeName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRoute.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm">Departure: {selectedRoute.departureTime || "08:00 AM"}</p>
                  <p className="text-sm">Arrival: {selectedRoute.arrivalTime || "02:00 PM"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Fare</span>
                  <span>₹{selectedRoute.price || 450}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>₹50</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{(selectedRoute.price || 450) + 50}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold mb-6">Payment Details</h3>

            {/* Payment Method Selection */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                onClick={() => setPaymentMethod("card")}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-sm">Card</span>
              </Button>
              <Button
                variant={paymentMethod === "upi" ? "default" : "outline"}
                onClick={() => setPaymentMethod("upi")}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Wallet className="w-6 h-6" />
                <span className="text-sm">UPI</span>
              </Button>
              <Button
                variant={paymentMethod === "netbanking" ? "default" : "outline"}
                onClick={() => setPaymentMethod("netbanking")}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Building className="w-6 h-6" />
                <span className="text-sm">Net Banking</span>
              </Button>
            </div>

            {/* Payment Form Fields */}
            <div className="space-y-4">
              {paymentMethod === "card" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cardholder Name</label>
                    <Input
                      placeholder="Enter cardholder name"
                      value={formData.cardholderName}
                      onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Card Number</label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Expiry Date</label>
                      <Input
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">CVV</label>
                      <Input
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === "upi" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">UPI ID</label>
                  <Input
                    placeholder="yourname@upi"
                    value={formData.upiId}
                    onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                  />
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Bank</label>
                  <select className="w-full p-3 border border-border rounded-md">
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Punjab National Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full mt-6 h-12 text-lg"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Payment...
                </div>
              ) : (
                `Pay ₹${(selectedRoute.price || 450) + 50}`
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusPayment;