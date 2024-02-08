import PropTypes from 'prop-types';

export const propTypes = {
    /**@type {Array<object>} */ fieldDefinitions: PropTypes.arrayOf(PropTypes.object),
    /**@type {object} */ data: PropTypes.object,
    /**@type {object} */ externalData: PropTypes.object,
    /**@type {object} */ msg: PropTypes.object,
    /**@type {string} */ id: PropTypes.string
}