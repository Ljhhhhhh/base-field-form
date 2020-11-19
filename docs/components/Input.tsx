import React from 'react';

const Input = (props: any) => (
  <input
    {...props}
    onChange={e => {
      props.onChange(e);
    }}
  />
);

const CustomizeInput = ({ value = '', ...props }: any) => (
  <div style={{ padding: 10 }}>
    <Input style={{ outline: 'none' }} value={value} {...props} />
  </div>
);

export default CustomizeInput;
