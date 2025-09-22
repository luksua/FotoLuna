type Props = {
    value: string;
}

const Button = ({value}: Props) => {
    return (
        <button className="btn custom-upload-btn"
            type="submit"
        >
            {value}
        </button>
    );
};

export default Button;