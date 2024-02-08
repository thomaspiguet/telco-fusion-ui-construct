import React from 'react';
import { screen, render, } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { helpers } from '@telco360/components';
import SxDateTimeLabel from './SxDateTimeLabel';


const requiredProps = {
    columnDataField: 'columnDataField',
    uniqueKey: 'uniqueKey',
};

const dateValue = '2020-12-01T00:00:00.000Z';


describe('<SxDateTimeLabel/>', () => {
    //on envoie le data pour afficher le component
    it("Injection du data valid", () => {
        const tmpProps = {
            isoStringValue: dateValue,
        };
        const isoStringFormat = helpers.Date.formatterFromUtc(tmpProps.isoStringValue);

        render(<SxDateTimeLabel {...requiredProps} {...tmpProps} />);
        expect(screen.getByText(isoStringFormat)).toBeInTheDocument();
    });

    it("Injection du data null", () => {
    //on envoie null dans le data pour pas afficher le component
        const tmpProps = {
            isoStringValue: null,
        };

        render(<SxDateTimeLabel {...requiredProps} {...tmpProps} />);

        expect(screen.queryByText(dateValue)).not.toBeInTheDocument();
    });

    it("Injection du pas data", () => {
    //on envoie pas le props avec l'isoData pour pas afficher le component

        render(<SxDateTimeLabel {...requiredProps} />);

        expect(screen.queryByText(dateValue)).not.toBeInTheDocument();
    });

    it("Injection du data undefined", () => {
        //on envoie undefined dans isoStringValue pour pas afficher le component
        const tmpProps = {
            isoStringValue: undefined,
        };

        render(<SxDateTimeLabel {...requiredProps} {...tmpProps} />);

        expect(screen.queryByText(dateValue)).not.toBeInTheDocument();
    });

    describe("Vérifier que la conversion se passe bien", () => {
        const dateString = ["2002-01-12T01:25:36.576", "2002-12-13T20:25:36.576Z", "Thu, 12 Jan 2023 13:05:42 GMT", "Thu, 12 Jan 2023 13:05:42 GMT-0500"];
        it("Format iso sans le Z", () => {
    
            render(<SxDateTimeLabel {...requiredProps} isoStringValue={dateString[0]} />);
    
            expect(screen.queryByText(helpers.Date.formatterFromUtc(dateString[0]))).toBeInTheDocument();
    
        });

        it("Format iso ", () => {
    
            render(<SxDateTimeLabel {...requiredProps} isoStringValue={dateString[1]} />);
    
            expect(screen.queryByText(helpers.Date.formatterFromUtc(dateString[1]))).toBeInTheDocument();
    
        });

        it("Format GMT sans timezone", () => {
    
            render(<SxDateTimeLabel {...requiredProps} isoStringValue={dateString[2]} />);
    
            expect(screen.queryByText(helpers.Date.formatterFromUtc(dateString[2]))).toBeInTheDocument();
        });
        
        it("Format GMT avec timezone", () => {
    
            render(<SxDateTimeLabel {...requiredProps} isoStringValue={dateString[3]} />);
    
            expect(screen.queryByText(helpers.Date.formatterFromUtc(dateString[3]))).toBeInTheDocument();
        });
    });
});