import PropTypes from 'prop-types';

export const propTypes = {
    /**@type {Function} */ doCancel: PropTypes.func,
    /**@type {Function} */ formUrl: PropTypes.func,
    /**@type {Function} */ header: PropTypes.func,
    /**@type {boolean} */ hideSecondaryControls: PropTypes.bool,
    /**@type {Function} */ isInModal: PropTypes.func,
    /**@type {Array<object>} */ secondaryControls: PropTypes.arrayOf(PropTypes.object),
    /**@type {string} */ title: PropTypes.string,
};
