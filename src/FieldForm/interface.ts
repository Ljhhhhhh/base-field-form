import { ReactElement } from 'react';

export type StoreValue = any;
export interface Store {
  [name: string]: StoreValue;
}

export interface FieldError {
  name: string;
  errors: string[];
}

type ValidateMessage = string | (() => string);

export interface ValidateMessages {
  default?: ValidateMessage;
  required?: ValidateMessage;
  enum?: ValidateMessage;
  whitespace?: ValidateMessage;
  date?: {
    format?: ValidateMessage;
    parse?: ValidateMessage;
    invalid?: ValidateMessage;
  };
  types?: {
    string?: ValidateMessage;
    method?: ValidateMessage;
    array?: ValidateMessage;
    object?: ValidateMessage;
    number?: ValidateMessage;
    date?: ValidateMessage;
    boolean?: ValidateMessage;
    integer?: ValidateMessage;
    float?: ValidateMessage;
    regexp?: ValidateMessage;
    email?: ValidateMessage;
    url?: ValidateMessage;
    hex?: ValidateMessage;
  };
  string?: {
    len?: ValidateMessage;
    min?: ValidateMessage;
    max?: ValidateMessage;
    range?: ValidateMessage;
  };
  number?: {
    len?: ValidateMessage;
    min?: ValidateMessage;
    max?: ValidateMessage;
    range?: ValidateMessage;
  };
  array?: {
    len?: ValidateMessage;
    min?: ValidateMessage;
    max?: ValidateMessage;
    range?: ValidateMessage;
  };
  pattern?: {
    mismatch?: ValidateMessage;
  };
}

export type RuleType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'method'
  | 'regexp'
  | 'integer'
  | 'float'
  | 'object'
  | 'enum'
  | 'date'
  | 'url'
  | 'hex'
  | 'email';

type Validator = (
  rule: RuleObject,
  value: StoreValue,
  callback: (error?: string) => void,
) => Promise<void> | void;

export type RuleRender = (form: FormInstance) => RuleObject;

export interface ValidatorRule {
  message?: string | ReactElement;
  validator: Validator;
}

interface BaseRule {
  enum?: StoreValue[];
  len?: number;
  max?: number;
  message?: string | ReactElement;
  min?: number;
  pattern?: RegExp;
  required?: boolean;
  transform?: (value: StoreValue) => StoreValue;
  type?: RuleType;
  whitespace?: boolean;

  /** Customize rule level `validateTrigger`. Must be subset of Field `validateTrigger` */
  validateTrigger?: string | string[];
}

type AggregationRule = BaseRule & Partial<ValidatorRule>;

interface ArrayRule extends Omit<AggregationRule, 'type'> {
  type: 'array';
  defaultField?: RuleObject;
}

export type RuleObject = AggregationRule | ArrayRule;

export type Rule = RuleObject | RuleRender;

export interface FormInstance<Values = any> {
  getFieldValue: (name: string) => any;
  getFieldsValue(): Values;
  setFieldsValue: (value: any) => void;
  validateFields: any;
  setCallbacks: (callbacks: Callbacks) => void;
  setInitialValues: (values: Store, init: boolean) => void;
  submit: () => void;
  resetFields: (fields?: string[]) => void;
}

export type EventArgs = any[];

export interface FieldEntity {
  onStoreChange: () => void;
  validateRules: () => any;
  props: {
    name?: string;
    rules?: Rule[];
    initialValue?: any;
  };
}

export interface InternalFieldData {
  value: StoreValue;
}

export interface FieldData extends Partial<Omit<InternalFieldData, 'name'>> {
  name: string;
}

export interface ValidateErrorEntity<Values = any> {
  values: Values;
  errorFields: { name: string; errors: string[] }[];
  outOfDate: boolean;
}

export interface Callbacks<Values = any> {
  onValuesChange?: (changedValues: any, values: Values) => void;
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void;
  onFinish?: (values: Values) => void;
  onFinishFailed?: (errorInfo: ValidateErrorEntity<Values>) => void;
}

export interface InternalHooks {
  // dispatch: (action: ReducerAction) => void;
  registerField: (entity: FieldEntity) => () => void;
  // useSubscribe: (subscribable: boolean) => void;
  setInitialValues: (values: Store, init: boolean) => void;
  setCallbacks: (callbacks: Callbacks) => void;

  // getFields: (namePathList?: InternalNamePath[]) => FieldData[];
  // setValidateMessages: (validateMessages: ValidateMessages) => void;
  // setPreserve: (preserve?: boolean) => void;
}

export type InternalFormInstance = Omit<FormInstance, 'validateFields'> & {
  validateFields: any;

  validateTrigger?: string | string[] | false;

  /**
   * Form component should register some content into store.
   * We pass the `HOOK_MARK` as key to avoid user call the function.
   */
  getInternalHooks: (secret: string) => InternalHooks;
};
