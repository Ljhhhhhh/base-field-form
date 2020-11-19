import React from 'react';
import { Store, FormInstance, Callbacks, InternalFormInstance } from './interface';
import FieldContext, { HOOK_MARK } from './FieldContext';
import useForm from './useForm';

type BaseFormProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>;

type RenderProps = (values: Store, form: FormInstance) => JSX.Element | React.ReactNode;

export interface FormProps<Values = any> extends BaseFormProps {
  initialValues?: Store;
  form?: FormInstance<Values>;
  children?: RenderProps | React.ReactNode;
  name?: string;
  onValuesChange?: Callbacks<Values>['onValuesChange'];
  onFieldsChange?: Callbacks<Values>['onFieldsChange'];
  onFinish?: Callbacks<Values>['onFinish'];
  onFinishFailed?: Callbacks<Values>['onFinishFailed'];
  validateTrigger?: string | string[] | false;
  preserve?: boolean;
}

const Form: React.FC<FormProps> = ({
  name,
  initialValues,
  form,
  preserve,
  children,
  onValuesChange,
  onFinish,
  onFinishFailed,
  ...restProps
}: FormProps) => {
  const [formInstance] = useForm(form);
  const internalFormInstance: InternalFormInstance = formInstance as InternalFormInstance;
  const { setCallbacks, setInitialValues } = internalFormInstance.getInternalHooks(HOOK_MARK);
  setCallbacks({
    onValuesChange,
    onFinish,
    onFinishFailed,
  });

  const mountRef = React.useRef<boolean>(true);
  setInitialValues(initialValues || {}, !mountRef.current);
  if (!mountRef.current) {
    mountRef.current = false;
  }

  const WrapperNode = (
    <FieldContext.Provider value={internalFormInstance}>{children}</FieldContext.Provider>
  );
  // React.useImperativeHandle(ref, () => formInstance);
  return (
    <form
      {...restProps}
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        internalFormInstance.submit();
      }}
    >
      {WrapperNode}
    </form>
  );
};

export default Form;
