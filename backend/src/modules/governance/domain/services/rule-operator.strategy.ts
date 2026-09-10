import { RuleOperator } from '../enums/rule-operator.enum';

export interface IRuleOperatorStrategy {
  matches(actualValue: any, expectedValue: string): boolean;
}

class EqualsStrategy implements IRuleOperatorStrategy {
  matches(actualValue: any, expectedValue: string): boolean {
    if (actualValue === undefined || actualValue === null) return false;
    return String(actualValue).toLowerCase().trim() === expectedValue.toLowerCase().trim();
  }
}

class NotEqualsStrategy implements IRuleOperatorStrategy {
  matches(actualValue: any, expectedValue: string): boolean {
    if (actualValue === undefined || actualValue === null) return true;
    return String(actualValue).toLowerCase().trim() !== expectedValue.toLowerCase().trim();
  }
}

class ContainsStrategy implements IRuleOperatorStrategy {
  matches(actualValue: any, expectedValue: string): boolean {
    if (!actualValue) return false;
    const stringified = typeof actualValue === 'object' 
      ? JSON.stringify(actualValue).toLowerCase() 
      : String(actualValue).toLowerCase();

    // Soporta múltiples términos separados por comas (ej. "token, password, secret, apikey")
    const terms = expectedValue
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (terms.length === 0) {
      return stringified.includes(expectedValue.toLowerCase().trim());
    }

    return terms.some((term) => stringified.includes(term));
  }
}

class InListStrategy implements IRuleOperatorStrategy {
  matches(actualValue: any, expectedValue: string): boolean {
    if (!actualValue) return false;
    const actual = String(actualValue).toLowerCase().trim();

    const allowedList = expectedValue
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    return allowedList.includes(actual);
  }
}

class RegexStrategy implements IRuleOperatorStrategy {
  matches(actualValue: any, expectedValue: string): boolean {
    if (!actualValue) return false;
    const stringified = typeof actualValue === 'object'
      ? JSON.stringify(actualValue)
      : String(actualValue);

    try {
      const regex = new RegExp(expectedValue, 'i');
      return regex.test(stringified);
    } catch {
      return false;
    }
  }
}

/**
 * Strategy Factory / Registry
 */
export class RuleOperatorStrategyFactory {
  private static readonly strategies: Record<RuleOperator, IRuleOperatorStrategy> = {
    [RuleOperator.EQUALS]: new EqualsStrategy(),
    [RuleOperator.NOT_EQUALS]: new NotEqualsStrategy(),
    [RuleOperator.CONTAINS]: new ContainsStrategy(),
    [RuleOperator.IN_LIST]: new InListStrategy(),
    [RuleOperator.REGEX]: new RegexStrategy(),
  };

  public static getStrategy(operator: RuleOperator): IRuleOperatorStrategy {
    const strategy = this.strategies[operator];
    if (!strategy) {
      throw new Error(`Estrategia no implementada para el operador: ${operator}`);
    }
    return strategy;
  }
}

