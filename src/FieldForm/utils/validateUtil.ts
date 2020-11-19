import RawAsyncValidator from 'async-validator';
import {
  RuleObject,
  StoreValue,
  ValidateMessages,
  FieldError,
} from '../interface';

const AsyncValidator: any = RawAsyncValidator;

async function validateRule(
  name: string,
  value: StoreValue,
  rule: RuleObject,
): Promise<string[]> {
  const cloneRule = { ...rule };

  const validator = new AsyncValidator({
    [name]: [cloneRule],
  });

  const messages: ValidateMessages = {
    required: '必填字段',
  };
  validator.messages(messages);

  let result = [];

  try {
    await Promise.resolve(validator.validate({ [name]: value }, {}));
  } catch (errObj) {
    if (errObj.errors) {
      result = errObj.errors;
    } else {
      result = [(messages.default as () => string)()];
    }
  }

  return result;
}

export function validateRules(
  name: string,
  value: StoreValue,
  rules: RuleObject[],
) {
  // let summaryPromise: Promise<string[]>;

  // >>>>> Validate by parallel
  const rulePromises = rules.map(rule => validateRule(name, value, rule));

  const summaryPromise: Promise<string[]> = finishOnAllFailed(
    rulePromises,
  ).then((errors: string[]): string[] | Promise<string[]> => {
    if (!errors.length) {
      return [];
    }

    return Promise.reject<string[]>(errors);
  });

  // Internal catch error to avoid console error log.
  summaryPromise.catch(e => e);

  return summaryPromise;
}

async function finishOnAllFailed(
  rulePromises: Promise<string[]>[],
): Promise<string[]> {
  return Promise.all(rulePromises).then((errorsList: any):
    | string[]
    | Promise<string[]> => {
    const errors: string[] = [].concat(...errorsList);

    return errors;
  });
}

export function allPromiseFinish(
  promiseList: Promise<FieldError>[],
): Promise<FieldError[]> {
  let hasError = false;
  let count = promiseList.length;
  const results: FieldError[] = [];

  if (!promiseList.length) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    promiseList.forEach((promise, index) => {
      promise
        .catch(e => {
          hasError = true;
          return e;
        })
        .then(result => {
          count -= 1;
          results[index] = result;

          if (count > 0) {
            return;
          }

          if (hasError) {
            reject(results);
          }
          resolve(results);
        });
    });
  });
}
