import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProfitsTable from "main/components/Commons/ProfitsTable";
import profitsFixtures from "fixtures/profitsFixtures";

const largeProfitsFixture = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    userCommons: {
        id: 3,
        commonsId: 2,
        userId: 1,
        username: "Phill Conrad",
        totalWealth: 400,
        numOfCows: 6,
        cowHealth: 0,
    },
    amount: 50 + i,
    timestamp: `2023-05-1${i}T20:50:00.043225`,
    numCows: 6,
    avgCowHealth: 90 + i,
}));

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

    test("Pagination and slicing works correctly", () => {
        render(<ProfitsTable profits={profitsFixtures.threeProfits} />);
        
        // Check initial rows displayed
        expect(screen.getByText("$58.20")).toBeInTheDocument();
        expect(screen.getByText("5/15/2023, 20:50:00")).toBeInTheDocument();
        expect(screen.getByText("97.000%")).toBeInTheDocument();
        const cowCells = screen.getAllByText("6");
        expect(cowCells).toHaveLength(3);

        // The profitsFixtures.threeProfits only has 3 entries, so there won't be a second page
        expect(screen.queryByText("$54.60")).toBeInTheDocument();
        expect(screen.queryByText("$52.80")).toBeInTheDocument();
    });

    test("Button styles are correct", () => {
        render(<ProfitsTable profits={profitsFixtures.threeProfits} />);
        
        const firstButton = screen.getByText('First');
        const nextButton = screen.getByText('Next');
        const lastButton = screen.getByText('Last');
        const previousButton = screen.getByText('Previous');

        // Check initial styles
        expect(firstButton).toHaveStyle('background-color: #cccccc');
        expect(nextButton).toHaveStyle('background-color: #cccccc');
        expect(lastButton).toHaveStyle('background-color: #cccccc');
        expect(previousButton).toHaveStyle('background-color: #cccccc');
    });

    test("Pagination Test", async () => {
        render(<ProfitsTable profits={profitsFixtures.threeProfits} />);

        const firstButton = screen.getByText('First');
        const nextButton = screen.getByText('Next');
        const lastButton = screen.getByText('Last');
        const previousButton = screen.getByText('Previous');

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

        render(<ProfitsTable profits={profitsWithMoreThanFiveItems} />);

        const firstButton = screen.getByText('First');
        const nextButton = screen.getByText('Next');
        const lastButton = screen.getByText('Last');
        const previousButton = screen.getByText('Previous');

        // Initial state: first page
        expect(firstButton).toBeDisabled();
        expect(previousButton).toBeDisabled();
        expect(nextButton).toHaveStyle('background-color: #007bff');
        expect(lastButton).toHaveStyle('background-color: #007bff');
        expect(firstButton).toHaveStyle('background-color: #cccccc');
        expect(previousButton).toHaveStyle('background-color: #cccccc');

        // Click Next to go to the second page
        fireEvent.click(nextButton);
        expect(firstButton).not.toBeDisabled();
        expect(previousButton).not.toBeDisabled();
        expect(firstButton).toHaveStyle('background-color: #007bff');
        expect(previousButton).toHaveStyle('background-color: #007bff');
        expect(nextButton).toHaveStyle('background-color: #cccccc');
        expect(lastButton).toHaveStyle('background-color: #cccccc');

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

    test("Pagination and slicing works correctly", () => {
        render(<ProfitsTable profits={largeProfitsFixture} />);

        // Check initial rows displayed (first 5 entries)
        largeProfitsFixture.slice(0, 5).forEach((profit, index) => {
            expect(screen.getByTestId(`ProfitsTable-cell-row-${index}-col-Profit`)).toHaveTextContent(`$${profit.amount.toFixed(2)}`);
        });

        // Click next page
        fireEvent.click(screen.getByText('Next'));
        
        // Check second page rows displayed (next 5 entries)
        largeProfitsFixture.slice(5, 10).forEach((profit, index) => {
            expect(screen.getByTestId(`ProfitsTable-cell-row-${index}-col-Profit`)).toHaveTextContent(`$${profit.amount.toFixed(2)}`);
        });

        // Go back to first page and check again
        fireEvent.click(screen.getByText('First'));
        largeProfitsFixture.slice(0, 5).forEach((profit, index) => {
            expect(screen.getByTestId(`ProfitsTable-cell-row-${index}-col-Profit`)).toHaveTextContent(`$${profit.amount.toFixed(2)}`);
        });
    });
});