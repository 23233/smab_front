import React, { useState } from 'react';
import CommForm, { formParams } from '@/components/form/commForm';
import ReactDOM from 'react-dom';

interface p extends formParams {}

const fastOpenForms = (p: p) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  function destroy() {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }

  function success(values: any) {
    p.onCreate && p.onCreate(values);
    close();
  }

  function close() {
    destroy();
  }

  function render() {
    setTimeout(() => {
      ReactDOM.render(
        <CommForm
          onCreate={success}
          onCancel={close}
          fieldsList={p.fieldsList}
          initValues={p.initValues}
          title={p.title}
          children={p.children}
        />,
        div,
      );
    });
  }

  render();

  return {
    destroy: close,
  };
};
export default fastOpenForms;
