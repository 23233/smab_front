import ReactDOM from 'react-dom';
import React from 'react';
import CommForm, { formParams } from '@/components/form/dataForm';

export const openDataForm = (p: formParams) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  function destroy() {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }

  function close() {
    if (p?.onCancel) {
      p?.onCancel();
    }
    destroy();
  }

  function render() {
    setTimeout(() => {
      ReactDOM.render(
        <CommForm
          fieldsList={p.fieldsList}
          loading={p.loading}
          initValues={p.initValues}
          onCreate={p.onCreate}
          isAction={p.isAction}
          onCancel={close}
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
