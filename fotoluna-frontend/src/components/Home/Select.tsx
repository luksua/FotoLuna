interface SelectProps {
    id: string;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
    selectRef?: React.Ref<HTMLSelectElement>;
    error?: string;
}

const SelectLabel: React.FC<SelectProps> = ({
    id,
    label,
    value,
    options,
    onChange,
    onBlur,
    selectRef,
    error,
}) => {
    return (
        <div className="row mb-3 align-items-center">
            <div className="col-12 col-md-4">
                <label htmlFor={id} className="col-form-label">
                    {label}
                </label>
            </div>
            <div className="col-12 col-md-8">
                <select
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    ref={selectRef}
                    className={`form-select ${error ? "is-invalid" : ""}`}
                >
                    <option value="">Seleccione una opción</option>
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
