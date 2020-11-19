import * as React from 'react';
import { FormInstance } from './interface';

export const HOOK_MARK = 'RC_FORM_INTERNAL_HOOKS';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const warningFunc: any = () => {
  console.warn(
    'Can not find FormContext. Please make sure you wrap Field under Form.',
  );
};

const Context = React.createContext<FormInstance>({
  getFieldValue: warningFunc,
  getFieldsValue: warningFunc,
  setFieldsValue: warningFunc,
  validateFields: warningFunc,
  setCallbacks: warningFunc,
  submit: warningFunc,
  setInitialValues: warningFunc,
  resetFields: warningFunc,
});

export default Context;
