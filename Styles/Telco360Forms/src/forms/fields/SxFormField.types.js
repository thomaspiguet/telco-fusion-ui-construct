import PropTypes, { checkPropTypes } from 'prop-types';
import { sxFieldTypesHelpersFromString, sxFieldTypesHelpersToString } from './SxFormField.types.helpers';

// Ceci est un mapping avec l'enum définit dans RequiredFieldResult.FieldTypes dans le projet Telco360Commands
const SxFieldTypes = {
    Text: { Type: "text", EnumIndex: 0, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    TextList: { Type: "textList", EnumIndex: undefined, FromString: sxFieldTypesHelpersFromString.stringList, ToString: sxFieldTypesHelpersToString.stringList },
    Number: { Type: "number", EnumIndex: 1, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.number },
    Checkbox: { Type: "checkbox", EnumIndex: 2, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.bool },
    List: { Type: "list", EnumIndex: undefined, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    Select: { Type: "select", EnumIndex: 3, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    //ToDo AG_15-07-2021 : EnumIndex fait étrange ici car UdlList a l'enum 4 du côté de Telco360Commands. Un Jira sera créé pour corriger cela.
    Date: { Type: "date", EnumIndex: 5, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.date },
    Label: { Type: "label", EnumIndex: 6, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    ExtendedSelect: { Type: "extendedSelect", EnumIndex: 7, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    HiddenText: { Type: "hiddenText", EnumIndex: 8, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    Image: { Type: "image", EnumIndex: 9, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    LabeledSelect: { Type: "labeledSelect", EnumIndex: 10, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    BooleanLabel: { Type: "booleanLabel", EnumIndex: 11, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    NumInputRange: { Type: "numInputRange", EnumIndex: 12, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.object },
    NumInputUnder: { Type: "numInputUnder", EnumIndex: 13, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    NumInputOver: { Type: "numInputOver", EnumIndex: 14, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    TriStateCheckBox: { Type: "triStateCheckBox", EnumIndex: 15, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    TextareaAutoHeight: { Type: "textareaAutoHeight", EnumIndex: 16, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    SecretText: { Type: "secretText", EnumIndex: undefined }, // Aucun EnumIndex ici parce que ce champ ne pourra pas être fourni par les commandes
    FormattedInput: { Type: "formattedInput", EnumIndex: 17, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    PostalCode: { Type: "postalCode", EnumIndex: undefined, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    Address: { Type: "address", EnumIndex: undefined, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    DateTime: { Type: "dateTime", EnumIndex: 18, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    Integer: { Type: "integer", EnumIndex: 19, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    PhoneNumberWithCallBtn: { Type: "phoneNumberWithCallBtn", EnumIndex: undefined, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.string },
    AmountInput: { Type: "amountInput", EnumIndex: 20, FromString: sxFieldTypesHelpersFromString.string, ToString: sxFieldTypesHelpersToString.number },
};
//Ceci est pour faire en sorte de ne pas pouvoir ajouter/retirer/modifier les entré dans SxFieldTypes.
if (Object.freeze)
    Object.freeze(SxFieldTypes);

const getFieldTypeForIndex = (idx) => {
    return SxFieldTypes[(Object.keys(SxFieldTypes).filter(aKey => SxFieldTypes?.[aKey]?.EnumIndex === idx))[0]];
};


//#region Props definitions

const baseFieldDefEntryProps = {
    /**
     * @typedef {object} baseFieldDefEntryProps
     * @property {number|string} id id unique pour la définition du champs.
     * @property {string} name Nom du champs correspondant au field dans data.
     * @property {string|Function} label Text du label du champs.
     * @property {boolean|Function} isHidden Indique si le champs doit être caché dans le formulaire. bool || (fieldDefinition, fieldValue, formValues) => bool
     * @property {boolean|Function} isMandatory Indique si le champs doit être remplis pour permettre la sauvegarde.
     * @property {boolean|Function} enabled Indique si le champs doit être éditable ou non.
     * @property {string|Function} fieldMessage Annotation à ajouter en dessou d'un champs.
     * @property {Function} action Fonction d'action à exécuter lors d'une modification à un champ. Retourne un objet contenant les champs à modifier suite à l'action. {fieldName1 : newVal1, fieldName2: newVal2, etc...}
     * @property {Function} actionOnFail Fonction d'action à exécuter lors d'une modification à un champ et que la validation échoue. Retourne un objet contenant les champs à modifier suite à l'action. {fieldName1 : newVal1, fieldName2: newVal2, etc...}
     * @property {Function} validation Fonction de validation retournant un objet du format { valid, message, otherFields, isSaving } otherFields = fieldName de de champs devant être re-validé suite à la validation actuelle.
     * @property {string|Function} className ClassName à appliquer au FormGroup (label + champ) du champ.
     * @property {string|Function} lblClassName ClassName à appliquer uniquement au label du champ.
     * @property {(1|2|3|4|5|6|7|8|9|10|11|12)|Function} lblNbCols Indique le nombre de colonne à allouer au label sur la ligne. Doit être un nombre compris entre 1 et 12.
     * @property {number|Function} delay Délai avant que la valeur du champ ne soit automatiquement remonté au parent.
     * @property {boolean|Function} noDelay Indique que ce champ ne remonte pas automatiquement sa valeur au parent.
     * @property {array} excludeFromTransform Permet d'indiquer de ne pas calculer une propriété pour ce champ si nécessaire.
    */
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    isHidden: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    isMandatory: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    enabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    fieldMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    action: PropTypes.func,
    actionOnFail: PropTypes.func,
    validation: PropTypes.func,
    className: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    lblClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    lblNbCols: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])]),
    delay: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    noDelay: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    excludeFromTransform: PropTypes.array,
};

const fieldDefEntryFieldsByType = {
    // base: // Hidden
    /** @type {baseFieldDefEntryProps} */
    HiddenText: {
        ...baseFieldDefEntryProps,
        type: PropTypes.oneOf([SxFieldTypes.HiddenText]).isRequired,
    },
    // champ booléen: BooleanLabel
    /** @type {{ overrideFieldProps: object } & baseFieldDefEntryProps} */
    BooleanLabel: {
        ...baseFieldDefEntryProps,
        overrideFieldProps: PropTypes.object,                         //Objet contenant les props pour overrider les valeurs par défaut du champs.
        type: PropTypes.oneOf([SxFieldTypes.BooleanLabel]).isRequired,
    },
    /** @type {baseFieldDefEntryProps} */
    Text: {
        ...baseFieldDefEntryProps,
        type: PropTypes.oneOf([SxFieldTypes.Text]).isRequired
    },
    /** @type {baseFieldDefEntryProps} */
    TextList: {
        ...baseFieldDefEntryProps,
        type: PropTypes.oneOf([SxFieldTypes.TextList]).isRequired
    },
    /** @type {baseFieldDefEntryProps} */
    Checkbox: {
        ...baseFieldDefEntryProps,
        type: PropTypes.oneOf([SxFieldTypes.Checkbox]).isRequired
    },
    /** @type {baseFieldDefEntryProps} */
    Date: {
        ...baseFieldDefEntryProps,
        type: PropTypes.oneOf([SxFieldTypes.Date]).isRequired
    },
    /** @type {baseFieldDefEntryProps} */
    DateTime: {
        ...baseFieldDefEntryProps,
        type: PropTypes.oneOf([SxFieldTypes.DateTime]).isRequired
    },
    /** @type {baseFieldDefEntryProps} */
    NumInputUnder: {
        ...baseFieldDefEntryProps,
        type: PropTypes.oneOf([SxFieldTypes.NumInputUnder]).isRequired
    },
    /** @type {baseFieldDefEntryProps} */
    NumInputOver: {
        ...baseFieldDefEntryProps,
        type: PropTypes.oneOf([SxFieldTypes.NumInputOver]).isRequired
    },
    /** @type {baseFieldDefEntryProps} */
    TriStateCheckBox: {
        ...baseFieldDefEntryProps,
        type: PropTypes.oneOf([SxFieldTypes.TriStateCheckBox])
    },
    /** @type {baseFieldDefEntryProps} */
    TextareaAutoHeight: {
        ...baseFieldDefEntryProps,
        type: PropTypes.oneOf([SxFieldTypes.TextareaAutoHeight]).isRequired
    },
    // champ normal de type Number
    /** @type {{ max: number|Function, min: number|Function, overrideFieldProps: object } & baseFieldDefEntryProps} */
    Number: {
        ...baseFieldDefEntryProps,
        max: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        min: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        overrideFieldProps: PropTypes.object,                         //Objet contenant les props pour overrider les valeurs par défaut du champs.
        type: PropTypes.oneOf([SxFieldTypes.Number]).isRequired,
    },
    // étiquettes: // Label
    /** @type {{ overrideFieldProps: object } & baseFieldDefEntryProps} */
    Label: {
        ...baseFieldDefEntryProps,
        overrideLabelProps: PropTypes.object,                         //Objet contenant les props pour overrider les valeurs par défaut du label d'un champs.
        type: PropTypes.oneOf([SxFieldTypes.Label]).isRequired,
    },
    // images: // Image
    /** @type {{ overrideFieldProps: object, imageMaximumSize: number|Function } & baseFieldDefEntryProps} */
    Image: {
        ...baseFieldDefEntryProps,
        overrideFieldProps: PropTypes.object,                                               //Objet contenant les props pour overrider les valeurs par défaut du champs.
        imageMaximumSize: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),          //Taille maximale de l'image en bits
        type: PropTypes.oneOf([SxFieldTypes.Image]).isRequired,
    },
    // listes: // List, ExtendedSelect
    /** @type {{ overrideFieldProps: object, options: Array.<object>|Array.<string>|Function } & baseFieldDefEntryProps} */
    List: {
        ...baseFieldDefEntryProps,
        options: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),         //List d'options lorsque type est égale à list.  On doit fournir options ou getOptions.  La propriété getOptions peut être fournie par overrideFieldProps.
        overrideFieldProps: PropTypes.object,                                   //Objet contenant les props pour overrider les valeurs par défaut du champs.
        type: PropTypes.oneOf([SxFieldTypes.List]).isRequired,
    },
    /** @type {{ overrideFieldProps: object, options: Array.<object>|Array.<string>|Function } & baseFieldDefEntryProps} */
    ExtendedSelect: {
        ...baseFieldDefEntryProps,
        options: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),         //List d'options lorsque type est égale à list.  On doit fournir options ou getOptions.  La propriété getOptions peut être fournie par overrideFieldProps.
        overrideFieldProps: PropTypes.object,                                   //Objet contenant les props pour overrider les valeurs par défaut du champs.
        type: PropTypes.oneOf([SxFieldTypes.ExtendedSelect]).isRequired,
    },
    /** @type {{ overrideFieldProps: object, options: Array.<object>|Array.<string>|Function } & baseFieldDefEntryProps} */
    Select: {
        ...baseFieldDefEntryProps,
        options: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),         //List d'options lorsque type est égale à list.  On doit fournir options ou getOptions.  La propriété getOptions peut être fournie par overrideFieldProps.
        overrideFieldProps: PropTypes.object,                                   //Objet contenant les props pour overrider les valeurs par défaut du champs.
        type: PropTypes.oneOf([SxFieldTypes.Select]).isRequired,
    },
    // Saisie d'intervales: // SxNumInputRange
    /** @type {{ overrideFieldProps: object, maxAllowed: number|Function, minAllowed: number|Function } & baseFieldDefEntryProps} */
    NumInputRange: {
        ...baseFieldDefEntryProps,
        maxAllowed: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,
        minAllowed: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,
        overrideFieldProps: PropTypes.object,                                               //Objet contenant les props pour overrider les valeurs par défaut du champs.
        type: PropTypes.oneOf([SxFieldTypes.NumInputRange]).isRequired,
    },
    // Saisie montant d'argent': // SxAmountInput
    /** @type {{ overrideFieldProps: object, max: number|Function, min: number|Function, userLocal: string|Function, userCurrency: string|Function, addontype: ('append'|'prepend') } & baseFieldDefEntryProps} */
    AmountInput: {
        ...baseFieldDefEntryProps,
        max: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        min: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        userLocal: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        userCurrency: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        addontype: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        overrideFieldProps: PropTypes.object,                                               //Objet contenant les props pour overrider les valeurs par défaut du champs.
        type: PropTypes.oneOf([SxFieldTypes.AmountInput]).isRequired,
    },
    // Secret : SecretText
    /** @type {{ overrideFieldProps: object, fetchValue: Function } & baseFieldDefEntryProps} */
    SecretText: {
        ...baseFieldDefEntryProps,
        fetchValue: PropTypes.func.isRequired,                        //Fonction responsable de fournir la valeur du composant.
        overrideFieldProps: PropTypes.object,                         //Objet contenant les props pour overrider les valeurs par défaut du champs.
        type: PropTypes.oneOf([SxFieldTypes.SecretText]).isRequired,
    },
    // Select étendus: // LabeledSelect
    /** @type {{ overrideFieldProps: object, overrideSelectFieldProps: object, labelPropertyName: string|Function, options: Array.<object>|Array.<string>|Function } & baseFieldDefEntryProps} */
    LabeledSelect: {
        ...baseFieldDefEntryProps,
        options: PropTypes.oneOfType([PropTypes.array, PropTypes.func]).isRequired,         //List d'options lorsque type est égale à list.
        labelPropertyName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),         //Indique la propriété qui contient l'étiquette
        overrideSelectFieldProps: PropTypes.object,                                         //Objet contenant les props pour surcharger les valeurs par défaut d'un dropdown.
        overrideLabelFieldProps: PropTypes.object,                                          //Objet contenant les props pour overrider les valeurs par défaut du label d'un champs.
        type: PropTypes.oneOf([SxFieldTypes.LabeledSelect]).isRequired,
    },
    // Champ formatté: FormattedInput
    /** @type {{ format: object, fetchValue: Function } & baseFieldDefEntryProps} */
    FormattedInput: {
        ...baseFieldDefEntryProps,
        format: PropTypes.object.isRequired,
    },
    // Champ code postal: PostalCode
    /** @type {{ countryId: string|number, getFormat: Function } & baseFieldDefEntryProps} */
    PostalCode: {
        ...baseFieldDefEntryProps,
        countryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        getFormat: PropTypes.func,
    },
    // Champ texte avec lien pour carte: Address
    /**
     * @typedef {object} modalProps
     * @property {string} backdrop
     * @property {boolean} centered
     * @property {boolean} unmountOnClose
     * @property {string} size
     * @property {boolean} fade
     * @property {string} className
     * @property {classProps} classNames
     * @property {Function} renderHeader
     * @property {Function} renderFooter
     */
    /**
     * @typedef {object} classProps
     * @property {string} header
     * @property {string} body
     * @property {string} footer
     */
    /**
     * @typedef {object} textAreaProps
     * @property {string} className
     * @property {boolean} showCounter
     * @property {number} maxLength
     */
    /** @type {{ fullscreen: boolean|Function, modalOverrideProps: modalProps|Function, openMap: Function, textAreaOverrideProps: textAreaProps|Function } & baseFieldDefEntryProps} */
    Address: {
        ...baseFieldDefEntryProps,
        fullscreen: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        modalOverrideProps: PropTypes.oneOfType([PropTypes.shape({
            backdrop: PropTypes.string,
            centered: PropTypes.bool,
            unmountOnClose: PropTypes.bool,
            size: PropTypes.string,
            fade: PropTypes.bool,
            className: PropTypes.string,                                                    //Définit le className à appliquer sur le component globale.
            classNames: PropTypes.shape({                                                   //Définit le className à définir sur chacun des sous component du SxModal.
                header: PropTypes.string,
                body: PropTypes.string,
                footer: PropTypes.string,
            }),
            renderHeader: PropTypes.func,
            renderFooter: PropTypes.func,
        }), PropTypes.func]),
        openMaps: PropTypes.func,
        textAreaOverrideProps: PropTypes.oneOfType([PropTypes.shape({
            className: PropTypes.string,
            showCounter: PropTypes.bool,
            maxLength: PropTypes.number,
        }), PropTypes.func]),
    },
    // Champ numérique de type entier: integer
    /** @type {{ max: number, min: number } & baseFieldDefEntryProps} */
    Integer: {
        ...baseFieldDefEntryProps,
        max: PropTypes.number,
        min: PropTypes.number,
        type: PropTypes.oneOf([SxFieldTypes.Integer]).isRequired,
    },
    // Champ numéro téléphone avec bouton d'appel: PhoneNumberWithCallBtn
    /** @type {{ classNameCallBtn: string|Function, overrideFieldProps: object, overridePropsCallBtn: object, overridePropsInput: object, disabledCallBtn: boolean|Function } & baseFieldDefEntryProps} */
    PhoneNumberWithCallBtn: {
        ...baseFieldDefEntryProps,
        classNameCallBtn: PropTypes.oneOfType([ //ClassName à appliquer uniquement à l'icône du bouton d'appel.
            PropTypes.string,
            PropTypes.func,
        ]),
        overrideFieldProps: PropTypes.object,       //Objet contenant les props pour surcharger les valeurs par défaut du champs.
        overridePropsCallBtn: PropTypes.object,     //Objet contenant les props pour surcharger les valeurs par défaut du bouton d'appel.
        overridePropsInput: PropTypes.object,       //Objet contenant les props pour surcharger les valeurs par défaut de l'input.
        type: PropTypes.oneOf([SxFieldTypes.PhoneNumberWithCallBtn]).isRequired,
        disabledCallBtn: PropTypes.oneOfType([      //Indique si le bouton d'appel doit être désactivé.
            PropTypes.bool,
            PropTypes.func,
        ]),
    },
    // Champ personnalisé sur mesure sans 'SxFormField.types'
    /** @type {{ render: Function } & baseFieldDefEntryProps} */
    custom: {
        ...baseFieldDefEntryProps,
        render: PropTypes.func.isRequired,                            //Fonction permettent de render un champs de manière spécifique. Attention, le traitement habituellement géré par Sxform ne le sera pas pour ce champs. Il faudra utiliser les callback fournit render(field, formData, externalData, onChange, onUpdate, onValErrorStart, onValErrorEnd)
    },
};

//Effectue la validation allant avec les propriétés render et type fournies. Reçois les types étendu en paramètre et retourne la fonction de validation.
const fieldDefEntryShapes = (extendedTypes = {}) =>
    (props, propName, component, location) => {
        if (props.render !== undefined) {
            if (props.type !== undefined) {
                throw new Error(`The property ${propName} of component ${component} cannot have both render and type.`);
            }
            return checkPropTypes(fieldDefEntryFieldsByType.custom, props, location, component);
        }

        /* eslint-disable react/forbid-foreign-prop-types -- Nous désactivons le warning eslint d'utilisation de proptypes pour cette section car leur utilisation ici est voulu. */
        //Traitement des types étendus
        const tmp = extendedTypes?.[props.type];
        if (typeof tmp !== 'undefined' &&
            typeof tmp.propTypes !== 'undefined') {
            return checkPropTypes({ ...baseFieldDefEntryProps, ...tmp.propTypes }, props, location, component);
        }
        /* eslint-enable react/forbid-foreign-prop-types */

        if (typeof props.type === 'function') {
            return;     //Lorsque le type du champ est calculé, il n'est pas possible de valider le type retourné.
        }
        const type = Object.keys(SxFieldTypes).find(x => x.toLowerCase() === props.type?.Type?.toLowerCase());
        if (type){
            return checkPropTypes(fieldDefEntryFieldsByType[type], props, location, component);
        } else {
            throw new Error(`Couldn't match type '${props?.type?.Type}' in field '${props?.name}' with id '${props?.id}' for PropTypes validation in ${component}. Watch type in 'SxFormField.types'.`);
        }
    };
//endregion


export { fieldDefEntryShapes };
export { getFieldTypeForIndex };
/** 
 * Définition des props attendus selon le type spécifié 
 * 
 * @type {fieldDefEntryFieldsByType} 
 */
const finalExport = {
    ...SxFieldTypes,
    //Utilitaires pour SxFieldTypes.
    getFieldTypeForIndex: getFieldTypeForIndex,
    fieldDefEntryShapes: fieldDefEntryShapes,
};

export default finalExport;