import { Customer } from "./customers-data";

export interface PartNumber {
  id: string;
  name: string;
  description: string;
  quantity: number;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  technicalAnalysisId?: string;
  files: {
    drawingFile?: string;
    modelFile?: string;
  };
}

export interface RFQ {
  id: string;
  name: string;
  customerId: string;
  dateCreated: string;
  dueDate: string;
  status:
    | "draft"
    | "submitted"
    | "in-review"
    | "quoted"
    | "accepted"
    | "rejected";
  partNumbers: PartNumber[];
}

export const RFQS: RFQ[] = [
  {
    id: "rfq-001",
    name: "Hydraulic System Components",
    customerId: "cust-001",
    dateCreated: "2023-11-15",
    dueDate: "2023-12-05",
    status: "in-review",
    partNumbers: [
      {
        id: "part-001",
        name: "Hydraulic Valve Housing",
        description: "Custom valve housing for high-pressure hydraulic system",
        quantity: 50,
        status: "in-progress",
        technicalAnalysisId: "ta-001",
        files: {
          drawingFile: "valve_housing_drawing.pdf",
          modelFile: "valve_housing.step",
        },
      },
      {
        id: "part-002",
        name: "Pressure Regulator Mount",
        description: "Mounting bracket for pressure regulator assembly",
        quantity: 25,
        status: "pending",
        files: {
          drawingFile: "regulator_mount.pdf",
          modelFile: "regulator_mount.step",
        },
      },
      {
        id: "part-003",
        name: "Flow Control Block",
        description:
          "Precision-machined flow control block with multiple ports",
        quantity: 15,
        status: "completed",
        technicalAnalysisId: "ta-002",
        files: {
          drawingFile: "flow_control.pdf",
          modelFile: "flow_control.step",
        },
      },
    ],
  },
  {
    id: "rfq-002",
    name: "Medical Device Components",
    customerId: "cust-004",
    dateCreated: "2023-11-20",
    dueDate: "2023-12-15",
    status: "submitted",
    partNumbers: [
      {
        id: "part-004",
        name: "Surgical Instrument Handle",
        description: "Ergonomic handle for precision surgical instrument",
        quantity: 100,
        status: "pending",
        files: {
          drawingFile: "instrument_handle.pdf",
          modelFile: "instrument_handle.step",
        },
      },
      {
        id: "part-005",
        name: "Implant Fixture",
        description: "Titanium fixture for medical implant",
        quantity: 50,
        status: "pending",
        files: {
          drawingFile: "implant_fixture.pdf",
          modelFile: "implant_fixture.step",
        },
      },
    ],
  },
  {
    id: "rfq-003",
    name: "Aerospace Mounting Brackets",
    customerId: "cust-003",
    dateCreated: "2023-10-05",
    dueDate: "2023-11-10",
    status: "quoted",
    partNumbers: [
      {
        id: "part-006",
        name: "Wing Sensor Mount",
        description: "Lightweight aluminum mount for wing sensor array",
        quantity: 12,
        status: "completed",
        technicalAnalysisId: "ta-003",
        files: {
          drawingFile: "wing_mount.pdf",
          modelFile: "wing_mount.step",
        },
      },
      {
        id: "part-007",
        name: "Avionics Cooling Bracket",
        description: "Heat-dissipating bracket for avionics bay",
        quantity: 24,
        status: "in-progress",
        technicalAnalysisId: "ta-004",
        files: {
          drawingFile: "cooling_bracket.pdf",
          modelFile: "cooling_bracket.step",
        },
      },
    ],
  },
  {
    id: "rfq-004",
    name: "Custom Furniture Hardware",
    customerId: "cust-005",
    dateCreated: "2023-11-25",
    dueDate: "2023-12-20",
    status: "draft",
    partNumbers: [
      {
        id: "part-008",
        name: "Table Leg Connector",
        description: "Hidden connector for designer table legs",
        quantity: 200,
        status: "pending",
        files: {
          drawingFile: "leg_connector.pdf",
          modelFile: "leg_connector.step",
        },
      },
      {
        id: "part-009",
        name: "Adjustable Chair Hinge",
        description: "Custom hinge for adjustable chair back",
        quantity: 100,
        status: "pending",
        files: {
          drawingFile: "chair_hinge.pdf",
          modelFile: "chair_hinge.step",
        },
      },
      {
        id: "part-010",
        name: "Decorative Panel Clip",
        description: "Hidden clip system for decorative panels",
        quantity: 500,
        status: "pending",
        files: {
          drawingFile: "panel_clip.pdf",
          modelFile: "panel_clip.step",
        },
      },
    ],
  },
  {
    id: "rfq-005",
    name: "Renewable Energy Components",
    customerId: "cust-006",
    dateCreated: "2023-10-15",
    dueDate: "2023-11-30",
    status: "accepted",
    partNumbers: [
      {
        id: "part-011",
        name: "Solar Panel Mount Bracket",
        description: "Adjustable mounting bracket for solar panels",
        quantity: 150,
        status: "completed",
        technicalAnalysisId: "ta-005",
        files: {
          drawingFile: "solar_mount.pdf",
          modelFile: "solar_mount.step",
        },
      },
      {
        id: "part-012",
        name: "Wind Turbine Coupling",
        description: "High-strength coupling for small wind turbines",
        quantity: 75,
        status: "completed",
        technicalAnalysisId: "ta-006",
        files: {
          drawingFile: "turbine_coupling.pdf",
          modelFile: "turbine_coupling.step",
        },
      },
    ],
  },
];

export function getRfqById(id: string): RFQ | undefined {
  return RFQS.find((rfq) => rfq.id === id);
}

export function getPartNumberById(
  rfqId: string,
  partId: string
): PartNumber | undefined {
  const rfq = getRfqById(rfqId);
  if (!rfq) return undefined;
  return rfq.partNumbers.find((part) => part.id === partId);
}
