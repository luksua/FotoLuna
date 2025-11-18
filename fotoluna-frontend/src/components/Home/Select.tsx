interface SelectProps {
    id: string;
    option: string;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
    selectRef?: React.Ref<HTMLSelectElement>;
    error?: string;
    labelClassName?: string;
    selectClassName?: string;
}

const SelectLabel: React.FC<SelectProps> = ({
    id,
    label,
    option,
    value,
    options,
    onChange,
    onBlur,
    selectRef,
    error,
    labelClassName = "",
    selectClassName = "",
}) => {
    return (
        <div className="row mb-3 align-items-center">
            <div className={labelClassName}>
                <label htmlFor={id}>
                    {label}
                </label>
            </div>
            <div className={selectClassName}>
                <select
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    ref={selectRef}
                    className={`form-select ${error ? "is-invalid" : ""}`}
                >
                    <option value="">{option}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <span className="invalid-feedback d-block" role="alert">
                        <strong>{error}</strong>
                    </span>
                )}
            </div>
        </div>
    );
};

export default SelectLabel;
