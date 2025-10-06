interface Props {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; 
    inputRef?: React.Ref<HTMLInputElement>;
    error?: string;
    labelClassName?: string; // New prop for label classes
    inputClassName?: string; // New prop for input classes
    containerClassName?: string; // New prop for container classes
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
    labelClassName = "", // Default empty string
    inputClassName = "", // Default empty string
    containerClassName = "row mb-3 align-items-center", // Default classes
}) => {
    return (
        <div className={containerClassName}>
            <div className={labelClassName}>
                <label 
                    htmlFor={id}
                >
                    {label}
                </label>
            </div>
            <div className={inputClassName}>
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    ref={inputRef}          
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

// interface Props {
//     id: string;
//     label: string;
//     type?: string;
//     value: string;
//     onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; 
//     inputRef?: React.Ref<HTMLInputElement>;
//     error?: string;
// }

// const InputLabel: React.FC<Props> = ({
//     id,
//     label,
//     type = "text",
//     value,
//     onChange,
//     onBlur,
//     inputRef,
//     error,
// }) => {
//     return (
//         <div className="row mb-3 align-items-center">
//             <div className="col-12 col-md-2">
//                 <label htmlFor={id}>
//                     {label}
//                 </label>
//             </div>
//             <div className="col-12 col-md-10">
//                 <input
//                     id={id}
//                     name={id}
//                     type={type}
//                     value={value}
//                     onChange={onChange}
//                     onBlur={onBlur}
//                     ref={inputRef}          
//                     className={`form-control ${error ? "is-invalid" : ""}`}
//                 />
//                 {error && (
//                     <span className="invalid-feedback d-block" role="alert">
//                         <strong>{error}</strong>
//                     </span>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default InputLabel;