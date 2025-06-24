export interface SupplierCapability {
  id: string;
  name: string;
  description: string;
  expertise: "beginner" | "intermediate" | "expert";
}

export interface SupplierTransaction {
  id: string;
  date: string;
  orderNumber: string;
  amount: number;
  status: "completed" | "pending" | "cancelled";
  materialType: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  totalPurchases: number;
  avatar?: string;
  status: "active" | "inactive";
  rating: number;
  capabilities: SupplierCapability[];
  transactions: SupplierTransaction[];
  contactsCount?: number;
  iso9001?: boolean;
  iatf?: boolean;
  type?: string;
  size?: string;
  presentation?: string;
  state?: string;
  zip?: string;
  supplierType?: string;
  coreCapacity?: string;
}

export const SUPPLIERS: Supplier[] = [
  {
    id: "sup-001",
    name: "Robert Johnson",
    company: "MetalWorks Inc.",
    email: "robert@metalworks.com",
    phone: "(555) 123-4567",
    address: "123 Industrial Blvd, Detroit, MI 48201",
    joinedDate: "2021-03-15",
    totalPurchases: 45750.25,
    avatar: "https://github.com/polymet-ai.png",
    status: "active",
    rating: 4.8,
    capabilities: [
      {
        id: "cap-001",
        name: "CNC Milling",
        description: "Precision CNC milling for complex metal parts",
        expertise: "expert",
      },
      {
        id: "cap-002",
        name: "Metal Casting",
        description: "Custom metal casting for industrial applications",
        expertise: "intermediate",
      },
      {
        id: "cap-003",
        name: "Surface Finishing",
        description: "Professional surface treatments and finishes",
        expertise: "expert",
      },
    ],

    transactions: [
      {
        id: "tr-001",
        date: "2023-10-15",
        orderNumber: "PO-2023-089",
        amount: 12500.75,
        status: "completed",
        materialType: "Aluminum Alloy",
      },
      {
        id: "tr-002",
        date: "2023-09-22",
        orderNumber: "PO-2023-076",
        amount: 8750.5,
        status: "completed",
        materialType: "Stainless Steel",
      },
      {
        id: "tr-003",
        date: "2023-08-10",
        orderNumber: "PO-2023-064",
        amount: 15200.0,
        status: "completed",
        materialType: "Tool Steel",
      },
    ],
    contactsCount: 1,
    iso9001: true,
    iatf: false,
    type: "Tolling",
    size: "Large",
    presentation: "",
    state: "CDMX",
    zip: "12345",
    supplierType: "Manufacturer",
    coreCapacity: "Aluminum Die Casting",
  },
  {
    id: "sup-002",
    name: "Sarah Williams",
    company: "Precision Plastics",
    email: "sarah@precisionplastics.com",
    phone: "(555) 234-5678",
    address: "456 Manufacturing Way, Chicago, IL 60607",
    joinedDate: "2020-06-22",
    totalPurchases: 32450.75,
    avatar: "https://github.com/yusufhilmi.png",
    status: "active",
    rating: 4.5,
    capabilities: [
      {
        id: "cap-004",
        name: "Injection Molding",
        description: "High-volume plastic injection molding",
        expertise: "expert",
      },
      {
        id: "cap-005",
        name: "3D Printing",
        description: "Rapid prototyping with industrial 3D printers",
        expertise: "expert",
      },
      {
        id: "cap-006",
        name: "Plastic Extrusion",
        description: "Custom plastic extrusion for various applications",
        expertise: "intermediate",
      },
    ],

    transactions: [
      {
        id: "tr-004",
        date: "2023-10-05",
        orderNumber: "PO-2023-085",
        amount: 9500.25,
        status: "completed",
        materialType: "ABS Plastic",
      },
      {
        id: "tr-005",
        date: "2023-09-12",
        orderNumber: "PO-2023-072",
        amount: 7200.5,
        status: "completed",
        materialType: "Polycarbonate",
      },
      {
        id: "tr-006",
        date: "2023-11-01",
        orderNumber: "PO-2023-094",
        amount: 11250.0,
        status: "pending",
        materialType: "Nylon",
      },
    ],
  },
  {
    id: "sup-003",
    name: "Michael Chen",
    company: "Advanced Electronics",
    email: "michael@advancedelectronics.com",
    phone: "(555) 345-6789",
    address: "789 Tech Park, San Jose, CA 95134",
    joinedDate: "2022-01-10",
    totalPurchases: 28900.5,
    avatar: "https://github.com/furkanksl.png",
    status: "active",
    rating: 4.7,
    capabilities: [
      {
        id: "cap-007",
        name: "PCB Assembly",
        description: "Automated PCB assembly and testing",
        expertise: "expert",
      },
      {
        id: "cap-008",
        name: "Electronic Components",
        description: "Supply of specialized electronic components",
        expertise: "expert",
      },
      {
        id: "cap-009",
        name: "Circuit Design",
        description: "Custom circuit design and optimization",
        expertise: "intermediate",
      },
    ],

    transactions: [
      {
        id: "tr-007",
        date: "2023-10-25",
        orderNumber: "PO-2023-092",
        amount: 8750.25,
        status: "completed",
        materialType: "PCB Components",
      },
      {
        id: "tr-008",
        date: "2023-09-30",
        orderNumber: "PO-2023-080",
        amount: 12350.5,
        status: "completed",
        materialType: "Microcontrollers",
      },
      {
        id: "tr-009",
        date: "2023-11-05",
        orderNumber: "PO-2023-096",
        amount: 7800.0,
        status: "pending",
        materialType: "Sensors",
      },
    ],
  },
  {
    id: "sup-004",
    name: "Jennifer Davis",
    company: "Quality Fasteners",
    email: "jennifer@qualityfasteners.com",
    phone: "(555) 456-7890",
    address: "101 Hardware St, Pittsburgh, PA 15222",
    joinedDate: "2021-09-05",
    totalPurchases: 18500.25,
    avatar: "https://github.com/kdrnp.png",
    status: "inactive",
    rating: 3.9,
    capabilities: [
      {
        id: "cap-010",
        name: "Precision Screws",
        description: "Custom precision screws and bolts",
        expertise: "expert",
      },
      {
        id: "cap-011",
        name: "Industrial Fasteners",
        description: "Heavy-duty industrial fastening solutions",
        expertise: "expert",
      },
      {
        id: "cap-012",
        name: "Specialty Hardware",
        description: "Specialized hardware for unique applications",
        expertise: "intermediate",
      },
    ],

    transactions: [
      {
        id: "tr-010",
        date: "2023-08-15",
        orderNumber: "PO-2023-065",
        amount: 5250.75,
        status: "completed",
        materialType: "Titanium Screws",
      },
      {
        id: "tr-011",
        date: "2023-07-22",
        orderNumber: "PO-2023-058",
        amount: 7500.5,
        status: "completed",
        materialType: "Steel Bolts",
      },
      {
        id: "tr-012",
        date: "2023-09-10",
        orderNumber: "PO-2023-070",
        amount: 5750.0,
        status: "cancelled",
        materialType: "Specialty Fasteners",
      },
    ],
  },
  {
    id: "sup-005",
    name: "David Thompson",
    company: "Composite Materials",
    email: "david@compositematerials.com",
    phone: "(555) 567-8901",
    address: "202 Aerospace Ave, Seattle, WA 98108",
    joinedDate: "2022-04-18",
    totalPurchases: 52300.75,
    avatar: "https://github.com/yahyabedirhan.png",
    status: "active",
    rating: 4.9,
    capabilities: [
      {
        id: "cap-013",
        name: "Carbon Fiber",
        description: "Advanced carbon fiber manufacturing",
        expertise: "expert",
      },
      {
        id: "cap-014",
        name: "Composite Layup",
        description: "Precision composite material layup",
        expertise: "expert",
      },
      {
        id: "cap-015",
        name: "Kevlar Processing",
        description: "Specialized Kevlar processing for industrial use",
        expertise: "intermediate",
      },
    ],

    transactions: [
      {
        id: "tr-013",
        date: "2023-10-20",
        orderNumber: "PO-2023-090",
        amount: 18500.25,
        status: "completed",
        materialType: "Carbon Fiber Sheets",
      },
      {
        id: "tr-014",
        date: "2023-09-15",
        orderNumber: "PO-2023-074",
        amount: 22750.5,
        status: "completed",
        materialType: "Composite Resin",
      },
      {
        id: "tr-015",
        date: "2023-11-02",
        orderNumber: "PO-2023-095",
        amount: 11050.0,
        status: "pending",
        materialType: "Kevlar Fabric",
      },
    ],
  },
  {
    id: "sup-006",
    name: "Lisa Rodriguez",
    company: "Industrial Coatings",
    email: "lisa@industrialcoatings.com",
    phone: "(555) 678-9012",
    address: "303 Paint Blvd, Houston, TX 77002",
    joinedDate: "2021-07-30",
    totalPurchases: 24850.5,
    avatar: "https://github.com/denizbuyuktas.png",
    status: "inactive",
    rating: 4.2,
    capabilities: [
      {
        id: "cap-016",
        name: "Powder Coating",
        description: "Industrial powder coating services",
        expertise: "expert",
      },
      {
        id: "cap-017",
        name: "Ceramic Coating",
        description: "High-temperature ceramic coating application",
        expertise: "intermediate",
      },
      {
        id: "cap-018",
        name: "Anti-Corrosion",
        description: "Specialized anti-corrosion treatments",
        expertise: "expert",
      },
    ],

    transactions: [
      {
        id: "tr-016",
        date: "2023-08-25",
        orderNumber: "PO-2023-068",
        amount: 9250.25,
        status: "completed",
        materialType: "Powder Coating Materials",
      },
      {
        id: "tr-017",
        date: "2023-07-12",
        orderNumber: "PO-2023-055",
        amount: 7600.5,
        status: "completed",
        materialType: "Ceramic Compounds",
      },
      {
        id: "tr-018",
        date: "2023-09-05",
        orderNumber: "PO-2023-069",
        amount: 8000.0,
        status: "cancelled",
        materialType: "Anti-Corrosion Chemicals",
      },
    ],
  },
];
