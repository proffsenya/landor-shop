import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import AccordionMotion from '@/utils/AccordionMotion';

export const FilterSection = ({ title, children, isExpanded = true }) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const toggle = useCallback(() => setExpanded(prev => !prev), []);
  return (
    <div className="pb-4 mb-4 border-b border-gray-200">
      <button onClick={toggle} className="flex items-center justify-between w-full mb-3 font-medium text-left text-gray-900">
        <span>{title}</span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </motion.div>
      </button>
      <AccordionMotion isOpen={expanded}>
        <div className="mt-2">{children}</div>
      </AccordionMotion>
    </div>
  );
};