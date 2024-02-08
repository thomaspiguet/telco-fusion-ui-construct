import React from 'react';
import PropTypes from 'prop-types';

import { SxTooltip } from '@telco360/components';

const SxTableCellWrapper = ({ text, truncate = true, collapseWhiteSpace = false, cellClasses = "", cellIsTextOnly = false, centered=false, children, noTooltip }) =>
    { return noTooltip ? 
        children : 
        <SxTooltip title={text}>
        <div className={`${collapseWhiteSpace ? '' : 'white-space-pre'} ${truncate ? 'text-truncate' : ''} ${cellClasses} ${cellIsTextOnly && !centered ? ' ml-1' : 'text-center'}`}>
                {children}
            </div>
        </SxTooltip>
    };

SxTableCellWrapper.propTypes = {
    cellClasses: PropTypes.string,
    cellIsTextOnly: PropTypes.bool,
    children: PropTypes.any,
    text: PropTypes.any,
    truncate: PropTypes.bool,
    collapseWhiteSpace: PropTypes.bool,
};

SxTableCellWrapper.displayName = "SxTableCellWrapper";

export default SxTableCellWrapper;