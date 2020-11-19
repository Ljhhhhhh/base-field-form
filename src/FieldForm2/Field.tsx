import React from 'react';
import { validateRules } from './utils/validateUtil';
import {
  FieldEntity,
  FormInstance,
  // InternalNamePath,
  Meta,
  // NotifyInfo,
  Rule,
  // ValidateOptions,
  InternalFormInstance,
  // ValidateOptions,
  // RuleObject,
  EventArgs,
} from './interface';
import FieldContext, { HOOK_MARK } from './FieldContext';

interface ChildProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any;
}

export interface InternalFieldProps<Values = any> {
  children?:
    | React.ReactElement
    | ((control: ChildProps, meta: Meta, form: FormInstance<Values>) => React.ReactNode);
  /**
   * Set up `dependencies` field.
   * When dependencies field update and current field is touched,
   * will trigger validate rules and render.
   */
  name?: string;
  rules?: Rule[];
  initialValue?: any;
  onReset?: () => void;
}

export interface FieldProps<Values = any> extends Omit<InternalFieldProps<Values>, 'name'> {
  name?: string;
}

class Field
  extends React.Component<InternalFieldProps, InternalFormInstance>
  implements FieldEntity {
  // 申明静态变量、contextType 将 context 直接赋值于 contextType
  public static contextType = FieldContext;

  private cancelRegister: any;

  private validatePromise: Promise<string[]> | null = null;

  componentDidMount() {
    const { getInternalHooks }: InternalFormInstance = this.context;
    const { registerField } = getInternalHooks(HOOK_MARK);
    this.cancelRegister = registerField(this);
  }

  componentWillUnmount() {
    this.cancelRegister();
  }

  public onStoreChange = () => {
    this.reRender();
  };

  public getControlled = (childProps: any = {}) => {
    const { name } = this.props;
    const { getFieldValue, setFieldsValue } = this.context;
    const control = {
      ...childProps,
      value: getFieldValue(name),
      onChange: (...args: EventArgs) => {
        const event = args[0];
        if (event && event.target && name) {
          setFieldsValue({
            [name]: (event.target as HTMLInputElement).value,
          });
        }
      },
    };

    return control;
  };

  public reRender() {
    this.forceUpdate();
  }

  public validateRules = () => {
    const { rules, name } = this.props;
    if (!name || !rules || !rules.length) return [];
    const cloneRule: any = [...rules];
    const { getFieldValue } = this.context;
    const value = getFieldValue(name);

    const promise = validateRules(name, value, cloneRule);

    promise
      .catch((e) => e)
      .then(() => {
        if (this.validatePromise === promise) {
          this.validatePromise = null;
          this.reRender();
        }
      });

    return promise;
  };

  public render() {
    const { children } = this.props;
    let returnChildNode = children;
    returnChildNode = React.cloneElement(
      children as React.ReactElement,
      this.getControlled((children as React.ReactElement).props),
    );

    return <React.Fragment>{returnChildNode}</React.Fragment>;
  }
}

function WrapperField<Values = any>({ name, ...restProps }: FieldProps<Values>) {
  return <Field name={name} {...restProps} />;
}

export default WrapperField;
