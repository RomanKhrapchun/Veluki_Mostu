import './FileList.css';
import Button from "../Button/Button";
import LazyImage from "../LazyImage/LazyImage";

const FileList = ({
                      items = [],
                      title = 'Фото',
                      titleAddPhoto = 'Додати фото',
                      onUpload,
                      onDelete,
                      maxFiles = Infinity,
                      acceptFiles ='*'
                  }) => {

    return (
        <div className="photo-upload full-width components-container__full-width">
            <h2>{title}</h2>
            <div className="photo-grid">
                {Array.isArray(items) && items.length > 0 && items.slice(0, maxFiles).map((el, index) => (
                    <div key={index} className="photo-item">
                        <LazyImage src={`/files/${el?.server_name}`} alt="Photo"/>
                        <Button
                            title="Видалити"
                            type="button"
                            className="btn--secondary"
                            onClick={() => onDelete?.(el?.server_name)}
                        >
                            Видалити
                        </Button>
                    </div>
                ))}

                {items?.length < maxFiles && (
                    <label className="photo-item add-photo">
                        <input
                            type="file"
                            multiple={maxFiles > 1}
                            onChange={onUpload}
                            accept={acceptFiles}
                        />
                        <span>+</span>
                        <>{titleAddPhoto}</>
                    </label>
                )}
            </div>
        </div>
    );
};

export default FileList;