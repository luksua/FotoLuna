type Props = {
    firstNameCustomer: string;
    lastNameCustomer: string;
    phoneCustomer: string;
    documentType: string;
    documentNumber: string;
    emailCustomer: string;
    password: string;
    confirmPassword: string;
    photoCustomer: FileList;
};

const Contact = () => {
    return (
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248.61459725476792!2d-75.21587023397399!3d4.4420617413971915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38c4f02ac49f57%3A0x4d7fc43a0abcf963!2sCra%209A%20%23%2037-20%2C%20Ibagu%C3%A9%2C%20Tolima!5e0!3m2!1ses-419!2sco!4v1759246557627!5m2!1ses-419!2sco" 
                width="800" 
                height="600" 
                loading="lazy" 
                style={{ border: 0 }}
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade">
        </iframe>
    );
};

export default Contact;