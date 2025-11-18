interface TextareaProps {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    textareaRef?: React.Ref<HTMLTextAreaElement>;
    error?: string;
    rows?: number;
}

const TextareaLabel: React.FC<TextareaProps> = ({
    id,
    label,
    value,
    onChange,
    onBlur,
    textareaRef,
    error,
    rows = 4,
}) => {
    return (
        <div className="row mb-3 align-items-center">
            <div className="col-12 col-md-4 texto2">
                <label htmlFor={id} className="col-form-label">
                    {label}
                </label>
            </div>
            <div className="col-12 col-md-8">
                <textarea
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    ref={textareaRef}
                    rows={rows}
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

export default TextareaLabel;
