import { getStep1Schema } from './step1Schema';
import { step2Schema } from './step2Schema';
import { getStep3Schema } from './step3Schema';
import { getStep4Schema } from './step4Schema';
import { getStep5Schema } from './step5Schema';
import { getStep6Schema } from './step6Schema';
import { getStep7Schema } from './step7Schema';
import { getStep8Schema } from './step8Schema';

/**
 * Dynamic Schema Factory
 * Assembles and returns the exact Zod schema for any given wizard step,
 * dynamically injecting cross-step validation dependencies and accumulated form data.
 */
export function getStepSchema(stepNumber, allFormData = {}) {
  switch (Number(stepNumber)) {
    case 1:
      return getStep1Schema(allFormData);
    case 2:
      return step2Schema;
    case 3:
      return getStep3Schema(allFormData);
    case 4:
      return getStep4Schema(allFormData);
    case 5:
      return getStep5Schema(allFormData);
    case 6:
      return getStep6Schema(allFormData);
    case 7:
      return getStep7Schema(allFormData);
    case 8:
      return getStep8Schema(allFormData);
    default:
      throw new Error(`Invalid step number: ${stepNumber}`);
  }
}
