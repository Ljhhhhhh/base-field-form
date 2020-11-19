import { useRef } from 'react';
import {
  FormInstance,
  InternalHooks,
  FieldEntity,
  Callbacks,
  FieldError,
  Store,
} from './interface';
import { HOOK_MARK } from './FieldContext';

class FormStore {
  private store: Store = {};

  private initialValues: Store = {};

  private fieldEntities: FieldEntity[] = [];

  private callbacks: Callbacks = {};

  private getFieldEntities = (pure: boolean = false) => {
    if (!pure) {
      return this.fieldEntities;
    }

    return this.fieldEntities.filter((field) => field.props.name);
  };

  getFieldValue = (name: string) => {
    return this.store[name];
  };

  getFieldsValue = () => this.store;

  private setFieldsValue = (values: any, reset?: boolean) => {
    const nextStore = {
      ...this.store,
      ...values,
    };
    this.store = nextStore;
    this.getFieldEntities(true).forEach(({ props, onStoreChange }) => {
      const name = props.name as string;
      Object.keys(values).forEach((key) => {
        if (name === key || reset) {
          onStoreChange();
        }
      });
    });

    const { onValuesChange } = this.callbacks;

    if (onValuesChange) {
      onValuesChange(values, nextStore);
    }
  };

  private setInitialValues = (initialValues: Store, init: boolean) => {
    if (init) return;
    this.initialValues = initialValues || {};
    this.setFieldsValue(initialValues);
  };

  private resetFields = (nameList?: string[]) => {
    if (!nameList) {
      this.store = { ...this.initialValues };
      this.setFieldsValue(this.store, true);
    }
  };

  private registerField = (entity: FieldEntity) => {
    this.fieldEntities.push(entity);

    const { name, initialValue } = entity.props;
    // Set initial values
    if (initialValue !== undefined && name) {
      this.initialValues = {
        ...this.initialValues,
        [name]: initialValue,
      };
      this.setFieldsValue({
        ...this.store,
        [name]: initialValue,
      });
    }

    // un-register field callback
    return () => {
      this.fieldEntities = this.fieldEntities.filter((item) => item !== entity);
      // this.store = setValue(this.store, namePath, undefined); // 删除移除字段的值
    };
  };

  private validateFields = () => {
    const promiseList: Promise<{
      name: string;
      errors: string[];
    }>[] = [];

    this.getFieldEntities(true).forEach((entity) => {
      const promise = entity.validateRules();
      const { name } = entity.props;
      promiseList.push(
        promise
          .then(() => ({ name, errors: [] }))
          .catch((errors: any) =>
            Promise.reject({
              name,
              errors,
            }),
          ),
      );
    });

    let hasError = false;
    let count = promiseList.length;
    const results: FieldError[] = [];

    const summaryPromise = new Promise((resolve, reject) => {
      promiseList.forEach((promise, index) => {
        promise
          .catch((e) => {
            hasError = true;
            return e;
          })
          .then((result) => {
            count -= 1;
            results[index] = result;

            if (count > 0) {
              return;
            }

            if (hasError) {
              reject(results);
            }
            resolve(this.store);
          });
      });
    });

    return summaryPromise as Promise<Store>;
  };

  private submit = async () => {
    this.validateFields()
      .then((values) => {
        const { onFinish } = this.callbacks;
        if (onFinish) {
          try {
            onFinish(values);
          } catch (err) {
            console.error(err);
          }
        }
      })
      .catch((e) => {
        const { onFinishFailed } = this.callbacks;
        if (onFinishFailed) {
          onFinishFailed(e);
        }
      });
  };

  private setCallbacks = (callbacks: Callbacks) => {
    this.callbacks = callbacks;
  };

  private getInternalHooks = (key: string): InternalHooks | null => {
    if (key === HOOK_MARK) {
      return {
        registerField: this.registerField,
        setInitialValues: this.setInitialValues,
        setCallbacks: this.setCallbacks,
      };
    }
    console.warn('`getInternalHooks` is internal usage. Should not call directly.');
    return null;
  };

  public getForm = () => {
    return {
      getFieldValue: this.getFieldValue,
      getFieldsValue: this.getFieldsValue,
      setFieldsValue: this.setFieldsValue,
      validateFields: this.validateFields,
      resetFields: this.resetFields,
      submit: this.submit,
      getInternalHooks: this.getInternalHooks,
    };
  };
}

const useForm = (form?: FormInstance) => {
  const formRef = useRef<FormInstance>();

  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      const formStore: FormStore = new FormStore();
      formRef.current = formStore.getForm();
    }
  }

  return [formRef.current];
};

export default useForm;
