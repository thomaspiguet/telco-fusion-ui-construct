import PropTypes from 'prop-types';

export const defaultProps = {
    errors: {},
};

export const propTypes = {
    /**@type {{ id: string, tabs: Array<object> }} */ 
    fieldDef: PropTypes.shape({ 
        id: PropTypes.string, 
        tabs: PropTypes.arrayOf(PropTypes.object) 
    }).isRequired, 
    /**@type {object} */ errors: PropTypes.object,
    /**@type {Function} */ header: PropTypes.func,
};