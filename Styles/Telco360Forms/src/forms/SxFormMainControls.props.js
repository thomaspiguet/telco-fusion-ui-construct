import PropTypes, {checkPropTypes} from 'prop-types';

const msg = {
    button: {
        duplicate: "Dupliquer",
        cancel: "Annuler",
        submit: "Sauvegarder",
    },
};

const classNames = {
    button: {
        duplicate: "btn-primary ml-1",
        cancel: "btn-secondary ml-1",
        submit: "btn-primary ml-1",
    },
};

const customButtonsProp = function (propValue, key, componentName, location, propFullName) {
    if (!(propValue[key].isSubmitBtn || propValue[key].isCancelBtn || propValue[key].isDuplicateBtn)) {
        let errMsg = "";
        if (!('onClick' in propValue[key])) {
            errMsg = `The prop ${propFullName}.onClick is marked as required in ${componentName}, but its value is undefined.`
        }

        if (!('label' in propValue[key])) {
            errMsg =  `${errMsg + '\n'}The prop ${propFullName}.label is marked as required in ${componentName}, but its value is undefined.`
        }
        if (errMsg.length > 0) return new Error(errMsg);
    }
    
    return checkPropTypes({
        buttonClassName: PropTypes.string,
        isDisabled: PropTypes.func,
        isCancelBtn: PropTypes.bool,
        isDuplicateBtn: PropTypes.bool,
        isSubmitBtn: PropTypes.bool,
        label: PropTypes.string,
        loading: PropTypes.bool,
        onClick: PropTypes.func,
    }, propValue, location, componentName)
};

export const customButtonsProps = customButtonsProp;

export const defaultProps = {
    isSubmitting: false,
    forceEnable: false,
    allowDuplicate: false,
    msg: msg,
    classNames: classNames,
};

export const propTypes = {
    handleCancel: PropTypes.func.isRequired,
    cancelLabel: PropTypes.string,
    allowDuplicate: PropTypes.bool,
    isSubmitting: PropTypes.bool,
    handleSubmit: PropTypes.func,
    handleDuplicate: PropTypes.func,
    submitLabel: PropTypes.string,
    formIsDirty: PropTypes.bool,
    forceEnable: PropTypes.bool,
    msg: PropTypes.object,
    classNames: PropTypes.object,
    /**@type {Array<{ buttonClassName: string, isDisabled: Function, isCancelBtn: boolean, isDuplicateBtn: boolean, isSubmitBtn: boolean, label: string, loading: boolean|Function, onClick: Function }>} */ 
    customButtons: PropTypes.arrayOf(customButtonsProp)
};