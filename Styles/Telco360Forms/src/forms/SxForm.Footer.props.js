import PropTypes from 'prop-types';
import { customButtonsProps } from './SxFormMainControls.props';

export const propTypes = {
    /**@type {boolean} */ allowDuplicate: PropTypes.bool,
    /**@type {string} */ cancelLabel: PropTypes.string,
    customButtons: customButtonsProps,
    /**@type {boolean} */ forceEnable: PropTypes.bool,
    /**@type {boolean} */ formIsDirty: PropTypes.bool,
    /**@type {Function} */ handleCancel: PropTypes.func,
    /**@type {Function} */ handleDuplicate: PropTypes.func,
    /**@type {Function} */ handleSubmit: PropTypes.func,
    /**@type {boolean} */ hideMainControls: PropTypes.bool,
    /**@type {boolean} */ isSubmitting: PropTypes.bool,
    /**@type {string} */ submitLabel: PropTypes.string,
};