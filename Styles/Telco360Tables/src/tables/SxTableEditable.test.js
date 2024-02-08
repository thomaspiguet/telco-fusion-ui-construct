import React, { useState, useEffect, useCallback } from 'react';
import { screen, fireEvent, waitFor, getByDisplayValue, findByText, act, queryByDisplayValue, getAllByRole } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { SxTable, sxTableColumnTypes  } from '../index';

import { accessors } from './SxTable.test.helpers';

import { Input } from 'reactstrap';
import { helpers, routerHelper as renderRouter, withSxDeletable } from '@telco360/components';

const msg = {
    tooltip: {
        add: 'Ajouter',
    }
};
const wait = (period = 50) => {
    return new Promise(resolve => setTimeout(resolve, period));
};

const onCancel = () => { };

const SomeValComplexComp = ({ value, valDelegator, validation, onUpdate }) => {
    const [_value, setValue] = useState(value);
    const [ctr, setCtr] = useState(0);

    const internalVal = useCallback(() => {
        return validation?.();
    }, [validation])

    useEffect(() => {
        valDelegator?.(internalVal);
    }, [internalVal, valDelegator]);

    return <Input type="text" value={_value} onChange={(e) => { setValue(e.target.value); setCtr(ctr + 1) }} onBlur={(e) => {
        onUpdate(_value);
    }} />;
};

const DeletableTable = withSxDeletable(SxTable);

const FakeFormTableEditable = (props) => {
    const [data, setData] = useState([
        { id: 1, col1: "Ccol1L1", col2: "col2L1", col3: "col3L1" },
        { id: 2, col1: "Acol1L2", col2: "col2L2", col3: "col3L2" },
        { id: 3, col1: "Bcol1L3", col2: "col2L3", col3: "col3L3" },
    ]);

    const columns = [{
        dataField: "id",
        text: "id",
        hidden: true,
        editable: false,
    },
    {
        dataField: "col1",
        text: "Colonne 1",
        sort: true,
        isLinkKey: true,
        editable: true,
    },
    {
        dataField: "col2",
        text: "Colonne 2",
        sort: true,
        editable: true,
    },
    {
        dataField: "col3",
        text: "Colonne 3",
        sort: true,
        editable: true,
        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
            <div>Editeur custom</div>
            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
        </>,
    }];

    const onDataChange = (_oldValue, _newValue, row, _column, modifiedData) => {
        setData(modifiedData.filter(x => x.id !== row.id).concat(modifiedData.filter(x => x.id === row.id)));
    };

    const handleUpdateGridData = (tdata) => {
        setData(tdata);
    };

    const onAddLine = (newLine) => {
        const lineToAdd = newLine  ? {...newLine, id: 999, key:"temp"} : { id: data.length + 1, col1: "DcolL" + (data.length + 1), col2: "col2L" + (data.length + 1), col3: "col3L" + (data.length + 1), isDirty: true, isNewLine: true };
        setData([lineToAdd, ...data]);
    };

    if (!data) return <></>

    if (!props.deleteTest) {
        return <SxTable
            title="Table1"
            data={data}
            columns={columns}
            editable
            onDataChange={onDataChange}
            canAddLine={true}
            onAddLine={onAddLine}
            onSave={() => true}
            onValidateCanAdd={() => true}

            {...props}
        />
    }
    else {
        return <DeletableTable
            title="Table1"
            data={data}
            columns={columns}
            editable
            onDataChange={onDataChange}
            canAddLine={true}
            onAddLine={onAddLine}
            onSave={() => true}

            canRemoveLine={true}
            onDataSetChange={(modifiedData) => {
                handleUpdateGridData(modifiedData);
            }}
            onRemoveLine={() => { return true }}
            onValidateCanAdd={() => true}

            {...props}
        />
    }
};
const columnsTypes = [
    {
        dataField: "id",
        text: "id",
        hidden: true,
        editable: false,
    },
    {
        dataField: "colText",
        text: "Colonne 1",
        sort: true,
        type: sxTableColumnTypes.Text,
        isLinkKey: true,
    },
    {
        dataField: "colCheckbox",
        text: "colCheckbox",
        type: sxTableColumnTypes.Checkbox,
        sort: true,
    },
    {
        dataField: "colSelect",
        text: "colSelect",
        sort: true,
        type: sxTableColumnTypes.Select,
        options: [{ value: 1, label: "Label 1" }, { value: 2, label: "Label 2" }, { value: 3, label: "Label 3" }],
    },
    {
        dataField: "colDate",
        text: "colDate",
        sort: true,
        type: sxTableColumnTypes.Date,
    },
    {
        dataField: "colDate",
        text: "colDateTime",
        sort: true,
        type: sxTableColumnTypes.DateTime,
    },
    {
        dataField: "colTime",
        text: "colTime",
        sort: true,
        type: sxTableColumnTypes.Time,
    },
];

const FakeComponent = (props) => {
    const [dataType, setDataType] = useState([{ id: 1, colText: "Text ligne 1", colCheckbox: true, colSelect: 1, colDate: "2002-12-13T20:25:36.576Z", colTime: "2002-12-13T20:25:00.576Z" }])

    const onDataChange = (_oldValue, newValue, _row, column, _modifiedData) => {
        setDataType(dataType.map(x => { return { ...x, [column.dataField]: newValue } }));
    };


    if (!dataType) return <></>
    return <SxTable
        title="Table2"
        data={dataType}
        columns={columnsTypes}
        editable
        onDataChange={onDataChange}
        {...props}
    />
};

const getHistory = (routes) => {
    return {
        initialRoute: "/FakeFormTableEditable",
        routes: routes,
    }
};


afterEach(() => {
    jest.clearAllMocks();
});

describe("SxTableEditable", () => {
    it("Save is disabled when no dirty row", async () => {
        var history = getHistory([{
            path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                canSave
                onCancel={onCancel}
                columns={[{
                    dataField: "id",
                    text: "id",
                    hidden: true,
                    editable: false,
                },
                {
                    dataField: "col1",
                    text: "Colonne 1",
                    editable: true,
                    validator: () => true
                },
                {
                    dataField: "col2",
                    text: "Colonne 2",
                    editable: true,
                },
                {
                    dataField: "col3",
                    text: "Colonne 3",
                    editable: true,
                    editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                        <div>Editeur custom</div>
                        <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                    </>,
                }]}
            />
        }]);

        renderRouter.renderWithRouterAndPath(history);
        const table = await accessors.findTable('Table1');
        const saveBtn = await accessors.getSaveBtn(table);
        expect(saveBtn).toBeInTheDocument();
        expect(saveBtn).toBeDisabled();
    });

    it("Edit existing", async () => {
        var history = getHistory([{ path: "/FakeFormTableEditable", component: FakeFormTableEditable }]);

        renderRouter.renderWithRouterAndPath(history);
        await screen.findByText("Ccol1L1");
        await accessors.editTextCell("Table1", "Ccol1L1", "newVal");
        await waitFor(() => expect(screen.getByText("newVal")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
    });

    it("Add new row", async () => {
        var history = getHistory([{ path: "/FakeFormTableEditable", component: FakeFormTableEditable }]);

        renderRouter.renderWithRouterAndPath(history);
        await waitFor(() => expect(screen.getByText("Ccol1L1")).toBeInTheDocument());
        const btnAdd = await screen.findByRole("button", { name: msg.tooltip.add });
        await act(async () => {
            fireEvent.click(btnAdd);
            await wait(200);
        });
        await waitFor(() => expect(screen.getByText("DcolL4")).toBeInTheDocument());
    });

    it("Clone row", async() => {
        const history = getHistory([{ path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props} clonableLines={true} />}]);

        renderRouter.renderWithRouterAndPath(history);
        await waitFor(() => expect(screen.getByText("Ccol1L1")).toBeInTheDocument());
        const row = await accessors.getRow("Table1", "col3L3");
        const btnClone = accessors.getCloneButtonByRow(row);
        fireEvent.click(btnClone);
        const editCell = queryByDisplayValue(row, "col3L3");
        fireEvent.blur(editCell);
        await waitFor(async() => expect(await screen.findAllByText("col3L3")).toHaveLength(2));
    });

    it("Begin/end edit mode of a row", async () => {
        var history = getHistory([{ path: "/FakeFormTableEditable", component: FakeFormTableEditable }]);

        renderRouter.renderWithRouterAndPath(history);
        const table = await accessors.findTable('Table1');

        const cell = await accessors.getCell("Ccol1L1", table);
        fireEvent.click(cell);
        await waitFor(() => expect(screen.getByDisplayValue("Ccol1L1")).toBeInTheDocument()); //Nous attendons que la valeur soit maintenant affiché dans un champ Input
        expect(screen.getByDisplayValue("col2L1")).toBeInTheDocument() //Nous validons que la ligne au complet est en édition
        expect(screen.getByText("Acol1L2")).toBeInTheDocument() //Nous validons que la seconde ligne n'est pas en édition

        //Nous retirons le focus du champs d'input pour quitter le mode édition
        const cellInput = getByDisplayValue(table, "Ccol1L1");
        await act(async () => {
            fireEvent.blur(cellInput);
        });
        await waitFor(() => expect(screen.getByText("Ccol1L1")).toBeInTheDocument()); //Nous validons que le mode edit est fermé lorsque le focus est perdu
        expect(screen.getByText("col2L1")).toBeInTheDocument() //Nous validons que la ligne au complet n'est plus en mode édition
    });

    it("Custom editor renderer works", async () => {
        var history = getHistory([{ path: "/FakeFormTableEditable", component: FakeFormTableEditable }]);

        renderRouter.renderWithRouterAndPath(history);
        const table = await accessors.findTable('Table1');

        const cell = await accessors.getCell("Ccol1L1", table);
        fireEvent.click(cell);
        await waitFor(() => expect(screen.getByDisplayValue("Ccol1L1")).toBeInTheDocument()); //Nous attendons que la valeur soit maintenant affiché dans un champ Input
        expect(screen.getByText("Editeur custom")).toBeInTheDocument(); //Nous validons que c'est bien le custom render qui est affiché.

        //Nous effectuons une modificationau champ custom
        const customInput = screen.getByLabelText("custom01");
        fireEvent.change(customInput, { target: { value: "newValue" } });
        await act(async () => {
            fireEvent.blur(customInput);
        });

        await waitFor(() => expect(screen.queryByText("Editeur custom")).not.toBeInTheDocument()); //L'editor renderer est bien fermé
        expect(screen.getByText("newValue")).toBeInTheDocument(); //La nouvelle valeur a bien été transféré
    });

    it("props.columns.action is executed", async () => {
        const history = getHistory([{
            path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable
                {...props}
                canSave
                onCancel={onCancel}
                columns={[{
                    dataField: "id",
                    text: "id",
                    hidden: true,
                    editable: false,
                },
                {
                    dataField: "col1",
                    text: "Colonne 1",
                    editable: true,
                },
                {
                    dataField: "col2",
                    text: "Colonne 2",
                    editable: true,
                    action: (newValue, _formValues, _externalData) => {
                        return { actions: { col1: newValue } };
                    },
                }
                ]}
            />
        }]);

        renderRouter.renderWithRouterAndPath(history);
        await accessors.findTable("Table1");
        await accessors.editTextCell("Table1", "col2L1", "newVal");
        await waitFor(() => expect(screen.getAllByText("newVal").length).toBe(2));
    });

    it("props.onSave is called", async () => {
        const handleOnSaveToBeCalled = jest.fn().mockResolvedValue(true);

        const history = getHistory([{
            path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                canSave
                onCancel={onCancel}
                onSave={handleOnSaveToBeCalled}
                columns={[{
                    dataField: "id",
                    text: "id",
                    hidden: true,
                    editable: false,
                },
                {
                    dataField: "col1",
                    text: "Colonne 1",
                    editable: true,
                },
                {
                    dataField: "col2",
                    text: "Colonne 2",
                    editable: true,
                },
                {
                    dataField: "col3",
                    text: "Colonne 3",
                    editable: true,
                    editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                        <div>Editeur custom</div>
                        <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                    </>,
                }]}
            />
        }]);

        renderRouter.renderWithRouterAndPath(history);
        const table = await accessors.findTable("Table1");

        const addBtn = await accessors.getAddBtn(table);
        fireEvent.click(addBtn);
        await accessors.getRow(table, "col3L4"); //Nous attendons que la ligne soit ajouté

        await accessors.clickSaveBtn(table);

        await waitFor(() => expect(handleOnSaveToBeCalled).toHaveBeenCalledTimes(1));
    });

    describe("Validations", () => {
        it("Sync validation runs properly on success", async () => {
            const fakeVal = jest.fn(() => true);

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                        validator: fakeVal
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");
            await accessors.editTextCell("Table1", "Ccol1L1", "newVal");
            await waitFor(() => expect(screen.getByText("newVal")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(1));
            await waitFor(async () => expect(await accessors.getSaveBtn(table)).toBeEnabled());
        });

        it("Sync validation runs properly on failure", async () => {
            const fakeVal = jest.fn(() => ({ valid: false, message: "Message d'erreur" }));

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                        validator: fakeVal
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");
            const cell = await accessors.getCell("Ccol1L1", table);
            fireEvent.click(cell);

            const ctlInput = getByDisplayValue(table, "Ccol1L1");
            fireEvent.change(ctlInput, { target: { value: "newVal" } });
            await act(async () => {
                fireEvent.blur(ctlInput);
                await wait(500);
            });
            await waitFor(() => expect(screen.getByText("newVal")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(1));
            expect(screen.getByText("Message d'erreur")).toBeInTheDocument();
            expect(await accessors.getSaveBtn(table)).not.toBeEnabled();
        });

        it("Async validation runs properly on success", async () => {
            const fakeVal = jest.fn().mockResolvedValue(true);

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                        validator: fakeVal
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");
            await accessors.editTextCell("Table1", "Ccol1L1", "newVal");
            await waitFor(() => expect(screen.getByText("newVal")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(1));
            await waitFor(async () => expect(await accessors.getSaveBtn(table)).toBeEnabled());
        });

        it("Async validation runs properly on failure", async () => {
            const fakeVal = jest.fn().mockResolvedValue({ valid: false, message: "Message d'erreur" });

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                        validator: fakeVal
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");
            await accessors.editTextCell("Table1", "Ccol1L1", "newVal");
            await waitFor(() => expect(screen.getByText("newVal")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(1));
            expect(screen.getByText("Message d'erreur")).toBeInTheDocument();
            expect(await accessors.getSaveBtn(table)).not.toBeEnabled();
        });

        it("Sync validation runs properly on success with custom editor", async () => {
            const fakeVal = jest.fn(() => true);

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                        validator: fakeVal
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");

            const cell = await accessors.getCell("Ccol1L1", table);
            fireEvent.click(cell);

            //Nous effectuons une modificationau champ custom
            const customInput = screen.getByLabelText("custom01");
            fireEvent.change(customInput, { target: { value: "newVal" } });
            fireEvent.blur(customInput);

            await waitFor(() => expect(screen.getByText("newVal")).toBeInTheDocument(), { timeout: 2000 }); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(1), { timeout: 2000 });
            await waitFor(async () => expect(await accessors.getSaveBtn(table)).toBeEnabled());
        });

        it("Sync validation runs properly on failure with custom editor", async () => {
            const fakeVal = jest.fn(() => ({ valid: false, message: "Non valide" }));

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                        validator: fakeVal
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");

            const cell = await accessors.getCell("Ccol1L1", table);
            fireEvent.click(cell);

            //Nous effectuons une modificationau champ custom
            const customInput = screen.getByLabelText("custom01");
            fireEvent.change(customInput, { target: { value: "newVal" } });
            await act(async () => {
                fireEvent.blur(customInput);
                await wait(100);
            });

            await waitFor(() => expect(screen.getByText("newVal")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(1));
            expect(await accessors.getSaveBtn(table)).not.toBeEnabled();
        });

        it("Async validation runs properly on success with custom editor", async () => {
            const fakeVal = jest.fn().mockResolvedValue(true);

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                        validator: fakeVal
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");

            const cell = await accessors.getCell("Ccol1L1", table);
            fireEvent.click(cell);

            //Nous effectuons une modificationau champ custom
            const customInput = screen.getByLabelText("custom01");
            fireEvent.change(customInput, { target: { value: "newVal" } });
            fireEvent.blur(customInput);

            await waitFor(() => expect(screen.getByText("newVal")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(1));
            await waitFor(async () => expect(await accessors.getSaveBtn(table)).toBeEnabled());
        });

        it("Async validation runs properly on failure with custom editor", async () => {
            const fakeVal = jest.fn().mockResolvedValue({ valid: false, message: "Message d'erreur" });

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                        validator: fakeVal
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");

            const cell = await accessors.getCell("Ccol1L1", table);
            fireEvent.click(cell);

            //Nous effectuons une modificationau champ custom
            const customInput = screen.getByLabelText("custom01");
            fireEvent.change(customInput, { target: { value: "newVal" } });
            fireEvent.blur(customInput);

            await waitFor(() => expect(screen.getByText("newVal")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(1));
            expect(await screen.findByText("Message d'erreur")).toBeInTheDocument();
            expect(await accessors.getSaveBtn(table)).not.toBeEnabled();
        });

        it("onValErrorStart/End are called", async () => {
            const fakeVal = jest.fn()
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true);
            const onValErrStart = jest.fn();
            const onValErrEnd = jest.fn();

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable
                    {...props}
                    canSave
                    onCancel={onCancel}
                    onValErrorStart={onValErrStart}
                    onValErrorEnd={onValErrEnd}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                        validator: fakeVal
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");
            await accessors.editTextCell("Table1", "Ccol1L1", "newVal");
            await waitFor(() => expect(screen.getByText("newVal")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(1));
            expect(await accessors.getSaveBtn(table)).not.toBeEnabled();
            await waitFor(() => expect(onValErrStart).toHaveBeenCalledTimes(1));

            await accessors.editTextCell("Table1", "newVal", "newVal2");
            await waitFor(() => expect(screen.getByText("newVal2")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(2));
            await waitFor(async () => expect(await accessors.getSaveBtn(table)).toBeEnabled());
            expect(onValErrEnd).toHaveBeenCalledTimes(1);
        });

        it("Dirty rows are validated on save", async () => {
            const fakeVal = jest.fn().mockResolvedValue({ valid: false, message: "Message d'erreur" });

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    data={
                        [
                            { id: 1, col1: "Ccol1L1", col2: "col2L1", col3: "col3L1" },
                            { id: 2, col1: "Acol1L2", col2: "col2L2", col3: "col3L2" },
                            { id: 3, col1: "Bcol1L3", col2: "col2L3", col3: "col3L3" },
                            { id: 4, col1: "Ccol1L4", col2: "col2L4", col3: "col3L4", isDirty: true }
                        ]}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                        validator: fakeVal
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");

            await act(async () => {
                await accessors.clickSaveBtn(table);
            });

            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(1)); //La validation devrai avoir été appelé 1 fois pour la nouvelle ligne ajouté.
            expect((await screen.findAllByText("Message d'erreur")).length).toBe(1);
            expect(await accessors.getSaveBtn(table)).not.toBeEnabled();
        });

        it("Validations of new rows run on save", async () => {
            const fakeVal = jest.fn().mockResolvedValue({ valid: false, message: "Message d'erreur" });

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                        validator: fakeVal
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");

            const addBtn = await accessors.getAddBtn(table);
            fireEvent.click(addBtn);
            await accessors.getRow(table, "col3L4"); //Nous attendons que la ligne soit ajouté
            fireEvent.click(addBtn);
            await accessors.getRow(table, "col3L5"); //Nous attendons que la ligne soit ajouté

            await act(async () => {
                await accessors.clickSaveBtn(table);
            });

            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(2)); //La validation devrai avoir été appelé 1 fois pour la nouvelle ligne ajouté.
            await waitFor(() => expect(screen.getAllByText("Message d'erreur").length).toBe(2));
            expect(await accessors.getSaveBtn(table)).not.toBeEnabled();
        });

        it("Internal validations are run on save", async () => {
            const fakeVal = jest.fn().mockResolvedValue({ valid: false, message: "Message d'erreur" });
            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        sort: true,
                        isLinkKey: true,
                        editable: true,
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        sort: true,
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne WTF",
                        sort: true,
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <SomeValComplexComp aria-label="custom01"
                                type="text"
                                value={value}
                                onUpdate={(val) => editorProps.onUpdate(val)}
                                valDelegator={editorProps.valDelegator}
                                validation={fakeVal}
                            />
                        </>,
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");

            const addBtn = await accessors.getAddBtn(table);
            fireEvent.click(addBtn);
            await accessors.getRow(table, "col3L4"); //Nous attendons que la ligne soit ajouté
            fireEvent.click(addBtn);
            await accessors.getRow(table, "col3L5"); //Nous attendons que la ligne soit ajouté

            await act(async () => {
                await accessors.clickSaveBtn(table);
            });

            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(2)); //La validation devrai avoir été appelé 1 fois pour la nouvelle ligne ajouté.
            await waitFor(() => expect(screen.getAllByText("Message d'erreur").length).toBe(2));
            expect(await accessors.getSaveBtn(table)).not.toBeEnabled();
        });

        it("Errors are cleared on row deletion", async () => {
            const fakeVal = jest.fn().mockResolvedValue({ valid: false, message: "Message d'erreur" });
            let history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    deleteTest={true}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        sort: true,
                        isLinkKey: true,
                        editable: true,
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        sort: true,
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne WTF",
                        sort: true,
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <SomeValComplexComp aria-label="custom01"
                                type="text"
                                value={value}
                                onUpdate={(val) => editorProps.onUpdate(val)}
                                valDelegator={editorProps.valDelegator}
                                validation={fakeVal}
                            />
                        </>,
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");

            const addBtn = await accessors.getAddBtn(table);
            fireEvent.click(addBtn);
            await accessors.getRow(table, "col3L4"); //Nous attendons que la ligne soit ajouté

            await act(async () => {
                await accessors.clickSaveBtn(table);
            });

            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(1), { timeout: 10000 }); //La validation devrai avoir été appelé 1 fois pour la nouvelle ligne ajouté.
            await waitFor(() => expect(screen.getAllByText("Message d'erreur").length).toBe(1));
            expect(await accessors.getSaveBtn(table)).not.toBeEnabled();

            const delBtn = accessors.getDelButtonByRow(await accessors.getRow(table, "col3L4"));
            fireEvent.click(delBtn);
            const buttonAccept = await screen.findByText("Oui", { timeout: 20000 });
            fireEvent.click(buttonAccept);
            await accessors.editTextCell(table, "col2L1", "newVal"); //Bien que l'erreur soit retiré, pour que le bouton de sauvegarde soit disponible il faut au moins un élément dirty puisqu'aucune ligne n'est dirty
            await waitFor(async () => expect(await accessors.getSaveBtn(table)).toBeEnabled(), { timeout: 2000 }); //Si le bouton de sauvegarde est actif, cela signifie que les erreurs ont été retirées.
        });

        it("validateAllOnSave works", async () => {
            const fakeVal = jest.fn().mockResolvedValue({ valid: false, message: "Message d'erreur" });

            const history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    validateAllOnSave
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                        validator: fakeVal
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");

            const addBtn = await accessors.getAddBtn(table);
            fireEvent.click(addBtn);
            await accessors.getRow(table, "col3L4"); //Nous attendons que la ligne soit ajouté

            await act(async () => {
                await accessors.clickSaveBtn(table);
            });

            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(4), { timeout: 10000 }); //La validation devrai avoir été appelé 3 fois pour le data déjà en place et 1 fois pour la nouvelle ligne ajouté.
            await waitFor(() => expect(screen.getAllByText("Message d'erreur").length).toBe(4), { timeout: 10000 });
            expect(await accessors.getSaveBtn(table)).not.toBeEnabled();
        });

        it("noValidationOnSave works", async () => {
            const fakeVal = jest.fn().mockResolvedValue({ valid: false, message: "Message d'erreur" });

            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    noValidationOnSave
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                    },
                    {
                        dataField: "col2",
                        text: "Colonne 2",
                        editable: true,
                    },
                    {
                        dataField: "col3",
                        text: "Colonne 3",
                        editable: true,
                        editorRenderer: (editorProps, value, _row, _column, _rowIndex, _columnIndex) => <>
                            <div>Editeur custom</div>
                            <Input aria-label="custom01" type="text" defaultValue={value} onBlur={(e) => { editorProps.onUpdate(e.target.value) }} />
                        </>,
                        validator: fakeVal
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            const table = await accessors.findTable("Table1");

            const addBtn = await accessors.getAddBtn(table);
            fireEvent.click(addBtn);
            await accessors.getRow(table, "col3L4"); //Nous attendons que la ligne soit ajouté

            await accessors.clickSaveBtn(table);

            await waitFor(() => expect(fakeVal).toHaveBeenCalledTimes(0));
            expect(await accessors.getSaveBtn(table)).toBeEnabled();
        });

        describe("Validation queue handling", () => {
            const timeout = (ms) => {
                return new Promise(resolve => setTimeout(resolve, ms));
            };

            it("Validation is called adequately with otherFields", async () => {
                // Ici nous avons une validation qui dépend de la valeur de deux autres colonnes.  Donc, on veut revalider sur le changement des autres colonnes en utilisant otherFields.
                const validatorFn = jest.fn().mockImplementation(async (newValue, row, _column, _data, _extraData) => {
                    await timeout(30);

                    return newValue === "col2L1" && row.col1 === "New" ?
                        { valid: false, message: "Can't have 'col2L1' when col1 is 'New'." } :
                        true;
                });

                const validatorFn2 = jest.fn().mockImplementation(async (newValue, row, _column, _data, _extraData) => {
                    await timeout(10);

                    return newValue === "col3L1" && row.col1 === "New" ?
                        { valid: false, message: "Can't have 'col3L1' when col1 is 'New'." } :
                        true;
                });

                var history = getHistory([{
                    path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                        canSave
                        columns={[{
                            dataField: "id",
                            text: "id",
                            hidden: true,
                            editable: false,
                        },
                        {
                            dataField: "col1",
                            text: "Colonne 1",
                            validator: () => ({ valid: true, otherFields: ["col2", "col3"] }),
                        },
                        {
                            dataField: "col2",
                            text: "Colonne 2",
                            validator: validatorFn,
                        },
                        {
                            dataField: "col3",
                            text: "Colonne 3",
                            validator: validatorFn2,
                        }]}
                    />
                }]);

                renderRouter.renderWithRouterAndPath(history);

                await accessors.findTable("Table1");

                await accessors.editTextCell("Table1", "Ccol1L1", "New");
                await waitFor(() => expect(screen.getByText("New")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
                await waitFor(() => expect(screen.queryByRole("loadingIndicator")).not.toBeInTheDocument(), { timeout: 10000 });
                expect(validatorFn).toHaveBeenCalledTimes(1);
                expect(validatorFn2).toHaveBeenCalledTimes(1); // Nous validons que la "col3" a été revalidée aussi.
                expect(screen.getByText("Can't have 'col2L1' when col1 is 'New'.")).toBeInTheDocument();
                expect(screen.getByText("Can't have 'col3L1' when col1 is 'New'.")).toBeInTheDocument();
                await accessors.editTextCell("Table1", "New", "Ccol1LNew");
                await waitFor(() => expect(screen.getByText("Ccol1LNew")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
                await waitFor(() => expect(screen.queryByRole("loadingIndicator")).not.toBeInTheDocument(), { timeout: 10000 });
                expect(validatorFn).toHaveBeenCalledTimes(2);
                expect(validatorFn2).toHaveBeenCalledTimes(2); // Nous validons que la "col3" a été revalidée aussi.
                expect(screen.queryByText("Can't have 'col2L1' when col1 is 'New'.")).not.toBeInTheDocument();
                expect(screen.queryByText("Can't have 'col3L1' when col1 is 'New'.")).not.toBeInTheDocument();
            });

            it("Validation queue is handled adequately - concurrence", async () => {
                // Ici on va appeler des changements sans attendre que la validation soit effectuée, on veut s'assurer que l'état final soit adéquat et que l'état de concurrence new gâche rien.
                const validatorFn = jest.fn().mockImplementation(async (newValue, row, _column, _data, _extraData) => {
                    await timeout(50);

                    return newValue.length > row.col3.length ?
                        { valid: false, message: "Must not be longer than col3.", otherFields: ["col3"] } :
                        { valid: true, otherFields: ["col3"] };
                });

                const validatorFn2 = jest.fn().mockImplementation(async (newValue, row, _column, _data, _extraData) => {
                    await timeout(10);

                    return newValue === "new" && row.col2 === "New" ?
                        { valid: false, message: "Can't have 'new' when col2 is 'New'.", otherFields: ["col2"] } :
                        { valid: true, otherFields: ["col2"] };
                });

                var history = getHistory([{
                    path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                        canSave
                        columns={[{
                            dataField: "id",
                            text: "id",
                            hidden: true,
                            editable: false,
                        },
                        {
                            dataField: "col1",
                            text: "Colonne 1",
                            validator: () => ({ valid: true, otherFields: ["col2", "col3"] }),
                        },
                        {
                            dataField: "col2",
                            text: "Colonne 2",
                            validator: validatorFn,
                        },
                        {
                            dataField: "col3",
                            text: "Colonne 3",
                            validator: validatorFn2,
                        }]}
                    />
                }]);

                renderRouter.renderWithRouterAndPath(history);

                await accessors.findTable("Table1");
                await accessors.editTextCell("Table1", "col2L1", "Newer", false); // On change col2, la validation est démarrée rapidement
                await accessors.editTextCell("Table1", "col3L1", "BrandNew", false); // On change col3, la validation est en attente
                await accessors.editTextCell("Table1", "Newer", "New", false); // On rechange col2, la validation est placée dans la file d'attente.  La validation précédente est déjà en cours d'exécution.
                await accessors.editTextCell("Table1", "BrandNew", "new", false); // On rechange col3, la validation placée en attente est retirée et celle-ci ajoutée
                await waitFor(() => expect(screen.queryByRole("loadingIndicator")).not.toBeInTheDocument());
                // Nous attendons que les deux fonctions de validation aient été appelées le bon nombre de fois.
                // - col2  - pour deux modifications et un appel d'otherFields de col3.
                // - col3  - pour une modification plus deux appels via otherFields pour les changements dans col2.
                await waitFor(() => expect(validatorFn).toHaveBeenCalledTimes(3));
                await waitFor(() => expect(validatorFn2).toHaveBeenCalledTimes(3));
                await waitFor(() => expect(screen.queryByRole("loadingIndicator")).not.toBeInTheDocument());
                await waitFor(() => expect(screen.getByText("new")).toBeInTheDocument()); //Nous attendons que la nouvelle valeur soit inclus dans le DOM.
                // On s'assure que le dernier appel soit pour "new".
                expect(validatorFn2).toHaveBeenCalledWith("new", expect.anything(), expect.anything(), expect.anything(), undefined);
                expect(screen.queryByText("Must not be longer than col3.")).not.toBeInTheDocument();
                expect(screen.getByText("Can't have 'new' when col2 is 'New'.")).toBeInTheDocument();
                // On s'assure qu'on a toujours le bon compte d'appels.
                expect(validatorFn).toHaveBeenCalledTimes(3);
                expect(validatorFn2).toHaveBeenCalledTimes(3);
            });
        });
    });

    describe("Section avec les types de colonne", () => {

        const getHistory1 = (routes) => {
            return {
                initialRoute: "/FakeComponent",
                routes: routes,
            }
        };

        it("Editer avec colonnes type", async () => {
            let history = getHistory1([{ path: "/FakeComponent", component: FakeComponent }]);
            let column = {};
            renderRouter.renderWithRouterAndPath(history);
            expect(await screen.findAllByText("Text ligne 1")).toHaveLength(1);
            expect(await screen.findAllByText("Label 1")).toHaveLength(1);

            await accessors.editTextCell("Table2", "Text ligne 1", "newVal");
            await waitFor(() => expect(screen.getAllByText("newVal").length).toBe(1), { timeout: 10000 });
            await screen.findByText("newVal");

            // Édition du type checkbox
            column = columnsTypes.find(x => x.dataField === "colCheckbox");
            expect(await accessors.cellValue("Table2", "newVal", column)).toBeTruthy();
            await accessors.editTypeCell("Table2", "newVal", column);
            expect(await accessors.cellValue("Table2", "newVal", column)).toBeFalsy();

            // Édition d'un type Select
            column = columnsTypes.find(x => x.dataField === "colSelect");
            await accessors.editTypeCell("Table2", "newVal", column, "Label 2");
            expect(await findByText(await accessors.cellValue("Table2", "newVal", column), "Label 2")).toBeTruthy();

            // Édition d'un type Date
            column = columnsTypes.find(x => x.dataField === "colDate" && x.type === sxTableColumnTypes.Date);
            await accessors.editTypeCell("Table2", "newVal", column, "2002-12-14");
            expect(await findByText(await accessors.cellValue("Table2", "newVal", column), "2002-12-14")).toBeTruthy();

            // Édition d'un type Time
            column = columnsTypes.find(x => x.dataField === "colTime" && x.type === sxTableColumnTypes.Time);
            await accessors.editTypeCell("Table2", "newVal", column, { hours: "15", mins: "25" });
            let dateString = helpers.Date.formatterFromUtc(new Date(2002, 11, 20, 15, 25, 0).toISOString(), helpers.Date.format.timeDefault);
            expect(await findByText(await accessors.cellValue("Table2", "newVal", column), dateString)).toBeTruthy();
        });
    });

    describe("Calculated properties", () => {
        it("- supports functions through getter", async () => {
            const cellClassesFn = jest.fn().mockImplementation((data, _rowData, extraData) => {
                return `${(data || []).map(x => x.cellClasses || "").join(" ")} ${extraData?.fieldZ}`;
            });
            const centerCellVerticalFn = jest.fn().mockImplementation((data, _rowData, _extraData) => {
                return (data || []).some(x => x.text === "false");
            });
            const editableFn = jest.fn().mockImplementation((data, _rowData, _extraData) => {
                return !(data || []).some(x => x.text === "false");
            });
            const editOnlyFn = jest.fn().mockImplementation((data, _rowData, _extraData) => {
                return !(data || []).some(x => x.text === "false");
            });
            const isCenteredFn = jest.fn().mockImplementation((data, _rowData, _extraData) => {
                return (data || []).some(x => x.text === "false");
            });
            const isDummyFieldFn = jest.fn().mockImplementation((data, _rowData, _extraData) => {
                return (data || []).some(x => x.text === "false");
            });
            const isOnlyTextFn = jest.fn().mockImplementation((data, _rowData, _extraData) => {
                return (data || []).some(x => x.text === "false");
            });
            const textFn = jest.fn().mockImplementation((data, _rowData, _extraData) => {
                return ((data || []).filter(x => x.text.length > 6)[0]?.text || "") + "-textAdded";
            });
            const truncateCellFn = jest.fn().mockImplementation((data, _rowData, _extraData) => {
                return (data || []).some(x => x.text === "false");
            });
            const truncateHeadFn = jest.fn().mockImplementation((data, _rowData, _extraData) => {
                return (data || []).some(x => x.text === "false");
            });
            const columns = [
                { type: sxTableColumnTypes.Text, editable: false, dataField: "cellClasses", text: "cellClasses", cellClasses: cellClassesFn },
                { type: sxTableColumnTypes.Text, editable: false, dataField: "centerCellVertical", text: "centerCellVertical", centerCellVertical: centerCellVerticalFn },
                { type: sxTableColumnTypes.Text, dataField: "editable", text: "editable", editable: editableFn, editOnly: editOnlyFn },
                { type: sxTableColumnTypes.Text, editable: false, dataField: "isCentered", text: "isCentered", isCentered: isCenteredFn },
                { type: sxTableColumnTypes.Text, editable: false, dataField: "isDummyField", text: "isDummyField", isDummyField: isDummyFieldFn },
                { type: sxTableColumnTypes.Text, editable: false, dataField: "isOnlyText", text: "isOnlyText", isOnlyText: isOnlyTextFn },
                { type: sxTableColumnTypes.Text, dataField: "text", text: textFn, editable: true, editOnly: true },
                { type: sxTableColumnTypes.Text, editable: false, dataField: "truncateCell", text: "truncateCell", truncateCell: truncateCellFn },
                { type: sxTableColumnTypes.Text, editable: false, dataField: "truncateHead", text: "truncateHeadtruncateHeadtruncateHeadtruncateHead", truncateHead: truncateHeadFn },
            ];
            const getColumnByName = (name) => columns.find(x => x.dataField === name);
            let theData = [
                {
                    id: 0,
                    cellClasses : "Aaaa",
                    centerCellVertical : "centerCellVertical1",
                    editable : "editable1",
                    isCentered : "isCentered1",
                    isDummyField : "isDummyField1",
                    isOnlyText : "isOnlyText1",
                    sort : "sort1",
                    summaryColSpan : "summaryColSpan1",
                    summaryIsCentered : "summaryIsCentered1",
                    text : "text1",
                    truncateCell : "truncateCelltruncateCelltruncateCelltruncateCell1",
                    truncateHead : "truncateHead1"
                },
                {
                    id: 1,
                    cellClasses : "Bbbb",
                    centerCellVertical : "centerCellVertical2",
                    editable : "editable2",
                    isCentered : "isCentered2",
                    isDummyField : "isDummyField2",
                    isOnlyText : "isOnlyText2",
                    sort : "sort2",
                    summaryColSpan : "summaryColSpan2",
                    summaryIsCentered : "summaryIsCentered2",
                    text : "text2",
                    truncateCell : "truncateCelltruncateCelltruncateCelltruncateCell2",
                    truncateHead : "truncateHead2"
                },
                {
                    id: 2,
                    cellClasses : "true",
                    centerCellVertical : "centerCellVertical3",
                    editable : "editable3",
                    isCentered : "isCentered3",
                    isDummyField : "isDummyField3",
                    isOnlyText : "isOnlyText3",
                    sort : "sort3",
                    summaryColSpan : "summaryColSpan3",
                    summaryIsCentered : "summaryIsCentered3",
                    text : "text3",
                    truncateCell : "truncateCelltruncateCelltruncateCelltruncateCell3",
                    truncateHead : "truncateHead3"
                },
            ];
            const doUpdateData = jest.fn().mockImplementation((row, oldValue, newValue, dataField) => {
                theData.find(x => x.id === row.id)[dataField] = newValue;
            });
            const extraData = { fieldZ: "IGotFields" };
            let history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <SxTable {...props} 
                    editable={true}
                    canSave
                    columns={columns}
                    data={theData}
                    extraData={extraData}
                    title="TableCalculatedColumns"
                    doUpdateData={doUpdateData}
                    keyField={"id"}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            await screen.findByText(theData[2].truncateHead);
            const theTable = accessors.getTable("TableCalculatedColumns");
            
            // Les fonctions ont bel et ben été appelées
            expect(cellClassesFn).toHaveBeenCalledWith(theData, undefined, extraData);
            expect(centerCellVerticalFn).toHaveBeenCalledWith(theData, undefined, extraData);
            expect(editableFn).toHaveBeenCalledWith(theData, undefined, extraData);
            expect(isCenteredFn).toHaveBeenCalledWith(theData, undefined, extraData);
            expect(isDummyFieldFn).toHaveBeenCalledWith(theData, undefined, extraData);
            expect(isOnlyTextFn).toHaveBeenCalledWith(theData, undefined, extraData);
            expect(textFn).toHaveBeenCalledWith(theData, undefined, extraData);
            expect(truncateCellFn).toHaveBeenCalledWith(theData, undefined, extraData);
            expect(truncateHeadFn).toHaveBeenCalledWith(theData, undefined, extraData);

            const row2 = await accessors.getRow(theTable, theData[1].cellClasses);
            const row2Editable = await accessors.getCellByDataField(row2, "editable");
            const row2CellClasses = await accessors.getCell(theData[1].cellClasses, row2);
            const row2CenterCellVertical = await accessors.getCell(theData[1].centerCellVertical, row2);
            const row2IsCentered = await accessors.getCell(theData[1].isCentered, row2);
            const row2IsDummyField = await accessors.getCell(theData[1].isDummyField, row2);
            const row2IsOnlyText = await accessors.getCell(theData[1].isOnlyText, row2);
            const row2TruncateCell = await accessors.getCell(theData[1].truncateCell, row2);
            const row2TruncateHead = await accessors.getCell(theData[1].truncateHead, row2);
            const truncateHeadColHeader = await accessors.getHeader(getColumnByName("truncateHead").text);
            const row2TextInput = await accessors.getCellByDataField(row2, "text");

            // Les valeurs initiales sont présentes et correctes
            expect(row2CellClasses).toBeInTheDocument();
            expect(row2CenterCellVertical).toBeInTheDocument();
            expect(accessors.cellContent(row2Editable, "input").value).toBe(theData[1].editable);
            expect(accessors.cellContent(row2TextInput, "input").value).toBe(theData[1].text);
            expect(row2IsCentered).toBeInTheDocument();
            expect(row2IsDummyField).toBeInTheDocument();
            expect(row2IsOnlyText).toBeInTheDocument();
            expect(row2TruncateCell).toBeInTheDocument();
            expect(row2TruncateHead).toBeInTheDocument();

            // Les impacts des propriétés sont appliquées
            expect(accessors.cellContent(row2CellClasses)).toHaveClass(theData[0].cellClasses);
            expect(accessors.cellContent(row2CellClasses)).toHaveClass(theData[1].cellClasses);
            expect(accessors.cellContent(row2CellClasses)).toHaveClass(theData[2].cellClasses);
            expect(accessors.cellContent(row2CellClasses)).toHaveClass(extraData.fieldZ);
            expect(row2CenterCellVertical).toHaveClass("align-top");
            expect(accessors.cellContent(row2IsCentered)).not.toHaveClass("text-center");
            expect(accessors.cellContent(row2TruncateCell)).not.toHaveClass("text-truncate");
            expect(accessors.cellContent(truncateHeadColHeader)).not.toHaveClass("text-truncate");

            // On change un text pour "false"
            await accessors.editTextCell("TableCalculatedColumns", "text2", "false", false);

            await waitFor(() => accessors.cellContent(row2TextInput, "input").value === "false");

            expect(await accessors.getCell(theData[1].centerCellVertical, row2)).toHaveClass("align-middle");
            expect(accessors.cellContent(await accessors.getCell(theData[1].isCentered, row2))).toHaveClass("text-center");
            expect(accessors.cellContent(await accessors.getCell(theData[1].truncateCell, row2))).toHaveClass("text-truncate");
            expect(accessors.cellContent(await accessors.getHeader(getColumnByName("truncateHead").text))).toHaveClass("text-truncate");
            expect(row2Editable).toBeInTheDocument();

            await accessors.editTextCell("TableCalculatedColumns", "text1", "SomethingsChanged", false);

            await screen.findByDisplayValue("SomethingsChanged");
            expect(await accessors.getHeader("SomethingsChanged-textAdded")).toBeInTheDocument();
        });

        it("- ignored properties aren't assigned getter", async () => {
            // Les propriétés qui supportent les fonctions originalement n'ont pas de getter d'assignés.
            // Donc, on peut assigner leur fonction et valider qu'elles ne sont pas appelées avec les trois paramètres que les getter vont appeler: (data, rowData, extraData)
            // Au moment d'écrire ce test, rowData est toujours "undefined".
            const hiddenFalseFn = jest.fn().mockImplementation((_arg1, _arg2, _arg3) => false);
            const hiddenTrueFn = jest.fn().mockImplementation((_arg1, _arg2, _arg3) => true);
            const cellClassesFn = jest.fn().mockImplementation((data, _rowData, extraData) => {
                return `${(data || []).map(x => x.item || "").join(" ")} ${extraData?.dummyProp}`;
            });
            // Les colonnes id et item serviront à vérifier que les fonctions sont pas appelées par le getter.
            // La colonne quality servira de valider que le getter est bien actif.
            const columns = [
                { dataField: "id", hidden: hiddenTrueFn, text: "Id" },
                { dataField: "item", hidden: hiddenFalseFn, text: "Item" },
                { dataField: "quality", text: "Niveau de qualité", cellClasses: cellClassesFn },
            ];
            const extraData = { dummyProp: "dummy value" };
            const theData = [
                { id: 1, item: "Apple", quality: 1 },
                { id: 2, item: "Hi phone", quality: 0 },
                { id: 3, item: "Crap", quality: 1 },
            ];
            let history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <SxTable {...props} 
                    editable={false}
                    columns={columns}
                    data={theData}
                    extraData={extraData}
                    title="TableCalculatedColumns"
                    keyField={"id"}
                />
            }]);
            renderRouter.renderWithRouterAndPath(history);
            await screen.findByText(theData[2].item);

            // Ici on valide que les deux fonctions "hidden" ont été appelées sans paramètres et jamais avec les paramètres que le getter fourni.
            // Et on valide que les paramètres que le getter fourni n'ont pas été modifiés sans que ce test n'ait été ajusté.
            expect(hiddenFalseFn).toHaveBeenCalledWith();
            expect(hiddenFalseFn).not.toHaveBeenCalledWith(theData, undefined, extraData);
            expect(hiddenTrueFn).toHaveBeenCalledWith();
            expect(hiddenTrueFn).not.toHaveBeenCalledWith(theData, undefined, extraData);
            expect(cellClassesFn).toHaveBeenCalledWith(theData, undefined, extraData);
        });

        it("mandatory validation", async () => {
            var history = getHistory([{
                path: "/FakeFormTableEditable", component: props => <FakeFormTableEditable {...props}
                    canSave
                    onCancel={onCancel}
                    columns={[{
                        dataField: "id",
                        text: "id",
                        hidden: true,
                        editable: false,
                    },
                    {
                        dataField: "col1",
                        text: "Colonne 1",
                        editable: true,
                        mandatory: true,
                    }]}
                />
            }]);

            renderRouter.renderWithRouterAndPath(history);
            //Vider un champs requis
            await accessors.editTextCell("Table1", "Ccol1L1", "");
            await waitFor(() => expect(screen.queryByText("La valeur ne peut pas être nulle.")).toBeInTheDocument());

            //Remettre une valeur dans le champs requis
            await accessors.editTextCell("Table1", "", "Now With Value");
            await waitFor(() => expect(screen.queryByText("La valeur ne peut pas être nulle.")).not.toBeInTheDocument());
        })
    });
});