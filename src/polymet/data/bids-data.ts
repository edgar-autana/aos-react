import { Supplier } from "./suppliers-data";

export interface BidDocument {
  id: string;
  name: string;
  type: "quote" | "specification" | "terms" | "other";
  fileUrl: string;
  uploadDate: string;
  fileSize: number; // in bytes
}

export interface BidItem {
  partNumberId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  leadTimeInDays: number;
}

export interface Bid {
  id: string;
  rfqId: string;
  supplierId: string;
  status: "pending" | "submitted" | "accepted" | "rejected" | "negotiating";
  submissionDate: string;
  expirationDate: string;
  totalAmount: number;
  currency: string;
  notes: string;
  documents: BidDocument[];
  items: BidItem[];
}

export interface BidCompetition {
  id: string;
  rfqId: string;
  name: string;
  status: "draft" | "active" | "closed";
  createdDate: string;
  closingDate: string;
  invitedSuppliers: string[]; // supplier IDs
  description: string;
  emailsSent: number;
  emailsOpened: number;
  bidsReceived: number;
}

// Mock data for bids
export const BIDS: Bid[] = [
  {
    id: "bid-001",
    rfqId: "rfq-001",
    supplierId: "sup-001",
    status: "submitted",
    submissionDate: "2023-11-20",
    expirationDate: "2023-12-20",
    totalAmount: 4250.0,
    currency: "USD",
    notes: "Quote includes expedited manufacturing option for additional 15%",
    documents: [
      {
        id: "doc-001",
        name: "Formal Quotation.pdf",
        type: "quote",
        fileUrl: "quotation_001.pdf",
        uploadDate: "2023-11-20",
        fileSize: 1245678,
      },
      {
        id: "doc-002",
        name: "Manufacturing Specifications.pdf",
        type: "specification",
        fileUrl: "specs_001.pdf",
        uploadDate: "2023-11-20",
        fileSize: 2345678,
      },
    ],

    items: [
      {
        partNumberId: "part-001",
        partName: "Hydraulic Valve Housing",
        quantity: 50,
        unitPrice: 85.0,
        totalPrice: 4250.0,
        leadTimeInDays: 14,
      },
    ],
  },
  {
    id: "bid-002",
    rfqId: "rfq-001",
    supplierId: "sup-002",
    status: "submitted",
    submissionDate: "2023-11-22",
    expirationDate: "2023-12-22",
    totalAmount: 4750.0,
    currency: "USD",
    notes: "Premium materials used for extended product life",
    documents: [
      {
        id: "doc-003",
        name: "Quote_HydraulicComponents.pdf",
        type: "quote",
        fileUrl: "quotation_002.pdf",
        uploadDate: "2023-11-22",
        fileSize: 1345678,
      },
    ],

    items: [
      {
        partNumberId: "part-001",
        partName: "Hydraulic Valve Housing",
        quantity: 50,
        unitPrice: 95.0,
        totalPrice: 4750.0,
        leadTimeInDays: 10,
      },
    ],
  },
  {
    id: "bid-003",
    rfqId: "rfq-001",
    supplierId: "sup-003",
    status: "negotiating",
    submissionDate: "2023-11-21",
    expirationDate: "2023-12-21",
    totalAmount: 4000.0,
    currency: "USD",
    notes: "Bulk discount available for orders over 100 units",
    documents: [
      {
        id: "doc-004",
        name: "ValveHousing_Quote.pdf",
        type: "quote",
        fileUrl: "quotation_003.pdf",
        uploadDate: "2023-11-21",
        fileSize: 1145678,
      },
      {
        id: "doc-005",
        name: "Terms and Conditions.pdf",
        type: "terms",
        fileUrl: "terms_003.pdf",
        uploadDate: "2023-11-21",
        fileSize: 545678,
      },
    ],

    items: [
      {
        partNumberId: "part-001",
        partName: "Hydraulic Valve Housing",
        quantity: 50,
        unitPrice: 80.0,
        totalPrice: 4000.0,
        leadTimeInDays: 18,
      },
    ],
  },
  {
    id: "bid-004",
    rfqId: "rfq-003",
    supplierId: "sup-001",
    status: "accepted",
    submissionDate: "2023-10-15",
    expirationDate: "2023-11-15",
    totalAmount: 3600.0,
    currency: "USD",
    notes: "Includes specialized heat treatment for aerospace applications",
    documents: [
      {
        id: "doc-006",
        name: "Aerospace_Brackets_Quote.pdf",
        type: "quote",
        fileUrl: "quotation_004.pdf",
        uploadDate: "2023-10-15",
        fileSize: 1645678,
      },
    ],

    items: [
      {
        partNumberId: "part-006",
        partName: "Wing Sensor Mount",
        quantity: 12,
        unitPrice: 150.0,
        totalPrice: 1800.0,
        leadTimeInDays: 21,
      },
      {
        partNumberId: "part-007",
        partName: "Avionics Cooling Bracket",
        quantity: 24,
        unitPrice: 75.0,
        totalPrice: 1800.0,
        leadTimeInDays: 21,
      },
    ],
  },
  {
    id: "bid-005",
    rfqId: "rfq-005",
    supplierId: "sup-004",
    status: "rejected",
    submissionDate: "2023-10-25",
    expirationDate: "2023-11-25",
    totalAmount: 12500.0,
    currency: "USD",
    notes: "High-grade materials suitable for outdoor exposure",
    documents: [
      {
        id: "doc-007",
        name: "RenewableComponents_Quote.pdf",
        type: "quote",
        fileUrl: "quotation_005.pdf",
        uploadDate: "2023-10-25",
        fileSize: 1845678,
      },
    ],

    items: [
      {
        partNumberId: "part-011",
        partName: "Solar Panel Mount Bracket",
        quantity: 150,
        unitPrice: 45.0,
        totalPrice: 6750.0,
        leadTimeInDays: 14,
      },
      {
        partNumberId: "part-012",
        partName: "Wind Turbine Coupling",
        quantity: 75,
        unitPrice: 76.67,
        totalPrice: 5750.0,
        leadTimeInDays: 16,
      },
    ],
  },
];

// Mock data for bid competitions
export const BID_COMPETITIONS: BidCompetition[] = [
  {
    id: "comp-001",
    rfqId: "rfq-001",
    name: "Hydraulic Components Bidding",
    status: "active",
    createdDate: "2023-11-15",
    closingDate: "2023-12-01",
    invitedSuppliers: ["sup-001", "sup-002", "sup-003", "sup-004"],
    description:
      "Seeking competitive quotes for hydraulic system components with delivery by Q1 2024",
    emailsSent: 4,
    emailsOpened: 3,
    bidsReceived: 3,
  },
  {
    id: "comp-002",
    rfqId: "rfq-003",
    name: "Aerospace Mounting Brackets",
    status: "closed",
    createdDate: "2023-10-05",
    closingDate: "2023-10-20",
    invitedSuppliers: ["sup-001", "sup-003", "sup-005"],
    description:
      "Requesting quotes for lightweight aluminum mounting brackets for aerospace application",
    emailsSent: 3,
    emailsOpened: 3,
    bidsReceived: 1,
  },
  {
    id: "comp-003",
    rfqId: "rfq-005",
    name: "Renewable Energy Components Bidding",
    status: "closed",
    createdDate: "2023-10-15",
    closingDate: "2023-10-30",
    invitedSuppliers: ["sup-002", "sup-004", "sup-006"],
    description:
      "Seeking quotes for solar panel mounts and wind turbine couplings with corrosion resistance",
    emailsSent: 3,
    emailsOpened: 2,
    bidsReceived: 1,
  },
];

export function getBidsByRfqId(rfqId: string): Bid[] {
  return BIDS.filter((bid) => bid.rfqId === rfqId);
}

export function getBidById(bidId: string): Bid | undefined {
  return BIDS.find((bid) => bid.id === bidId);
}

export function getBidCompetitionsByRfqId(rfqId: string): BidCompetition[] {
  return BID_COMPETITIONS.filter((comp) => comp.rfqId === rfqId);
}

export function getBidCompetitionById(
  competitionId: string
): BidCompetition | undefined {
  return BID_COMPETITIONS.find((comp) => comp.id === competitionId);
}
