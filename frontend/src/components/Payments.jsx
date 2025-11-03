import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CreditCard,
  Wallet,
  Smartphone,
  CheckCircle,
  Download,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  Calendar,
  Lock,
  Bus,
  Plane,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Simulate PDF download
const simulatePdfDownload = (filename, content) => {
  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flight, bus, bookingDetails } = location.state || {};

  const isFlight = !!flight;
  const item = flight || bus;

  // Redirect if no booking data
  useEffect(() => {
    if (!item) navigate("/", { replace: true });
    window.scrollTo(0, 0);
  }, [item, navigate]);

  const [paymentStep, setPaymentStep] = useState("select");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [progress, setProgress] = useState(0);

  if (!item) return null;

  const basePrice = parseFloat(item.price?.replace(/[₹,]/g, "") || "0");
  const passengerCount = parseFloat(bookingDetails?.passengers || 1);
  const totalAmount = basePrice * passengerCount;
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(totalAmount);

  const handlePayment = () => {
    if (paymentStep === "select") return;
    setPaymentStep("processing");
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    setTimeout(() => {
      clearInterval(interval);
      if (Math.random() < 0.9) setPaymentStep("success");
      else setPaymentStep("failure");
    }, 2500);
  };

  const handleDownloadTicket = () => {
    const travelType = isFlight ? "Flight" : "Bus";
    const ticketContent = `
      --- ${travelType} Ticket / Boarding Pass ---
      ${travelType}: ${item.operator || item.airline}
      Route: ${item.from} (${item.departure || item.departureTime}) → ${
      item.to
    } (${item.arrival || item.arrivalTime})
      Date: ${item.date || item.departureDate || "N/A"}
      Passenger(s): ${bookingDetails?.passengers || 1}
      Class: ${bookingDetails?.class || "Standard"}
      Booking ID: ${isFlight ? "FLT" : "BUS"}-${Date.now().toString().slice(-6)}
      Total Amount Paid: ${formattedAmount}
      ---------------------------------
      (This is a simulated PDF ticket.)
    `;
    simulatePdfDownload(
      `${travelType}_Ticket_${Date.now().toString().slice(-6)}.pdf`,
      ticketContent
    );
  };

  const handleDownloadReceipt = () => {
    const travelType = isFlight ? "Flight" : "Bus";
    const receiptContent = `
      --- ${travelType} Payment Receipt ---
      Transaction ID: TXN-${Date.now().toString().slice(-10)}
      Date: ${new Date().toLocaleDateString()}
      Amount: ${formattedAmount}
      Method: ${
        selectedMethod === "card"
          ? "Credit/Debit Card"
          : selectedMethod === "upi"
          ? "UPI"
          : "Wallet"
      }
      Booked For: ${item.operator || item.airline}
      Booking ID: ${isFlight ? "FLT" : "BUS"}-${Date.now().toString().slice(-6)}
      -------------------------
      (This is a simulated PDF content.)
    `;
    simulatePdfDownload(
      `${travelType}_Receipt_${Date.now().toString().slice(-6)}.pdf`,
      receiptContent
    );
  };

  // --- COMPONENTS ---
  const BookingSummary = () => (
    <Card className="p-5 mb-6 bg-blue-50 border-blue-200 border-2 shadow-inner">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-blue-700">
          {isFlight ? "Flight Details" : "Bus Details"}
        </h3>
        {isFlight ? (
          <Plane className="text-blue-600" />
        ) : (
          <Bus className="text-blue-600" />
        )}
      </div>
      <div className="flex justify-between items-center text-sm">
        <div className="space-y-1">
          <p>
            <strong>Operator:</strong> {item.operator || item.airline}
          </p>
          <p>
            <strong>Route:</strong> {item.from} → {item.to}
          </p>
          <p>
            <strong>Date:</strong> {item.date || item.departureDate || "N/A"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-primary">
            {formattedAmount}
          </p>
          <p className="text-xs text-muted-foreground">
            for {bookingDetails?.passengers || 1} traveller(s)
          </p>
        </div>
      </div>
    </Card>
  );

  const PaymentSelection = () => (
    <>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Choose a Payment Option
      </h2>
      <div className="space-y-4">
        {[
          {
            id: "card",
            icon: CreditCard,
            label: "Credit / Debit Card",
            sub: "Visa, MasterCard, Amex",
            color: "indigo",
          },
          {
            id: "upi",
            icon: Smartphone,
            label: "UPI",
            sub: "GPay, PhonePe, Paytm",
            color: "green",
          },
          {
            id: "wallet",
            icon: Wallet,
            label: "Wallets & Netbanking",
            sub: "Paytm, All Banks",
            color: "yellow",
          },
        ].map((opt) => (
          <Button
            key={opt.id}
            onClick={() => {
              setSelectedMethod(opt.id);
              setPaymentStep(opt.id);
            }}
            className={`w-full justify-start gap-4 bg-white text-gray-800 border-2 border-${opt.color}-400 hover:bg-${opt.color}-50 h-16 rounded-xl shadow-md transition-all`}
            variant="outline"
          >
            <opt.icon className={`w-6 h-6 text-${opt.color}-600`} />
            <div className="text-left">
              <span className="font-semibold block">{opt.label}</span>
              <span className="text-xs text-gray-500">{opt.sub}</span>
            </div>
          </Button>
        ))}
      </div>
    </>
  );

  const ProcessingState = () => (
    <div className="text-center p-12 bg-white rounded-xl">
      <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
      <h2 className="text-2xl font-bold mb-4">Processing Payment...</h2>
      <Progress value={progress} className="w-full h-2 mb-4" />
      <p className="text-sm text-muted-foreground">
        Securing your booking. Please wait.
      </p>
    </div>
  );

  const SuccessState = () => (
    <div className="text-center p-8 bg-green-50 rounded-3xl border-4 border-green-200">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-3xl font-extrabold mb-2 text-green-700">
        Payment Successful!
      </h2>
      <p className="text-lg text-green-600 mb-6">
        {isFlight
          ? "Your flight is confirmed."
          : "Your bus ticket is confirmed."}
      </p>
      <BookingSummary />
      <div className="flex flex-col space-y-3">
        <Button
          onClick={handleDownloadTicket}
          className="w-full h-12 rounded-xl bg-primary hover:opacity-90 text-lg font-semibold shadow-md"
        >
          <Download className="w-5 h-5 mr-2" /> Download Ticket
        </Button>
        <Button
          onClick={handleDownloadReceipt}
          variant="outline"
          className="w-full h-12 rounded-xl border-primary text-primary hover:bg-primary/10 font-semibold"
        >
          <Download className="w-5 h-5 mr-2" /> Download Receipt
        </Button>
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mt-4 text-gray-600 hover:text-primary"
        >
          Go back Home
        </Button>
      </div>
    </div>
  );

  const FailureState = () => (
    <div className="text-center p-8 bg-red-50 rounded-3xl border-4 border-red-200">
      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-3xl font-bold mb-2 text-red-700">Payment Failed</h2>
      <p className="text-lg text-red-600 mb-6">
        Transaction could not be completed. Please try again.
      </p>
      <BookingSummary />
      <Button
        onClick={() => setPaymentStep("select")}
        className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-lg font-semibold mt-4 shadow-md"
      >
        Try Another Method
      </Button>
      <Button
        onClick={() => navigate(isFlight ? "/flights" : "/buses")}
        variant="ghost"
        className="mt-4 text-gray-600 hover:text-red-500"
      >
        Back to {isFlight ? "Flight" : "Bus"} Search
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (paymentStep) {
      case "select":
        return (
          <>
            <BookingSummary />
            <PaymentSelection />
          </>
        );
      case "card":
      case "upi":
      case "wallet":
        return (
          <>
            <BookingSummary />
            <UpiOrCardForm method={paymentStep} />
          </>
        );
      case "processing":
        return <ProcessingState />;
      case "success":
        return <SuccessState />;
      case "failure":
        return <FailureState />;
      default:
        return <PaymentSelection />;
    }
  };

  const UpiOrCardForm = ({ method }) => (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {method === "card"
          ? "Enter Card Details"
          : method === "upi"
          ? "Pay via UPI"
          : "Choose Wallet / Bank"}
      </h2>

      {method === "card" ? (
        <div className="space-y-5">
          <Label>Card Number</Label>
          <Input
            placeholder="XXXX XXXX XXXX XXXX"
            className="rounded-xl h-12"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="MM/YY" className="rounded-xl h-12" />
            <Input
              placeholder="CVV"
              type="password"
              className="rounded-xl h-12"
            />
          </div>
          <Input placeholder="Name on Card" className="rounded-xl h-12" />
        </div>
      ) : method === "upi" ? (
        <div>
          <Label>UPI ID</Label>
          <Input placeholder="yourname@upi" className="rounded-xl h-12" />
        </div>
      ) : (
        <select className="w-full h-12 px-3 rounded-xl border bg-background font-semibold">
          <option>Paytm Wallet</option>
          <option>PhonePe Wallet</option>
          <option>Netbanking (All Banks)</option>
        </select>
      )}

      <Button
        onClick={handlePayment}
        className="w-full h-12 mt-8 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg font-semibold"
      >
        Pay {formattedAmount}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="py-12 pt-24 px-4">
        <div className="container mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6 gap-2 text-gray-600 hover:text-primary"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Card className="p-8 shadow-2xl rounded-3xl border border-gray-100 bg-white">
              {renderContent()}
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PaymentPage;
