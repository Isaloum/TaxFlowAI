import { RulesEngineService } from './rules/rules-engine.service';

export class ValidationService {
  /**
   * Auto-validate tax year after document upload/delete
   */
  static async autoValidate(taxYearId: string): Promise<void> {
    try {
      console.log(`🔍 Auto-validating tax year ${taxYearId}...`);
      await RulesEngineService.validateTaxYear(taxYearId);
      console.log(`✅ Validation complete for tax year ${taxYearId}`);
    } catch (error: any) {
      console.error(`❌ Validation failed for ${taxYearId}:`, error);
      // Don't throw - validation failures shouldn't block uploads
    }
  }
}
