import PropTypes from 'prop-types';
import SxFieldTypes from './SxFormField.types';

export const msg = {
    indicators: {
        characterMandatory: "*",
    },
    button: {
        under: "Inférieur",
        over: "Supérieur",
    },
};

export const defaultProps = {
    dirtyClassName: "font-weight-bold",
    extendedTypes: {},
    msg: msg
};

export const propTypes =  {
    field: (props, propName, component, location) =>
        SxFieldTypes.fieldDefEntryShapes(props.extendedTypes)(props.field, propName, component, location),  //Définition du champ.
    /**@type {any}*/ data: PropTypes.any,                                               //Donnée du champ.
    /**@type {number} */ delay: PropTypes.number,                                       //Délai global avant que la valeur du champ ne soit automatiquement remonté au parent.
    /**@type {object} */ formData: PropTypes.object.isRequired,                         //Donnée complète du formulaire où le champs est contenue.
    /**@type {object} */ externalData: PropTypes.object,                                //Donnée requisent qui ne sont pas lié directement à un champ du formulaire.
    /**@type {boolean} */ isDirty: PropTypes.bool,                                      //Indique si le champ a des modifications non sauvegardées.
    /**@type {string} */ dirtyClassName: PropTypes.string,                              //Définit un className spécifique à utiliser pour le label des champs dirty.
    /**@type {string} */ errorMsg: PropTypes.string,                                    //Contient le message d'erreur à afficher sur le champ s'il y en a un.
    /**@type {string} */ warningMsg: PropTypes.string,                                  //Contient le message d'avertissement à afficher sur le champ s'il y en a un.

    /**@type {Function} */ onUpdateData: PropTypes.func.isRequired,                     //Callback utiliser pour commetre les donnée changer au modèle de données d'origine. (Généralement onBlur)
    /**@type {Function} */ onChange: PropTypes.func.isRequired,                         //Callback utilisé pour effectuer un traitement à chaque changement dans un champ.

    /**@type {Function} */ onValErrorStart: PropTypes.func,                             //Callback utilisé pour indiquer qu'une erreur est activé
    /**@type {Function} */ onValErrorEnd: PropTypes.func,                               //Callback utilisé pour indiquer qu'une erreur est désactivé
    /**@type {object} */ extendedTypes: PropTypes.object,
    /**@type {object} */ msg: PropTypes.object,
};