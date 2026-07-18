import React, { useState, useRef, useEffect } from "react";
import "./DropDown.css";

export default function DropDown({
  text = "Select",
  options = [],
  value = null,
  onChange = () => {},
  width = "fit-content", // accepts also "100%", "50%", etc.
}) {



  return (
    <div className="dropdown-root" style={{ width }}>
      <select
        className="dropdown-native"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      >
        <option value="" disabled>{text}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
