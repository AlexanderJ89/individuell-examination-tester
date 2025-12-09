import "./Input.scss";
// Fixat input koppla label till input
import { nanoid } from "nanoid";
import { useMemo } from "react";

function Input({
  label,
  type,
  customClass,
  name,
  handleChange,
  defaultValue,
  disabled,
  maxLength,
}) {
  // Generera unikt Id för koppla label och input
  const inputId = useMemo(() => nanoid(), []);
  return (
    <section className="input">
      <label className="input__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        className={`input__field ${customClass ? customClass : ""}`}
        name={name}
        onChange={handleChange}
        defaultValue={defaultValue ? defaultValue : ""}
        maxLength={maxLength}
        disabled={disabled}
      />
    </section>
  );
}

export default Input;
