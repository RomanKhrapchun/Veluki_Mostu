import React, {useState} from 'react';
import {usePopper} from 'react-popper';
import './Tooltip.css'
import {generateIcon, iconMap} from "../../../utils/constants";
import Portal from "../../../hooks/usePortal";

const tooltipIcon = generateIcon(iconMap.tooltip, 'input-description__icon')

const Tooltip = ({caption = ""}) => {

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [referenceElement, setReferenceElement] = useState(null);
    const [popperElement, setPopperElement] = useState(null);

    const {styles, attributes} = usePopper(referenceElement, popperElement, {
            placement: "top",
            modifiers: [
                {
                    name: "offset",
                    options: {
                        offset: [0, 10]
                    }
                },

            ]
        }
    );

    const showTooltip = () => {
        setTooltipVisible(true);
    };

    const hideTooltip = () => {
        setTooltipVisible(false);
    };

    return (
        <React.Fragment>
            <span
                aria-describedby="tooltip"
                ref={setReferenceElement}
                onMouseEnter={showTooltip}
                onFocus={showTooltip}
                onMouseLeave={hideTooltip}
                onBlur={hideTooltip}
            >
              {tooltipIcon}
            </span>
            {tooltipVisible &&
                <Portal id="tooltip">
                    <div
                        id="tooltip"
                        role="tooltip"
                        data-show
                        ref={setPopperElement}
                        style={styles.popper}
                        {...attributes.popper}
                    >
                        {caption}
                        <div id="arrow" data-popper-arrow style={styles.arrow}></div>
                    </div>
                </Portal>
            }
        </React.Fragment>
    );
};
export default Tooltip;
