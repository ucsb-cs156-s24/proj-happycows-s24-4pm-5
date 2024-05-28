import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProfitsTable from "main/components/Commons/ProfitsTable";
import profitsFixtures from "fixtures/profitsFixtures";

describe("ProfitsTable tests", () => {
    test("renders without crashing for 0 profits", () => {
        render(
            <ProfitsTable profits={[]} />
        );
    });

    test("renders without crashing", async () => {
        render(
            <ProfitsTable profits={profitsFixtures.threeProfits} />
        );
        await waitFor(()=>{
            expect(screen.getByTestId("ProfitsTable-header-Profit") ).toBeInTheDocument();
        });

        const expectedHeaders = [ "Profit", "Date", "Health", "Cows"];
    
        expectedHeaders.forEach((headerText) => {
          const header = screen.getByText(headerText);
          expect(header).toBeInTheDocument();
        });

    });

    test("Pagination Test   ", async () => {
        const { getByText } = render(<ProfitsTable profits={profitsFixtures.threeProfits} />);

        // Assuming mockProfits has more than 5 items to enable pagination
        const firstButton = getByText('First');
        const nextButton = getByText('Next');
        const lastButton = getByText('Last');
        const previousButton = getByText('Previous');

        fireEvent.click(firstButton);
        fireEvent.click(nextButton);
        fireEvent.click(previousButton);
        fireEvent.click(lastButton);
        expect(firstButton).toBeDisabled();
        expect(previousButton).toBeDisabled();
        expect(nextButton).toBeDisabled();
        expect(lastButton).toBeDisabled();
    });

    test("Pagination handles page changes correctly", () => {
        const profitsWithMoreThanFiveItems = [
            ...profitsFixtures.threeProfits,
            ...profitsFixtures.threeProfits,
        ]; // Duplicate items to have more than 5

        const { getByText } = render(<ProfitsTable profits={profitsWithMoreThanFiveItems} />);

        const firstButton = getByText('First');
        const nextButton = getByText('Next');
        const lastButton = getByText('Last');
        const previousButton = getByText('Previous');

        // Initial state: first page
        expect(firstButton).toBeDisabled();
        expect(previousButton).toBeDisabled();

        // Click Next to go to the second page
        fireEvent.click(nextButton);
        expect(firstButton).not.toBeDisabled();
        expect(previousButton).not.toBeDisabled();

        // Click Previous to go back to the first page
        fireEvent.click(previousButton);
        expect(firstButton).toBeDisabled();
        expect(previousButton).toBeDisabled();

        // Click Last to go to the last page
        fireEvent.click(lastButton);
        expect(nextButton).toBeDisabled();
        expect(lastButton).toBeDisabled();

        // Click First to go back to the first page
        fireEvent.click(firstButton);
        expect(firstButton).toBeDisabled();
        expect(previousButton).toBeDisabled();
    });
});