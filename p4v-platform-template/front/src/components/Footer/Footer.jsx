import './Footer.css'
const Footer = ({year}) => {
    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__inner">
                    <p className="paragraph paragraph--sm">
                        Всі права захищено &copy; {year}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;