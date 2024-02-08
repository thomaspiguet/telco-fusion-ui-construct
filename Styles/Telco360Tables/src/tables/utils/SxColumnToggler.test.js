import React from "react";
import { render, fireEvent, screen, } from '@testing-library/react';

import SxColumnToggler, { msg } from "./SxColumnToggler";

const onColumnToggle = jest.fn();

const columns = [
    {
        dataField: "id",
        text: "id",
        hidden: true,
    },
    {
        dataField: "column1",
        text: "Colonne 1",
    },
    {
        dataField: "column2",
        text: "Colonne 2",
    },
    {
        dataField: "column3",
        text: "Colonne 3",
    },
];

const excludedColDataFields = [
    "id",
];

const toggles = {
    column1: true,
    column2: false,
    column3: false,
};


describe("Basic SxColumnToggler test", () => {
    it("Just render with props", async () => {
        render(<SxColumnToggler 
            onColumnToggle={onColumnToggle}
            toggles={toggles}
            excludedColDataFields={excludedColDataFields}
            columns={columns}
        />);

        var btnToggle = await screen.findByLabelText(msg.tooltip.toggleCols);
        fireEvent.click(btnToggle);
        const cb = await screen.findAllByRole("checkbox");
        expect(cb.filter(x => x.name === "Colonne 1")[0].checked).toBeTruthy();
        expect(cb.filter(x => x.name === "Colonne 2")[0].checked).toBeFalsy();
        expect(cb.filter(x => x.name === "Colonne 3")[0].checked).toBeFalsy();
    })
    it("Render & take action", async () => {

        var thisToggles ={ column1: true, column2: false, column3: false }
        const thisColumnToggle = jest.fn().mockImplementation(field => {
            thisToggles = { ...thisToggles, [field]: !thisToggles[field]}
        });

        render(<SxColumnToggler 
            onColumnToggle={thisColumnToggle}
            toggles={thisToggles}
            excludedColDataFields={excludedColDataFields}
            columns={columns}
        />);
        var btnToggle = await screen.findByLabelText(msg.tooltip.toggleCols);
        fireEvent.click(btnToggle);
        var cb = await screen.findAllByRole("checkbox");
        expect(cb.filter(x => x.name === "Colonne 1")[0].checked).toBeTruthy();
        expect(cb.filter(x => x.name === "Colonne 2")[0].checked).toBeFalsy();
        expect(cb.filter(x => x.name === "Colonne 3")[0].checked).toBeFalsy();
        
        fireEvent.click(cb.filter(x => x.name === "Colonne 1")[0]);
        fireEvent.click(cb.filter(x => x.name === "Colonne 2")[0]);
        
        expect(thisColumnToggle).toBeCalledTimes(2);
        expect(thisColumnToggle).toHaveBeenCalledWith("column1");
        expect(thisColumnToggle).toHaveBeenLastCalledWith("column2");
    })
})