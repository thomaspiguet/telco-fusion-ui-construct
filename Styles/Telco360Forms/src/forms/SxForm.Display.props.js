import PropTypes, { checkPropTypes } from 'prop-types';
import { propTypes as customButtonsProps } from './SxFormMainControls.props';
import { fieldDefEntryShapes } from './fields/SxFormField';

const msg = {
    button: {
        submit: "Sauvegarder",
        cancel: "Annuler",
    },
    error: {
        notNull: "La valeur ne peut pas être nulle.",
        invalidField: "Un ou plusieurs champs sont erronées",
        warningField: "Un ou plusieurs champs ont des avertissements",
    },
};
const sectionShape = {
    sectionName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
    noBorder: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    classNames: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    collapsible: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    isFocusType: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    fields: (props, propName, component, location) => {
        if (Array.isArray(props.fields)) {
            props.fields.forEach(aFieldDef => {
                if (aFieldDef.tabs !== undefined) {
                    checkPropTypes(tabsContainerShape, aFieldDef, location, component);
                } else if (aFieldDef.tabName !== undefined) {
                    checkPropTypes(tabShape, aFieldDef, location, component);
                } else if (aFieldDef.fields !== undefined) {
                    checkPropTypes(rowShape, aFieldDef, location, component);
                } else if (aFieldDef.sectionName !== undefined) {
                    checkPropTypes(sectionShape, aFieldDef, location, component);
                } else {
                    fieldDefEntryShapes(props.extendedTypes)(aFieldDef, propName, component, location);
                }
            });
        }
    },
    tabs: (props, _propName, component, location) => {
        if (Array.isArray(props.tabs)) {
            props.tabs.forEach(aTabDef => {
                checkPropTypes(tabShape, aTabDef, location, component);
            });
        }
    },
};

const rowShape = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),                              //ClassName à appliquer à la ligne complète.
    fields: (props, propName, component, location) => {
        props.fields.forEach(aFieldDef => {
            if (typeof aFieldDef.sectionName !== 'undefined') {
                checkPropTypes(sectionShape, aFieldDef, location, component);
            } else {
                fieldDefEntryShapes(props.extendedTypes)(aFieldDef, propName, component, location);
            }
        });
    },
};

const tabShape = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    header: PropTypes.func,                                   //Composant représentant le header à produire
    tabName: PropTypes.string.isRequired,                     //Nom du tab. Est utilisé pour détecter si un SxForm utilise des tabs.
    tab: PropTypes.func,                                      //Fonction de render du tab. permet l'affichage de tabs affiché mais non géré directement par SxForm.
    fields: (props, propName, component, location) => {
        if (Array.isArray(props.fields)) {
            props.fields.forEach(aFieldDef => {
                if (aFieldDef.fields !== undefined) {
                    checkPropTypes(rowShape, aFieldDef, location, component);
                } else if (aFieldDef.sectionName !== undefined) {
                    checkPropTypes(sectionShape, aFieldDef, location, component);
                } else {
                    fieldDefEntryShapes(props.extendedTypes)(aFieldDef, propName, component, location);
                }
            });
        }
    },
};

const tabsContainerShape = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tabs: (props, propName, component, location) => {
        if (Array.isArray(props.tabs)) {
            props.tabs.forEach(aFieldDef => {
                if (aFieldDef.tabs !== undefined) {
                    checkPropTypes(tabsContainerShape, aFieldDef, location, component);
                } else if (aFieldDef.fields !== undefined) {
                    checkPropTypes(rowShape, aFieldDef, location, component);
                } else if (aFieldDef.sectionName !== undefined) {
                    checkPropTypes(sectionShape, aFieldDef, location, component);
                } else {
                    fieldDefEntryShapes(props.extendedTypes)(aFieldDef, propName, component, location);
                }
            });
        }
    },
};

export const defaultProps = {
    customButtonsAlign: "right",
    dirtyFields: [],
    externalData: {},
    externalErrors: [],
    formUrl: () => {},
    hasExternalErrors: false,
    header: undefined,
    isInModal: () => {},
    isScrollable: false,
    lblNbCols: 3,
    msg: msg,
    onChange: () => {},
    onDelayedUpdate: () => {},
    onValErrorEnd: () => {},
    onValErrorStart: () => {},
    updateData: () => {}
};

export const propTypes = {
    /**@type {boolean} */ allowDuplicate: PropTypes.bool,
    customButtons: PropTypes.arrayOf(PropTypes.shape(customButtonsProps)),
    /**@type {object} */ data: PropTypes.object,
    /**@type {Array<string>} */ dirtyFields: PropTypes.arrayOf(PropTypes.string),
    /**@type {Function} */ doCancel: PropTypes.func,
    /**@type {object} */ errors: PropTypes.object,
    /**@type {object} */ errorMsgs: PropTypes.object,
    /**@type {{render: Function, type: { Type: string, EnumIndex: number, FromString: Function, ToString: string }, propTypes: object}} */ 
        extendedTypes: PropTypes.shape({                                        //Permet de définir des types étendue à utiliser dans une application cliente.
            render: PropTypes.func,
            type: PropTypes.shape({
                Type: PropTypes.string.isRequired,
                EnumIndex: PropTypes.number,
                FromString: PropTypes.func,
                ToString: PropTypes.string,
            }),
            propTypes: PropTypes.object,
        }),
    /**@type {object} */ externalData: PropTypes.object,
    /**@type {boolean} */ formIsDirty: PropTypes.bool,
    /**@type {Function} */ formUrl: PropTypes.func,
    /**@type {Function} */ handleCancel: PropTypes.func,
    /**@type {Function} */ handleDelayedUpdate: PropTypes.func,
    /**@type {Function} */ handleDuplicate: PropTypes.func,
    /**@type {Function} */ hasErrors: PropTypes.func,
    /**@type {Function} */ header: PropTypes.func,
    /**@type {boolean} */ hideMainControls: PropTypes.bool,
    /**@type {boolean} */ hideSecondaryControls: PropTypes.bool,
    /**@type {string} */ id: PropTypes.string,
    /**@type {boolean} */ inspection: PropTypes.bool,
    /**@type {Function} */ isInModal: PropTypes.func,
    /**@type {boolean} */ isScrollable: PropTypes.bool,
    /**@type {boolean} */ isSubmitting: PropTypes.bool,
    /**@type {string} */ lblClassName: PropTypes.string,
    /**@type {(1|2|3|4|5|6|7|8|9|10|11|12)} */ lblNbCols: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    /**@type {object} */ msg: PropTypes.object,
    /**@type {string} */ name: PropTypes.string,
    /**@type {Function} */ onChange: PropTypes.func,
    /**@type {Function} */ onDelayedUpdate: PropTypes.func,
    /**@type {Function} */ onSubmit: PropTypes.func,
    /**@type {Function} */ onValErrorEnd: PropTypes.func,
    /**@type {Function} */ onValErrorStart: PropTypes.func,
    /**@type {{ tag: string|Function, className: string }} */
        overrideCardFooterProps: PropTypes.shape({                              //Permet override deux props du component CardFooter, il doit être un ou autre pas les deux au même temps
            tag: PropTypes.oneOfType([                                          //Override completement le component avec autre
                PropTypes.string,
                PropTypes.func
            ]),
            className: PropTypes.string,                                        //Override le className du CardFooter
        }),
    /**@type {Array<{ icon: string, action: Function }>} */ 
        secondaryControls: PropTypes.arrayOf(PropTypes.shape({
            icon: PropTypes.string,
            action: PropTypes.func,
        })),
    /**@type {Array<string>} */ tabsWithIssues: PropTypes.arrayOf(PropTypes.string),
    /**@type {string} */ title: PropTypes.string,
    /**@type {Function} */ updateData: PropTypes.func,
    /**@type {number} */ updateDelay: PropTypes.number,
    /**@type {object} */ warnings: PropTypes.object,
    /**@type {object} */ warningMsgs: PropTypes.object,
    fieldDefinitions: (props, propName, component, location) => {
        props.fieldDefinitions.forEach(aFieldDef => {
            if (aFieldDef.tabs !== undefined) {
                checkPropTypes(tabsContainerShape, aFieldDef, location, component);
            } else if (aFieldDef.tabName !== undefined) {
                checkPropTypes(tabShape, aFieldDef, location, component);
            } else if (aFieldDef.sectionName !== undefined) {
                checkPropTypes(sectionShape, aFieldDef, location, component);
            } else if (aFieldDef.fields !== undefined) {
                checkPropTypes(rowShape, aFieldDef, location, component);
            } else {
                fieldDefEntryShapes(props.extendedTypes)(aFieldDef, propName, component, location);
            }
        });
    },

};