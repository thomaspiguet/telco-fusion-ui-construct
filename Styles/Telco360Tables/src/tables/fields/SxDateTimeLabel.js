import PropTypes from 'prop-types';
import React from 'react';

import { helpers, withConfigs } from '@telco360/components';
import moment from 'moment';


/// Ce présenteur affiche un datetime en lecture seule dans une table.
const SxDateTimeLabel = ({ dateOnly, timeOnly, format, isoStringValue, ...props }) => {
    const formatLocal = dateOnly ? 
        helpers.Date.format.dateDefault : 
        timeOnly ? 
            helpers.Date.format.timeDefault : 
            helpers.Date.format.dateTimeDefault;

    const dateTimeToDisplay = isoStringValue ? 
        helpers.Date.formatterFromUtc(
            isoStringValue,
            format ?? formatLocal) : '';

    return <span aria-label={props["aria-label"]}>
            {dateTimeToDisplay}
        </span>;
}


SxDateTimeLabel.propTypes = {
    isoStringValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date), PropTypes.instanceOf(moment)]),
    dateOnly: PropTypes.bool,
    timeOnly: PropTypes.bool,
    format: PropTypes.string,
};

SxDateTimeLabel.displayName = "SxDateTimeLabel";

export default withConfigs(SxDateTimeLabel);