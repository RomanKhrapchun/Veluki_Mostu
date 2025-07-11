import classNames from "classnames";
const style = {
    width: 'fit-content'
}
const Badge = ({theme = "positive", caption}) => {
    const classes = classNames("table__label", {
        "table__label--positive": theme === "positive",
        "table__label--negative": theme === "negative"
    })
    return (
        <span style={style} className={classes}>{caption}</span>
    );
};

export default Badge;