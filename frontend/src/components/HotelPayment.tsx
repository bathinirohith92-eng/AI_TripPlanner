import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Wallet, Building, CheckCircle, Calendar, Users, Building2, Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { generateHotelTicket, generateHotelReceipt } from "@/utils/pdfGenerator";

interface Hotel {
  id: number;
  name: string;
  rating: number;
  address: string;
  price: number;
  image: string;
  amenities: string[];
  website: string;
  mapLink: string;
  description: string;
  reviews: number;
}

interface HotelPaymentProps {
  selectedHotel: Hotel | null;
  searchData: {
    city: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    rooms: string;
  };
  onBack: () => void;
  onPaymentSuccess: () => void;
}

const HotelPayment = ({ selectedHotel, searchData, onBack, onPaymentSuccess }: HotelPaymentProps) => {
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

  if (!selectedHotel) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No hotel selected</p>
      </div>
    );
  }

  // Calculate stay duration and total price
  const checkInDate = new Date(searchData.checkIn);
  const checkOutDate = new Date(searchData.checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const basePrice = selectedHotel.price * nights;
  const taxes = Math.round(basePrice * 0.18); // 18% GST
  const totalPrice = basePrice + taxes;

  if (paymentComplete) {
    const bookingId = `HTL${Date.now()}`;

    const handleDownloadTicket = () => {
      generateHotelTicket({
        bookingId,
        hotelName: selectedHotel.name,
        address: selectedHotel.address,
        rating: selectedHotel.rating,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        nights,
        guests: searchData.guests,
        rooms: searchData.rooms,
        pricePerNight: selectedHotel.price,
        totalPrice: basePrice,
        taxes,
        total: totalPrice
      });
    };

    const handleDownloadReceipt = () => {
      generateHotelReceipt({
        bookingId,
        hotelName: selectedHotel.name,
        address: selectedHotel.address,
        rating: selectedHotel.rating,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        nights,
        guests: searchData.guests,
        rooms: searchData.rooms,
        pricePerNight: selectedHotel.price,
        totalPrice: basePrice,
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
        <p className="text-muted-foreground mb-4">Your hotel reservation has been confirmed</p>
        <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto mb-6">
          <p className="text-sm"><strong>Hotel:</strong> {selectedHotel.name}</p>
          <p className="text-sm"><strong>Check-in:</strong> {searchData.checkIn}</p>
          <p className="text-sm"><strong>Check-out:</strong> {searchData.checkOut}</p>
          <p className="text-sm"><strong>Guests:</strong> {searchData.guests}</p>
          <p className="text-sm"><strong>Booking ID:</strong> {bookingId}</p>
        </div>
        
        {/* Download Buttons */}
        <div className="flex gap-4 justify-center mb-4">
          <Button onClick={handleDownloadTicket} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Booking
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
        <h1 className="text-2xl font-bold">Complete Your Hotel Booking</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Booking Details</h3>
            
            <div className="space-y-4">
              {/* Hotel Image */}
              <div className="relative h-32 rounded-lg overflow-hidden">
                <img
                  src={selectedHotel.image}
                  alt={selectedHotel.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">{selectedHotel.name}</p>
                  <p className="text-sm text-muted-foreground">⭐ {selectedHotel.rating} rating</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm">Check-in: {searchData.checkIn}</p>
                  <p className="text-sm">Check-out: {searchData.checkOut}</p>
                  <p className="text-sm text-muted-foreground">{nights} night{nights > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm">Guests: {searchData.guests}</p>
                  <p className="text-sm">Rooms: {searchData.rooms}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Room Rate ({nights} nights)</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>₹{taxes.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
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
                `Pay ₹${totalPrice.toLocaleString()}`
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HotelPayment;
