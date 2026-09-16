import { LegalRequirement } from "@/types";

export const legalRequirements: LegalRequirement[] = [
  { id: "LGL-001", law: "พระราชบัญญัติคุ้มครองแรงงาน พ.ศ. 2541", type: "Labor Law", departmentId: "HR", status: "compliant", description: "Labor Protection Act - Working hours, wages, safety" },
  { id: "LGL-002", law: "พระราชบัญญัติความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน พ.ศ. 2558", type: "Safety Law", departmentId: "SAF", status: "compliant", description: "Occupational Safety, Health and Environment Act" },
  { id: "LGL-003", law: "พระราชบัญญัติโรงงาน พ.ศ. 2535", type: "Factory Law", departmentId: "PROD", status: "compliant", description: "Factory Act - Licensing and operation requirements" },
  { id: "LGL-004", law: "พระราชบัญญัติโรงงาน พ.ศ. 2535 (แก้ไข 2562)", type: "Factory Law", departmentId: "PROD", status: "pending_assessment", description: "Factory Act amendments 2019" },
  { id: "LGL-005", law: "ประกาศกระทรวงอุตสาหกรรม เรื่อง ความปลอดภัยในการทำงานเกี่ยวกับไฟฟ้า", type: "Safety Regulation", departmentId: "ETEC", status: "compliant", description: "Ministry of Industry - Electrical safety regulations" },
  { id: "LGL-006", law: "พระราชบัญญัติส่งเสริมและอนุรักษ์พลังงาน พ.ศ. 2535", type: "Energy Law", departmentId: "TEC", status: "compliant", description: "Energy Conservation Promotion Act" },
  { id: "LGL-007", law: "พระราชบัญญัติภาษีโรงเรือนและที่ดิน พ.ศ. 2475", type: "Tax Law", departmentId: "ACC", status: "compliant", description: "Building and Land Tax Act" },
  { id: "LGL-008", law: "ประมวลกฎหมายแพ่งและพาณิชย์", type: "Civil Law", departmentId: "LAW", status: "compliant", description: "Civil and Commercial Code" },
  { id: "LGL-009", law: "พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562", type: "Data Protection", departmentId: "IT", status: "pending_assessment", description: "Personal Data Protection Act (PDPA)" },
  { id: "LGL-010", law: "ประกาศกระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม เรื่อง กำหนดประเภทและขนาดของโครงการ/กิจการที่ต้องจัดทำรายงานการวิเคราะห์ผลกระทบสิ่งแวดล้อม", type: "Environmental Regulation", departmentId: "TEC", status: "compliant", description: "EIA requirements for industrial projects" },
  { id: "LGL-011", law: "พระราชบัญญัติวัตถุอันตราย พ.ศ. 2535", type: "Chemical Law", departmentId: "SAF", status: "non_compliant", description: "Hazardous Substances Act - Chemical storage requirements" },
  { id: "LGL-012", law: "ประกาศคณะกรรมการกำกับการบริหารنقصความปลอดภัยของโรงงาน เรื่อง หลักเกณฑ์และวิธีการจัดให้มีการฝึกอบรมเกี่ยวกับความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน", type: "Safety Regulation", departmentId: "HR", status: "compliant", description: "Safety training requirements regulation" },
  { id: "LGL-013", law: "พระราชบัญญัติږล waste management พ.ศ. 2558", type: "Waste Law", departmentId: "PUR", status: "non_compliant", description: "Waste management requirements for industrial facilities" },
  { id: "LGL-014", law: "ประกาศกระทรวงสาธารณสุข เรื่อง กำหนดค่าได้รับสูงสุดของสารเคมีในบรรยากาศการทำงาน", type: "Health Regulation", departmentId: "SAF", status: "compliant", description: "Maximum chemical exposure limits in workplace" },
  { id: "LGL-015", law: "พระราชบัญญัติแรงงานสัมพันธ์ พ.ศ. 2518", type: "Labor Law", departmentId: "HR", status: "compliant", description: "Labor Relations Act" },
];
