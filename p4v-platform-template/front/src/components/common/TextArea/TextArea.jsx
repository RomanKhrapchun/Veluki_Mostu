const TextArea = ({
                      className,
                      value,
                      onChange,
                      name,
                      style,
                      ...attr
                  }) => {
    return (
        <textarea {...attr} style={style} className={className} value={value} onChange={(e) => {
            onChange?.(name, e.target.value)
        }}>

        </textarea>
    );
};

export default TextArea;