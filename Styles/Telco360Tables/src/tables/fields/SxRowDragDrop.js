import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withConfigs } from '@telco360/components';
import { Helpers as commonHelpers } from '@telco360/commonjs';

/// Ce présenteur affiche l'icone pour effectuer un drag and drop d'une ligne et effectue la gestion de l'ordonnancement.
class SxRowDragDrop extends Component {
    onDragStart = (e, row) => {
        e.dataTransfer.setData("rowId", row[this.props.keyField]);
    }

    onDrop = (e, row) => {
        let toReturn = commonHelpers.deepClone(this.props.rows);             //Nous devons cloner l'array de data pour éviter de faire muter le props. (La mutation des props est une mauvaise pratique et dans le cas des RBT2Tables que nous utilisons, cela bloque les refresh)
        let sourceIndex;
        let targetIndex;

        let prevRow = toReturn.filter((r, i) => {
            if (r[this.props.keyField] == e.dataTransfer.getData("rowId")) { //eslint-disable-line
                // == doit être utilisé ici car en utilisant dataTransfer, le type est converti à string au lieu de number
                sourceIndex = i;
                return true;
            }
            return false;
        })[0];

        toReturn.forEach((r, i) => {
            if (r[this.props.orderingField] === row[this.props.orderingField]) {
                targetIndex = i;
            }
        });

        //L'élément bougé est toujours mis au dessus de l'élément où il a été déposé.
        prevRow[this.props.orderingField] = row[this.props.orderingField] - 1;

        //On ajuste les valeurs des ordonnencements des éléments affecté.
        toReturn.forEach((r, i) => {
            if (sourceIndex < targetIndex) {
                if (i > sourceIndex && i < targetIndex) {
                    r[this.props.orderingField]--;
                }
            }
            else if (sourceIndex > targetIndex) {
                if (i >= targetIndex && i <= sourceIndex) {
                    r[this.props.orderingField]++;
                }
            }
        });

        //On ré-order les éléments en tenant compte des modifications.
        toReturn.sort((a, b) => { return a[this.props.orderingField] - b[this.props.orderingField] });

        //On ré-inscrit les bonnes valeurs pour le ordering field lorsque le props le demande.
        if (this.props.overwriteOrderField) {
            toReturn.forEach((r, i) => { r[this.props.orderingField] = i; });
        }

        this.props.onDrop(toReturn);
    }

    allowDrop = (e) => {
        e.preventDefault();
    }

    render() {
        return (
            <div
                aria-label={this.props["aria-label"]}
                className="text-left"
                draggable
                onDragStart={(e) => { this.onDragStart(e, this.props.row) }}        //Insère le data dans l'event lors du début du drag
                onDrop={(e) => { this.onDrop(e, this.props.row) }}                  //Exécute l'action du drop
                onDragOver={(e) => { this.allowDrop(e) }}                           //Permet d'effectuer un drop
            >
                {this.props.leadingText}<li className="fa fa-bars" />{this.props.trailingText}
            </div>
        );
    }
}

SxRowDragDrop.propTypes = {
    "aria-label": PropTypes.string,
    keyField: PropTypes.string.isRequired,                          //Champ identifiant un élément de manière unique.
    orderingField: PropTypes.string.isRequired,                     //Champ à utiliser pour effectuer l'ordonnancement.

    row: PropTypes.object.isRequired,                               //Objet row associé au component.
    rows: PropTypes.array.isRequired,                               //Toutes les rows de la grid associé au component.

    onDrop: PropTypes.func.isRequired,                              //Callback pour synchroniser le data dans le component appelant suite au changement d'ordre.

    overwriteOrderField: PropTypes.bool,                            //Détermine si le champs définit par orderingField devra être écrasé lors des mouvements. (Nécessaire dans les cas où des lignes peuvent être retiré et ramenné dans la grid)

    leadingText: PropTypes.string,                                  // text à ajouter avant drag-and-drop icone (optionnel)
    trailingText: PropTypes.string                                  // text à ajouter before drag-and-drop icone (optionnel)
}

SxRowDragDrop.defaultProps = {
    overwriteOrderField: true,
}

SxRowDragDrop.displayName = "SxRowDragDrop";

export default withConfigs(SxRowDragDrop);