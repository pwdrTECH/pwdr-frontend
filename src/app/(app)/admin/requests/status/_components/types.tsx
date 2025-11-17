export type EMRRequest = {
  id: string
  sn: number
  dateDisplay: string // "10:47 AM" or "12 Dec 2024"
  patientFirst: string
  patientLast: string
  patientId: string
  hmo: string
  createdBy: string
  status: "Process" | "Processed"
}

export const HMOS = [
  "ALLY HEALTH CARE",
  "VENUS MEDICARE LIMITED",
  "SONGHAI",
] as const

export const STATUSES = ["Process", "Processed"] as const

// Deterministic mock data (10 rows like screenshot)
export const MOCK_REQUESTS: EMRRequest[] = [
  {
    id: "r1",
    sn: 1,
    dateDisplay: "10:47 AM",
    patientFirst: "Muhammad",
    patientLast: "Sahab",
    patientId: "PT-0001",
    hmo: "ALLY HEALTH CARE",
    createdBy: "Rupert Chima",
    status: "Process",
  },
  {
    id: "r2",
    sn: 2,
    dateDisplay: "11:12 AM",
    patientFirst: "Muhammad",
    patientLast: "Sahab",
    patientId: "PT-0002",
    hmo: "ALLY HEALTH CARE",
    createdBy: "Oluwatobi Bamsa",
    status: "Process",
  },
  {
    id: "r3",
    sn: 3,
    dateDisplay: "01:32 PM",
    patientFirst: "Muhammad",
    patientLast: "Sahab",
    patientId: "PT-0003",
    hmo: "VENUS MEDICARE LIMITED",
    createdBy: "Oluwatobi Bamsa",
    status: "Process",
  },
  {
    id: "r4",
    sn: 4,
    dateDisplay: "12 Dec 2024",
    patientFirst: "Muhammad",
    patientLast: "Sahab",
    patientId: "PT-0004",
    hmo: "VENUS MEDICARE LIMITED",
    createdBy: "Rupert Chima",
    status: "Process",
  },
  {
    id: "r5",
    sn: 5,
    dateDisplay: "12 Dec 2024",
    patientFirst: "Muhammad",
    patientLast: "Sahab",
    patientId: "PT-0005",
    hmo: "SONGHAI",
    createdBy: "Oluwatobi Bamsa",
    status: "Processed",
  },
  {
    id: "r6",
    sn: 6,
    dateDisplay: "12 Dec 2024",
    patientFirst: "Muhammad",
    patientLast: "Sahab",
    patientId: "PT-0006",
    hmo: "SONGHAI",
    createdBy: "Victor Mosugu Mosiforeba",
    status: "Processed",
  },
  {
    id: "r7",
    sn: 7,
    dateDisplay: "12 Dec 2024",
    patientFirst: "Muhammad",
    patientLast: "Sahab",
    patientId: "PT-0007",
    hmo: "SONGHAI",
    createdBy: "Victor Mosugu Mosiforeba",
    status: "Processed",
  },
  {
    id: "r8",
    sn: 8,
    dateDisplay: "12 Dec 2024",
    patientFirst: "Muhammad",
    patientLast: "Sahab",
    patientId: "PT-0008",
    hmo: "ALLY HEALTH CARE",
    createdBy: "Kelechi Henry Njoku",
    status: "Processed",
  },
  {
    id: "r9",
    sn: 9,
    dateDisplay: "12 Dec 2024",
    patientFirst: "Muhammad",
    patientLast: "Sahab",
    patientId: "PT-0009",
    hmo: "VENUS MEDICARE LIMITED",
    createdBy: "Kelechi Henry Njoku",
    status: "Processed",
  },
  {
    id: "r10",
    sn: 10,
    dateDisplay: "12 Dec 2024",
    patientFirst: "Muhammad",
    patientLast: "Sahab",
    patientId: "PT-0010",
    hmo: "SONGHAI",
    createdBy: "Oluwatobi Bamsa",
    status: "Processed",
  },
]
