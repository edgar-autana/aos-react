export interface CustomerTransaction {
  id: string;
  date: string;
  orderNumber: string;
  amount: number;
  status: "completed" | "pending" | "cancelled";
  projectName: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  totalSpent: number;
  avatar?: string;
  status: "active" | "inactive";
  transactions: CustomerTransaction[];
}

export const CUSTOMERS: Customer[] = [
  {
    id: "cust-001",
    name: "John Smith",
    company: "Acme Industries",
    email: "john.smith@acme.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, CA 94105",
    joinedDate: "2020-03-15",
    totalSpent: 158750.25,
    avatar: "https://github.com/yusufhilmi.png",
    status: "active",
    transactions: [
      {
        id: "txn-001",
        date: "2023-10-12",
        orderNumber: "CNC-2023-001",
        amount: 45250.75,
        status: "pending",
        projectName: "Custom Machine Parts",
      },
      {
        id: "txn-002",
        date: "2023-07-05",
        orderNumber: "CNC-2023-A45",
        amount: 32500.0,
        status: "completed",
        projectName: "Industrial Gears",
      },
      {
        id: "txn-003",
        date: "2023-04-18",
        orderNumber: "CNC-2023-B12",
        amount: 28750.5,
        status: "completed",
        projectName: "Hydraulic Components",
      },
      {
        id: "txn-004",
        date: "2022-11-30",
        orderNumber: "CNC-2022-C78",
        amount: 52249.0,
        status: "completed",
        projectName: "Precision Molds",
      },
    ],
  },
  {
    id: "cust-002",
    name: "Sarah Johnson",
    company: "TechSolutions Inc.",
    email: "sarah.johnson@techsolutions.com",
    phone: "(555) 987-6543",
    address: "456 Tech Blvd, Innovation City, NY 10001",
    joinedDate: "2021-01-22",
    totalSpent: 93450.0,
    avatar: "https://github.com/denizbuyuktas.png",
    status: "active",
    transactions: [
      {
        id: "txn-005",
        date: "2023-09-28",
        orderNumber: "CNC-2023-002",
        amount: 18750.0,
        status: "completed",
        projectName: "Prototype Enclosures",
      },
      {
        id: "txn-006",
        date: "2023-06-14",
        orderNumber: "CNC-2023-D23",
        amount: 27500.0,
        status: "completed",
        projectName: "Electronic Housing",
      },
      {
        id: "txn-007",
        date: "2023-02-08",
        orderNumber: "CNC-2023-E56",
        amount: 47200.0,
        status: "completed",
        projectName: "Server Rack Components",
      },
    ],
  },
  {
    id: "cust-003",
    name: "Robert Chen",
    company: "Precision Engineering Ltd.",
    email: "robert.chen@precisioneng.com",
    phone: "(555) 456-7890",
    address: "789 Engineering Way, Techville, WA 98101",
    joinedDate: "2019-08-10",
    totalSpent: 215300.75,
    avatar: "https://github.com/furkanksl.png",
    status: "active",
    transactions: [
      {
        id: "txn-008",
        date: "2023-11-05",
        orderNumber: "CNC-2023-003",
        amount: 42750.25,
        status: "pending",
        projectName: "Aerospace Components",
      },
      {
        id: "txn-009",
        date: "2023-08-17",
        orderNumber: "CNC-2023-F34",
        amount: 36500.0,
        status: "completed",
        projectName: "Turbine Parts",
      },
      {
        id: "txn-010",
        date: "2023-05-22",
        orderNumber: "CNC-2023-G67",
        amount: 58250.5,
        status: "completed",
        projectName: "Precision Bearings",
      },
      {
        id: "txn-011",
        date: "2023-02-09",
        orderNumber: "CNC-2023-H89",
        amount: 77800.0,
        status: "completed",
        projectName: "Aircraft Fittings",
      },
    ],
  },
  {
    id: "cust-004",
    name: "Emily Rodriguez",
    company: "MedTech Innovations",
    email: "emily.rodriguez@medtech.com",
    phone: "(555) 789-0123",
    address: "321 Health Ave, Medville, MA 02115",
    joinedDate: "2022-04-05",
    totalSpent: 87650.5,
    avatar: "https://github.com/yahyabedirhan.png",
    status: "active",
    transactions: [
      {
        id: "txn-012",
        date: "2023-10-30",
        orderNumber: "CNC-2023-004",
        amount: 32150.5,
        status: "pending",
        projectName: "Medical Device Parts",
      },
      {
        id: "txn-013",
        date: "2023-07-12",
        orderNumber: "CNC-2023-I12",
        amount: 28750.0,
        status: "completed",
        projectName: "Surgical Instrument Components",
      },
      {
        id: "txn-014",
        date: "2023-03-25",
        orderNumber: "CNC-2023-J45",
        amount: 26750.0,
        status: "completed",
        projectName: "Diagnostic Equipment Parts",
      },
    ],
  },
  {
    id: "cust-005",
    name: "Michael Thompson",
    company: "Custom Furniture Co.",
    email: "michael.thompson@customfurniture.com",
    phone: "(555) 234-5678",
    address: "567 Design St, Craftsville, OR 97201",
    joinedDate: "2021-09-18",
    totalSpent: 62450.25,
    avatar: "https://github.com/kdrnp.png",
    status: "inactive",
    transactions: [
      {
        id: "txn-015",
        date: "2023-09-15",
        orderNumber: "CNC-2023-005",
        amount: 18750.25,
        status: "delayed",
        projectName: "Designer Table Legs",
      },
      {
        id: "txn-016",
        date: "2023-05-28",
        orderNumber: "CNC-2023-K78",
        amount: 24500.0,
        status: "completed",
        projectName: "Custom Chair Components",
      },
      {
        id: "txn-017",
        date: "2023-01-14",
        orderNumber: "CNC-2023-L90",
        amount: 19200.0,
        status: "completed",
        projectName: "Decorative Panels",
      },
    ],
  },
  {
    id: "cust-006",
    name: "Jennifer Lee",
    company: "Green Energy Systems",
    email: "jennifer.lee@greenenergy.com",
    phone: "(555) 345-6789",
    address: "890 Solar Rd, Greenville, CO 80201",
    joinedDate: "2020-11-30",
    totalSpent: 143750.0,
    status: "active",
    transactions: [
      {
        id: "txn-018",
        date: "2023-11-10",
        orderNumber: "CNC-2023-M23",
        amount: 47250.0,
        status: "pending",
        projectName: "Solar Panel Mounts",
      },
      {
        id: "txn-019",
        date: "2023-08-05",
        orderNumber: "CNC-2023-N56",
        amount: 36500.0,
        status: "completed",
        projectName: "Wind Turbine Components",
      },
      {
        id: "txn-020",
        date: "2023-04-22",
        orderNumber: "CNC-2023-O89",
        amount: 29750.0,
        status: "completed",
        projectName: "Battery Housing Units",
      },
      {
        id: "txn-021",
        date: "2022-12-10",
        orderNumber: "CNC-2022-P12",
        amount: 30250.0,
        status: "completed",
        projectName: "Geothermal System Parts",
      },
    ],
  },
];
