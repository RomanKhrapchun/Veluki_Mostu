import React from 'react';
import {usePagination} from "../../../hooks/usePagination";
import classNames from "classnames";
import Button from "../Button/Button";
import {generateIcon, iconMap} from "../../../utils/constants";
import {DOTS} from "../../../utils/function";
const prevIcon = generateIcon(iconMap.prev)
const nextIcon = generateIcon(iconMap.next)
const dotsIcon = generateIcon(iconMap.dots,'pagination__dots')
const Pagination = ({
                        style,
                        onPageChange,
                        totalCount = 1,
                        siblingCount = 2,
                        currentPage = 1,
                        pageSize = 25,
                        className
                    }) => {

    const classes = classNames("pagination pagination--center", className)
    const paginationRange = usePagination({
        currentPage,
        totalCount,
        siblingCount,
        pageSize
    });
    if (currentPage === 0 || paginationRange?.length < 2) {
        return null;
    }
    let lastPage = paginationRange[paginationRange?.length - 1];
    const onNext = () => {
        onPageChange(currentPage + 1);
    };

    const onPrevious = () => {
        onPageChange(currentPage - 1);
    };

    return (
        <ul className={classes} style={style}>
            <li>
                <Button
                    aria-label={"Попередня сторінка"}
                    className="btn--secondary"
                    icon={prevIcon}
                    disabled={currentPage === 1}
                    onClick={onPrevious}/>
            </li>
            {paginationRange?.map((pageNumber, index) => {
                if (pageNumber === DOTS) {
                    return <li key={index}>
                        {dotsIcon}
                    </li>;
                }

                return (
                    <li key={index}>
                        <Button
                            className={classNames( {
                                "btn--active": parseInt(pageNumber) === parseInt(currentPage),
                                "btn--secondary": parseInt(pageNumber) !== parseInt(currentPage)
                            })}
                            onClick={() => onPageChange(pageNumber)}>
                            {pageNumber}
                        </Button>
                    </li>
                );
            })}
            <li>
                <Button
                    aria-label={"Наступна сторінка"}
                    className="btn--secondary"
                    icon={nextIcon}
                    disabled={parseInt(currentPage) === parseInt(lastPage)}
                    onClick={onNext}/>
            </li>
        </ul>
    );
};

export default React.memo(Pagination);