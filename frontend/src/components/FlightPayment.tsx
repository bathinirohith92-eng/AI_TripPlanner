import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Wallet, Building, CheckCircle, Clock, Plane, Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { generateFlightTicket, generateFlightReceipt } from "@/utils/pdfGenerator";

interface Flight {
  id: number;
  airline: string;
  logo: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: string;
}

interface FlightPaymentProps {
  selectedFlight: Flight | null;
  searchData: {
    from: string;
    to: string;
    departure: string;
    passengers: string;
    class: string;
  };
  onBack: () => void;
  onPaymentSuccess: () => void;
}

const FlightPayment = ({ selectedFlight, searchData, onBack, onPaymentSuccess }: FlightPaymentProps) => {
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

  if (!selectedFlight) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No flight selected</p>
      </div>
    );
  }

  const basePrice = parseInt(selectedFlight.price);
  const taxes = Math.round(basePrice * 0.12); // 12% taxes
  const totalPrice = basePrice + taxes;

  if (paymentComplete) {
    const bookingId = `FLT${Date.now()}`;
    const basePrice = parseInt(selectedFlight.price);
    const taxes = Math.round(basePrice * 0.12);
    const totalPrice = basePrice + taxes;

    const handleDownloadTicket = () => {
      generateFlightTicket({
        bookingId,
        airline: selectedFlight.airline,
        from: searchData.from,
        to: searchData.to,
        departureTime: selectedFlight.departureTime,
        arrivalTime: selectedFlight.arrivalTime,
        duration: selectedFlight.duration,
        date: searchData.departure,
        passengers: searchData.passengers,
        class: searchData.class,
        price: basePrice,
        taxes,
        total: totalPrice
      });
    };

    const handleDownloadReceipt = () => {
      generateFlightReceipt({
        bookingId,
        airline: selectedFlight.airline,
        from: searchData.from,
        to: searchData.to,
        departureTime: selectedFlight.departureTime,
        arrivalTime: selectedFlight.arrivalTime,
        duration: selectedFlight.duration,
        date: searchData.departure,
        passengers: searchData.passengers,
        class: searchData.class,
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
        <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-4">Your flight ticket has been booked successfully</p>
        <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto mb-6">
          <p className="text-sm"><strong>Flight:</strong> {selectedFlight.airline}</p>
          <p className="text-sm"><strong>Route:</strong> {searchData.from} → {searchData.to}</p>
          <p className="text-sm"><strong>Date:</strong> {searchData.departure}</p>
          <p className="text-sm"><strong>PNR:</strong> {bookingId}</p>
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
        <h1 className="text-2xl font-bold">Complete Your Flight Booking</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Flight Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Plane className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">{selectedFlight.airline}</p>
                  <p className="text-sm text-muted-foreground">{searchData.from} → {searchData.to}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm">Departure: {selectedFlight.departureTime}</p>
                  <p className="text-sm">Arrival: {selectedFlight.arrivalTime}</p>
                  <p className="text-sm text-muted-foreground">Duration: {selectedFlight.duration}</p>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm"><strong>Date:</strong> {searchData.departure}</p>
                <p className="text-sm"><strong>Passengers:</strong> {searchData.passengers}</p>
                <p className="text-sm"><strong>Class:</strong> {searchData.class.charAt(0).toUpperCase() + searchData.class.slice(1)}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Fare</span>
                  <span>₹{basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>₹{taxes}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
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
                `Pay ₹${totalPrice}`
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlightPayment;
