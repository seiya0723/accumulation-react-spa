const InputField = ({ label, value, onChange, min, max, placeholder  }) => {

    return (
    <div className="input_area">
        <label className="label">{label}</label>
        <input className="input"
            type="number"
            onChange={onChange}
            value={value}
            min={min}
            max={max}
            placeholder={placeholder}
        />
    </div>
    )

};

export default InputField
