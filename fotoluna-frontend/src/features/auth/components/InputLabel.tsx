interface Props {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; // <-- nuevo
    inputRef?: React.Ref<HTMLInputElement>; // <-- nuevo
    error?: string;
}

const InputLabel: React.FC<Props> = ({
    id,
    label,
    type = "text",
    value,
    onChange,
    onBlur,
    inputRef,
    error,
}) => {
    return (
        <div className="row mb-3 align-items-center">
            <div className="col-12 col-md-4 texto2">
                <label htmlFor={id} className="col-form-label">
                    {label}
                </label>
            </div>
            <div className="col-12 col-md-8">
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}         // 👈 ahora sí pasa onBlur
                    ref={inputRef}          // 👈 ahora sí pasa ref
                    className={`form-control ${error ? "is-invalid" : ""}`}
                />
                {error && (
                    <span className="invalid-feedback d-block" role="alert">
                        <strong>{error}</strong>
                    </span>
                )}
            </div>
        </div>
    );
};

export default InputLabel;