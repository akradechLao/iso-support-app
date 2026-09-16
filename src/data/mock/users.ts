import { User } from "@/types";

export const users: User[] = [
  { id: "U001", name: "สมชาย ใจดี", email: "somchai@company.com", departmentId: "QA", role: "manager" },
  { id: "U002", name: "สมหญิง รักงาน", email: "somying@company.com", departmentId: "HR", role: "admin" },
  { id: "U003", name: "วิชัย เก่งมาก", email: "wichai@company.com", departmentId: "SAF", role: "auditor" },
  { id: "U004", name: "พิมพ์ใจ สดใส", email: "pimjai@company.com", departmentId: "RD", role: "owner" },
  { id: "U005", name: "ธนวัฒน์ มั่นคง", email: "thanawat@company.com", departmentId: "TEC", role: "owner" },
  { id: "U006", name: "วรรณา 优美", email: "warana@company.com", departmentId: "LAB", role: "owner" },
  { id: "U007", name: "ประเสริฐ ดีเลิศ", email: "prasert@company.com", departmentId: "PROD", role: "manager" },
  { id: "U008", name: "จินดา ระเบียบ", email: "jinda@company.com", departmentId: "OFF", role: "admin" },
  { id: "U009", name: "นิพนธ์ ถูกต้อง", email: "nipon@company.com", departmentId: "LAW", role: "owner" },
  { id: "U010", name: "สุภาพร ตรวจสอบ", email: { email: "supaporn@company.com" } as unknown as string, departmentId: "ACC", role: "auditor" },
  { id: "U011", name: "กมล ซื้อมา", email: "kamol@company.com", departmentId: "PUR", role: "owner" },
  { id: "U012", name: "รัตนา ข้อมูล", email: "rattana@company.com", departmentId: "IT", role: "owner" },
  { id: "U013", name: "อภิชาติ ตลาด", email: "apichat@company.com", departmentId: "MK", role: "owner" },
  { id: "U014", name: "สุทธิพงศ์ ไฟฟ้า", email: "suthipong@company.com", departmentId: "ETEC", role: "owner" },
  { id: "U015", name: "มณี ไฟเขียว", email: "manee@company.com", departmentId: "QA", role: "auditor" },
];
