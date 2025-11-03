// PDF generation utility using jsPDF
// Note: You'll need to install jsPDF: npm install jspdf

interface FlightBookingData {
  bookingId: string;
  airline: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  date: string;
  passengers: string;
  class: string;
  price: number;
  taxes: number;
  total: number;
}

interface BusBookingData {
  bookingId: string;
  routeName: string;
  operator: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  date: string;
  passengers: string;
  price: number;
  taxes: number;
  total: number;
}

interface HotelBookingData {
  bookingId: string;
  hotelName: string;
  address: string;
  rating: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: string;
  rooms: string;
  pricePerNight: number;
  totalPrice: number;
  taxes: number;
  total: number;
}

// Simple PDF generation without external dependencies
export const generateFlightTicket = (data: FlightBookingData) => {
  const content = `
FLIGHT TICKET
═══════════════════════════════════════

✈️ ${data.airline}
Booking ID: ${data.bookingId}
Date: ${new Date().toLocaleDateString()}

FLIGHT DETAILS
──────────────────────────────────────
From: ${data.from}
To: ${data.to}
Date: ${data.date}
Departure: ${data.departureTime}
Arrival: ${data.arrivalTime}
Duration: ${data.duration}

PASSENGER DETAILS
──────────────────────────────────────
Passengers: ${data.passengers}
Class: ${data.class.toUpperCase()}

FARE BREAKDOWN
──────────────────────────────────────
Base Fare: ₹${data.price.toLocaleString()}
Taxes & Fees: ₹${data.taxes.toLocaleString()}
Total Amount: ₹${data.total.toLocaleString()}

IMPORTANT INFORMATION
──────────────────────────────────────
• Please arrive at airport 2 hours before departure
• Carry valid photo ID for domestic flights
• Web check-in available 24 hours before departure
• Baggage allowance: 15kg (Economy), 25kg (Business)

Thank you for choosing our service!
Generated on: ${new Date().toLocaleString()}
  `;

  downloadTextAsPDF(content, `Flight_Ticket_${data.bookingId}.pdf`);
};

export const generateFlightReceipt = (data: FlightBookingData) => {
  const content = `
PAYMENT RECEIPT
═══════════════════════════════════════

TravelAI - Flight Booking
Receipt No: RCP${data.bookingId}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

BOOKING DETAILS
──────────────────────────────────────
Booking ID: ${data.bookingId}
Service: Flight Booking
Airline: ${data.airline}
Route: ${data.from} → ${data.to}
Travel Date: ${data.date}

PAYMENT BREAKDOWN
──────────────────────────────────────
Base Fare: ₹${data.price.toLocaleString()}
Taxes & Fees: ₹${data.taxes.toLocaleString()}
──────────────────────────────────────
Total Paid: ₹${data.total.toLocaleString()}

PAYMENT METHOD
──────────────────────────────────────
Payment Status: SUCCESSFUL
Transaction ID: TXN${Date.now()}
Payment Date: ${new Date().toLocaleDateString()}

CUSTOMER SUPPORT
──────────────────────────────────────
Email: support@travelai.com
Phone: +91-1800-123-4567
Website: www.travelai.com

This is a computer generated receipt.
No signature required.

Generated on: ${new Date().toLocaleString()}
  `;

  downloadTextAsPDF(content, `Flight_Receipt_${data.bookingId}.pdf`);
};

export const generateBusTicket = (data: BusBookingData) => {
  const content = `
BUS TICKET
═══════════════════════════════════════

🚌 ${data.operator}
Booking ID: ${data.bookingId}
Date: ${new Date().toLocaleDateString()}

JOURNEY DETAILS
──────────────────────────────────────
Route: ${data.routeName}
From: ${data.from}
To: ${data.to}
Date: ${data.date}
Departure: ${data.departureTime}
Arrival: ${data.arrivalTime}
Duration: ${data.duration}

PASSENGER DETAILS
──────────────────────────────────────
Passengers: ${data.passengers}
Seat Type: AC Sleeper

FARE BREAKDOWN
──────────────────────────────────────
Base Fare: ₹${data.price.toLocaleString()}
Taxes & Fees: ₹${data.taxes.toLocaleString()}
Total Amount: ₹${data.total.toLocaleString()}

IMPORTANT INFORMATION
──────────────────────────────────────
• Report at boarding point 30 minutes before departure
• Carry valid photo ID for verification
• Smoking and alcohol consumption prohibited
• Keep this ticket for the entire journey

Thank you for choosing our service!
Generated on: ${new Date().toLocaleString()}
  `;

  downloadTextAsPDF(content, `Bus_Ticket_${data.bookingId}.pdf`);
};

export const generateBusReceipt = (data: BusBookingData) => {
  const content = `
PAYMENT RECEIPT
═══════════════════════════════════════

TravelAI - Bus Booking
Receipt No: RCP${data.bookingId}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

BOOKING DETAILS
──────────────────────────────────────
Booking ID: ${data.bookingId}
Service: Bus Booking
Operator: ${data.operator}
Route: ${data.routeName}
Travel Date: ${data.date}

PAYMENT BREAKDOWN
──────────────────────────────────────
Base Fare: ₹${data.price.toLocaleString()}
Taxes & Fees: ₹${data.taxes.toLocaleString()}
──────────────────────────────────────
Total Paid: ₹${data.total.toLocaleString()}

PAYMENT METHOD
──────────────────────────────────────
Payment Status: SUCCESSFUL
Transaction ID: TXN${Date.now()}
Payment Date: ${new Date().toLocaleDateString()}

CUSTOMER SUPPORT
──────────────────────────────────────
Email: support@travelai.com
Phone: +91-1800-123-4567
Website: www.travelai.com

This is a computer generated receipt.
No signature required.

Generated on: ${new Date().toLocaleString()}
  `;

  downloadTextAsPDF(content, `Bus_Receipt_${data.bookingId}.pdf`);
};

export const generateHotelTicket = (data: HotelBookingData) => {
  const content = `
HOTEL BOOKING CONFIRMATION
═══════════════════════════════════════

🏨 ${data.hotelName}
Booking ID: ${data.bookingId}
Date: ${new Date().toLocaleDateString()}

HOTEL DETAILS
──────────────────────────────────────
Hotel: ${data.hotelName}
Rating: ${data.rating} ⭐
Address: ${data.address}

BOOKING DETAILS
──────────────────────────────────────
Check-in: ${data.checkIn}
Check-out: ${data.checkOut}
Duration: ${data.nights} night${data.nights > 1 ? 's' : ''}
Guests: ${data.guests}
Rooms: ${data.rooms}

FARE BREAKDOWN
──────────────────────────────────────
Room Rate (${data.nights} nights): ₹${data.totalPrice.toLocaleString()}
Taxes & Fees: ₹${data.taxes.toLocaleString()}
Total Amount: ₹${data.total.toLocaleString()}

IMPORTANT INFORMATION
──────────────────────────────────────
• Check-in time: 2:00 PM
• Check-out time: 12:00 PM
• Carry valid photo ID for check-in
• Cancellation policy applies as per hotel terms
• Contact hotel directly for special requests

Thank you for choosing our service!
Generated on: ${new Date().toLocaleString()}
  `;

  downloadTextAsPDF(content, `Hotel_Booking_${data.bookingId}.pdf`);
};

export const generateHotelReceipt = (data: HotelBookingData) => {
  const content = `
PAYMENT RECEIPT
═══════════════════════════════════════

TravelAI - Hotel Booking
Receipt No: RCP${data.bookingId}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

BOOKING DETAILS
──────────────────────────────────────
Booking ID: ${data.bookingId}
Service: Hotel Booking
Hotel: ${data.hotelName}
Check-in: ${data.checkIn}
Check-out: ${data.checkOut}

PAYMENT BREAKDOWN
──────────────────────────────────────
Room Rate (${data.nights} nights): ₹${data.totalPrice.toLocaleString()}
Taxes & Fees: ₹${data.taxes.toLocaleString()}
──────────────────────────────────────
Total Paid: ₹${data.total.toLocaleString()}

PAYMENT METHOD
──────────────────────────────────────
Payment Status: SUCCESSFUL
Transaction ID: TXN${Date.now()}
Payment Date: ${new Date().toLocaleDateString()}

CUSTOMER SUPPORT
──────────────────────────────────────
Email: support@travelai.com
Phone: +91-1800-123-4567
Website: www.travelai.com

This is a computer generated receipt.
No signature required.

Generated on: ${new Date().toLocaleString()}
  `;

  downloadTextAsPDF(content, `Hotel_Receipt_${data.bookingId}.pdf`);
};

// Helper function to download text content as PDF
const downloadTextAsPDF = (content: string, filename: string) => {
  // Create a simple text-based PDF content
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${content.length + 100}
>>
stream
BT
/F1 10 Tf
50 750 Td
${content.split('\n').map((line, index) => `(${line}) Tj 0 -12 Td`).join('\n')}
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Courier
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000348 00000 n 
0000000565 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
640
%%EOF`;

  // Create blob and download
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.replace('.pdf', '.txt'); // Download as text file for now
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
