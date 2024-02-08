import PropTypes, {checkPropTypes} from 'prop-types';
import { fieldDefEntryShapes } from './fields/SxFormField';
import { propTypes as customButtonsProps } from './SxFormMainControls.props';

export const msg = {
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

export const propTypes = {
    /*
        Définition des champs à afficher dans le formulaire.
        Toutes les propriétés peuvent être définit comme étant des fonctions ayant la forme : (fieldDef, value, formData, externalData) => {}
        Attention, pour ajouter une nouvelle propriété d'un champ n'étant pas calculer avec les même paramètres, il faut l'ajouter aux exclusions dans le fichiers SxForm.Helpers.js ou via la propriété excludeFromTransform.

        Les propriétés suivantes ne peuvent pas être calculé :
        "id",
        "name",
        "fields",
        "tabs",
        "action",
        "actionOnFail",
        "validation",
        "render",
        "fetchValue",
        "onChange",
        "onUpdate",
        "onBlur",
        "tab",
        "header",
        "onMapNotFound",
        "openMaps",
        "overrideFieldProps",
        "overrideSelectFieldProps",
    */
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
    /**@type {boolean} */ allowDuplicate: PropTypes.bool,
    /**@type {Function} */ cancelDelegator: PropTypes.func,                                        //Fonction permettant au parent d'executer le cancel du SxForm.
    /**@type {boolean} */ clearOnHiddenFields: PropTypes.bool,                                    //Indique si les champs identifier comme isHidden doivent avoir leur valeur remise à undefined dans newFormData retourné par updateData.
    customButtons: PropTypes.arrayOf(PropTypes.shape(customButtonsProps)),                        //Définitions d'une liste de boutons customs pour remplacer les Sauvegarder et Annuler par défaut.
    /**@type {string} */ customButtonsAlign: PropTypes.string,
    /**@type {object} */ data: PropTypes.object.isRequired,                                      //Objet contenant les données à afficher dans le formulaire.
    /**@type {Function} */ duplicateDelegator: PropTypes.func,                                     //Fonction permettant au parent d'executer le duplicate du SxForm.
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
    /**@type {object} */ externalData: PropTypes.object,                                         //Objet contenant les données requisent pour le fonctionnement du SxForm mais qui ne sont pas des données directement lié aux champs. (utilisation dans validations et format des champs custom)
    /**@type {Array} */ externalErrors: PropTypes.array,
    /**@type {boolean} */ formIsDirty: PropTypes.bool,
    /**@type {string} */ formUrl: PropTypes.string,
    /**@type {Function} */ handleDuplicate: PropTypes.func,
    /**@type {boolean} */ hasExternalErrors: PropTypes.bool,                                      //Permet au component utilisant le SxForm de forcer un état d'erreur si nécessaire.
    /**@type {Function} */ header: PropTypes.func,
    /**@type {boolean} */ hideMainControls: PropTypes.bool,                                       //Permet de cacher la zone de controles principal et de seulement afficher formulaire
    /**@type {boolean} */ hideSecondaryControls: PropTypes.bool,
    /**@type {boolean} */ inspection: PropTypes.bool,
    /**@type {string} */ lblClassName: PropTypes.string,                                         //Classnames à appliquer à tout les labels.
    /**@type {(1|2|3|4|5|6|7|8|9|10|11|12)} */ lblNbCols: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])]),                                                 //Définit le nombre de colonnes des tous les labels du formulaire.
    /**@type {boolean} */ isInModal: PropTypes.bool,
    /**@type {boolean} */ isScrollable: PropTypes.bool,
    /**@type {object} */ msg: PropTypes.object,
    /**@type {string} */ name: function (props, propName, componentName) {
        if ((props.title === undefined) && (props[propName] === undefined)) {
            return new Error(
                `The prop '${propName}' must be defined if prop 'title' is undefined in component '${componentName}'.`
            );
        }
        return null;
    },
    /**@type {Function} */ onCancel: PropTypes.func,                                               //Fonction à exécuter lors du clique sur le bouton cancel.
    /**@type {Function} */ onSubmit: PropTypes.func,                                               //Fonction à exécuter lors du clique sur le bouton submit.
    /**@type {Function} */ onSubmitSuccess: PropTypes.func,                                        //Fonction à exécuter lorsqu'un submit est complété avec succes.
    /**@type {Function} */ onValErrorEnd: PropTypes.func,
    /**@type {Function} */ onValErrorStart: PropTypes.func,
    /**@type {{ tag: string|Function, className: string }} */
        overrideCardHeaderProps: PropTypes.shape({                              //Permet override deux props du component CardHeader, il doit être un ou autre pas les deux au même temps
            tag: PropTypes.oneOfType([                                          //Override completement le component avec autre
                PropTypes.string,
                PropTypes.func
            ]),
            className: PropTypes.string,                                        //Override le className du CardFooter
        }),
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
    /**@type {Function} */ setIsDirtyPanel: PropTypes.func,
    /**@type {Function} */ submitDelegator: PropTypes.func,                                        //Fonction permettant au parent d'executer le submit du SxForm.
    /**@type {string} */ title: PropTypes.string,
    /**@type {Function} */ tryToLaunchPcModal: PropTypes.func,
    /**@type {Function} */ updateData: PropTypes.func.isRequired,                                  //Fonction appelée lors de modification apporté à un champs (onBlur) pour syncroniser le data avec l'interface. (fieldDef, newValue, newFormData) => {}
    /**@type {number} */ updateDelay: PropTypes.number,                                          //Indique le délai avant d'effectuer un update automatique de la valeur d'un champ.
    /**@type {Function} */ validateDelegator: PropTypes.func,                                      //Fonction permettant au parent d'executer les validations du SxForm
    /**@type {object} */ warningMsgs: PropTypes.object,

};

export const defaultProps = {
    customButtonsAlign: "right",
    externalData: {},
    hasExternalErrors: false,
    externalErrors: [],
    isScrollable: false,
    lblNbCols: 3,
    msg: msg,
};
