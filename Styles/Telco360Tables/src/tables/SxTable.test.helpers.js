import {
    screen,
    findByRole,
    findByText,
    fireEvent,
    getByRole,
    getByText,
    queryAllByRole,
    queryByLabelText,
    queryByRole,
    waitFor,
    getAllByRole,
    queryByDisplayValue,
    queryByText,
    getByDisplayValue,
    getByLabelText,
} from '@testing-library/react';

import { sxTableDefaultMsg } from './SxTable';
import sxTableColumnTypes from './SxTable.columnTypes';
import { utHelpers} from '@telco360/components';
import { MsgIds as MsgComp } from './utils/Language';
const SxSelectTestHelper = utHelpers.sxSelect;
const sxBooleanLabelTestHelper = utHelpers.sxBooleanLabel;
/// Fonctions utilitaires en lien avec les tests unitaires du composant 'SxTable'.
const accessors = {
    findTable: (name) => screen.findByLabelText(name),
    getTable: (name) => screen.getByLabelText(name),

    sortColumn: async (table, colText) => {
        const tbl = await treatTableArg(table);

        return queryByLabelText((typeof tbl === 'undefined' ?
            screen.getByText(colText) :
            getByText(tbl, colText)), sxTableDefaultMsg.ariaLabel.sortColumn);
    },

    getRows: async (table, inclHeaders = false) => {
        const tbl = await treatTableArg(table);

        return queryAllByRole(inclHeaders ?
            tbl :
            queryAllByRole(tbl, "rowgroup")[1], "row");
    },

    getCell: async (searchedVal, elem) => {
        const result = (typeof elem !== 'undefined') ?
            await findByText(elem, searchedVal) :
            await screen.findByText(searchedVal);
        return result.closest("td");
    },

    getCellByDataField: async (row, dataField) => await findByRole(row, 'cell', { name: dataField }),

    getRow: async (table, searchValue) => {
        const tbl = await treatTableArg(table);

        return typeof tbl !== "undefined" ?
            (queryByDisplayValue(tbl, searchValue) ?? queryByText(tbl, searchValue))?.closest("tr") :       //Nous allons chercher la row par DisplayValue si elle est en mode édition ou par le text si elle est en mode lecture.
            (screen.queryByDisplayValue(searchValue) ?? screen.queryByText(searchValue))?.closest("tr")
    },

    openRowEdit: async (table, searchValue) => {
        const cells = getAllByRole(await accessors.getRow(table, searchValue), "cell");
        fireEvent.click(cells[0]);
    },

    searchField: async (table) => {
        const tbl = await treatTableArg(table);

        //Ouvre le champ de recherche
        const searchIcon = (typeof tbl === 'undefined' ?
            screen.queryByRole("button", { name: "Rechercher" }) :
            queryByRole(tbl, "button", { name: "Rechercher" }));

        if (searchIcon === null) return searchIcon;

        fireEvent.click(searchIcon);

        const section = typeof tbl === 'undefined' ?
            screen.queryByLabelText("Section de Recherche") :
            queryByLabelText(tbl, "Section de Recherche");

        //Retourne le champ
        return queryByRole(section, "textbox");
    },

    getPagination: async (table) => {
        const tbl = await treatTableArg(table);

        return typeof tbl === 'undefined' ?
            screen.queryByLabelText("Pagination") :
            queryByLabelText(tbl, "Pagination"); //ToDo AG_2022-03-14 : Use Language
    },

    getPaginationBtn: async (table, page) => {
        const tbl = await treatTableArg(table);
        const section = await accessors.getPagination(tbl);
        return queryByRole(section, "button", { name: page });
    },

    getPaginationInput: async (table) => {
        const tbl = await treatTableArg(table);
        const section = await accessors.getPagination(tbl);
        return queryByRole(section, "spinbutton");
    },

    getPaginationNbElem: async (table) => {
        const tbl = await treatTableArg(table);
        const section = await accessors.getPagination(tbl);
        return queryByRole(section, 'combobox');
    },

    changeNbElemPerPage: async (table, value) => {
        const select = await accessors.getPaginationNbElem(table);
        fireEvent.change(select, { target: { value: getByRole(select, 'option', { name: value + " / page" }).value } });
        const option = getByRole(select, 'option', { name: value + " / page" }); //ToDo AG_2022-03-14 : use language
        await waitFor(() => expect(option.selected).toBeTruthy());
    },

    getColumnToggler: async (table) => {
        const tbl = await treatTableArg(table);

        return typeof tbl === 'undefined' ?
            screen.queryByRole("button", { name: "Colonnes" }) :    //ToDo AG_2022-03-14 : use Language
            queryByRole(tbl, "button", { name: "Colonnes" });
    },

    toggleColumn: async (table, columnText) => {
        const tbl = await treatTableArg(table);
        const toggler = await accessors.getColumnToggler(tbl);

        fireEvent.click(toggler);

        const menu = await findByRole(tbl, "menu");
        const checkBox = queryByLabelText(menu, columnText);
        fireEvent.click(checkBox);

        fireEvent.click(toggler); //On referme le menu
    },

    getActions: async (table) => {
        const tbl = await treatTableArg(table);

        return typeof tbl !== 'undefined' ?
            queryByLabelText(tbl, "Actions menu", { exact: false }) :
            screen.queryByLabelText("Actions menu", { exact: false });
    },

    getActionsBtn: async (table) => {
        const act = await accessors.getActions(table);

        if (act === null) return act;

        return queryByLabelText(act, "Actions button", { exact: false });
    },

    execAction: async (table, actText) => {
        const tbl = await treatTableArg(table);
        const actions = await accessors.getActions(tbl);
        const btn = await accessors.getActionsBtn(tbl);

        if (actions === null || btn === null) return null;

        fireEvent.click(btn);

        const actToRun = getByRole(actions, "menuitem", { name: actText });

        fireEvent.click(actToRun);
    },

    getAddBtn: async (table, btnText = "Ajouter") => {
        const tbl = await treatTableArg(table);

        return typeof tbl !== 'undefined' ?
            queryByRole(tbl, "button", { name: btnText }) :
            screen.queryByRole("button", { name: btnText });
    },

    clickAddBtn: async (table, btnText = "Ajouter", waitForValOptions = { timeout: 3000 }, tableRefreshDelay = 50) => {
        await new Promise(resolve => setTimeout(() => resolve(), tableRefreshDelay)); //Nous laissons un court délai pour laisser le temps à la table de mettre à jour son status.
        await accessors.waitForValidationsEnd(table, waitForValOptions); //Comme le bouton est désactivé lorsque des lignes sont en traitement, nous attendons la fin
        const addBtn = await accessors.getAddBtn(table, btnText);
        fireEvent.click(addBtn);
        await accessors.waitForValidationsEnd(table, waitForValOptions); //Nous redonnons le controle à l'appelant une fois el traitement de la sauvegarde complété.
        await new Promise(resolve => setTimeout(() => resolve(), tableRefreshDelay)); //Nous laissons un court délai pour laisser le temps à la table de mettre à jour son status.
    },

    getDelButtonByRow: (row) => accessors.getButtonByRow(row, "Supprimer"),

    getCloneButtonByRow: (row) => accessors.getButtonByRow(row, "Dupliquer"),

    getButtonByRow: (rowTable, btnName) => getByRole(rowTable, 'button', { name: btnName }),

    editTextCell: async (scope, originalValue, newValue, waitForValEnd = true, waitForValOptions = { timeout: 3000 }) => {
        const _scope = await treatTableArg(scope);

        let cellInput = typeof _scope !== 'undefined' ?
            queryByDisplayValue(_scope, originalValue) :
            screen.queryByDisplayValue(originalValue);

        if (cellInput == null) {    //Si la cellule n'a pas été trouvé en mode édition, nous la cherchons en mode lecture et la mettons en mode édition.
            const noEditCell = typeof _scope !== 'undefined' ? getByText(_scope, originalValue) : screen.getByText(originalValue);
            fireEvent.click(noEditCell);   //On provoque l'ouverture du editor.
            cellInput = typeof _scope !== 'undefined' ?
                getByDisplayValue(_scope, originalValue) :
                screen.getByDisplayValue(originalValue);
        }

        fireEvent.change(cellInput, { target: { value: newValue } });
        fireEvent.blur(cellInput);

        if (waitForValEnd) {
            await waitFor(() => expect(queryByRole(_scope, "loadingIndicator")).not.toBeInTheDocument(), waitForValOptions); //Nous attendons que la validation soit complété.
        }
    },

    editCustomCell: async (table, searchValue, columnName, newValue, findFunc, editFunc, rowNumber = 0, waitForValEnd = true, waitForValOptions = { timeout: 3000 }) => {
        const _scope = await treatTableArg(table);

        let row = searchValue !== null ? (await accessors.getRow(_scope, searchValue)) : getAllByRole(_scope, "row")[rowNumber];

        const noEditCell = await accessors.getCellByDataField(row, columnName);
        fireEvent.click(noEditCell);   //On provoque l'ouverture du editor.

        let cellInput = await findFunc(await accessors.getCellByDataField(row, columnName));
        await editFunc(cellInput, newValue); // Exécuter la fonction de mise à jour du champ
        fireEvent.blur(cellInput);

        if (waitForValEnd) {
            await waitFor(() => expect(queryByRole(_scope, "loadingIndicator")).not.toBeInTheDocument(), waitForValOptions); //Nous attendons que la validation soit complété.
        }
    },

    editTypeCell: async (table, searchValue, column, newValue, rowNumber = 1, waitForValEnd = true, waitForValOptions = { timeout: 3000 }) => {
        const _scope = await treatTableArg(table);
        let row = searchValue !== null ? (await accessors.getRow(_scope, searchValue)) : getAllByRole(_scope, "row")[rowNumber];
        const noEditCell = getAllByRole(row, 'cell', { name: column.dataField })[0];
        fireEvent.click(noEditCell);   //On provoque l'ouverture du editor.
        switch (column.type) {
            case sxTableColumnTypes.Checkbox:
                let checkboxCtrl = getByRole(await accessors.getCellByDataField(row, column.dataField), "checkbox");
                fireEvent.click(checkboxCtrl);
                fireEvent.blur(checkboxCtrl);
                break;
            case sxTableColumnTypes.Select:
                let selectCtrl = await SxSelectTestHelper.findSelect(undefined, await accessors.getCellByDataField(row, column.dataField));
                await SxSelectTestHelper.changeOption(selectCtrl, newValue);
                fireEvent.blur(selectCtrl);
                break;
            case sxTableColumnTypes.DateTime:
            case sxTableColumnTypes.Date:
                let dateCtrls = getAllByRole(row, 'cell', { name: column.dataField });
                let dateCtrl = getByRole(dateCtrls.find(x => getByRole(x, "textbox").getAttribute("aria-label") === `${column.dataField}-${column.type.name}`), "textbox");
                fireEvent.change(dateCtrl, { target: { value: newValue } });
                fireEvent.blur(dateCtrl);
                break;
            case sxTableColumnTypes.Time:
                const cell = getByLabelText(row, `${column.dataField}-${column.type.name}`);
                let timeSelectCtrls = await SxSelectTestHelper.findXSelects(2, cell);
                await SxSelectTestHelper.changeOption(timeSelectCtrls[0], newValue.hours);
                await SxSelectTestHelper.changeOption(timeSelectCtrls[1], newValue.mins);
                const option = getByRole(timeSelectCtrls[1], 'option', { name: newValue.mins });
                await waitFor(() => expect(option.selected).toBeTruthy());
                fireEvent.blur(timeSelectCtrls[1]);
                fireEvent.blur(cell);
                break;
            default:
                break;
        }
        if (waitForValEnd) {
            await accessors.waitForValidationsEnd(_scope, waitForValOptions); //Nous attendons que la validation soit complété.
        }
    },

    /// Cette fonction s'adresse uniquement aux colonnes qui ont un type.
    /// Le paramètre 'column' est un objet avec les propriétés 'dataField' et 'type'.
    cellValue: async (table, searchValue, column, rowNumber = 1) => {
        const _scope = await treatTableArg(table);
        let row = searchValue !== null ? (await accessors.getRow(_scope, searchValue)) : getAllByRole(_scope, "row")[rowNumber];
        switch (column.type) {
            case sxTableColumnTypes.Checkbox:
                let boolLabel = accessors.cellContent(await accessors.getCellByDataField(row, column.dataField)).querySelector('i');
                return sxBooleanLabelTestHelper.getValue(boolLabel);
            case sxTableColumnTypes.Select:
                return accessors.getCellByDataField(row, column.dataField);
            case sxTableColumnTypes.DateTime:
            case sxTableColumnTypes.Date:
            case sxTableColumnTypes.Time:
                return getByLabelText(row, `${column.dataField}-${column.type.name}`);
            case sxTableColumnTypes.Number:
                const cellNumberValue = Number((await accessors.getCellByDataField(row, column.dataField)).textContent);
                return cellNumberValue;
            case sxTableColumnTypes.Text:
                const cellTextValue = (await accessors.getCellByDataField(row, column.dataField)).textContent;
                return cellTextValue;
            case sxTableColumnTypes.Action:
                console.warn(`SxTable column type '${column.type.name}' does not have value.`);
                return undefined;
            default:
                console.warn(`Unknown SxTable column type '${column.type.name}' for column with dataField='${column.dataField}'.`);
                break;
        }
    },

    cellContent: (cell, nodeType = "div") => {
        return cell.querySelector('div').querySelector(nodeType);
    },

    getSaveBtn: async (table, btnText = "Sauvegarder") => {
        const tbl = await treatTableArg(table);
        return queryByLabelText(tbl, btnText);
    },

    clickSaveBtn: async (table, btnText = "Sauvegarder", waitForValOptions = { timeout: 5000 }, tableRefreshDelay = 50) => {
        await new Promise(resolve => setTimeout(() => resolve(), tableRefreshDelay)); //Nous laissons un court délai pour laisser le temps à la table de mettre à jour son status.
        await accessors.waitForValidationsEnd(table, waitForValOptions); //Comme le bouton est désactivé lorsque des lignes sont en traitement, nous attendons la fin
        const saveBtn = await accessors.getSaveBtn(table, btnText);
        fireEvent.click(saveBtn);
        await accessors.waitForValidationsEnd(table, waitForValOptions); //Nous redonnons le controle à l'appelant une fois el traitement de la sauvegarde complété.
        await new Promise(resolve => setTimeout(() => resolve(), tableRefreshDelay)); //Nous laissons un court délai pour laisser le temps à la table de mettre à jour son status.
    },

    waitForValidationsEnd: async (table, waitForValOptions = { timeout: 5000 }) => {
        //Permet d'attendre que toutes les validations d'une table soient terminées.
        const _scope = await treatTableArg(table);
        await waitFor(() => {
            const loadings = queryAllByRole(_scope, "loadingIndicator")
            expect(loadings.length).toBe(0);
        }, waitForValOptions);
    },

    sxDualTables: {
        getAvailableTable: async () => {
            return await screen.findByLabelText("SxDualTables Available Table");
        },
        getIncludedTable: async () => {
            return await screen.findByLabelText("SxDualTables Included Table");
        },
    },
    getHeader: async (name) => {
        return await screen.findByRole("columnheader", { name: name });
    },
};

const generators = {
    genData: (fieldNames, nbElem, valGenerator = (fieldName, lineNum) => `val-${fieldName}-line-${lineNum}`) => {
        const toRet = [];

        for (let i = 0; i < nbElem; i++) {
            toRet.push(fieldNames.map(fn => {
                return { field: fn, value: valGenerator(fn, i) };
            }).reduce((a, v) => ({ ...a, [v.field]: v.value }), {}));
        }
        return toRet;
    }
};

const treatTableArg = async (table) =>
    typeof table === 'function' ?
        await table() :
        typeof table === 'string' ?
            accessors.findTable(table) :
            table;

const sxTableTestHelpers = {
    accessors,
    generators,
};


export { accessors };
export { generators };
export default sxTableTestHelpers;