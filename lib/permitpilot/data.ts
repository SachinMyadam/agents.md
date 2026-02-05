export interface PermitTemplate {
  key: string;
  summary: string;
  keyPermits: string[];
  agencies: string[];
  baseTimelineDays: number;
  baseCost: number;
  costItems: Array<{ label: string; amount: number }>;
  risks: Array<{ title: string; severity: "low" | "medium" | "high"; description: string }>;
  documents: Array<{ name: string; required: boolean; notes?: string }>;
  offices: Array<{ name: string; address: string; hours?: string }>;
  checklist: Array<{
    id: string;
    title: string;
    agency: string;
    dueDate: string;
    cost: number;
    status: "todo" | "in_progress" | "blocked" | "done";
  }>;
  timeline: Array<{
    id: string;
    title: string;
    targetDate: string;
    owner: string;
    status: "planned" | "active" | "waiting" | "done";
  }>;
  actions: Array<{
    id: string;
    task: string;
    owner: string;
    priority: "low" | "medium" | "high";
    eta: string;
  }>;
}

export const permitTemplates: PermitTemplate[] = [
  {
    key: "austin|tx|food truck",
    summary:
      "Mobile food operations in Austin require health approval, fire inspection, and commissary verification before launch.",
    keyPermits: [
      "Mobile Food Vendor Permit",
      "Fire Safety Inspection",
      "Commissary Agreement",
      "Sales Tax Permit",
    ],
    agencies: [
      "Austin Public Health",
      "Austin Fire Department",
      "Texas Comptroller",
    ],
    baseTimelineDays: 32,
    baseCost: 4200,
    costItems: [
      { label: "Health Permit + Inspection", amount: 375 },
      { label: "Fire Safety Inspection", amount: 160 },
      { label: "Sales Tax Permit", amount: 0 },
      { label: "Commissary Fees", amount: 2100 },
      { label: "Insurance + Licensing", amount: 1565 },
    ],
    risks: [
      {
        title: "Parking Location Approval",
        severity: "medium",
        description:
          "Preferred vending zones may require separate authorization and can delay launch.",
      },
      {
        title: "Menu Change Review",
        severity: "low",
        description:
          "Adding high-risk foods triggers an extra health review.",
      },
    ],
    documents: [
      { name: "Commissary Letter", required: true },
      { name: "Menu + Food Handling Plan", required: true },
      { name: "Insurance Certificate", required: true },
      { name: "Vehicle Registration", required: true },
      { name: "Wastewater Disposal Plan", required: false },
    ],
    offices: [
      {
        name: "Austin Public Health",
        address: "1520 Rutherford Ln, Austin",
        hours: "Mon-Fri 8:00-5:00",
      },
      {
        name: "Austin Fire Department",
        address: "401 E 5th St, Austin",
      },
      {
        name: "Texas Comptroller Office",
        address: "111 E 17th St, Austin",
      },
    ],
    checklist: [
      {
        id: "ATX-FT-01",
        title: "Mobile Food Vendor Permit",
        agency: "Austin Public Health",
        dueDate: "Feb 18",
        cost: 375,
        status: "in_progress",
      },
      {
        id: "ATX-FT-02",
        title: "Fire Inspection Certificate",
        agency: "Austin Fire Department",
        dueDate: "Feb 22",
        cost: 160,
        status: "todo",
      },
      {
        id: "ATX-FT-03",
        title: "Commissary Agreement",
        agency: "Travis County",
        dueDate: "Feb 14",
        cost: 0,
        status: "done",
      },
    ],
    timeline: [
      {
        id: "M1",
        title: "Submit mobile vendor application",
        targetDate: "Feb 18",
        owner: "Founder",
        status: "active",
      },
      {
        id: "M2",
        title: "Complete fire inspection",
        targetDate: "Feb 25",
        owner: "AFD",
        status: "planned",
      },
      {
        id: "M3",
        title: "Health inspection + license issuance",
        targetDate: "Mar 5",
        owner: "APH",
        status: "waiting",
      },
    ],
    actions: [
      {
        id: "A1",
        task: "Upload commissary letter + menu",
        owner: "Founder",
        priority: "high",
        eta: "Tomorrow",
      },
      {
        id: "A2",
        task: "Book fire inspection slot",
        owner: "Operations",
        priority: "medium",
        eta: "This week",
      },
      {
        id: "A3",
        task: "Confirm insurance coverage",
        owner: "Legal",
        priority: "low",
        eta: "Next week",
      },
    ],
  },
  {
    key: "austin|tx|restaurant",
    summary:
      "Brick-and-mortar restaurants in Austin need health plan review, building permits, fire safety inspections, and occupancy approval.",
    keyPermits: [
      "Food Establishment Permit",
      "Certificate of Occupancy",
      "Fire Safety Inspection",
      "Signage Permit",
    ],
    agencies: [
      "Austin Public Health",
      "Austin Development Services",
      "Austin Fire Department",
    ],
    baseTimelineDays: 55,
    baseCost: 12500,
    costItems: [
      { label: "Health Plan Review", amount: 650 },
      { label: "Building Permit + Inspections", amount: 5800 },
      { label: "Fire Safety Inspection", amount: 220 },
      { label: "Occupancy Certificate", amount: 430 },
      { label: "Equipment + Vendor Fees", amount: 5400 },
    ],
    risks: [
      {
        title: "Construction Permit Lead Time",
        severity: "high",
        description:
          "Tenant improvements often require multiple inspections and can extend timelines.",
      },
      {
        title: "Ventilation Requirements",
        severity: "medium",
        description:
          "Kitchen upgrades may trigger additional mechanical permits.",
      },
    ],
    documents: [
      { name: "Floor Plan + Equipment Layout", required: true },
      { name: "Food Safety SOP", required: true },
      { name: "Lease + Zoning Approval", required: true },
      { name: "Grease Trap Agreement", required: false },
    ],
    offices: [
      {
        name: "Austin Development Services",
        address: "6310 Wilhelmina Delco Dr, Austin",
      },
      {
        name: "Austin Public Health",
        address: "1520 Rutherford Ln, Austin",
      },
      {
        name: "Austin Fire Department",
        address: "401 E 5th St, Austin",
      },
    ],
    checklist: [
      {
        id: "ATX-R-01",
        title: "Food Establishment Permit",
        agency: "Austin Public Health",
        dueDate: "Mar 5",
        cost: 650,
        status: "todo",
      },
      {
        id: "ATX-R-02",
        title: "Certificate of Occupancy",
        agency: "Development Services",
        dueDate: "Mar 20",
        cost: 430,
        status: "todo",
      },
      {
        id: "ATX-R-03",
        title: "Fire Safety Inspection",
        agency: "Austin Fire Department",
        dueDate: "Mar 12",
        cost: 220,
        status: "todo",
      },
    ],
    timeline: [
      {
        id: "M1",
        title: "Plan review + building permit",
        targetDate: "Mar 2",
        owner: "ADS",
        status: "active",
      },
      {
        id: "M2",
        title: "Fire inspection",
        targetDate: "Mar 12",
        owner: "AFD",
        status: "planned",
      },
      {
        id: "M3",
        title: "Final occupancy approval",
        targetDate: "Mar 25",
        owner: "ADS",
        status: "waiting",
      },
    ],
    actions: [
      {
        id: "A1",
        task: "Submit floor plan + equipment list",
        owner: "Founder",
        priority: "high",
        eta: "This week",
      },
      {
        id: "A2",
        task: "Schedule pre-opening health inspection",
        owner: "Operations",
        priority: "medium",
        eta: "2 weeks",
      },
      {
        id: "A3",
        task: "Confirm zoning clearance",
        owner: "Legal",
        priority: "medium",
        eta: "Next week",
      },
    ],
  },
];

function createGenericTemplate(
  city: string,
  state: string,
  businessType: string
): PermitTemplate {
  const safeCity = city || "your city";
  const safeState = state || "your region";
  const safeType = businessType || "business";
  return {
    key: `${safeCity}|${safeState}|${safeType}`.toLowerCase(),
    summary: `${safeType} launches in ${safeCity}, ${safeState} require local health, safety, and municipal approvals before opening.`,
    keyPermits: [
      "Food Safety License",
      "Local Trade License",
      "Fire Safety Clearance",
      "Tax Registration",
    ],
    agencies: [
      `${safeCity} Municipal Corporation`,
      `${safeState} Fire Department`,
      `${safeState} Tax Authority`,
    ],
    baseTimelineDays: 35,
    baseCost: 4500,
    costItems: [
      { label: "Health / Food Safety License", amount: 500 },
      { label: "Municipal Trade License", amount: 350 },
      { label: "Fire Safety Clearance", amount: 250 },
      { label: "Vehicle / Facility Compliance", amount: 2200 },
      { label: "Insurance + Misc Fees", amount: 1200 },
    ],
    risks: [
      {
        title: "Local Permit Lead Times",
        severity: "medium",
        description:
          "Processing time varies by municipality. Start applications early.",
      },
      {
        title: "Site / Route Approval",
        severity: "low",
        description:
          "Some cities restrict vending zones or require special permission.",
      },
    ],
    documents: [
      { name: "Identity + Address Proof", required: true },
      { name: "Menu + Food Safety Plan", required: true },
      { name: "Vehicle Registration / Lease", required: true },
      { name: "Waste Disposal Plan", required: false },
    ],
    offices: [
      {
        name: `${safeCity} Municipal Corporation`,
        address: "Municipal office (address TBD)",
      },
      {
        name: `${safeState} Fire Department`,
        address: "Fire department office (address TBD)",
      },
      {
        name: `${safeState} Tax Authority`,
        address: "Tax office (address TBD)",
      },
    ],
    checklist: [
      {
        id: "GEN-01",
        title: "Food Safety License",
        agency: `${safeState} Food Safety Dept`,
        dueDate: "Week 2",
        cost: 500,
        status: "in_progress",
      },
      {
        id: "GEN-02",
        title: "Local Trade License",
        agency: `${safeCity} Municipal Corporation`,
        dueDate: "Week 3",
        cost: 350,
        status: "todo",
      },
      {
        id: "GEN-03",
        title: "Fire Safety Clearance",
        agency: `${safeState} Fire Department`,
        dueDate: "Week 4",
        cost: 250,
        status: "todo",
      },
    ],
    timeline: [
      {
        id: "M1",
        title: "Submit license applications",
        targetDate: "Week 1",
        owner: "Founder",
        status: "active",
      },
      {
        id: "M2",
        title: "Facility / vehicle inspection",
        targetDate: "Week 3",
        owner: `${safeState} Fire Dept`,
        status: "planned",
      },
      {
        id: "M3",
        title: "Final approval + launch",
        targetDate: "Week 5",
        owner: "Municipality",
        status: "waiting",
      },
    ],
    actions: [
      {
        id: "A1",
        task: "Confirm vending zones and rules",
        owner: "Founder",
        priority: "high",
        eta: "This week",
      },
      {
        id: "A2",
        task: "Prepare food safety documents",
        owner: "Operations",
        priority: "medium",
        eta: "1 week",
      },
      {
        id: "A3",
        task: "Schedule inspection slot",
        owner: "Compliance",
        priority: "medium",
        eta: "2 weeks",
      },
    ],
  };
}

export function findPermitTemplate(city: string, state: string, businessType: string) {
  const normalized = `${city}|${state}|${businessType}`.toLowerCase();
  const cityState = `${city}|${state}`.toLowerCase();
  const type = businessType.toLowerCase();
  const isFoodTruck =
    type.includes("food truck") || type.includes("foodtruck") || type.includes("mobile");
  const isRestaurant =
    type.includes("restaurant") ||
    type.includes("brick") ||
    type.includes("dine") ||
    type.includes("cafe");

  return (
    permitTemplates.find((template) => template.key === normalized) ??
    (isRestaurant
      ? permitTemplates.find((template) =>
          template.key.startsWith(`${cityState}|restaurant`)
        )
      : undefined) ??
    (isFoodTruck
      ? permitTemplates.find((template) =>
          template.key.startsWith(`${cityState}|food truck`)
        )
      : undefined) ??
    permitTemplates.find((template) => template.key.startsWith(cityState)) ??
    createGenericTemplate(city, state, businessType)
  );
}
