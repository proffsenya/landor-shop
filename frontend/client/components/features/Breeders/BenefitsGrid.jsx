import React from "react";
import { PageFade } from "@/utils/PageAnimations";
import { BENEFITS } from "@/constants/breedersConstants";

export const BenefitsGrid = () => {
  return (
    <PageFade>
      <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
        {BENEFITS.map((benefit, index) => {
          const IconComponent = benefit.icon;
          return (
            <div
              key={index}
              className="p-8 transition-all border border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-[#6F2A2B] rounded-full flex items-center justify-center mb-6">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {benefit.title}
              </h3>
              <p className="text-gray-700">{benefit.description}</p>
            </div>
          );
        })}
      </div>
    </PageFade>
  );
};