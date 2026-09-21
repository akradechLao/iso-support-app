import { FileText, CheckCircle, ClipboardCheck, AlertTriangle, AlertCircle, Wrench, Eye, TrendingUp } from "lucide-react";

const steps = [
  { icon: FileText, title: "DOCUMENT", subtitle: "เอกสารและระเบียบปฏิบัติ" },
  { icon: CheckCircle, title: "APPROVAL", subtitle: "การอนุมัติ" },
  { icon: ClipboardCheck, title: "AUDIT", subtitle: "การตรวจสอบภายใน" },
  { icon: AlertTriangle, title: "FINDING", subtitle: "พบร่องรอย/ข้อผิดพลาด" },
  { icon: AlertCircle, title: "NCR/CAR", subtitle: "การแก้ไขและป้องกัน" },
  { icon: Wrench, title: "ACTION", subtitle: "การดำเนินการแก้ไข" },
  { icon: Eye, title: "VERIFICATION", subtitle: "การตรวจสอบผลลัพธ์" },
  { icon: TrendingUp, title: "IMPROVEMENT", subtitle: "ปรับปรุงอย่างต่อเนื่อง" },
];

export default function ProcessFlow() {
  return (
    <div className="w-full overflow-x-auto py-6">
      <div className="flex flex-wrap items-start justify-center gap-y-6 gap-x-2 min-w-max px-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex items-center">
              <div className="flex flex-col items-center gap-2 w-28">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-400/20 transition-transform hover:scale-110">
                  <Icon className="w-7 h-7" strokeWidth={2} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-100 tracking-wide">
                    {step.title}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                    {step.subtitle}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex items-center mx-1 mb-8">
                  <div className="w-4 h-[2px] bg-gray-300 dark:bg-gray-600" />
                  <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-gray-400 dark:border-l-gray-500 -ml-[1px]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
