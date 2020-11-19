import React, { Component } from 'react';
import FieldContext from './FieldContext';
import {
  EventArgs,
  FieldEntity,
  FormInstance,
  Rule,
  InternalFormInstance,
} from './interface';
import { validateRules } from './utils/validateUtil';

interface ChildProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any;
}

export interface InternalFieldProps<Values = any> {
  children?:
    | React.ReactElement
    | ((control: ChildProps, form: FormInstance<Values>) => React.ReactNode);
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

export interface FieldProps<Values = any>
  extends Omit<InternalFieldProps<Values>, 'name'> {
  name?: string;
}

class Field extends Component<InternalFieldProps, InternalFormInstance>
  implements FieldEntity {
  public static contextType = FieldContext;

  private cancelRegister: any;

  private validatePromise: Promise<string[]> | null = null;

  componentDidMount() {
    const { registerField } = this.context;
    this.cancelRegister = registerField(this);
  }

  componentWillUnmount() {
    this.cancelRegister && this.cancelRegister();
  }

  public onStoreChange = () => {
    this.forceUpdate();
  };

  public validateRules = () => {
    const { rules, name } = this.props;
    if (!name || !rules || !rules.length) return [];
    const cloneRule: any = [...rules];
    const { getFieldValue } = this.context;
    const value = getFieldValue(name);

    const promise = validateRules(name, value, cloneRule);

    promise
      .catch(e => e)
      .then(() => {
        if (this.validatePromise === promise) {
          this.validatePromise = null;
          this.onStoreChange();
        }
      });

    return promise;
  };

  getControled = () => {
    const { name } = this.props;
    const { getFieldValue, setFieldsValue } = this.context;
    return {
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
  };
  render() {
    const { children } = this.props;
    const returnChildNode = React.cloneElement(
      children as React.ReactElement,
      this.getControled(),
    );
    return returnChildNode;
  }
}

export default Field;
