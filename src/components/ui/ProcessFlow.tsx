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
    <div className="w-full overflow-x-auto py-4 -mx-6 px-6">
      <div className="flex items-start justify-start lg:justify-center gap-y-4 gap-x-1 min-w-max">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5 w-20 lg:w-24">
                <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-400/20 transition-transform hover:scale-110">
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={2} />
                </div>
                <div className="text-center">
                  <p className="text-[10px] lg:text-xs font-bold text-gray-800 dark:text-gray-100 tracking-wide">
                    {step.title}
                  </p>
                  <p className="hidden sm:block text-[9px] lg:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                    {step.subtitle}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex items-center mx-0.5 lg:mx-1 mb-6">
                  <div className="w-3 lg:w-5 h-[2px] bg-gray-300 dark:bg-gray-600" />
                  <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-gray-400 dark:border-l-gray-500 -ml-[1px]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
