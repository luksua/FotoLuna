interface Props {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}
const InputLabel: React.FC<Props> = ({ id, label, type = 'text', value, onChange, error }) => {
    return (
        <div className="row mb-3 align-items-center">
            <div className="col-12 col-md-4 texto2">
                <label className="col-form-label">
                    {label}
                </label>
            </div>
            <div className="col-12 col-md-8">
                <input type={type} className="form-control"
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                />
                {error && (
                    <span className="invalid-feedback" role="alert">
                        <strong>{error}</strong>
                    </span>
                )}
            </div>
        </div>                                                                        
    );
}

export default InputLabel;