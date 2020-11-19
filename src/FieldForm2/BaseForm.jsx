// import React from 'react';

// class Form extends React.Component {
//   constructor(props) {
//     super(props);
//     this.store = {
//       username: '1111',
//       password: '2222',
//     };
//   }

//   render() {
//     return (
//       <div>
//         <Field name="username" onChange={(e) => {
//           const {value} = e.target;
//           this.store.username = value;
//           this.emit('onFieldValue', 'username', value);
//         }}>
//           <input />
//         </Field>
//         <Field name="password">
//           <input />
//         </Field>
//       </div>
//     );
//   }
// }

// class Field extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       value: '',
//     };
//     this.on('onFieldValue', (name, value) => {
//       if(name === this.props.name) {
//         this.setState({
//           value
//         })
//       }
//     })
//   }

//   render() {
//     return (
//       <div>
//         {React.cloneElement(this.props.children, {
//           value: this.state.value,
//           onChange: (e) => {
//             this.props.onChange(e)
//           }
//         })}
//       </div>
//     );
//   }
// }

// export default Form;
