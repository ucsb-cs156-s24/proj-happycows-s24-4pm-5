import {  render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import HealthUpdateStrategiesDropdown from "main/components/Commons/HealthStrategiesUpdateDropdown";


import commonsFixtures from "fixtures/commonsFixtures";
import healthUpdateStrategyListFixtures from "fixtures/healthUpdateStrategyListFixtures";


describe("HealthUpdateStrategiesDropdown tests", () => {


    it("renders correctly, with initial value strat1", async () => {

        const initialCommons = commonsFixtures.threeCommons[0];
        const register = jest.fn();
        const healthUpdateStrategies = healthUpdateStrategyListFixtures.simple;

        render(
            <QueryClientProvider client={new QueryClient()}>
                <Router>
                    <HealthUpdateStrategiesDropdown
                        formName={"aboveCapacityHealthUpdateStrategy"}
                        displayName={"When above capacity"}
                        initialValue={"strat1"}
                        register={register}
                        healthUpdateStrategies={healthUpdateStrategies}
                    />
                </Router>
            </QueryClientProvider>

        );

        await waitFor( ()=>{
            expect(screen.getByTestId("aboveCapacityHealthUpdateStrategy-select")).toBeInTheDocument();        
        });
        const selectElement = screen.getByTestId("aboveCapacityHealthUpdateStrategy-select");
        expect(selectElement).toHaveValue("strat1");

        expect(screen.getByTestId("aboveCapacityHealthUpdateStrategy-strat1")).toHaveAttribute("selected")
        expect(screen.getByTestId("aboveCapacityHealthUpdateStrategy-strat2")).not.toHaveAttribute("selected")

    });

    it("renders correctly, with initial value strat2", async () => {

        const initialCommons = commonsFixtures.threeCommons[0];
        const register = jest.fn();
        const healthUpdateStrategies = healthUpdateStrategyListFixtures.simple;

        render(
            <QueryClientProvider client={new QueryClient()}>
                <Router>
                    <HealthUpdateStrategiesDropdown
                        formName={"aboveCapacityHealthUpdateStrategy"}
                        displayName={"When above capacity"}
                        initialValue={"strat2"}
                        register={register}
                        healthUpdateStrategies={healthUpdateStrategies}
                    />
                </Router>
            </QueryClientProvider>

        );

        await waitFor( ()=>{
            expect(screen.getByTestId("aboveCapacityHealthUpdateStrategy-select")).toBeInTheDocument();        
        });
        const selectElement = screen.getByTestId("aboveCapacityHealthUpdateStrategy-select");
        expect(selectElement).toHaveValue("strat2");
        expect(screen.getByTestId("aboveCapacityHealthUpdateStrategy-strat2")).toHaveAttribute("selected")
        expect(screen.getByTestId("aboveCapacityHealthUpdateStrategy-strat1")).not.toHaveAttribute("selected")

    });
    
    
});
