import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'

const noop = () => { };

const InputFiled = (props) => {
  const { value, defaultValue, onChange = noop, onInputChange = noop } = props;
  const [value, setValue] = useState(value || defaultValue || '');
  const isOnComposition = useRef(false);
  const emittedInput = useRef(true);
  const inputEl = useRef(null);

  function handleInputChange(event) {
    let userInputValue = event.target.value;
    setValue(userInputValue);
    if (!isOnComposition.current) {
      event.target.value = userInputValue;
      onInputChange(event);
      emittedInput.current = true;
    } else {
      emittedInput.current = false;
    }
    onChange(userInputValue);
  }

  function handleComposition(event) {
    if (event.type === 'compositionstart') {
      isOnComposition.current = true;
      emittedInput.current = false;
    } else if (event.type === 'compositionend') {
      isOnComposition.current = false;
      if (!emittedInput.current) {
        handleInputChange(event);
      }
    }
  }

  return (
    <input
      type='text'
      {...props}
      ref={inputEl}
      value={value}
      onChange={handleInputChange}
      onCompositionStart={handleComposition}
      onCompositionEnd={handleComposition}
    />
  );
};

InputFiled.propTypes = {
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
  onInputChange: PropTypes.func,
};

export default InputFiled;