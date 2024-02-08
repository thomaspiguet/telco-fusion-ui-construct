import React from 'react';
import { screen, render, fireEvent, getByText, queryByText, findByRole, queryByLabelText, getByLabelText, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { SxTable, sxTableColumnTypes } from '../index';

import { accessors, generators } from './SxTable.test.helpers';
import { withSxDeletable } from '@telco360/components';
const TableWithDeletion = withSxDeletable(SxTable);

describe('<SxTable/>', () => {
    describe("Sort", () => {
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
        },
        {
            dataField: "col2",
            text: "Colonne 2",
            sort: true,
        }];

        const data = [{ id: 1, col1: "Ccol1L1", col2: "col2L1", col3: 2 },
        { id: 2, col1: "Acol1L2", col2: "col2L2", col3: 3 },
        { id: 3, col1: "Bcol1L3", col2: "col2L3", col3: 1 }];

        describe("string", () => {
            it("Sort ASC", async () => {
                render(<SxTable
                    title="Table01"
                    data={data}
                    columns={columns}
                />);

                const table = await accessors.findTable('Table01');
                const rows = await accessors.getRows(table);
                //On valide l'ordonnancement avant le click
                expect(getByText(rows[0], "Ccol1L1")).toBeInTheDocument();
                expect(getByText(rows[1], "Acol1L2")).toBeInTheDocument();
                expect(getByText(rows[2], "Bcol1L3")).toBeInTheDocument();

                const sortBtn = await accessors.sortColumn(table, "Colonne 1");
                fireEvent.click(sortBtn);

                const rowsAfter = await accessors.getRows(table);

                //On valide l'ordonnancement après le click
                expect(rowsAfter.length).toBe(3);
                expect(getByText(rowsAfter[0], "Acol1L2")).toBeInTheDocument();
                expect(getByText(rowsAfter[1], "Bcol1L3")).toBeInTheDocument();
                expect(getByText(rowsAfter[2], "Ccol1L1")).toBeInTheDocument();
            });

            it("Sort DESC", async () => {
                render(<SxTable
                    title="Table01"
                    data={data}
                    columns={columns}
                />);

                const table = await accessors.findTable('Table01');
                const rows = await accessors.getRows(table);

                //On valide l'ordonnancement avant le click
                expect(getByText(rows[0], "Ccol1L1")).toBeInTheDocument();
                expect(getByText(rows[1], "Acol1L2")).toBeInTheDocument();
                expect(getByText(rows[2], "Bcol1L3")).toBeInTheDocument();

                const sortBtn = await accessors.sortColumn(table, "Colonne 1");
                fireEvent.click(sortBtn);
                fireEvent.click(sortBtn);

                const rowsAfter = await accessors.getRows(table);

                //On valide l'ordonnancement après le click
                expect(rowsAfter).toHaveLength(3);
                expect(getByText(rowsAfter[0], "Ccol1L1")).toBeInTheDocument();
                expect(getByText(rowsAfter[1], "Bcol1L3")).toBeInTheDocument();
                expect(getByText(rowsAfter[2], "Acol1L2")).toBeInTheDocument();
            });
        });

        describe("number", () => {
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
            },
            {
                dataField: "col2",
                text: "Colonne 2",
                sort: true,
            }];

            const data = [{ id: 1, col1: "Dcol1L1", col2: 10 },
            { id: 2, col1: "Bcol1L2", col2: 1 },
            { id: 3, col1: "Ccol1L3", col2: 3 },
            { id: 4, col1: "Acol1L4", col2: null }];

            it("Sort ASC", async () => {
                render(<SxTable
                    title="Table01"
                    data={data}
                    columns={columns}
                />);

                const table = await accessors.findTable('Table01');
                const rows = await accessors.getRows(table);

                //On valide l'ordonnancement avant le click
                expect(getByText(rows[0], "Dcol1L1")).toBeInTheDocument();
                expect(getByText(rows[1], "Bcol1L2")).toBeInTheDocument();
                expect(getByText(rows[2], "Ccol1L3")).toBeInTheDocument();
                expect(getByText(rows[3], "Acol1L4")).toBeInTheDocument();

                const sortBtn = await accessors.sortColumn(table, "Colonne 2");
                fireEvent.click(sortBtn);

                const rowsAfter = await accessors.getRows(table);

                //On valide l'ordonnancement après le click
                expect(rowsAfter.length).toBe(4);
                expect(getByText(rowsAfter[0], "Acol1L4")).toBeInTheDocument();
                expect(getByText(rowsAfter[1], "Bcol1L2")).toBeInTheDocument();
                expect(getByText(rowsAfter[2], "Ccol1L3")).toBeInTheDocument();
                expect(getByText(rowsAfter[3], "Dcol1L1")).toBeInTheDocument();
            });

            it("Sort DESC", async () => {
                render(<SxTable
                    title="Table01"
                    data={data}
                    columns={columns}
                />);

                const table = await accessors.findTable('Table01');
                const rows = await accessors.getRows(table);

                //On valide l'ordonnancement avant le click
                expect(getByText(rows[0], "Dcol1L1")).toBeInTheDocument();
                expect(getByText(rows[1], "Bcol1L2")).toBeInTheDocument();
                expect(getByText(rows[2], "Ccol1L3")).toBeInTheDocument();
                expect(getByText(rows[3], "Acol1L4")).toBeInTheDocument();

                const sortBtn = await accessors.sortColumn(table, "Colonne 2");
                fireEvent.click(sortBtn);
                fireEvent.click(sortBtn);

                const rowsAfter = await accessors.getRows(table);

                //On valide l'ordonnancement après le click
                expect(rowsAfter.length).toBe(4);
                expect(getByText(rowsAfter[0], "Dcol1L1")).toBeInTheDocument();
                expect(getByText(rowsAfter[1], "Ccol1L3")).toBeInTheDocument();
                expect(getByText(rowsAfter[2], "Bcol1L2")).toBeInTheDocument();
                expect(getByText(rowsAfter[3], "Acol1L4")).toBeInTheDocument();
            });
        });

        describe("bool", () => {
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
            },
            {
                dataField: "col2",
                text: "Colonne 2",
                sort: true,
            }];

            const data = [{ id: 1, col1: "Ccol1L1", col2: true },
            { id: 2, col1: "Acol1L2", col2: true },
            { id: 3, col1: "Bcol1L3", col2: false },
            { id: 4, col1: "Dcol1L3", col2: false }];

            it("Sort ASC", async () => {
                render(<SxTable
                    title="Table01"
                    data={data}
                    columns={columns}
                />);

                const table = await accessors.findTable('Table01');
                const rows = await accessors.getRows(table);
                expect(rows.length).toBe(4);
                //On valide l'ordonnancement avant le click
                expect(getByText(rows[0], "Ccol1L1")).toBeInTheDocument();
                expect(getByText(rows[1], "Acol1L2")).toBeInTheDocument();
                expect(getByText(rows[2], "Bcol1L3")).toBeInTheDocument();
                expect(getByText(rows[3], "Dcol1L3")).toBeInTheDocument();

                const sortBtn = await accessors.sortColumn(table, "Colonne 2");
                fireEvent.click(sortBtn);

                const rowsAfter = await accessors.getRows(table);

                expect(rowsAfter.length).toBe(4);
                //On valide l'ordonnancement après le click
                expect(rowsAfter.length).toBe(4);
                expect(getByText(rowsAfter[0], "false")).toBeInTheDocument();
                expect(getByText(rowsAfter[1], "false")).toBeInTheDocument();
                expect(getByText(rowsAfter[2], "true")).toBeInTheDocument();
                expect(getByText(rowsAfter[3], "true")).toBeInTheDocument();
            });

            it("Sort DESC", async () => {
                render(<SxTable
                    title="Table01"
                    data={data}
                    columns={columns}
                />);

                const table = await accessors.findTable('Table01');
                const rows = await accessors.getRows(table);

                //On valide l'ordonnancement avant le click
                expect(getByText(rows[0], "Ccol1L1")).toBeInTheDocument();
                expect(getByText(rows[1], "Acol1L2")).toBeInTheDocument();
                expect(getByText(rows[2], "Bcol1L3")).toBeInTheDocument();
                expect(getByText(rows[3], "Dcol1L3")).toBeInTheDocument();

                const sortBtn = await accessors.sortColumn(table, "Colonne 2");
                fireEvent.click(sortBtn);
                fireEvent.click(sortBtn);

                const rowsAfter = await accessors.getRows(table);

                //On valide l'ordonnancement après le click
                expect(rowsAfter.length).toBe(4);
                expect(getByText(rowsAfter[1], "true")).toBeInTheDocument();
                expect(getByText(rowsAfter[0], "true")).toBeInTheDocument();
                expect(getByText(rowsAfter[2], "false")).toBeInTheDocument();
                expect(getByText(rowsAfter[3], "false")).toBeInTheDocument();
            });
        });

        it("Sort NONE", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);

            const table = await accessors.findTable('Table01');
            const rows = await accessors.getRows(table);

            //On valide l'ordonnancement avant le click
            expect(getByText(rows[0], "Ccol1L1")).toBeInTheDocument();
            expect(getByText(rows[1], "Acol1L2")).toBeInTheDocument();
            expect(getByText(rows[2], "Bcol1L3")).toBeInTheDocument();

            const sortBtn = await accessors.sortColumn(table, "Colonne 1");
            fireEvent.click(sortBtn);
            fireEvent.click(sortBtn);
            fireEvent.click(sortBtn);

            const rowsAfter = await accessors.getRows(table);

            //On valide l'ordonnancement après le click
            expect(rowsAfter.length).toBe(3);
            expect(getByText(rowsAfter[0], "Ccol1L1")).toBeInTheDocument();
            expect(getByText(rowsAfter[1], "Acol1L2")).toBeInTheDocument();
            expect(getByText(rowsAfter[2], "Bcol1L3")).toBeInTheDocument();
        });

        it("Can be deactivated", async () => {
            render(<SxTable
                title="Table01"
                data={data.map(d => ({ ...d, col3: "some useless value" }))}
                columns={[...columns, {
                    dataField: "col3",
                    text: "Colonne 3",
                    sort: false,
                }]}
            />);

            const table = await accessors.findTable('Table01');
            const sortBtn = await accessors.sortColumn(table, "Colonne 3");

            expect(sortBtn).toBe(null);
        });

        it("Custom Sort Value", async () => {
            render(<SxTable
                title="Table01"
                data={data}
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
                    sortValue: (_cell, row) => row.col3.toString()
                },
                {
                    dataField: "col2",
                    text: "Colonne 2",
                    sort: true,
                }]}
            />);

            const table = await accessors.findTable('Table01');
            const rows = await accessors.getRows(table);

            //On valide l'ordonnancement avant le click
            expect(getByText(rows[0], "Ccol1L1")).toBeInTheDocument();
            expect(getByText(rows[1], "Acol1L2")).toBeInTheDocument();
            expect(getByText(rows[2], "Bcol1L3")).toBeInTheDocument();

            const sortBtn = await accessors.sortColumn(table, "Colonne 1");
            fireEvent.click(sortBtn);

            const rowsAfter = await accessors.getRows(table);

            //On valide l'ordonnancement après le click
            expect(getByText(rowsAfter[0], "Bcol1L3")).toBeInTheDocument();
            expect(getByText(rowsAfter[1], "Ccol1L1")).toBeInTheDocument();
            expect(getByText(rowsAfter[2], "Acol1L2")).toBeInTheDocument();
        });
    });

    describe("Search", () => {
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
        },
        {
            dataField: "col2",
            text: "Colonne 2",
            sort: true,
        }, 
        {
            dataField: "booleanCol",
            text: "Colonne 3",
            sort: false,
        }];

        const data = [{ id: 1, col1: "Ccol1L1", col2: "col2L1", col3: "Bob", booleanCol: true },
        { id: 2, col1: "Acol1L2", col2: "col2L2", col3: "Louis", booleanCol: true },
        { id: 3, col1: "Bcol1L3", col2: "col2L3", col3: "Jerry", booleanCol: false }];

        it("Can be deactivated", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}

                canSearch={false}
            />);
            expect(await accessors.searchField()).not.toBeInTheDocument();
        });

        it("when found", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);
            const table = await accessors.findTable('Table01');
            const searchField = await accessors.searchField(table);

            fireEvent.change(searchField, { target: { value: "Acol1" } });

            await waitFor(async () => expect(await accessors.getRows(table)).toHaveLength(1), { timeout: 3000 });
            const rows = await accessors.getRows(table);
            expect(rows).toHaveLength(1);
        });

        it("when not found", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);
            const table = await accessors.findTable('Table01');
            const searchField = await accessors.searchField(table);

            fireEvent.change(searchField, { target: { value: "NoExist" } });

            await waitFor(async () => expect(await accessors.getRows(table)).toHaveLength(0), { timeout: 3000 });
            const rows = await accessors.getRows(table);
            expect(rows).toHaveLength(0);
        });

        it("case insensitive", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);
            const table = await accessors.findTable('Table01');
            const searchField = await accessors.searchField(table);

            fireEvent.change(searchField, { target: { value: "acol1" } });

            await waitFor(async () => expect(await accessors.getRows(table)).toHaveLength(1), { timeout: 3000 });
            const rows = await accessors.getRows(table);
            expect(rows).toHaveLength(1);
        });

        it("custom search value", async () => {
            render(<SxTable
                title="Table01"
                data={data}
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
                    filterValue: (_cell, row) => row.col3,
                },
                {
                    dataField: "col2",
                    text: "Colonne 2",
                    sort: true,
                }]}
            />);
            const table = await accessors.findTable('Table01');
            const searchField = await accessors.searchField(table);

            fireEvent.change(searchField, { target: { value: "Bob" } });

            await waitFor(async () => expect(await accessors.getRows(table)).toHaveLength(1), { timeout: 3000 });
            const rows = await accessors.getRows(table);
            expect(rows).toHaveLength(1);
            expect(await screen.findByText("Ccol1L1")).toBeInTheDocument();
        });

        it("does not search on boolean columns", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);
            const table = await accessors.findTable('Table01');
            const searchField = await accessors.searchField(table);

            fireEvent.change(searchField, { target: { value: "tru" } });

            await waitFor(async () => expect(await accessors.getRows(table)).toHaveLength(0), { timeout: 3000 });
            const rows = await accessors.getRows(table);
            expect(rows).toHaveLength(0);
        });
    });

    describe("Pagination", () => {
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
        },
        {
            dataField: "col2",
            text: "Colonne 2",
            sort: true,
        }];

        it("Shown", async () => {
            const data = generators.genData(["id", "col1", "col2", "col3"], 15);

            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);
            await screen.findByText("Table01");
            expect(await accessors.getPagination()).toBeInTheDocument();
        });

        it("Not shown when insufficient data", async () => {
            render(<SxTable
                title="Table01"
                data={[{ id: 1, col1: "Ccol1L1", col2: "col2L1" },
                { id: 2, col1: "Acol1L2", col2: "col2L2" },
                { id: 3, col1: "Bcol1L3", col2: "col2L3" }]}
                columns={columns}
            />);
            expect(await accessors.getPaginationInput()).not.toBeInTheDocument();
        });

        it("Can get to page 2 with button", async () => {
            const data = generators.genData(["id", "col1", "col2", "col3"], 15);

            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);

            const table = await accessors.findTable('Table01');
            const page2Btn = await accessors.getPaginationBtn(table, 2);

            fireEvent.click(page2Btn);

            const rows = await accessors.getRows(table);

            expect(getByText(rows[0], "val-col1-line-10")).toBeInTheDocument();
        });

        it("Can get to page 2 with input", async () => {
            const data = generators.genData(["id", "col1", "col2", "col3"], 15);

            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);

            const table = await accessors.findTable('Table01');
            const input = await accessors.getPaginationInput(table);

            fireEvent.change(input, { target: { value: "2" } });
            fireEvent.blur(input);

            const rows = await accessors.getRows(table);

            expect(getByText(rows[0], "val-col1-line-10")).toBeInTheDocument();
        });

        it("Can change number of elements per page", async () => {
            const data = generators.genData(["id", "col1", "col2", "col3"], 15);

            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);

            const table = await accessors.findTable("Table01");
            await accessors.changeNbElemPerPage(table, 50);

            const rows = await accessors.getRows(table);
            expect(rows.length).toBe(15); //Les 15 éléments devraient être affiché
            expect(await accessors.getPaginationInput()).not.toBeInTheDocument(); //Les boutons et input de pagiantion ne devraient plus être visibles
            expect(await accessors.getPaginationNbElem()).toBeInTheDocument(); //Le sélecteur de nombre d'éléments par page devrait toujours être visible
        });

        it("Nb Items per page is not visible if total number of items is lower than default minimum of items per page", async () => {
            const data = generators.genData(["id", "col1", "col2", "col3"], 8);

            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);

            const table = await accessors.findTable("Table01");

            const rows = await accessors.getRows(table);
            expect(rows.length).toBe(8);
            expect(await accessors.getPaginationInput()).not.toBeInTheDocument();
            expect(await accessors.getPaginationNbElem()).not.toBeInTheDocument();
        });

        it("Nb Items per page is visible if total number of items is lower than default minimum of items per page but higher than custom one", async () => {
            const data = generators.genData(["id", "col1", "col2", "col3"], 8);

            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
                pageSize={7}
            />);

            const table = await accessors.findTable("Table01");

            const rows = await accessors.getRows(table);
            expect(rows.length).toBe(7);
            expect(await accessors.getPaginationInput()).toBeInTheDocument();
            expect(await accessors.getPaginationNbElem()).toBeInTheDocument();
        });

        it("Fixed number of elements per page at 15", async () => {
            const data = generators.genData(["id", "col1", "col2", "col3"], 30);

            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
                fixedPageSize
                pageSize={15}
            />);

            const table = await accessors.findTable("Table01");

            const rows = await accessors.getRows(table);
            expect(rows.length).toBe(15);
            expect(await accessors.getPaginationInput()).toBeInTheDocument();
            expect(await accessors.getPaginationNbElem()).not.toBeInTheDocument();
        });

        it("Lots of data with no pagination", async () => {
            const data = generators.genData(["id", "col1", "col2", "col3"], 100);

            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
                usePagination={false}
            />);

            const table = await accessors.findTable("Table01");

            const rows = await accessors.getRows(table);
            expect(rows.length).toBe(100);
            expect(await accessors.getPagination()).not.toBeInTheDocument();
        });
    });

    describe("ColumnToggler", () => {
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
        },
        {
            dataField: "col2",
            text: "Colonne 2",
            sort: true,
        },
        {
            dataField: "col3",
            text: "Colonne 3",
            sort: true,
            isLinkKey: true,
        }];

        const data = [{ id: 1, col1: "Ccol1L1", col2: "col2L1", col3: "col3Val" },
        { id: 2, col1: "Acol1L2", col2: "col2L2", col3: "col3Val" },
        { id: 3, col1: "Bcol1L3", col2: "col2L3", col3: "col3Val" }];

        it("Can hide column", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}

                columnToggler
            />);

            const table = await accessors.findTable("Table01");

            //Valide l'affichage de la colonne 1 au départ
            const rows = await accessors.getRows(table, true);
            expect(getByText(rows[0], "Colonne 1")).toBeInTheDocument();

            await accessors.toggleColumn(table, "Colonne 1");

            const rowsAfter = await accessors.getRows(table, true);
            expect(queryByText(rowsAfter[0], "Colonne 1")).not.toBeInTheDocument();
        });

        it("Can hide and bring back column", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}

                columnToggler
            />);

            const table = await accessors.findTable("Table01");

            //Valide l'affichage de la colonne 1 au départ
            const rows = await accessors.getRows(table, true);
            expect(getByText(rows[0], "Colonne 1")).toBeInTheDocument();

            await accessors.toggleColumn(table, "Colonne 1");

            const rowsAfter = await accessors.getRows(table, true);
            expect(queryByText(rowsAfter[0], "Colonne 1")).not.toBeInTheDocument();

            await accessors.toggleColumn(table, "Colonne 1");

            const rowsAfter2 = await accessors.getRows(table, true);
            expect(getByText(rowsAfter2[0], "Colonne 1")).toBeInTheDocument();
        });

        it("Can be deactivated", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}

                columnToggler={false}
            />);

            expect(await accessors.getColumnToggler()).not.toBeInTheDocument();
        });

        it("Can exclude column from the toggler's choices", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}

                columnToggler
                togglerExcludedColDataFields={["col1"]}
            />);

            const table = await accessors.findTable("Table01");
            const toggler = await accessors.getColumnToggler(table);

            fireEvent.click(toggler);

            const menu = await findByRole(table, "menu");
            expect(queryByLabelText(menu, "Colonne 1")).not.toBeInTheDocument();
            expect(getByLabelText(menu, "Colonne 2")).toBeInTheDocument();
        });

        it("Link cols are added to exclusion", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}

                columnToggler
                togglerExcludedColDataFields={["col1"]}
            />);

            const table = await accessors.findTable("Table01");
            const toggler = await accessors.getColumnToggler(table);

            fireEvent.click(toggler);

            const menu = await findByRole(table, "menu");
            expect(queryByLabelText(menu, "Colonne 1")).not.toBeInTheDocument();
            expect(queryByLabelText(menu, "Colonne 3")).not.toBeInTheDocument();
            expect(getByLabelText(menu, "Colonne 2")).toBeInTheDocument();
        });

        it("Link cols are added to exclusion when no other exclusion", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}

                columnToggler
            />);

            const table = await accessors.findTable("Table01");
            const toggler = await accessors.getColumnToggler(table);

            fireEvent.click(toggler);

            const menu = await findByRole(table, "menu");
            expect(queryByLabelText(menu, "Colonne 3")).not.toBeInTheDocument();
            expect(getByLabelText(menu, "Colonne 1")).toBeInTheDocument();
            expect(getByLabelText(menu, "Colonne 2")).toBeInTheDocument();
        });
    });

    describe("Actions button", () => {
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
        },
        {
            dataField: "col2",
            text: "Colonne 2",
            sort: true,
        }];

        const data = [{ id: 1, col1: "Ccol1L1", col2: "col2L1" },
        { id: 2, col1: "Acol1L2", col2: "col2L2" },
        { id: 3, col1: "Bcol1L3", col2: "col2L3" }];


        it("Is displayed", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}

                actionsList={[
                    {
                        id: 0,
                        label: "Action01",
                        isActive: true,
                        onClick: () => { },
                    },
                ]}
            />);

            const table = await accessors.findTable("Table01");
            expect(await accessors.getActionsBtn(table)).toBeInTheDocument();
        });

        it("Is not displayed if there is no action", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);

            const table = await accessors.findTable("Table01");
            expect(await accessors.getActionsBtn(table)).not.toBeInTheDocument();
        });

        it("Action is executed", async () => {
            const fakeClick = jest.fn();
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}

                actionsList={[
                    {
                        id: 0,
                        label: "Action01",
                        isActive: true,
                        onClick: fakeClick,
                    },
                ]}
            />);

            const table = await accessors.findTable("Table01");
            await accessors.execAction(table, "Action01");
            expect(fakeClick).toHaveBeenCalledTimes(1);
        });
    });

    describe("Add button", () => {
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
        },
        {
            dataField: "col2",
            text: "Colonne 2",
            sort: true,
        }];

        const data = [{ id: 1, col1: "Ccol1L1", col2: "col2L1" },
        { id: 2, col1: "Acol1L2", col2: "col2L2" },
        { id: 3, col1: "Bcol1L3", col2: "col2L3" }];


        it("Is displayed", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
                canAdd
                addUrl="/fakeUrl"
            />);

            const table = await accessors.findTable("Table01");
            expect(await accessors.getAddBtn(table)).toBeInTheDocument();
        });

        it("Is not displayed by default", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);

            const table = await accessors.findTable("Table01");
            expect(await accessors.getAddBtn(table)).not.toBeInTheDocument();
        });

        it("Add is executed", async () => {
            const fakeCanAddVal = jest.fn(_x => true);
            const fakeOpenForm = jest.fn();

            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}

                canAdd
                addUrl="/fakeUrl"
                onValidateCanAdd={fakeCanAddVal}
                openForm={fakeOpenForm}
            />);

            const table = await accessors.findTable("Table01");
            const addBtn = await accessors.getAddBtn(table);
            fireEvent.click(addBtn);
            expect(fakeCanAddVal).toHaveBeenCalledTimes(1);
            expect(fakeOpenForm).toHaveBeenCalledTimes(1);
        });

        it("Add is blocked", async () => {
            const fakeCanAddVal = jest.fn(_x => false);
            const fakeOpenForm = jest.fn();

            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}

                canAdd
                addUrl="/fakeUrl"
                onValidateCanAdd={fakeCanAddVal}
                openForm={fakeOpenForm}
            />);

            const table = await accessors.findTable("Table01");
            const addBtn = await accessors.getAddBtn(table);
            fireEvent.click(addBtn);
            expect(fakeCanAddVal).toHaveBeenCalledTimes(1);
            expect(fakeOpenForm).toHaveBeenCalledTimes(0);
        });
    });

    describe("Custom cells", () => {
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
        },
        {
            dataField: "col2",
            text: "Colonne 2",
            formatter: (cell, row, rowIndex, formatExtraData) => <>
                <div>Ceci est un custom render!</div>
                <div className="form-control">Cell : {cell}</div>
                <div>Row id : {row.id}</div>
                <div>RowIndex : {rowIndex}</div>
                <div>FormatExtraData.testInCol : {formatExtraData.testInCol}</div>
                <div>FormatExtraData.testInTable : {formatExtraData.testInTable}</div>
            </>,
            tooltip: (cell, row, rowIndex, formatExtraData) =>
                `Ceci est un custom tooltip! Cell : ${cell} Row id : ${row.id} RowIndex : ${rowIndex} FormatExtraData.testInCol : ${formatExtraData.testInCol} FormatExtraData.testInTable : ${formatExtraData.testInTable}`,
            sort: true,
            formatExtraData: { testInCol: "valInCol" },
        }];

        it("Custom Render is used", async () => {
            render(<SxTable
                title="Table01"
                data={[{ id: 1, col1: "Ccol1L1", col2: "col2L1" }]}
                columns={columns}
                extraData={{ testInTable: "valInTable" }}
            />);

            //La cellule custom est présente
            expect(await screen.findByText("Ceci est un custom render!")).toBeInTheDocument();
            //La valeur de la cellule est la bonne
            expect(screen.getByText("Cell : col2L1")).toBeInTheDocument();
            //L'id de la row est la bonne
            expect(screen.getByText("Row id : 1")).toBeInTheDocument();
            //L'index de la row est la bonne
            expect(screen.getByText("RowIndex : 0")).toBeInTheDocument();
            //formatExtraData sur la colonne est bonne
            expect(screen.getByText("FormatExtraData.testInCol : valInCol")).toBeInTheDocument();
            //formatExtraData sur la table est bonne
            expect(screen.getByText("FormatExtraData.testInTable : valInTable")).toBeInTheDocument();
        });
    });

    describe("IsLinkKey", () => {
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
        },
        {
            dataField: "col2",
            text: "Colonne 2",
            sort: true,
        }];

        const data = [{ id: 1, col1: "Ccol1L1", col2: "col2L1" },
        { id: 2, col1: "Acol1L2", col2: "col2L2" },
        { id: 3, col1: "Bcol1L3", col2: "col2L3" }];

        it("link is shown", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);

            const links = await screen.findAllByRole("link");
            expect(links).toHaveLength(3);
        });
    });

    describe("Async data", () => {
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
        },
        {
            dataField: "col2",
            text: "Colonne 2",
            sort: true,
        }];
        const data = [];
        const dataLoaded = [{ id: 1, col1: "Ccol1L1", col2: "col2L1" },
        { id: 2, col1: "Acol1L2", col2: "col2L2" },
        { id: 3, col1: "Bcol1L3", col2: "col2L3" }];

        it("Table is shown properly when rendering with empty data then rerender with actual data", async () => {
            const { rerender } = render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);

            const table = await accessors.findTable('Table01');
            const initialRows = await accessors.getRows(table);
            expect(initialRows).toHaveLength(0);
            rerender(<SxTable
                title="Table01"
                data={dataLoaded}
                columns={columns}
            />);

            const rowsAfter = await accessors.getRows(table);
            expect(rowsAfter).toHaveLength(3);
        })
    });

    describe("ColumnTypes", () => {
        const columns = [
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
                dataField: "colDate",
                text: "colTime",
                sort: true,
                type: sxTableColumnTypes.Time,
            },
        ];
        const dateString = ["2002-01-12T01:25:36.576", "2002-12-13T20:25:36.576Z", "Thu, 12 Jan 2023 13:05:42 GMT"];
        const data = [
            { id: 1, colText: "Text ligne 1", colCheckbox: true, colSelect: 1, colDate: dateString[0] },
            { id: 2, colText: "Text ligne 2", colCheckbox: false, colSelect: 2, colDate: dateString[1] },
            { id: 3, colText: "Text ligne 3", colCheckbox: null, colSelect: 3, colDate: dateString[3] },
        ];
        it("Tester le rendu de la table en utilisant les types de colonne", async () => {
            render(<SxTable
                title="TableTypes"
                data={data}
                columns={columns}
            />);
            const table = await accessors.findTable('TableTypes');
            const rows = await accessors.getRows(table);
            expect(rows).toHaveLength(3);
            expect(await screen.findAllByText("Text ligne 1")).toHaveLength(1);
            expect(await screen.findAllByText("Text ligne 2")).toHaveLength(1);
            expect(await screen.findAllByText("Text ligne 3")).toHaveLength(1);
            expect(await screen.findAllByText("Label 1")).toHaveLength(1);
            expect(await screen.findAllByText("Label 2")).toHaveLength(1);
            expect(await screen.findAllByText("Label 3")).toHaveLength(1);
        });
    });

    describe("Using Keywords", () => {
        const columns = [
            {
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
            },
            {
                dataField: "length",
                text: "Longueur",
                sort: true,
            }
        ];

        const data = [
            { id: 1, col1: "Ccol1L1", length: "1" },
            { id: 2, col1: "Acol1L2", length: "2" },
            { id: 3, col1: "Bcol1L3", length: "3" }
        ];

        it("using 'length' keyword as data field name", async () => {
            render(<SxTable
                title="Table01"
                data={data}
                columns={columns}
            />);

            const table = await accessors.findTable("Table01");
            const rows = await accessors.getRows(table, true);

            // Nombre de ligne
            expect(rows).toHaveLength(4);
            screen.debug();

            // Vérification de l'existance de la colonne "length"
            expect(getByText(rows[0], "Longueur")).toBeInTheDocument();
        })
    });

    describe("WithSxDeletable SxTable", () => {
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
        },
        {
            dataField: "col2",
            text: "Colonne 2",
            sort: true,
        }];
    
        const data = [
            { id: 1, col1: "Ccol1L1", col2: "col2L1" },
            { id: 2, col1: "Acol1L2", col2: "col2L2" },
            { id: 3, col1: "Bcol1L3", col2: "col2L3" }
        ];
    
        it("Delete button is shown", async () => {
            render(<TableWithDeletion
                title="Table01"
                data={data}
                columns={columns}
                onRemoveLine={() => { return true }}
                onDataSetChange={() => { }}
            />);
    
            var buttons = await screen.findAllByRole("button", { name: "Supprimer" });//ToDo SD_2022-07-11 : Use Language
            expect(buttons.length).toBe(3);
        });
    
        it("Deletion working", async () => {
            let changeFn = jest.fn();
            let onRemoveLineFn = jest.fn(() => { return true });
    
            render(<TableWithDeletion
                title="Table01"
                data={data}
                columns={columns}
                keyField="id"
                onRemoveLine={onRemoveLineFn}
                onDataSetChange={changeFn}
            />);
            var buttons = await screen.findAllByRole("button", { name: "Supprimer" });//ToDo SD_2022-07-11 : Use Language
            fireEvent.click(buttons[0]);
            var buttonAccept = await screen.findByText("Oui"); //ToDo SD_2022-07-11 : Use Language
    
            fireEvent.click(buttonAccept);
            buttons = await screen.findAllByRole("button", { name: "Supprimer" });//ToDo SD_2022-07-11 : Use Language
            expect(onRemoveLineFn).toHaveBeenCalledTimes(1);
            expect(changeFn).toHaveBeenCalledTimes(1);
        });
    
        it("Do not remove row if server side removal fails", async () => {
            let changeFn = jest.fn();
            let onRemoveLineFn = jest.fn(() => { return false });
    
            render(<TableWithDeletion
                title="Table01"
                data={data}
                columns={columns}
                keyField="id"
                onRemoveLine={onRemoveLineFn}
                onDataSetChange={changeFn}
            />);
            var buttons = await screen.findAllByRole("button", { name: "Supprimer" });//ToDo SD_2022-07-11 : Use Language
            fireEvent.click(buttons[0]);
            var buttonAccept = await screen.findByText("Oui"); //ToDo SD_2022-07-11 : Use Language
    
            fireEvent.click(buttonAccept);
            buttons = await screen.findAllByRole("button", { name: "Supprimer" });//ToDo SD_2022-07-11 : Use Language
            expect(onRemoveLineFn).toHaveBeenCalledTimes(1);
            expect(changeFn).toHaveBeenCalledTimes(0);
        });
    
        it("Disabled deletion button for some rows", async () => {
            let changeFn = jest.fn();
            let onRemoveLineFn = jest.fn(() => { return true });
    
            render(<TableWithDeletion
                title="Table01"
                data={data}
                columns={columns}
                keyField="id"
                onRemoveLine={onRemoveLineFn}
                onDataSetChange={changeFn}
                isLineDeletable={(row) => row.col2 === "col2L2"}
            />);
            await screen.findByText("col2L2");
    
            const table = accessors.getTable('Table01');
    
            expect(accessors.getDelButtonByRow(await accessors.getRow(table, "col2L1"))).toBeDisabled();
            expect(accessors.getDelButtonByRow(await accessors.getRow(table, "col2L2"))).not.toBeDisabled();
            expect(accessors.getDelButtonByRow(await accessors.getRow(table, "col2L3"))).toBeDisabled();
        });
    });
});