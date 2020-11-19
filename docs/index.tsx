import React from 'react';
import Form, { Field, useForm } from '../src/FieldForm';
import Input from './components/Input';

const Demo = () => {
  const [form] = useForm();
  return (
    <>
      <Form
        form={form}
        onFinish={(values: any) => {
          console.log('onFinish执行，值为：', values);
        }}
        onValuesChange={(changed: any, store: any) => {
          console.log('改变的值：', changed, '当前表单值：', store);
        }}
        initialValues={{
          nickname: 'void',
        }}
      >
        <Field
          name="nickname"
          rules={[
            {
              required: true,
              message: '昵称必填',
            },
          ]}
        >
          <Input placeholder="请输入昵称" />
        </Field>
        <Field
          name="doing"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input placeholder="请输入在做的事" />
        </Field>
      </Form>
      <button
        onClick={() => {
          form
            .validateFields()
            .then((result: any) => {
              console.log('验证通过，值为：', result);
            })
            .catch((err: any) => {
              console.log('验证失败：', err);
            });
        }}
      >
        验证
      </button>
      <button
        onClick={() => {
          form.resetFields();
        }}
      >
        重置表单
      </button>
      <button
        onClick={() => {
          const result = form.submit();
          console.log();
        }}
      >
        提交
      </button>
    </>
  );
};

export default Demo;
