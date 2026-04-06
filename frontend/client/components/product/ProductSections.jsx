import { useState, useCallback } from "react";
import { PageFade } from "@/utils/PageAnimations";
import AccordionMotion from "@/utils/AccordionMotion";

const CardSection = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setOpen(v => !v), []);
  return (
    <PageFade>
      <div className="rounded-lg border border-[#E6E6E6]">
        <button onClick={toggle} className="flex w-full items-center justify-between px-4 py-3 text-[18px] font-medium text-[#1E1E1E] rounded-t-lg">
          {title}
          <span className="inline-flex h-6 w-6 items-center justify-center text-[#6F2A2B] text-[18px]">{open ? "–" : "+"}</span>
        </button>
        <AccordionMotion isOpen={open}>
          <div className="px-4 pb-4 text-base leading-relaxed text-gray-600">{children}</div>
        </AccordionMotion>
      </div>
    </PageFade>
  );
};

export const ProductSections = ({ description, guaranteedIndicators, feedingNote }) => (
  <div className="mt-8 space-y-3">
    <CardSection title="Описание" defaultOpen><p className="whitespace-pre-line">{description}</p></CardSection>
    <CardSection title="Гарантируемые показатели" defaultOpen><p className="whitespace-pre-line">{guaranteedIndicators}</p></CardSection>
    <CardSection title="Нормы кормления" defaultOpen><p className="whitespace-pre-line">{feedingNote}</p></CardSection>
  </div>
);