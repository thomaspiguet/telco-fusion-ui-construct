import PropTypes from 'prop-types';

export const propTypes = {
    /**@type {object} */ data: PropTypes.object,
    /**@type {number} */ delay: PropTypes.number,
    /**@type {Function} */ onDelayedUpdate: PropTypes.func,
    /**@type {Array<string>} */ dirtyFields: PropTypes.arrayOf(PropTypes.string),
    /**@type {object} */ errors: PropTypes.object,
    /**@type {object} */ errorMsgs: PropTypes.object,
    /**@type {any} */ extendedTypes: PropTypes.any,
    /**@type {object} */ externalData: PropTypes.object,
    /**@type {Array<object>} */ fieldDef: PropTypes.arrayOf(PropTypes.object),
    /**@type {string} */ formId: PropTypes.string,
    /**@type {Function} */ header: PropTypes.func,
    /**@type {string} */ id: PropTypes.string,
    /**@type {string} */ lblClassName: PropTypes.string,
    /**@type {(1|2|3|4|5|6|7|8|9|10|11|12)} */ lblNbCols: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    /**@type {Function} */ onChange: PropTypes.func,
    /**@type {Function} */ onValErrorEnd: PropTypes.func,
    /**@type {Function} */ onValErrorStart: PropTypes.func,
    /**@type {Function} */ updateData: PropTypes.func,
    /**@type {object} */ warnings: PropTypes.object,
    /**@type {object} */ warningMsgs: PropTypes.object
};