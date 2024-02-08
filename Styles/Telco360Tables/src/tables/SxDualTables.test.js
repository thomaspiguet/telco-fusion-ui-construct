import React, { useState } from 'react';
import { render, fireEvent, screen, getAllByRole, getByRole, waitFor, findByText, getByText } from '@testing-library/react';

import {SxDualTables} from '../index';

import { sxDualTablesDefaultMsg } from './SxDualTables';


import sxTableTestHelpers from './SxTable.test.helpers';

import '@testing-library/jest-dom/extend-expect';

const msgnoData = {
    label: {
        noDataToDisplay: "Aucune donnée à afficher",
    }
};

const basicIncTableCols = [
    {
        dataField: 'key',
        text: 'key',
        editable: false,
    },
    {
        dataField: 'field1',
        text: 'Field1',
        editable: false,
    },
];

var basicTestData = [];

beforeEach(() => {
    basicTestData = [
        {
            key: "anotherKey1",
            field1: "aField1.1",
            isIncluded: false
        },
        {
            key: "anotherKey2",
            field1: "aField1.2",
            isIncluded: true
        },
        {
            key: "anotherKey3",
            field1: "aField1.3",
            isIncluded: false
        },
        {
            key: "anotherKey4",
            field1: "aField1.4",
            isIncluded: true
        },
        {
            key: "key1",
            field1: "field1.1",
            isIncluded: false
        },
        {
            key: "key2",
            field1: "field1.2",
            isIncluded: false
        },
        {
            key: "key3",
            field1: "field1.3",
            isIncluded: true
        },
    ];
});


describe('Basic render tests', () => {
    it('renders without crashing', () => {
        render(<SxDualTables
            keyField="key"
            includedTableProps={
                {
                    title: "Inc Table",
                    columns: basicIncTableCols,
                }
            }

            availableTableProps={
                {
                    title: "Inc Table",
                    columns: basicIncTableCols,
                }
            }

            data={[]}

            addButtonHandler={() => { }}
            removeButtonHandler={() => { }}
        />);
    });
});


//Ceci est un mock de component utilisant SxDualTable afin de permettre un re-render lorsque le data est changé. Requis pour tester les actions sur les données (add, remove, edit, etc)
const MockDualTableUser = (props) => {
    var [data, setData] = useState(basicTestData);

    return (<SxDualTables
        keyField="key"
        includedTableProps={
            {
                title: "Inc Table",
                columns: basicIncTableCols,
            }
        }

        availableTableProps={
            {
                title: "Inc Table",
                columns: basicIncTableCols,
            }
        }

        data={data}

        addButtonHandler={(_rows, data) => {
            setData(data);
        }}
        removeButtonHandler={(_rows, data) => {
            setData(data);
        }}
        orderByDragValueDataField={props.orderByDragValueDataField}
    />);
}


describe('Basic interaction tests', () => {
    it('Add an element', async () => {
        render(<MockDualTableUser />);

        const avlbTable = await sxTableTestHelpers.accessors.sxDualTables.getAvailableTable();

        //Nous allons chercher tout les checkboxes de la table "available"
        const checkBoxes = getAllByRole(avlbTable, 'checkbox');

        //Nous effectuons un click sur tout le checkbox du premier élément
        fireEvent.click(checkBoxes[1]);
        await waitFor(() => expect(checkBoxes[1].checked).toBe(true));

        const addBtn = await screen.findByText(sxDualTablesDefaultMsg.button.dualTableAdd);

        fireEvent.click(addBtn);

        //On confirme que les lignes sont présente dans la table d'éléments sélectionné
        const incTable = await sxTableTestHelpers.accessors.sxDualTables.getIncludedTable();

        await findByText(incTable, "aField1.1");
    });

    it('Add all elements selecting all at once', async () => {
        render(<MockDualTableUser />);

        const avlbTable = await sxTableTestHelpers.accessors.sxDualTables.getAvailableTable();

        //Nous allons chercher tout les checkboxes de la table "available"
        const checkBoxes = getAllByRole(avlbTable, 'checkbox');

        //Nous effectuons un click sur tout les checkbox excepté le premier puisqu'il s'agit du checkbox de l'en-tête de colonne pour sélectionner toutes les lignes.
        fireEvent.click(checkBoxes[0]);

        await waitFor(() => expect(checkBoxes[1].checked).toBe(true));
        await waitFor(() => expect(checkBoxes[2].checked).toBe(true));
        await waitFor(() => expect(checkBoxes[3].checked).toBe(true));

        const addBtn = await screen.findByText(sxDualTablesDefaultMsg.button.dualTableAdd);

        fireEvent.click(addBtn);

        //On attend l'affichage du noDataIndication qui apparaitra dans la table available lorsque le transfère sera effectué puisque nous avons retirer toutes les données de la première table.
        await screen.findByText(msgnoData.label.noDataToDisplay);
        //On confirme que les lignes sont présente dans la table d'éléments sélectionné
        const incTable = await sxTableTestHelpers.accessors.sxDualTables.getIncludedTable();

        await findByText(incTable, "field1.1");
        await findByText(incTable, "field1.2");
        await findByText(incTable, "field1.3");
    });

    it('Add all elements selecting one by one', async () => {
        render(<MockDualTableUser />);

        const avlbTable = await sxTableTestHelpers.accessors.sxDualTables.getAvailableTable();

        //Nous allons chercher tout les checkboxes de la table "available"
        const checkBoxes = getAllByRole(avlbTable, 'checkbox');

        //Nous effectuons un click sur tout les checkbox excepté le premier puisqu'il s'agit du checkbox de l'en-tête de colonne pour sélectionner toutes les lignes.
        fireEvent.click(checkBoxes[1]);
        fireEvent.click(checkBoxes[2]);
        fireEvent.click(checkBoxes[3]);
        fireEvent.click(checkBoxes[4]);
        await waitFor(() => expect(checkBoxes[1].checked).toBe(true));
        await waitFor(() => expect(checkBoxes[2].checked).toBe(true));
        await waitFor(() => expect(checkBoxes[3].checked).toBe(true));
        await waitFor(() => expect(checkBoxes[4].checked).toBe(true));

        const addBtn = await screen.findByText(sxDualTablesDefaultMsg.button.dualTableAdd);

        fireEvent.click(addBtn);

        //On attend l'affichage du noDataIndication qui apparaitra dans la table available lorsque le transfère sera effectué puisque nous avons retirer toutes les données de la première table.
        await screen.findByText(msgnoData.label.noDataToDisplay);
        //On confirme que les lignes sont présente dans la table d'éléments sélectionné
        const incTable = await sxTableTestHelpers.accessors.sxDualTables.getIncludedTable();

        await findByText(incTable, "field1.1");
        await findByText(incTable, "field1.2");
        await findByText(incTable, "field1.3");
    });

    it('sorts both table', async () => {
        //Arrange
        render(<MockDualTableUser orderByDragValueDataField="keyord"/>);

        let avlbTable = await sxTableTestHelpers.accessors.sxDualTables.getAvailableTable();

        // Vérifier que le sort ne s'applique pas sur l'ordre initial.  Les données sont ordonnées par la requête get et l'ordre reçu fait foi de l'ordre à respecter.
        let avlbElems = getAllByRole(avlbTable, "row");
        expect(getByText(avlbElems[1], "anotherKey1")).toBeInTheDocument();
        expect(getByText(avlbElems[2], "anotherKey3")).toBeInTheDocument();
        expect(getByText(avlbElems[3], "key1")).toBeInTheDocument();
        expect(getByText(avlbElems[4], "key2")).toBeInTheDocument();

        const incTable = await sxTableTestHelpers.accessors.sxDualTables.getIncludedTable();
        let incElems = getAllByRole(incTable, "row");
        expect(getByText(incElems[1], "anotherKey2")).toBeInTheDocument();
        expect(getByText(incElems[2], "anotherKey4")).toBeInTheDocument();
        expect(getByText(incElems[3], "key3")).toBeInTheDocument();

        //Act
        // Déplacer l'élément key2 et anotherKey1 vers les éléments inclus va réordonner la table.
        let checkboxToClick1 = getByRole(avlbElems[1], 'checkbox');
        let checkboxToClick2 = getByRole(avlbElems[4], 'checkbox');
        fireEvent.click(checkboxToClick1);
        fireEvent.click(checkboxToClick2);
        await waitFor(() => expect(checkboxToClick1.checked).toBe(true));
        await waitFor(() => expect(checkboxToClick2.checked).toBe(true));

        const addBtn = screen.getByText(sxDualTablesDefaultMsg.button.dualTableAdd);
        fireEvent.click(addBtn);

        await findByText(incTable, "anotherKey1");

        //Assert
        // Vérifions que le anotherKey1 s'est installé au premier rang et que key2 s'est installé 4e rang
        incElems = getAllByRole(incTable, 'row');
        expect(getByText(incElems[1], "anotherKey1")).toBeInTheDocument();
        expect(getByText(incElems[2], "anotherKey2")).toBeInTheDocument();
        expect(getByText(incElems[3], "anotherKey4")).toBeInTheDocument();
        expect(getByText(incElems[4], "key2")).toBeInTheDocument();
        expect(getByText(incElems[5], "key3")).toBeInTheDocument();

        // Retournons un élément dans la liste disponible et il devrait reprendre sa place
        let checkboxToClick3 = getByRole(incElems[3], 'checkbox');
        fireEvent.click(checkboxToClick3);
        await waitFor(() => expect(getByRole(incElems[3], 'checkbox').checked).toBe(true));

        const removeBtn = screen.getByText(sxDualTablesDefaultMsg.button.dualTableRemove);
        fireEvent.click(removeBtn);

        // Vérifions que les items sont de retour dans la première liste
        avlbTable = await sxTableTestHelpers.accessors.sxDualTables.getAvailableTable();
        await findByText(avlbTable, "anotherKey4");
        avlbElems = getAllByRole(avlbTable, "row");
        expect(getByText(avlbElems[1], "anotherKey3")).toBeInTheDocument();
        expect(getByText(avlbElems[2], "anotherKey4")).toBeInTheDocument();
        expect(getByText(avlbElems[3], "key1")).toBeInTheDocument();
        expect(avlbElems).toHaveLength(4);
    });
});