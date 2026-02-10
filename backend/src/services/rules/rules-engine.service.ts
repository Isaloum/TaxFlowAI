import prisma from '../../config/database';
import { QUEBEC_PAIRING_RULES, SUPPORTING_DOC_RULES } from './quebec-rules';

interface ValidationResult {
  ruleCode: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  missingDocType?: string;
  severity: 'error' | 'warning' | 'info';
}

export class RulesEngineService {
  /**
   * Run all validation rules for a tax year
   */
  static async validateTaxYear(taxYearId: string): Promise<{
    completenessScore: number;
    results: ValidationResult[];
  }> {
    // Get tax year with documents and client
    const taxYear = await prisma.taxYear.findUnique({
      where: { id: taxYearId },
      include: {
        documents: true,
        client: true
      }
    });

    if (!taxYear) {
      throw new Error('Tax year not found');
    }

    const results: ValidationResult[] = [];

    // 1. Quebec Federal/Provincial Pairing Rules
    if (taxYear.client.province === 'QC') {
      results.push(...this.validateQuebecPairing(taxYear.documents));
    }

    // 2. Supporting Document Rules
    results.push(
      ...this.validateSupportingDocs(
        taxYear.documents,
        taxYear.profile as any,
        taxYear.client
      )
    );

    // 3. Basic Income Source Validation
    results.push(...this.validateIncomeSources(taxYear.documents));

    // 4. Year-over-Year Comparison (if previous year exists)
    const previousYearResults = await this.validateYearOverYear(
      taxYear.clientId,
      taxYear.year,
      taxYear.documents
    );
    results.push(...previousYearResults);

    // Calculate completeness score (0-100)
    const completenessScore = this.calculateCompletenessScore(results);

    // Save validation results to DB
    await this.saveValidationResults(taxYearId, results);

    // Update completeness score
    await prisma.taxYear.update({
      where: { id: taxYearId },
      data: { completenessScore }
    });

    return { completenessScore, results };
  }

  /**
   * Validate Quebec federal/provincial pairing
   */
  private static validateQuebecPairing(documents: any[]): ValidationResult[] {
    const results: ValidationResult[] = [];
    const docTypes = documents.map((d) => d.docType);

    for (const rule of Object.values(QUEBEC_PAIRING_RULES)) {
      const hasFederal = docTypes.includes(rule.federal);
      const hasProvincial = docTypes.includes(rule.provincial);

      if (hasFederal && !hasProvincial) {
        // Get employer/payer name from federal slip
        const federalDoc = documents.find((d) => d.docType === rule.federal);
        const entityName =
          federalDoc?.extractedData?.employer_name ||
          federalDoc?.extractedData?.payer_name ||
          'unknown employer';

        results.push({
          ruleCode: rule.code,
          status: 'fail',
          message: `Missing ${rule.provincial} for ${entityName}. Quebec residents must have matching provincial slip.`,
          missingDocType: rule.provincial,
          severity: rule.severity as 'error'
        });
      } else if (hasFederal && hasProvincial) {
        results.push({
          ruleCode: rule.code,
          status: 'pass',
          message: `${rule.federal} and ${rule.provincial} pair complete`,
          severity: 'info'
        });
      }
    }

    return results;
  }

  /**
   * Validate supporting documents based on profile
   */
  private static validateSupportingDocs(
    documents: any[],
    profile: any,
    client: any
  ): ValidationResult[] {
    const results: ValidationResult[] = [];
    const docTypes = documents.map((d) => d.docType);

    for (const rule of Object.values(SUPPORTING_DOC_RULES)) {
      const isTriggered = rule.triggerCondition(profile, client);

      if (isTriggered) {
        const hasDoc = docTypes.includes(rule.requiredDocType);

        if (!hasDoc) {
          results.push({
            ruleCode: rule.code,
            status: rule.severity === 'warning' ? 'warning' : 'fail',
            message: rule.description,
            missingDocType: rule.requiredDocType,
            severity: rule.severity as 'error' | 'warning'
          });
        } else {
          results.push({
            ruleCode: rule.code,
            status: 'pass',
            message: `${rule.requiredDocType} uploaded`,
            severity: 'info'
          });
        }
      }
    }

    return results;
  }

  /**
   * Validate basic income source documents
   */
  private static validateIncomeSources(documents: any[]): ValidationResult[] {
    const results: ValidationResult[] = [];
    const docTypes = documents.map((d) => d.docType);

    const hasIncomeDoc =
      docTypes.includes('T4') ||
      docTypes.includes('T4A') ||
      docTypes.includes('T5') ||
      docTypes.includes('T3') ||
      docTypes.includes('T2125');

    if (!hasIncomeDoc) {
      results.push({
        ruleCode: 'HAS_INCOME_SOURCE',
        status: 'fail',
        message: 'No income documents uploaded (T4, T5, T4A, etc.)',
        severity: 'error'
      });
    } else {
      results.push({
        ruleCode: 'HAS_INCOME_SOURCE',
        status: 'pass',
        message: 'Income documents present',
        severity: 'info'
      });
    }

    return results;
  }

  /**
   * Year-over-year comparison
   * Flag if client uploaded a document last year but not this year
   */
  private static async validateYearOverYear(
    clientId: string,
    currentYear: number,
    currentDocuments: any[]
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Get previous year
    const previousYear = await prisma.taxYear.findUnique({
      where: {
        clientId_year: { clientId, year: currentYear - 1 }
      },
      include: { documents: true }
    });

    if (!previousYear) {
      return results; // No previous year, skip comparison
    }

    const previousDocTypes = previousYear.documents.map((d) => d.docType);
    const currentDocTypes = currentDocuments.map((d) => d.docType);

    // Check for missing recurring documents
    const missingRecurring = previousDocTypes.filter(
      (type) =>
        !currentDocTypes.includes(type) &&
        ['T4', 'T5', 'T4A', 'RL1', 'RL3', 'RL2'].includes(type) // Common recurring docs
    );

    for (const docType of missingRecurring) {
      // Get employer/payer from last year
      const prevDoc = previousYear.documents.find((d) => d.docType === docType);
      const entityName =
        prevDoc?.extractedData?.employer_name ||
        prevDoc?.extractedData?.payer_name ||
        prevDoc?.docSubtype ||
        'previous employer';

      results.push({
        ruleCode: 'YEAR_OVER_YEAR_MISSING',
        status: 'warning',
        message: `Last year you uploaded ${docType} from ${entityName}. Did your situation change?`,
        missingDocType: docType,
        severity: 'warning'
      });
    }

    return results;
  }

  /**
   * Calculate completeness score (0-100)
   * Formula: (pass + warnings) / total * 100
   */
  private static calculateCompletenessScore(
    results: ValidationResult[]
  ): number {
    if (results.length === 0) return 0;

    const errors = results.filter(
      (r) => r.status === 'fail' && r.severity === 'error'
    ).length;
    const warnings = results.filter((r) => r.status === 'warning').length;
    const passes = results.filter((r) => r.status === 'pass').length;

    // Weight: errors = -2, warnings = -1, passes = +1
    const score = Math.max(
      0,
      Math.min(100, ((passes - errors * 2 - warnings) / results.length) * 100)
    );

    return Math.round(score);
  }

  /**
   * Save validation results to database
   */
  private static async saveValidationResults(
    taxYearId: string,
    results: ValidationResult[]
  ): Promise<void> {
    // Delete old validations
    await prisma.validation.deleteMany({
      where: { taxYearId }
    });

    // Insert new validations
    await prisma.validation.createMany({
      data: results.map((r) => ({
        taxYearId,
        ruleCode: r.ruleCode,
        status: r.status,
        message: r.message,
        missingDocType: r.missingDocType
      }))
    });
  }
}
